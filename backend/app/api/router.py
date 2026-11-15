from fastapi import APIRouter
from app.api.v1.api import api_v1_router
from app.api.v1.endpoints import health

root_api_router = APIRouter()

# Root health check directly on /health for root container health probes
root_api_router.include_router(health.router, prefix="/health", tags=["Health"])

# Versioned API
root_api_router.include_router(api_v1_router, prefix="/api/v1")
