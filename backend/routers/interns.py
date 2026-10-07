from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import require_roles
from models.user import User
from schemas.intern_profile import (
    InternProfileCreate,
    InternProfileResponse
)

from services.intern_service import (
    create_intern_profile,
    get_intern_profiles,
    get_intern_profile_by_id,
    update_intern_profile,
    submit_intern_application,
    get_my_intern_profile
)

from services.intern_service import (
    create_intern_profile,
    get_intern_profiles,
    get_intern_profile_by_id
)

from services.intern_service import create_intern_profile

from services.intern_service import (
    create_intern_profile,
    get_intern_profiles
)


router = APIRouter(
    prefix="/api/interns",
    tags=["Interns"]
)

@router.get("/me", response_model=InternProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("intern"))
):
    intern = get_my_intern_profile(
        db,
        current_user.id
    )

    if not intern:
        raise HTTPException(
            status_code=404,
            detail="Intern profile not found"
        )

    return intern

@router.put("/me", response_model=InternProfileResponse)
def update_my_profile(
    intern_data: InternProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("intern"))
):
    intern = get_my_intern_profile(db, current_user.id)

    if not intern:
        raise HTTPException(
            status_code=404,
            detail="Intern profile not found"
        )

    # Intern không được sửa hồ sơ đã được duyệt
    if intern.status == "approved":
        raise HTTPException(
            status_code=400,
            detail="Approved profile cannot be edited"
        )

    result = update_intern_profile(
        db,
        intern.id,
        intern_data
    )

    if result == "EMAIL_EXISTS":
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    if result == "STUDENT_ID_EXISTS":
        raise HTTPException(
            status_code=409,
            detail="Student ID already exists"
        )

    return result

@router.get(
    "/{intern_id}",
    response_model=InternProfileResponse
)
def get_intern_detail(
    intern_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hr"))
):
    intern = get_intern_profile_by_id(db, intern_id)

    if not intern:
        raise HTTPException(
            status_code=404,
            detail="Intern profile not found"
        )

    return intern

@router.get(
    "/",
    response_model=list[InternProfileResponse]
)
def get_interns(
    school: str | None = None,
    major: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hr"))
):
    return get_intern_profiles(
        db,
        school,
        major
    )

@router.post(
    "/",
    response_model=InternProfileResponse,
    status_code=201
)
def create_intern(
    intern_data: InternProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hr"))
):
    result = create_intern_profile(db, intern_data)

    if result == "EMAIL_EXISTS":
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    if result == "USERNAME_EXISTS":
        raise HTTPException(
            status_code=409,
            detail="Student ID or username already exists"
        )

    if result == "USERNAME_REQUIRED":
        raise HTTPException(
            status_code=400,
            detail="Student ID or phone is required"
        )

    return result

@router.post("/me/submit", response_model=InternProfileResponse)
def submit_my_application(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("intern"))
):
    result = submit_intern_application(
        db,
        current_user.id
    )

    if result == "PROFILE_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Intern profile not found"
        )

    if result == "ALREADY_APPROVED":
        raise HTTPException(
            status_code=400,
            detail="Application has already been approved"
        )

    if result == "ALREADY_PENDING":
        raise HTTPException(
            status_code=400,
            detail="Application is already pending"
        )

    return result

@router.put(
    "/{intern_id}",
    response_model=InternProfileResponse
)
def update_intern(
    intern_id: int,
    intern_data: InternProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hr"))
):
    intern = update_intern_profile(
        db,
        intern_id,
        intern_data
    )

    if intern == "EMAIL_EXISTS":
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    if intern == "STUDENT_ID_EXISTS":
        raise HTTPException(
            status_code=409,
            detail="Student ID already exists"
        )

    if not intern:
        raise HTTPException(
            status_code=404,
            detail="Intern profile not found"
        )

    return intern