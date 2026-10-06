from sqlalchemy.orm import Session

from models.internship_program import InternshipProgram
from schemas.internship_program import InternshipProgramCreate


def create_internship_program(
    db: Session,
    program_data: InternshipProgramCreate,
    created_by: int
):
    program = InternshipProgram(
        name=program_data.name,
        department=program_data.department,
        description=program_data.description,
        start_date=program_data.start_date,
        end_date=program_data.end_date,
        status=program_data.status,
        created_by=created_by
    )

    db.add(program)
    db.commit()
    db.refresh(program)

    return program