from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.user import User
from models.intern_profile import InternProfile
from schemas.intern_document import InternDocumentResponse
from services.intern_document_service import upload_intern_document

from services.intern_document_service import (
    upload_intern_document,
    get_intern_documents,
    update_document_status
)
from dependencies.auth import (
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


@router.post(
    "/upload",
    response_model=InternDocumentResponse,
    status_code=201
)
def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "intern":
        raise HTTPException(
            status_code=403,
            detail="Only interns can upload documents"
        )

    intern_profile = db.query(InternProfile).filter(
        InternProfile.user_id == current_user.id
    ).first()

    if not intern_profile:
        raise HTTPException(
            status_code=404,
            detail="Intern profile not found"
        )

    result = upload_intern_document(
        db=db,
        intern_id=intern_profile.id,
        document_type=document_type,
        file=file
    )

    if result == "INVALID_DOCUMENT_TYPE":
        raise HTTPException(
            status_code=400,
            detail="Invalid document type"
        )

    if result == "INVALID_FILE_TYPE":
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC and DOCX files are allowed"
        )

    if result == "FILE_TOO_LARGE":
        raise HTTPException(
            status_code=400,
            detail="File size must not exceed 5 MB"
        )

    return result

@router.get(
    "/intern/{intern_id}",
    response_model=list[InternDocumentResponse]
)
def get_documents_by_intern(
    intern_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hr"))
):
    return get_intern_documents(
        db,
        intern_id
    )

@router.patch(
    "/{document_id}/approve",
    response_model=InternDocumentResponse
)
def approve_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hr"))
):
    document = update_document_status(
        db,
        document_id,
        "approved"
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document

@router.patch(
    "/{document_id}/reject",
    response_model=InternDocumentResponse
)
def reject_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hr"))
):
    document = update_document_status(
        db,
        document_id,
        "rejected"
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document