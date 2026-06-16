from sqlalchemy import Column, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    student = "student"
    coordinator = "coordinator"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="student")
    college = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    graduation_year = Column(String, nullable=True)
    cgpa = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    profile_complete = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)