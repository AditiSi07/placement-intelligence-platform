from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.sql import func
from app.database import Base

class GapAnalysis(Base):
    __tablename__ = "gap_analyses"

    id = Column(String, primary_key=True)
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