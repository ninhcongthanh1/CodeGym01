"""Local setup helper: assign an existing intern profile to an active mentor."""
import argparse
from datetime import datetime, timezone
from database import Base, engine, SessionLocal
from models.user import User
from models.intern_profile import InternProfile
from models.mentor_evaluation import MentorAssignment, MentorEvaluation


def main():
    parser = argparse.ArgumentParser(description="Phân công TTS cho Mentor trước khi đánh giá")
    parser.add_argument("--intern-id", type=int, required=True, help="ID hồ sơ intern_profiles, không phải users.id")
    parser.add_argument("--mentor-username", required=True)
    args = parser.parse_args()
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        intern = db.get(InternProfile, args.intern_id)
        mentor = db.query(User).filter_by(username=args.mentor_username, role="mentor", is_active=True).first()
        if not intern or not mentor:
            parser.exit(1, "Không tìm thấy hồ sơ TTS hoặc Mentor đang hoạt động.\n")
        assignment = db.get(MentorAssignment, intern.id)
        if assignment and assignment.mentor_id != mentor.id:
            parser.exit(1, "Hồ sơ đã có mentor khác. Dùng API HR để thay đổi phân công.\n")
        if not assignment:
            db.add(MentorAssignment(intern_id=intern.id, mentor_id=mentor.id, assigned_at=datetime.now(timezone.utc).replace(tzinfo=None)))
            db.commit()
        print(f"Đã phân công {intern.full_name} (#{intern.id}) cho {mentor.full_name} ({mentor.username}).")


if __name__ == "__main__":
    main()
