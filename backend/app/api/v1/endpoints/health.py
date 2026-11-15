from fastapi import APIRouter, Depends, status
from app.core.config import settings
from app.core.database import check_database_health

router = APIRouter()


@router.get("", status_code=status.HTTP_200_OK)
async def health_check():
    """Basic ping endpoint for load balancer liveness probe."""
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


@router.get("/live", status_code=status.HTTP_200_OK)
async def liveness_probe():
    """Kubernetes / Cloud Run liveness probe."""
    return {"status": "alive"}


@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness_probe():
    """Kubernetes / Cloud Run readiness probe verifying database connectivity."""
    db_health = await check_database_health()
    is_ready = db_health.get("connected", False) or settings.ENVIRONMENT == "development"
    return {
        "status": "ready" if is_ready else "degraded",
        "services": {
            "database": db_health,
            "gemini_configured": bool(settings.GEMINI_API_KEY)
        }
    }
