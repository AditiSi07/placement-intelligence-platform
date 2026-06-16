from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Roadmap(Base):
    __tablename__ = "roadmaps"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    target_company = Column(String, nullable=True)
    target_role = Column(String, nullable=True)
    weeks_available = Column(Integer, default=8)
    current_skills = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)
    roadmap_content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())