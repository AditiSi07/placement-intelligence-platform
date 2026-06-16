from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.database import Base
import uuid

class MockInterview(Base):
    __tablename__ = "mock_interviews"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    target_company = Column(String, nullable=True)
    target_role = Column(String, nullable=True)
    interview_type = Column(String, default="technical")
    difficulty = Column(String, default="medium")
    status = Column(String, default="in_progress")
    total_questions = Column(Integer, default=0)
    questions_answered = Column(Integer, default=0)
    overall_score = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    transcript = Column(JSONB, nullable=True)
    feedback = Column(JSONB, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)