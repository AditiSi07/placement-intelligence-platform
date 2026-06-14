from fastapi import APIRouter
from datetime import datetime
from app.config import settings
from app.database import test_connection

router = APIRouter()

@router.get("/health")
def health_check():
    db_connected = test_connection()
    return {
        "status": "healthy" if db_connected else "degraded",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "database": "connected" if db_connected else "not connected"
    }

@router.get("/")
def root():
    return {
        "message": "Placement Intelligence Platform API",
        "docs": "/docs",
        "health": "/health"
    }