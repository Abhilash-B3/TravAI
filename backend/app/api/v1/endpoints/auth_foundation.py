from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.dependencies import AuthenticatedUser, get_current_user

router = APIRouter()


class TenantAssignmentResponse(BaseModel):
    scope_type: str
    organization_id: Optional[UUID] = None
    property_id: Optional[UUID] = None
    role_code: str


class CurrentUserContextResponse(BaseModel):
    user_id: UUID
    email: str
    is_superadmin: bool
    roles: List[str]
    permissions: List[str]
    tenants: List[TenantAssignmentResponse]


@router.get("/context", response_model=CurrentUserContextResponse)
async def get_current_user_context(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Returns the resolved identity, assigned roles, permissions,
    and scoped tenant memberships for the active session.
    """
    tenants = [
        TenantAssignmentResponse(
            scope_type=ra.scope_type.value,
            organization_id=ra.organization_id,
            property_id=ra.property_id,
            role_code=ra.role_code,
        )
        for ra in current_user.role_assignments
    ]
    return CurrentUserContextResponse(
        user_id=current_user.id,
        email=current_user.email,
        is_superadmin=current_user.is_superadmin,
        roles=sorted(list(current_user.roles)),
        permissions=sorted(list(current_user.permissions)),
        tenants=tenants,
    )
