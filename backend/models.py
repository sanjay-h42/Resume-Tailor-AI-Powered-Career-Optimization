from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
import json
from .database import Base

class OptimizationRequest(Base):
    __tablename__ = "optimization_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # Optional user identifier if needed later
    resume_text = Column(Text, nullable=False) # Storing file content internally for privacy
    job_description = Column(Text, nullable=False)
    status = Column(String, default="pending") # pending, processing, completed, failed
    relevance_score = Column(Integer, nullable=True)
    optimized_score = Column(Integer, nullable=True)
    missing_keywords = Column(Text, nullable=True) # Stored as JSON string
    tailored_profile = Column(Text, nullable=True)
    project_suggestions = Column(Text, nullable=True) # Stored as JSON string
    optimized_resume = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
