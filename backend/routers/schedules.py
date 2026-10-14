from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr
from backend.services.email_service import send_meeting_email

router = APIRouter(prefix="/schedules", tags=["Schedules"])

class ScheduleCreateRequest(BaseModel):
    intern_name: str
    intern_email: EmailStr
    title: str
    meeting_time: str
    meeting_link: str = ""

@router.post("/create")
def create_schedule(schedule: ScheduleCreateRequest, background_tasks: BackgroundTasks):
    """
    API Tạo lịch họp và tự động gửi email thông báo cho thực tập sinh (chạy ngầm BackgroundTasks)
    """
    # 1. Lưu thông tin lịch họp vào DB (nếu có)
    
    # 2. Gửi email tự động trong background để không làm chậm response
    background_tasks.add_task(
        send_meeting_email,
        to_email=schedule.intern_email,
        intern_name=schedule.intern_name,
        meeting_title=schedule.title,
        meeting_time=schedule.meeting_time,
        meeting_link=schedule.meeting_link
    )

    return {
        "status": "success",
        "message": f"Đã tạo lịch họp và kích hoạt gửi email tự động cho {schedule.intern_email}"
    }