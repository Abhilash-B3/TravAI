from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    auth_foundation,
    health,
    me,
    notifications,
    search,
    system_foundation,
    tenancy_foundation,
)

api_v1_router = APIRouter()

# Core system routes
api_v1_router.include_router(health.router, prefix="/health", tags=["Health & Probes"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Session Lifecycle"])
api_v1_router.include_router(me.router, tags=["Identity Profile & Scoped Context"])
api_v1_router.include_router(notifications.router, tags=["Notifications Foundation"])
api_v1_router.include_router(search.router, tags=["Global Search Foundation"])
api_v1_router.include_router(auth_foundation.router, prefix="/identity-foundation", tags=["Identity & Auth Foundation"])
api_v1_router.include_router(tenancy_foundation.router, prefix="/tenancy", tags=["Multi-Tenancy Foundation"])
api_v1_router.include_router(system_foundation.router, prefix="/system", tags=["System Foundation"])

