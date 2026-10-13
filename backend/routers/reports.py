from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.report import Report, ReportStatus
from schemas.report import ReportResponse, ReportFeedbackUpdate
from dependencies.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])

# US18: Mentor lấy danh sách tất cả báo cáo
@router.get("/", response_model=List[ReportResponse])
def get_all_reports(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role not in ["mentor", "admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Chỉ Mentor/HR/Admin mới có quyền truy cập"
        )
    return db.query(Report).all()

# US18: Xem chi tiết 1 báo cáo
@router.get("/{report_id}", response_model=ReportResponse)
def get_report_detail(
    report_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role not in ["mentor", "admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Không có quyền truy cập"
        )
    
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Không tìm thấy báo cáo"
        )
    return report

# US18: Mentor gửi/cập nhật phản hồi cho báo cáo
@router.put("/{report_id}/feedback", response_model=ReportResponse)
def give_feedback(
    report_id: int,
    payload: ReportFeedbackUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role not in ["mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Chỉ Mentor mới có quyền phản hồi báo cáo"
        )
    
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Không tìm thấy báo cáo"
        )
    
    report.feedback = payload.feedback
    report.status = ReportStatus.REVIEWED
    db.commit()
    db.refresh(report)
    return report