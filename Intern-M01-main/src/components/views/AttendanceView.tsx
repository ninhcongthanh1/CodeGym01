import React, { useState } from 'react';
import { 
  Clock, CheckCircle2, AlertCircle, Calendar, 
  FileSpreadsheet, Plus, Filter, QrCode, UserCheck, ShieldAlert 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, LeaveRequest } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface AttendanceViewProps {
  onOpenQr: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onOpenQr }) => {
  const { 
    attendance, leaves, interns, currentUser, 
    checkIn, checkOut, submitLeave, reviewLeave, 
    exportAttendanceToExcel, hasPermission
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'attendance' | 'leaves'>('attendance');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    startDate: '2026-07-28',
    endDate: '2026-07-28',
    type: 'exam' as 'sick' | 'personal' | 'exam' | 'other',
    reason: 'Về trường thi môn Cấu trúc Dữ liệu & Giải thuật nâng cao'
  });

  const today = new Date().toISOString().substring(0, 10);
  const myProfile = currentUser.role === 'intern'
    ? interns.find(i => i.id === currentUser.internProfileId || i.email === currentUser.email)
    : null;

  // Filter data for interns so they only see their own records
  const attendanceDisplay = currentUser.role === 'intern' ? attendance.filter(a => a.internId === (myProfile ? myProfile.id : (interns[0]?.id || 'intern-1'))) : attendance;
  const leavesDisplay = currentUser.role === 'intern' ? leaves.filter(l => l.internId === (myProfile ? myProfile.id : (interns[0]?.id || 'intern-1'))) : leaves;

  const currentInternId = myProfile ? myProfile.id : (interns[0]?.id || 'intern-1');
  const todayRecord = attendance.find(a => a.internId === currentInternId && a.date === today);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeave({
      internId: currentInternId,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      type: leaveForm.type,
      reason: leaveForm.reason
    });
    setIsLeaveModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Chấm Công, Điểm Danh & Nghỉ Phép
          </h2>
          <p className="text-xs text-slate-500">
            Ghi nhận thời gian làm việc hàng ngày qua Web / Mã QR, theo dõi chuyên cần & duyệt đơn xin nghỉ phép
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAttendanceToExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel Chấm Công</span>
          </button>
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Quét Mã QR Chấm Công</span>
          </button>
        </div>
      </div>

      {/* Quick Check-in/Check-out Action Console (Story 21) */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
            <Clock className="w-4 h-4" />
            Bảng Điều Khiển Điểm Danh Hôm Nay ({today})
          </div>
          <h3 className="text-lg font-bold">
            {myProfile ? `Thực tập sinh: ${myProfile.fullName}` : 'Chế độ Chấm công Nhanh (Trực tiếp)'}
          </h3>
          <p className="text-xs text-slate-300">
            Ca làm việc tiêu chuẩn: 08:30 - 17:30 (Quy định chấm công trước 08:30)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasPermission('attendance:checkin') ? (
            <>
              <button
                onClick={() => checkIn(currentInternId, 'web')}
                disabled={!!todayRecord?.checkInTime}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                  todayRecord?.checkInTime
                    ? 'bg-emerald-600/50 text-emerald-100 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{todayRecord?.checkInTime ? `Đã Check-in: ${todayRecord.checkInTime}` : 'Check-in Ngay'}</span>
              </button>

              <button
                onClick={() => checkOut(currentInternId)}
                disabled={!todayRecord?.checkInTime || !!todayRecord?.checkOutTime}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                  !todayRecord?.checkInTime || !!todayRecord?.checkOutTime
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{todayRecord?.checkOutTime ? `Đã Check-out: ${todayRecord.checkOutTime}` : 'Check-out Kết Thúc'}</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              Chế độ chỉ xem lịch sử chấm công
            </span>
          )}
        </div>
      </div>

      {/* Tabs Switcher: Chấm công vs Nghỉ phép */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTabSub('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTabSub === 'attendance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Nhật Ký Chấm Công Hàng Ngày ({attendance.length})
        </button>
        <button
          onClick={() => setActiveTabSub('leaves')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTabSub === 'leaves'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đơn Xin Nghỉ Phép ({leaves.length})
        </button>
      </div>

      {/* SUB-VIEW 1: ATTENDANCE LOG TABLE (Story 22) */}
      {activeTabSub === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Thực Tập Sinh</th>
                  <th className="py-3 px-4">Ngày Làm Việc</th>
                  <th className="py-3 px-4">Giờ Check-in</th>
                  <th className="py-3 px-4">Giờ Check-out</th>
                  <th className="py-3 px-4">Tổng Giờ Làm</th>
                  <th className="py-3 px-4">Phương Thức</th>
                  <th className="py-3 px-4">Trạng Thái Chuyên Cần</th>
                  <th className="py-3 px-4">Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceDisplay.map(att => {
                  const intern = interns.find(i => i.id === att.internId);
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{intern?.fullName || 'Thực tập sinh'}</div>
                        <div className="text-[11px] text-slate-500">{intern?.university}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{att.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{att.checkInTime || '--:--'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{att.checkOutTime || '--:--'}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                          {att.workHours} giờ
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={att.checkInMethod === 'qr' ? 'info' : 'neutral'} size="sm">
                          {att.checkInMethod === 'qr' ? 'Quét QR' : 'Trang Web'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={att.status === 'on_time' ? 'success' : att.status === 'late' ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {att.status === 'on_time' ? 'Đúng giờ' : att.status === 'late' ? 'Đi muộn' : 'Vắng mặt'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] italic">
                        {att.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: LEAVE REQUESTS (Story 24) */}
      {activeTabSub === 'leaves' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {hasPermission('attendance:leaves_submit') && (
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Gửi Đơn Xin Nghỉ Phép Mới</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaves.map(leave => {
              const intern = interns.find(i => i.id === leave.internId);
              return (
                <div
                  key={leave.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={intern?.avatar || 'https://images.unsplash.com/photo-1535713875002?w=150'}
                        alt={intern?.fullName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{intern?.fullName}</h4>
                        <p className="text-[11px] text-slate-500">{intern?.university}</p>
                      </div>
                    </div>
                    <Badge
                      variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {leave.status === 'approved' ? 'Đã duyệt' : leave.status === 'rejected' ? 'Từ chối' : 'Chờ HR duyệt'}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-700">
                    <div className="flex items-center justify-between">
                      <span><strong>Thời gian nghỉ:</strong> {leave.startDate} → {leave.endDate}</span>
                      <span className="font-semibold text-blue-600">
                        {leave.type === 'exam' ? 'Lịch thi trường' : leave.type === 'sick' ? 'Nghỉ ốm' : 'Việc riêng'}
                      </span>
                    </div>
                    <div><strong>Lý do:</strong> {leave.reason}</div>
                  </div>

                  {leave.reviewNote && (
                    <div className="text-[11px] text-slate-600 bg-blue-50/60 p-2.5 rounded-lg border border-blue-200">
                      <strong>Phản hồi từ HR:</strong> {leave.reviewNote} ({leave.reviewedBy})
                    </div>
                  )}

                  {/* HR Action Buttons */}
                  {hasPermission('attendance:leaves_review') && leave.status === 'pending' && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          const note = prompt('Ghi chú lý do từ chối (tùy chọn):');
                          reviewLeave(leave.id, 'rejected', note || undefined);
                        }}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors"
                      >
                        Từ Chối
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt('Ghi chú duyệt đơn (ví dụ: Chúc em thi tốt!):');
                          reviewLeave(leave.id, 'approved', note || 'Đồng ý duyệt đơn nghỉ phép.');
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                      >
                        Duyệt Đơn
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ĐĂNG KÝ NGHỈ PHÉP (Story 24) */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Đăng Ký Nghỉ Phép"
        subtitle="Gửi thông báo trước cho Mentor & HR để sắp xếp công việc"
        maxWidth="md"
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Từ ngày *</label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đến ngày *</label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Loại lý do nghỉ *</label>
            <select
              value={leaveForm.type}
              onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value as any })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            >
              <option value="exam">Lịch thi cử / Bảo vệ đồ án tại trường</option>
              <option value="sick">Nghỉ ốm / Khám bệnh</option>
              <option value="personal">Việc cá nhân gia đình</option>
              <option value="other">Lý do khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chi tiết lý do *</label>
            <textarea
              rows={3}
              required
              placeholder="Ghi rõ môn thi, giờ thi hoặc công việc cần nghỉ..."
              value={leaveForm.reason}
              onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Gửi Đơn Xin Phép
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
