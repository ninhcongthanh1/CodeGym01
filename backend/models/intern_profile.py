from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class InternProfile(Base):
    __tablename__ = "intern_profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    school: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    major: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    cv_storage_path: Mapped[str] = mapped_column(
        String(300),
        nullable=False
    )

    cv_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    application_storage_path: Mapped[str] = mapped_column(
        String(300),
        nullable=False
    )

    application_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )