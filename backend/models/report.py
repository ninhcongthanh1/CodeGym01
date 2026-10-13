from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    feedback = Column(Text, nullable=True)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    intern = relationship("User", foreign_keys=[intern_id])