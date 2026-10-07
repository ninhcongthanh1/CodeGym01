from sqlalchemy.orm import Session

from models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    commit: bool = True
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message
    )

    db.add(notification)

    if commit:
        db.commit()
        db.refresh(notification)

    return notification


def get_my_notifications(db: Session, user_id: int):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .limit(50)
        .all()
    )


def mark_as_read(db: Session, notification_id: int, user_id: int):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        .first()
    )

    if not notification:
        return None

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return notification


def mark_all_as_read(db: Session, user_id: int):
    (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False  # noqa: E712
        )
        .update({"is_read": True})
    )
    db.commit()