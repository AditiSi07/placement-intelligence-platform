from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class PlacementHistory(Base):
    __tablename__ = "placement_history"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    package_lpa = Column(Float, nullable=True)
    placement_year = Column(Integer, nullable=False)
    branch = Column(String, nullable=True)
    eligible_branches = Column(ARRAY(String), nullable=True)
    min_cgpa = Column(Float, nullable=True)
    bond_years = Column(Integer, default=0)
    job_type = Column(String, default="fulltime")
    sector = Column(String, nullable=True)
    skills_tested = Column(ARRAY(String), nullable=True)
    selection_process = Column(ARRAY(String), nullable=True)
    students_placed = Column(Integer, default=0)
    college = Column(String, nullable=True)
    added_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())