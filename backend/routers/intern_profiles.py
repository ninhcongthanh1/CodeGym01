from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user, require_roles
from models.intern_profile import InternProfile
from models.user import User
from schemas.intern_profile import InternProfileResponse


router = APIRouter(
    prefix="/api/intern-profile",
    tags=["Intern profile"]
)

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
DOCUMENT_TYPES = {"cv", "application"}


def _read_upload(upload: UploadFile, label: str) -> tuple[bytes, str, str]:
    original_name = Path((upload.filename or "").replace("\\", "/")).name
    extension = Path(original_name).suffix.lower()

    if not original_name or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"{label}: chỉ chấp nhận file PDF, DOC hoặc DOCX"
        )

    contents = upload.file.read(MAX_FILE_SIZE + 1)
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"{label}: dung lượng tối đa là 10 MB"
        )

    valid_signature = (
        (extension == ".pdf" and contents.startswith(b"%PDF-"))
        or (extension == ".doc" and contents.startswith(bytes.fromhex("D0CF11E0A1B11AE1")))
        or (extension == ".docx" and contents.startswith(b"PK\x03\x04"))
    )
    if not valid_signature:
        raise HTTPException(
            status_code=400,
            detail=f"{label}: nội dung file không khớp với phần mở rộng"
        )

    return contents, original_name[:255], extension


def _profile_response(profile: InternProfile) -> dict:
    return {
        "school": profile.school,
        "major": profile.major,
        "phone": profile.phone,
        "cv_filename": profile.cv_filename,
        "application_filename": profile.application_filename,
        "updated_at": profile.updated_at
    }


@router.get("/me", response_model=InternProfileResponse | None)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("intern"))
):
    profile = db.query(InternProfile).filter_by(user_id=current_user.id).first()
    return _profile_response(profile) if profile else None


@router.put("/me", response_model=InternProfileResponse)
def save_my_profile(
    school: str = Form(..., min_length=2, max_length=150),
    major: str = Form(..., min_length=2, max_length=150),
    phone: str = Form(..., min_length=8, max_length=30),
    cv_file: UploadFile | None = File(default=None),
    application_file: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("intern"))
):
    profile = db.query(InternProfile).filter_by(user_id=current_user.id).first()
    if profile is None and (cv_file is None or application_file is None):
        raise HTTPException(
            status_code=400,
            detail="Hồ sơ mới cần có cả CV và đơn xin thực tập"
        )

    uploads = {}
    if cv_file is not None:
        uploads["cv"] = _read_upload(cv_file, "CV")
    if application_file is not None:
        uploads["application"] = _read_upload(
            application_file,
            "Đơn xin thực tập"
        )

    user_directory = UPLOAD_DIR / str(current_user.id)
    new_paths = {}
    old_paths = []
    try:
        user_directory.mkdir(parents=True, exist_ok=True)
        for document_type, (contents, original_name, extension) in uploads.items():
            storage_name = f"{document_type}-{uuid4().hex}{extension}"
            relative_path = Path(str(current_user.id)) / storage_name
            (UPLOAD_DIR / relative_path).write_bytes(contents)
            new_paths[document_type] = str(relative_path)

        if profile is None:
            profile = InternProfile(
                user_id=current_user.id,
                school=school.strip(),
                major=major.strip(),
                phone=phone.strip(),
                cv_storage_path="",
                cv_filename="",
                application_storage_path="",
                application_filename=""
            )
            db.add(profile)

        profile.school = school.strip()
        profile.major = major.strip()
        profile.phone = phone.strip()

        for document_type, (contents, original_name, extension) in uploads.items():
            path_attribute = f"{document_type}_storage_path"
            filename_attribute = f"{document_type}_filename"
            previous_path = getattr(profile, path_attribute)
            if previous_path:
                old_paths.append(UPLOAD_DIR / previous_path)
            setattr(profile, path_attribute, new_paths[document_type])
            setattr(profile, filename_attribute, original_name)

        db.commit()
        db.refresh(profile)
    except Exception:
        db.rollback()
        for relative_path in new_paths.values():
            (UPLOAD_DIR / relative_path).unlink(missing_ok=True)
        raise

    for old_path in old_paths:
        old_path.unlink(missing_ok=True)

    return _profile_response(profile)


@router.get("/me/files/{document_type}")
def download_my_document(
    document_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "intern":
        raise HTTPException(status_code=403, detail="Chỉ thực tập sinh được phép")
    if document_type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=404, detail="Không tìm thấy loại tài liệu")

    profile = db.query(InternProfile).filter_by(user_id=current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Chưa có hồ sơ thực tập")

    storage_path = getattr(profile, f"{document_type}_storage_path")
    filename = getattr(profile, f"{document_type}_filename")
    file_path = UPLOAD_DIR / storage_path
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Không tìm thấy tệp")

    return FileResponse(
        file_path,
        media_type="application/octet-stream",
        filename=filename
    )