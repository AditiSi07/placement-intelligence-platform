from fastapi import APIRouter, HTTPException
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/test")
def test_users_route():
    """Test that the users route is working"""
    return {"message": "Users route is working correctly"}

@router.get("/me")
def get_current_user():
    """
    Get the currently logged-in user's profile.
    Will be connected to Clerk auth in Week 2.
    """
    return {
        "message": "Auth will be added in Week 2",
        "user": {
            "id": "test_user_001",
            "email": "student@college.edu",
            "full_name": "Test Student",
            "role": "student",
            "college": "IIT Kanpur",
            "branch": "Computer Science",
            "graduation_year": "2026",
            "cgpa": "8.5"
        }
    }