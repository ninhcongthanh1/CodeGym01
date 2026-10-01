import os
import uuid

from fastapi import UploadFile
from sqlalchemy.orm import Session

from models.intern_document import InternDocument


UPLOAD_DIR = "uploads/interns"

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx"
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def upload_intern_document(
    db: Session,
    intern_id: int,
    document_type: str,
    file: UploadFile
):
    # Kiểm tra loại tài liệu
    if document_type not in ["cv", "internship_application"]:
        return "INVALID_DOCUMENT_TYPE"

    # Kiểm tra phần mở rộng
    original_name = file.filename or ""
    extension = os.path.splitext(original_name)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        return "INVALID_FILE_TYPE"

    # Đọc file
    file_content = file.file.read()

    # Kiểm tra kích thước
    if len(file_content) > MAX_FILE_SIZE:
        return "FILE_TOO_LARGE"

    # Tạo thư mục lưu file
    intern_folder = os.path.join(
        UPLOAD_DIR,
        str(intern_id)
    )

    os.makedirs(intern_folder, exist_ok=True)

    # Tạo tên file mới để tránh trùng
    new_filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        intern_folder,
        new_filename
    )

    # Lưu file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    # Lưu thông tin file vào database
    document = InternDocument(
        intern_id=intern_id,
        document_type=document_type,
        file_name=original_name,
        file_path=file_path,
        status="pending"
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document

def get_intern_documents(
    db: Session,
    intern_id: int
):
    return db.query(InternDocument).filter(
        InternDocument.intern_id == intern_id
    ).all()

def update_document_status(
    db: Session,
    document_id: int,
    status: str
):
    document = db.query(InternDocument).filter(
        InternDocument.id == document_id
    ).first()

    if not document:
        return None

    document.status = status

    db.commit()
    db.refresh(document)

    return document