from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class ScheduleBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: Optional[str] = "Pending"

class ScheduleCreate(ScheduleBase):
    intern_id: int

class ScheduleResponse(ScheduleBase):
    id: int
    intern_id: int

    class Config:
        from_attributes = True