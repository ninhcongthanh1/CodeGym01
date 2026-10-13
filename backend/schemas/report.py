from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from models.report import ReportStatus

class ReportFeedbackUpdate(BaseModel):
    feedback: str

class ReportResponse(BaseModel):
    id: int
    intern_id: int
    title: str
    content: str
    feedback: Optional[str] = None
    status: ReportStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True