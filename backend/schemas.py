from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OptimizeRequest(BaseModel):
    user_id: str = "anonymous"
    resume_text: str
    job_description: str

class OptimizeResponse(BaseModel):
    id: int
    user_id: str
    status: str
    relevance_score: Optional[int] = None
    optimized_score: Optional[int] = None
    missing_keywords: Optional[str] = None
    tailored_profile: Optional[str] = None
    project_suggestions: Optional[str] = None
    optimized_resume: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class OptimizationResult(BaseModel):
    id: int
    status: str
    relevance_score: Optional[int] = None
    optimized_score: Optional[int] = None
    missing_keywords: Optional[str] = None
    tailored_profile: Optional[str] = None
    project_suggestions: Optional[str] = None
    optimized_resume: Optional[str] = None
    
    class Config:
        from_attributes = True
