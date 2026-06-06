"""
GET /health — endpoint simple para verificar que el servicio está vivo.
Útil para mantener despierto el servicio de Render con cron-job.org.
"""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok", "service": "dry-beans-backend"}
