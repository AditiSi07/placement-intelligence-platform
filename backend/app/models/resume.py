from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, ARRAY, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_size = Column(Integer)
    parsed_text = Column(Text)
    ats_score = Column(Integer)
    score_breakdown = Column(JSONB)
    missing_keywords = Column(ARRAY(String))
    suggestions = Column(ARRAY(String))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())