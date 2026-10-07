from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("intern_profiles.id"), nullable=False)
    title = Column(String, nullable=False)        # Tên công việc / buổi họp
    description = Column(String, nullable=True)  # Chi tiết công việc
    date = Column(Date, nullable=False)          # Ngày thực hiện
    start_time = Column(Time, nullable=True)    # Giờ bắt đầu
    end_time = Column(Time, nullable=True)      # Giờ kết thúc
    status = Column(String, default="Pending")   # Trạng thái (Pending, In Progress, Completed)

    # Khai báo mối quan hệ với InternProfile
    intern = relationship("InternProfile", back_populates="schedules")