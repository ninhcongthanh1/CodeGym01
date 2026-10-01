from datetime import datetime

from pydantic import BaseModel


class InternProfileResponse(BaseModel):
    school: str
    major: str
    phone: str
    cv_filename: str
    application_filename: str
    updated_at: datetime