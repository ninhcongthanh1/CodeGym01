from sqlalchemy.orm import Session
from models.schedule import Schedule
from schemas.schedule import ScheduleCreate

def get_schedules_by_intern(db: Session, intern_id: int):
    return db.query(Schedule).filter(Schedule.intern_id == intern_id).order_by(Schedule.date.asc()).all()

def create_schedule(db: Session, schedule_data: ScheduleCreate):
    db_schedule = Schedule(**schedule_data.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule