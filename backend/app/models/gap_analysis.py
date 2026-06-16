from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class GapAnalysis(Base):
    __tablename__ = "gap_analyses"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    resume_id = Column(String, nullable=True)
    job_id = Column(String, nullable=True)
    match_percentage = Column(Integer)
    matched_skills = Column(ARRAY(String))
    missing_skills = Column(ARRAY(String))
    bonus_skills = Column(ARRAY(String))
    priority_gaps = Column(JSONB)
    recommendation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())