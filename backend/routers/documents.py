import os
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.user import User
from models.document import InternDocument, DocumentStatus
from schemas.document import DocumentResponse, DocumentReviewRequest

router = APIRouter(prefix="/api/documents", tags=["Documents"])

UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# 1. API: Lấy danh sách tài liệu (dành cho HR và Admin)
@router.get("/", response_model=List[DocumentResponse])
def get_documents(
    status_filter: Optional[str] = None,
    intern_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Chỉ HR hoặc Admin mới có quyền xem danh sách tài liệu."
        )

    query = db.query(InternDocument)
    if status_filter:
        query = query.filter(InternDocument.status == status_filter.upper())
    if intern_id:
        query = query.filter(InternDocument.intern_id == intern_id)

    return query.order_by(InternDocument.created_at.desc()).all()


# 2. API: HR Duyệt hoặc Từ chối tài liệu
@router.patch("/{document_id}/review", response_model=DocumentResponse)
def review_document(
    document_id: int,
    payload: DocumentReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Chỉ HR hoặc Admin mới có quyền duyệt tài liệu."
        )

    doc = db.query(InternDocument).filter(InternDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tài liệu.")

    new_status = payload.status.upper()
    if new_status not in [DocumentStatus.APPROVED, DocumentStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Trạng thái không hợp lệ. Chỉ chấp nhận APPROVED hoặc REJECTED."
        )

    if new_status == DocumentStatus.REJECTED and not payload.reject_reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Vui lòng cung cấp lý do khi từ chối tài liệu."
        )

    doc.status = new_status
    doc.reject_reason = payload.reject_reason if new_status == DocumentStatus.REJECTED else None
    doc.reviewed_by = current_user.id
    doc.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(doc)
    return doc


# 3. API: Xem hoặc tải file tài liệu
@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(InternDocument).filter(InternDocument.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File không tồn tại trên hệ thống.")

    return FileResponse(path=doc.file_path, filename=doc.file_name)


# 4. API Tải file thử nghiệm (để bạn tự tạo dữ liệu test độc lập)
@router.post("/test-upload", response_model=DocumentResponse)
def test_upload_document(
    intern_id: int = Form(...),
    document_type: str = Form("CV"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_ext = os.path.splitext(file.filename)[1]
    saved_filename = f"{intern_id}_{int(datetime.utcnow().timestamp())}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_doc = InternDocument(
        intern_id=intern_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=file_path,
        status=DocumentStatus.PENDING
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc