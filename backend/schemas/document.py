from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentReviewRequest(BaseModel):
    status: str  # "APPROVED" hoặc "REJECTED"
    reject_reason: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    intern_id: int
    document_type: str
    file_name: str
    file_path: str
    status: str
    reject_reason: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True