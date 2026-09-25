from sqlalchemy.orm import Session

from models.user import User
from schemas.user import UserCreate
from services.auth_service import hash_password

from schemas.user import UserCreate, UserUpdate


def create_user(db: Session, user_data: UserCreate):
    existing_username = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if existing_username:
        return "USERNAME_EXISTS"

    existing_email = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_email:
        return "EMAIL_EXISTS"

    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def get_users(db: Session):
    return db.query(User).all()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(
        User.id == user_id
    ).first()

def update_user(
    db: Session,
    user_id: int,
    user_data: UserUpdate
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return None

    user.email = user_data.email
    user.full_name = user_data.full_name

    db.commit()
    db.refresh(user)

    return user

def update_user_role(
    db: Session,
    user_id: int,
    role: str
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return None

    user.role = role

    db.commit()
    db.refresh(user)

    return user

def update_user_status(
    db: Session,
    user_id: int,
    is_active: bool
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return None

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return user