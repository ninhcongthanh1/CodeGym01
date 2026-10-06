from datetime import date

from pydantic import BaseModel, Field, ConfigDict


class InternshipProgramCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )

    department: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    description: str | None = None

    start_date: date

    end_date: date

    status: str = "planned"


class InternshipProgramResponse(BaseModel):
    id: int
    name: str
    department: str
    description: str | None
    start_date: date
    end_date: date
    status: str
    created_by: int

    model_config = ConfigDict(
        from_attributes=True
    )