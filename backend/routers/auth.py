from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import create_access_token, hash_password, verify_password
from models.user import User
from schemas.auth import RegisterRequest, TokenResponse


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_intern(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        or_(User.username == payload.username, User.email == payload.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Tên đăng nhập hoặc email đã được sử dụng")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="intern"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_access_token({"sub": str(user.id)})}


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if user is None or not user.is_active or not verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return {"access_token": create_access_token({"sub": str(user.id)})}