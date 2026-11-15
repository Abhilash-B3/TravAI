from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Request, Response, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import AuthenticatedUser, get_current_user
from app.core.exceptions import AuthenticationError, NotFoundError
from app.modules.identity.models import UserSession
from app.modules.identity.schemas import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserRegisterRequest,
    UserRegisterResponse,
    UserSessionResponse,
    VerifyEmailRequest,
)
from app.modules.identity.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=UserRegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Registers a new user in PENDING_VERIFICATION state.
    Emits a single-use cryptographically strong verification token.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user, raw_verify_token = await AuthService.register_user(
        db=db,
        email=payload.email,
        password=payload.password,
        first_name=payload.first_name,
        last_name=payload.last_name,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    return UserRegisterResponse(
        user_id=user.id,
        email=user.email,
        account_status=user.account_status,
        message="Registration successful. Please verify your email using the provided token to activate your account.",
    )


@router.post("/verify-email")
async def verify_email(
    payload: VerifyEmailRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Activates account via single-use email verification token."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user = await AuthService.verify_email(
        db=db,
        raw_token=payload.token,
        ip_address=client_ip,
        user_agent=user_agent,
    )
    return {
        "status": "EMAIL_VERIFIED",
        "user_id": str(user.id),
        "email": user.email,
        "account_status": user.account_status.value,
        "message": "Email verified successfully. You may now log in.",
    }


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticates user, creates tracked session, and issues access & refresh tokens.
    Attaches refresh token as HttpOnly cookie in addition to returning it in JSON.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user, access_token, refresh_token, session_id = await AuthService.authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    # Set HttpOnly Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production HTTPS
        max_age=7 * 24 * 3600,
        path="/api/v1/auth/refresh",
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in_seconds=900,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: Optional[RefreshTokenRequest] = None,
    refresh_token_cookie: Optional[str] = Cookie(None, alias="refresh_token"),
    response: Response = None,
    request: Request = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Executes refresh token rotation.
    If an expired or previously rotated token is replayed, terminates entire session family!
    """
    token_str = (payload.refresh_token if payload and payload.refresh_token else None) or refresh_token_cookie
    if not token_str:
        raise AuthenticationError("Refresh token must be provided via request body or HttpOnly cookie.")

    client_ip = request.client.host if request and request.client else None
    user_agent = request.headers.get("user-agent") if request else None

    new_access_token, new_refresh_token, session_id = await AuthService.rotate_refresh_token(
        db=db,
        raw_refresh_token=token_str,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    if response:
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            samesite="lax",
            secure=False,
            max_age=7 * 24 * 3600,
            path="/api/v1/auth/refresh",
        )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="Bearer",
        expires_in_seconds=900,
    )


@router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revokes the current active session and clears the refresh token cookie."""
    if current_user.session_id:
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        await AuthService.logout(
            db=db,
            session_id=current_user.session_id,
            user_id=current_user.id,
            ip_address=client_ip,
            user_agent=user_agent,
        )

    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh")
    return {"status": "LOGOUT_SUCCESSFUL", "message": "Session terminated successfully."}


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Updates password and revokes all other active sessions."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    await AuthService.change_password(
        db=db,
        user_id=current_user.id,
        current_password=payload.current_password,
        new_password=payload.new_password,
        current_session_id=current_user.session_id,
        ip_address=client_ip,
        user_agent=user_agent,
    )
    return {"status": "PASSWORD_CHANGED", "message": "Password updated. All other active sessions revoked."}


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Issues single-use password reset token (15m TTL).
    Guards against user enumeration by returning a standardized success response.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    await AuthService.request_password_reset(
        db=db,
        email=payload.email,
        ip_address=client_ip,
        user_agent=user_agent,
    )
    return {
        "status": "PASSWORD_RESET_DISPATCHED",
        "message": "If an active account exists for this email address, password reset instructions have been generated.",
    }


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Validates reset token, updates password, and revokes all active sessions."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    await AuthService.reset_password(
        db=db,
        raw_token=payload.token,
        new_password=payload.new_password,
        ip_address=client_ip,
        user_agent=user_agent,
    )
    return {"status": "PASSWORD_RESET_SUCCESSFUL", "message": "Password reset completed. Please log in with your new password."}


@router.get("/sessions", response_model=List[UserSessionResponse])
async def list_sessions(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lists all active (unrevoked) sessions for the authenticated user."""
    query = select(UserSession).where(
        UserSession.user_id == current_user.id,
        UserSession.is_revoked.is_(False),
    ).order_by(UserSession.created_at.desc())
    res = await db.execute(query)
    sessions = res.scalars().all()

    return [
        UserSessionResponse(
            id=s.id,
            user_agent=s.user_agent,
            ip_address=s.ip_address,
            created_at=s.created_at,
            expires_at=s.expires_at,
            is_current=(s.id == current_user.session_id),
        )
        for s in sessions
    ]


@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revokes a specific session belonging to the authenticated user."""
    query = select(UserSession).where(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id,
    )
    res = await db.execute(query)
    session = res.scalar_one_or_none()
    if not session:
        raise NotFoundError("Session not found.")

    session.is_revoked = True
    session.revoked_reason = "USER_MANUAL_REVOKE"
    await db.flush()

    return {"status": "SESSION_REVOKED", "session_id": str(session_id)}


@router.post("/sessions/revoke-all")
async def revoke_all_sessions(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revokes all active sessions for the authenticated user."""
    await db.execute(
        update(UserSession)
        .where(
            UserSession.user_id == current_user.id,
            UserSession.is_revoked.is_(False),
        )
        .values(is_revoked=True, revoked_reason="USER_REVOKE_ALL")
    )
    await db.flush()
    return {"status": "ALL_SESSIONS_REVOKED"}
