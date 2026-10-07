from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user, require_roles
from models.user import User
from schemas.notification import NotificationCreate, NotificationResponse
from services.notification_service import (
    create_notification,
    get_my_notifications,
    mark_as_read,
    mark_all_as_read
)

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)


@router.get("/me", response_model=list[NotificationResponse])
def list_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_my_notifications(db, current_user.id)


@router.patch("/read-all")
def read_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mark_all_as_read(db, current_user.id)
    return {"message": "All notifications marked as read"}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = mark_as_read(db, notification_id, current_user.id)

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


@router.post(
    "/send",
    response_model=NotificationResponse,
    status_code=201
)
def send_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hr", "admin"))
):
    target = db.query(User).filter(User.id == data.user_id).first()

    if not target:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return create_notification(
        db,
        data.user_id,
        data.title,
        data.message
    )