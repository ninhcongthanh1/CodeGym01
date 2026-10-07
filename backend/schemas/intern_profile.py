from datetime import date

from pydantic import BaseModel, EmailStr


class InternProfileCreate(BaseModel):
    full_name: str
    date_of_birth: date | None = None
    gender: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    school: str | None = None
    major: str | None = None
    student_id: str | None = None
    address: str | None = None
    internship_position: str | None = None
    internship_start_date: date | None = None
    internship_end_date: date | None = None


class InternProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    date_of_birth: date | None
    gender: str | None
    phone: str | None
    email: EmailStr | None
    school: str | None
    major: str | None
    student_id: str | None
    address: str | None
    internship_position: str | None
    internship_start_date: date | None
    internship_end_date: date | None
    status: str

    class Config:
        from_attributes = True