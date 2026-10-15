import React, { useState } from 'react';
import { 
  UserPlus, CheckCircle, XCircle, Mail, Calendar, 
  FileText, Clock, ChevronRight, UserCheck, Eye, 
  Building, Sparkles, Send 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InternProfile, InternStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface RecruitmentViewProps {
  onOpenPublicApply: () => void;
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({ onOpenPublicApply }) => {
  const { 
    interns, departments, programs, mentors, 
    updateInternStatus, assignMentor, sendSystemEmail,
    hasPermission
  } = useApp();

  const [selectedCandidate, setSelectedCandidate] = useState<InternProfile | null>(null);
  const [interviewModalCandidate, setInterviewModalCandidate] = useState<InternProfile | null>(null);
  const [interviewDate, setInterviewDate] = useState('2026-07-20 14:00');
  const [interviewNote, setInterviewNote] = useState('Phỏng vấn đánh giá tư duy lập trình và kiến thức nền tảng Web');

  // Candidate pipeline
  const applyingList = interns.filter(i => i.status === 'applying');
  const interviewingList = interns.filter(i => i.status === 'interviewing');
  const acceptedList = interns.filter(i => i.status === 'accepted' || i.status === 'active');
  const rejectedList = interns.filter(i => i.status === 'terminated');

  const handleScheduleInterview = (candidate: InternProfile) => {
    updateInternStatus(candidate.id, 'interviewing');
    sendSystemEmail({
      toEmail: candidate.email,
      recipientName: candidate.fullName,
      subject: `[IMS TechCorp] Thư mời phỏng vấn Thực tập sinh - ${interviewDate}`,
      content: `Kính gửi bạn ${candidate.fullName},\n\nBan Tuyển dụng trân trọng kính mời bạn tham gia buổi phỏng vấn kỹ thuật vào lúc ${interviewDate}.\nNội dung: ${interviewNote}.\nĐịa điểm: Phòng Phỏng Vấn Trực Tuyến / Tòa nhà Tech Innovation.`,
      type: 'interview_invitation'
    });
    setInterviewModalCandidate(null);
  };

  const handleAcceptCandidate = (candidate: InternProfile) => {
    updateInternStatus(candidate.id, 'accepted');
  };

  const handleRejectCandidate = (candidate: InternProfile) => {
    updateInternStatus(candidate.id, 'terminated');
    sendSystemEmail({
      toEmail: candidate.email,
      recipientName: candidate.fullName,
      subject: `[IMS TechCorp] Thông báo kết quả ứng tuyển thực tập sinh`,
      content: `Kính gửi bạn ${candidate.fullName},\n\nCảm ơn bạn đã quan tâm đến chương trình thực tập của chúng tôi. Sau khi xem xét kỹ lưỡng hồ sơ, rất tiếc hiện tại chúng tôi chưa thể sắp xếp vị trí phù hợp với bạn trong đợt này. Chúng tôi sẽ lưu hồ sơ của bạn cho các đợt tuyển dụng tiếp theo.`,
      type: 'rejection'
    });
  };

  const renderCandidateCard = (candidate: InternProfile) => {
    const dept = departments.find(d => d.id === candidate.departmentId);
    return (
      <div
        key={candidate.id}
        className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <img
              src={candidate.avatar}
              alt={candidate.fullName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div>
              <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{candidate.fullName}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-1">{candidate.university}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700">
            GPA {candidate.gpa}
          </span>
        </div>

        <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div><strong>Ngành:</strong> {candidate.major}</div>
          <div><strong>Phòng ban:</strong> {dept?.name || 'Chưa gán'}</div>
          {candidate.notes && <div className="text-slate-500 italic line-clamp-1">"{candidate.notes}"</div>}
        </div>

        {/* Action buttons based on status */}
        <div className="flex items-center justify-between pt-1 gap-1.5">
          <button
            onClick={() => setSelectedCandidate(candidate)}
            className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem CV</span>
          </button>

          <div className="flex items-center gap-1">
            {hasPermission('recruitment:manage') && candidate.status === 'applying' && (
              <>
                <button
                  onClick={() => setInterviewModalCandidate(candidate)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs"
                >
                  Mời PV
                </button>
                <button
                  onClick={() => handleRejectCandidate(candidate)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Từ chối"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {hasPermission('recruitment:manage') && candidate.status === 'interviewing' && (
              <>
                <button
                  onClick={() => handleAcceptCandidate(candidate)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Tiếp nhận</span>
                </button>
                <button
                  onClick={() => handleRejectCandidate(candidate)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Từ chối"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Tiếp Nhận & Xét Duyệt Hồ Sơ Tuyển Dụng
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý phễu ứng viên từ Cổng nộp trực tuyến, lên lịch phỏng vấn, gửi email tự động và tiếp nhận thực tập sinh
          </p>
        </div>

        <button
          onClick={onOpenPublicApply}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Mở Cổng Ứng Tuyển Mới</span>
        </button>
      </div>

      {/* Kanban Pipeline Columns (Story 6, 7, 8) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Mới Ứng Tuyển */}
        <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Hồ Sơ Mới Nộp</h3>
            </div>
            <span className="text-xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {applyingList.length}
            </span>
          </div>

          <div className="space-y-3">
            {applyingList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-white/60 rounded-xl border border-dashed border-slate-300">
                Không có hồ sơ nào đang chờ duyệt
              </div>
            ) : (
              applyingList.map(renderCandidateCard)
            )}
          </div>
        </div>

        {/* Column 2: Đang Phỏng Vấn */}
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Đang Phỏng Vấn</h3>
            </div>
            <span className="text-xs font-bold bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              {interviewingList.length}
            </span>
          </div>

          <div className="space-y-3">
            {interviewingList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-white/60 rounded-xl border border-dashed border-slate-300">
                Chưa có ứng viên trong vòng phỏng vấn
              </div>
            ) : (
              interviewingList.map(renderCandidateCard)
            )}
          </div>
        </div>

        {/* Column 3: Đã Trúng Tuyển & Nhận Vào Thực Tập */}
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Đã Tiếp Nhận</h3>
            </div>
            <span className="text-xs font-bold bg-white text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              {acceptedList.length}
            </span>
          </div>

          <div className="space-y-3">
            {acceptedList.slice(0, 5).map(renderCandidateCard)}
          </div>
        </div>
      </div>

      {/* MODAL: LÊN LỊCH PHỎNG VẤN & GỬI EMAIL THÔNG BÁO (Story 7, 8) */}
      {interviewModalCandidate && (
        <Modal
          isOpen={!!interviewModalCandidate}
          onClose={() => setInterviewModalCandidate(null)}
          title={`Lên Lịch Phỏng Vấn: ${interviewModalCandidate.fullName}`}
          subtitle="Hệ thống sẽ tự động gửi Email thư mời phỏng vấn đến ứng viên"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian phỏng vấn</label>
              <input
                type="text"
                value={interviewDate}
                onChange={e => setInterviewDate(e.target.value)}
                placeholder="2026-07-20 14:00"
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Người phỏng vấn / Mentor đề xuất</label>
              <select className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500">
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} - {m.jobTitle}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung / Lưu ý buổi phỏng vấn</label>
              <textarea
                rows={3}
                value={interviewNote}
                onChange={e => setInterviewNote(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
              <Mail className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <span>Email thông báo sẽ tự động gửi tới: <strong>{interviewModalCandidate.email}</strong></span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInterviewModalCandidate(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleScheduleInterview(interviewModalCandidate)}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Xác Nhận & Gửi Thư Mời</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: XEM CHI TIẾT HỒ SƠ ỨNG VIÊN */}
      {selectedCandidate && (
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={`Hồ Sơ Ứng Tuyển: ${selectedCandidate.fullName}`}
          subtitle={`${selectedCandidate.university} | Ngành: ${selectedCandidate.major}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div><strong>Họ và tên:</strong> {selectedCandidate.fullName}</div>
              <div><strong>Email:</strong> {selectedCandidate.email}</div>
              <div><strong>Số điện thoại:</strong> {selectedCandidate.phone}</div>
              <div><strong>Điểm GPA:</strong> {selectedCandidate.gpa} / 4.0</div>
              <div><strong>Năm tốt nghiệp:</strong> {selectedCandidate.graduationYear}</div>
              <div><strong>Trạng thái:</strong> {selectedCandidate.status}</div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Tài liệu đính kèm</h4>
              <div className="space-y-2">
                {selectedCandidate.documents.map(doc => (
                  <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-slate-800">{doc.name}</span>
                    </div>
                    <Badge variant={doc.isVerified ? 'success' : 'warning'} size="sm">
                      {doc.isVerified ? 'Đã duyệt' : 'Chưa duyệt'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
