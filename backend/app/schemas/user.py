from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    full_name: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[str] = None
    cgpa: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[str] = None
    cgpa: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    college: Optional[str]
    branch: Optional[str]
    graduation_year: Optional[str]
    cgpa: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True