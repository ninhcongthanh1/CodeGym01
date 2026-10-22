from sqlalchemy.orm import Session

from models.user import User
from models.intern_profile import InternProfile
from schemas.intern_profile import InternProfileCreate
from services.auth_service import hash_password


def create_intern_profile(db: Session, intern_data: InternProfileCreate):
    # Kiểm tra email đã tồn tại chưa
    if intern_data.email:
        existing_user = db.query(User).filter(
            User.email == intern_data.email
        ).first()

        if existing_user:
            return "EMAIL_EXISTS"

    # Tạo username tự động từ mã sinh viên
    if intern_data.student_id:
        username = intern_data.student_id
    else:
        username = intern_data.phone

    if not username:
        return "USERNAME_REQUIRED"

    # Kiểm tra username đã tồn tại chưa
    existing_username = db.query(User).filter(
        User.username == username
    ).first()

    if existing_username:
        return "USERNAME_EXISTS"

    # Tạo tài khoản intern
    user = User(
        username=username,
        email=intern_data.email,
        password_hash=hash_password("123456"),
        full_name=intern_data.full_name,
        role="intern",
        is_active=True
    )

    db.add(user)
    db.flush()

    # Tạo hồ sơ thực tập sinh
    intern_profile = InternProfile(
        user_id=user.id,
        full_name=intern_data.full_name,
        date_of_birth=intern_data.date_of_birth,
        gender=intern_data.gender,
        phone=intern_data.phone,
        email=intern_data.email,
        school=intern_data.school,
        major=intern_data.major,
        student_id=intern_data.student_id,
        address=intern_data.address,
        internship_position=intern_data.internship_position,
        internship_start_date=intern_data.internship_start_date,
        internship_end_date=intern_data.internship_end_date,
        status="pending"
    )

    db.add(intern_profile)
    db.commit()

    db.refresh(intern_profile)

    return intern_profile

def get_intern_profiles(
    db: Session,
    school: str | None = None,
    major: str | None = None
):
    query = db.query(InternProfile)

    if school:
        query = query.filter(
            InternProfile.school.ilike(f"%{school}%")
        )

    if major:
        query = query.filter(
            InternProfile.major.ilike(f"%{major}%")
        )

    return query.all()

def get_intern_profile_by_id(db: Session, intern_id: int):
    return db.query(InternProfile).filter(
        InternProfile.id == intern_id
    ).first()

def update_intern_profile(
    db: Session,
    intern_id: int,
    intern_data: InternProfileCreate
):
    intern = (
        db.query(InternProfile)
        .filter(InternProfile.id == intern_id)
        .first()
    )

    if not intern:
        return None

    user = (
        db.query(User)
        .filter(User.id == intern.user_id)
        .first()
    )

    if not user:
        return None

    # Kiểm tra email đã được tài khoản khác sử dụng chưa
    if intern_data.email:
        existing_user = (
            db.query(User)
            .filter(
                User.email == intern_data.email,
                User.id != user.id
            )
            .first()
        )

        if existing_user:
            return "EMAIL_EXISTS"

    # Kiểm tra mã sinh viên trùng
    if intern_data.student_id:
        existing_student = (
            db.query(InternProfile)
            .filter(
                InternProfile.student_id == intern_data.student_id,
                InternProfile.id != intern_id
            )
            .first()
        )

        if existing_student:
            return "STUDENT_ID_EXISTS"

    # =========================
    # Cập nhật USER
    # =========================

    user.full_name = intern_data.full_name

    if intern_data.email:
        user.email = intern_data.email

    # =========================
    # Cập nhật INTERN PROFILE
    # =========================

    intern.full_name = intern_data.full_name
    intern.date_of_birth = intern_data.date_of_birth
    intern.gender = intern_data.gender
    intern.phone = intern_data.phone
    intern.email = intern_data.email
    intern.school = intern_data.school
    intern.major = intern_data.major
    intern.student_id = intern_data.student_id
    intern.address = intern_data.address
    intern.internship_position = intern_data.internship_position
    intern.internship_start_date = intern_data.internship_start_date
    intern.internship_end_date = intern_data.internship_end_date

    db.commit()

    db.refresh(intern)

    return intern

def submit_intern_application(db: Session, user_id: int):
    intern = (
        db.query(InternProfile)
        .filter(InternProfile.user_id == user_id)
        .first()
    )

    if not intern:
        return "PROFILE_NOT_FOUND"

    if intern.status == "approved":
        return "ALREADY_APPROVED"

    if intern.status == "pending":
        return "ALREADY_PENDING"

    intern.status = "pending"

    db.commit()
    db.refresh(intern)

    return intern

def get_my_intern_profile(db: Session, user_id: int):
    return (
        db.query(InternProfile)
        .filter(InternProfile.user_id == user_id)
        .first()
    )