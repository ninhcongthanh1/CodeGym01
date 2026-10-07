from datetime import date

from pydantic import BaseModel, EmailStr, model_validator


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

    @model_validator(mode="after")
    def validate_internship_dates(self):
        if (
            self.internship_start_date
            and self.internship_end_date
            and self.internship_end_date < self.internship_start_date
        ):
            raise ValueError(
                "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"
            )

        return self


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