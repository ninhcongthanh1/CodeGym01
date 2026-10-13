from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from database import get_db
from dependencies.auth import require_roles
from models.user import User
from models.intern_profile import InternProfile
from models.mentor_evaluation import MentorAssignment, MentorEvaluation
from schemas.mentor_evaluation import EvaluationSave, AssignmentSave, CRITERIA

router = APIRouter(prefix="/api/mentor", tags=["Mentor evaluations"])


def require_assignment(db, intern_id, mentor_id):
    if not db.get(InternProfile, intern_id):
        raise HTTPException(404, "Không tìm thấy hồ sơ thực tập sinh")
    assignment = db.get(MentorAssignment, intern_id)
    if not assignment or assignment.mentor_id != mentor_id:
        raise HTTPException(403, "Bạn chỉ được đánh giá TTS được phân công cho mình")
    return assignment


def serialize(evaluation):
    if not evaluation:
        return None
    scores = [getattr(evaluation, key) for key in CRITERIA]
    complete = all(s is not None for s in scores)
    skill = round(sum(scores[:3]) / 3, 2) if complete else None
    attitude = round(sum(scores[3:]) / 3, 2) if complete else None
    # Classification uses the unrounded average, matching the frontend preview.
    raw = sum(scores) / 6 if complete else None
    rating = None if raw is None else "Xuất sắc" if raw >= 4.5 else "Tốt" if raw >= 3.5 else "Đạt" if raw >= 2.5 else "Cần cải thiện"
    return {
        "id": evaluation.id, "intern_id": evaluation.intern_id, "mentor_id": evaluation.mentor_id,
        **{key: getattr(evaluation, key) for key in CRITERIA},
        "strengths": evaluation.strengths, "improvements": evaluation.improvements,
        "conclusion": evaluation.conclusion, "status": evaluation.status,
        "revision": evaluation.revision, "skill_score": skill, "attitude_score": attitude,
        "overall_score": round(raw, 2) if complete else None, "rating": rating,
        "created_at": evaluation.created_at, "updated_at": evaluation.updated_at,
        "submitted_at": evaluation.submitted_at,
    }


@router.get("/interns")
def assigned_interns(db: Session = Depends(get_db), user: User = Depends(require_roles("mentor"))):
    profiles = db.query(InternProfile).join(MentorAssignment, MentorAssignment.intern_id == InternProfile.id).filter(MentorAssignment.mentor_id == user.id).order_by(InternProfile.full_name, InternProfile.id).all()
    evaluations = {e.intern_id: e for e in db.query(MentorEvaluation).filter(MentorEvaluation.mentor_id == user.id).all()}
    return [{"id": i.id, "full_name": i.full_name, "email": i.email, "school": i.school,
             "major": i.major, "internship_position": i.internship_position,
             "internship_start_date": i.internship_start_date,
             "internship_end_date": i.internship_end_date, "status": i.status,
             "evaluation": serialize(evaluations.get(i.id))} for i in profiles]


@router.get("/evaluations/{intern_id}")
def get_evaluation(intern_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles("mentor"))):
    require_assignment(db, intern_id, user.id)
    evaluation = db.query(MentorEvaluation).filter_by(intern_id=intern_id, mentor_id=user.id).first()
    return serialize(evaluation)


@router.put("/evaluations/{intern_id}")
def save_evaluation(intern_id: int, data: EvaluationSave, db: Session = Depends(get_db), user: User = Depends(require_roles("mentor"))):
    # Lock assignment until commit so HR reassignment cannot race with an evaluation write.
    require_assignment(db, intern_id, user.id)
    assignment = db.query(MentorAssignment).filter_by(intern_id=intern_id).with_for_update().first()
    if not assignment or assignment.mentor_id != user.id:
        raise HTTPException(403, "Phân công mentor đã thay đổi. Hãy tải lại danh sách")
    existing = db.query(MentorEvaluation).filter_by(intern_id=intern_id, mentor_id=user.id).first()
    if existing and existing.status == "submitted":
        raise HTTPException(409, "Đánh giá đã gửi và không thể chỉnh sửa")
    now = datetime.utcnow()
    values = data.model_dump(exclude={"expected_revision"})
    values.update(updated_at=now, submitted_at=now if data.status == "submitted" else None)
    try:
        if existing:
            result = db.execute(update(MentorEvaluation).where(
                MentorEvaluation.id == existing.id,
                MentorEvaluation.revision == data.expected_revision,
                MentorEvaluation.status == "draft",
            ).values(**values, revision=MentorEvaluation.revision + 1))
            if result.rowcount != 1:
                db.rollback()
                raise HTTPException(409, "Đánh giá đã được cập nhật ở phiên khác. Hãy tải lại")
        else:
            if data.expected_revision != 0:
                raise HTTPException(409, "Phiên bản đánh giá không hợp lệ. Hãy tải lại")
            db.add(MentorEvaluation(intern_id=intern_id, mentor_id=user.id, revision=1, **values))
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Đánh giá đã được tạo ở phiên khác. Hãy tải lại")
    evaluation = db.query(MentorEvaluation).filter_by(intern_id=intern_id, mentor_id=user.id).first()
    db.refresh(evaluation)
    return serialize(evaluation)


@router.put("/assignments/{intern_id}")
def assign_mentor(intern_id: int, data: AssignmentSave, db: Session = Depends(get_db), user: User = Depends(require_roles("hr", "admin"))):
    if not db.get(InternProfile, intern_id):
        raise HTTPException(404, "Không tìm thấy hồ sơ thực tập sinh")
    mentor = db.get(User, data.mentor_id)
    if not mentor or mentor.role != "mentor" or not mentor.is_active:
        raise HTTPException(400, "Chọn tài khoản Mentor đang hoạt động")
    assignment = db.query(MentorAssignment).filter_by(intern_id=intern_id).with_for_update().first()
    if assignment:
        assignment.mentor_id = data.mentor_id
        assignment.assigned_at = datetime.utcnow()
    else:
        db.add(MentorAssignment(intern_id=intern_id, mentor_id=data.mentor_id))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Phân công vừa được cập nhật. Hãy thử lại")
    return {"intern_id": intern_id, "mentor_id": data.mentor_id}
