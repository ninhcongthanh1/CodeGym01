from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class InternDocument(Base):
    __tablename__ = "intern_documents"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    intern_id: Mapped[int] = mapped_column(
        ForeignKey("intern_profiles.id"),
        nullable=False
    )

    document_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False
    )

    intern = relationship(
        "InternProfile",
        backref="documents"
    )