from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.sql import func
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"
    __table_args__ = {"extend_existing": True}

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False, default="local")
    file_size = Column(Integer, nullable=True)
    parsed_text = Column(Text, nullable=True)
    ats_score = Column(Integer, nullable=True)
    score_breakdown = Column(JSONB, nullable=True)
    missing_keywords = Column(ARRAY(String), nullable=True)
    suggestions = Column(ARRAY(String), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)