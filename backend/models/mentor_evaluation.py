from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class MentorAssignment(Base):
    __tablename__ = "mentor_assignments"
    intern_id: Mapped[int] = mapped_column(ForeignKey("intern_profiles.id"), primary_key=True)
    mentor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MentorEvaluation(Base):
    __tablename__ = "mentor_evaluations"
    __table_args__ = (
        UniqueConstraint("intern_id", "mentor_id", name="uq_evaluation_intern_mentor"),
        *(CheckConstraint(f"{key} IS NULL OR ({key} >= 1 AND {key} <= 5)", name=f"ck_evaluation_{key}") for key in (
            "technical", "problem_solving", "learning", "discipline", "initiative", "teamwork")),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    intern_id: Mapped[int] = mapped_column(ForeignKey("intern_profiles.id"), index=True)
    mentor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    technical: Mapped[int | None] = mapped_column(Integer, nullable=True)
    problem_solving: Mapped[int | None] = mapped_column(Integer, nullable=True)
    learning: Mapped[int | None] = mapped_column(Integer, nullable=True)
    discipline: Mapped[int | None] = mapped_column(Integer, nullable=True)
    initiative: Mapped[int | None] = mapped_column(Integer, nullable=True)
    teamwork: Mapped[int | None] = mapped_column(Integer, nullable=True)
    strengths: Mapped[str] = mapped_column(Text, default="")
    improvements: Mapped[str] = mapped_column(Text, default="")
    conclusion: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="draft")
    revision: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
