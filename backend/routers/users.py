from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from services.user_service import create_user, get_users

from database import get_db
from schemas.user import UserCreate, UserResponse, UserUpdate
from services.user_service import create_user
from dependencies.auth import require_admin, require_roles
from models.user import User

from fastapi import APIRouter, Depends, HTTPException

from services.user_service import (
    create_user,
    get_users,
    get_user_by_id,
    update_user,
    update_user_role,
    update_user_status
)

from schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    UserRoleUpdate,
    UserStatusUpdate
)

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.post("/", response_model=UserResponse)
def create_new_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    user = create_user(db, user_data)

    if user == "USERNAME_EXISTS":
        raise HTTPException(
            status_code=409,
            detail="Username already exists"
        )

    if user == "EMAIL_EXISTS":
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    return user

@router.get("/", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("admin", "hr")
    )
):
    return get_users(db)

@router.get("/{user_id}", response_model=UserResponse)
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("admin", "hr")
    )
):
    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user_detail(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    user = update_user(
        db,
        user_id,
        user_data
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user

@router.patch("/{user_id}/role", response_model=UserResponse)
def change_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    user = update_user_role(
        db,
        user_id,
        role_data.role
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user

@router.patch("/{user_id}/status", response_model=UserResponse)
def change_user_status(
    user_id: int,
    status_data: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    if user_id == current_admin.id and status_data.is_active is False:
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account"
        )

    user = update_user_status(
        db,
        user_id,
        status_data.is_active
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user