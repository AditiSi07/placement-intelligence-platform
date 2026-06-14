from fastapi import APIRouter
from datetime import datetime
from app.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@router.get("/")
def root():
    return {
        "message": "Placement Intelligence Platform API",
        "docs": "/docs",
        "health": "/health"
    }