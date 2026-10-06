from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import require_roles
from models.user import User
from schemas.internship_program import (
    InternshipProgramCreate,
    InternshipProgramResponse
)
from services.internship_program_service import (
    create_internship_program
)


router = APIRouter(
    prefix="/api/internship-programs",
    tags=["Internship Programs"]
)


@router.post(
    "",
    response_model=InternshipProgramResponse,
    status_code=201
)
def create_program(
    program_data: InternshipProgramCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hr"))
):
    return create_internship_program(
        db=db,
        program_data=program_data,
        created_by=current_user.id
    )