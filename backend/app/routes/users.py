from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import SessionLocal
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

class OnboardingData(BaseModel):
    clerk_id: str
    email: str
    full_name: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[str] = None
    cgpa: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None

@router.get("/test")
def test_users_route():
    return {"message": "Users route is working correctly"}

@router.post("/onboard")
def onboard_user(data: OnboardingData):
    """Called after a new user completes the onboarding form."""
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.id == data.clerk_id).first()
        if existing:
            # Update existing user
            existing.college = data.college
            existing.branch = data.branch
            existing.graduation_year = data.graduation_year
            existing.cgpa = data.cgpa
            existing.phone = data.phone
            existing.linkedin_url = data.linkedin_url
            existing.github_url = data.github_url
            existing.profile_complete = True
            db.commit()
            return {"message": "Profile updated", "user_id": existing.id}

        # Create new user
        new_user = User(
            id=data.clerk_id,
            email=data.email,
            full_name=data.full_name,
            college=data.college,
            branch=data.branch,
            graduation_year=data.graduation_year,
            cgpa=data.cgpa,
            phone=data.phone,
            linkedin_url=data.linkedin_url,
            github_url=data.github_url,
            profile_complete=True,
        )
        db.add(new_user)
        db.commit()
        return {"message": "User created successfully", "user_id": new_user.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.get("/me/{clerk_id}")
def get_user(clerk_id: str):
    """Get a user's profile by their Clerk ID."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == clerk_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "college": user.college,
            "branch": user.branch,
            "graduation_year": user.graduation_year,
            "cgpa": user.cgpa,
            "profile_complete": user.profile_complete,
        }
    finally:
        db.close()