from datetime import datetime

from pydantic import BaseModel


class InternDocumentResponse(BaseModel):
    id: int
    intern_id: int
    document_type: str
    file_name: str
    file_path: str
    uploaded_at: datetime
    status: str

    class Config:
        from_attributes = True