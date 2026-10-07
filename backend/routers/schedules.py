from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from dependencies.auth import get_current_user
from services.schedule_service import get_schedules_by_intern
from schemas.schedule import ScheduleResponse

router = APIRouter(prefix="/schedules", tags=["Schedules"])

@router.get("/my-schedule", response_model=List[ScheduleResponse])
def get_my_schedule(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Lấy thông tin intern profile liên kết với user hiện tại
    intern_profile = current_user.get("intern_profile")
    if not intern_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Không tìm thấy thông tin thực tập sinh"
        )
    
    return get_schedules_by_intern(db, intern_id=intern_profile.id)