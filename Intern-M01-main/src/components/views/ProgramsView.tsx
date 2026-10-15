import React, { useState } from 'react';
import { 
  CalendarDays, Plus, CheckCircle2, Clock, Users, 
  UserCheck, Building2, ChevronRight, Flag 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InternshipProgram } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const ProgramsView: React.FC = () => {
  const { 
    programs, departments, interns, mentors, 
    addProgram, updateProgram, assignMentor 
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<InternshipProgram | null>(null);
  const [assignModalInternId, setAssignModalInternId] = useState<string | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    batchCode: '',
    departmentId: departments[0]?.id || '',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    targetCount: 15,
    description: ''
  });

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    addProgram({
      ...formData,
      currentCount: 0,
      status: 'planning',
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Onboarding & Định hướng văn hóa', date: formData.startDate, completed: false },
        { id: `m-${Date.now()}-2`, title: 'Đánh giá Giữa kỳ (Mid-term)', date: '2026-10-15', completed: false },
        { id: `m-${Date.now()}-3`, title: 'Báo cáo & Tổng kết đợt thực tập', date: formData.endDate, completed: false }
      ]
    });
    setIsAddModalOpen(false);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignModalInternId && selectedMentorId) {
      assignMentor(assignModalInternId, selectedMentorId);
      setAssignModalInternId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Quản Lý Chương Trình & Đợt Thực Tập
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi kế hoạch, chỉ tiêu tuyển dụng theo phòng ban, tiến độ các mốc sự kiện (Milestones) & phân công Mentor
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đợt Thực Tập Mới</span>
        </button>
      </div>

      {/* Programs Grid (Story 11, 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {programs.map(prog => {
          const dept = departments.find(d => d.id === prog.departmentId);
          const progInterns = interns.filter(i => i.programId === prog.id);
          const percent = Math.min(100, Math.round((progInterns.length / (prog.targetCount || 1)) * 100));

          return (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={prog.status === 'ongoing' ? 'primary' : 'warning'} size="sm">
                    {prog.batchCode}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {prog.status === 'ongoing' ? 'Đang diễn ra' : 'Lên kế hoạch'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{prog.name}</h3>
                  <div className="text-xs text-blue-600 font-medium flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{dept?.name || 'Đa phòng ban'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prog.description}
                </p>

                {/* Progress bar (Target vs Current) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Quy mô tiếp nhận:</span>
                    <span className="text-slate-900">{progInterns.length} / {prog.targetCount} thực tập sinh ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Timeline / Dates (Story 13) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Bắt đầu: {prog.startDate}
                  </span>
                  <span>Kết thúc: {prog.endDate}</span>
                </div>

                {/* Milestones Roadmap Preview (Story 14) */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Flag className="w-3 h-3 text-slate-400" />
                    Lộ trình các mốc (Milestones):
                  </div>
                  <div className="space-y-1">
                    {prog.milestones.map(m => (
                      <div key={m.id} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${m.completed ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className={m.completed ? 'line-through text-slate-400' : ''}>{m.title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{m.date.split('-').slice(1).join('/')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {progInterns.length} thành viên
                </span>
                <button
                  onClick={() => setSelectedProgram(prog)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span>Xem danh sách & Gán Mentor</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: TẠO ĐỢT THỰC TẬP MỚI (Story 11) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tạo Chương Trình / Đợt Thực Tập Mới"
        subtitle="Thiết lập kế hoạch thời gian và chỉ tiêu tiếp nhận"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProgram} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chương trình thực tập *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Khóa Thực Tập Sinh Công Nghệ Mùa Thu 2026"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã khóa (Batch Code) *</label>
              <input
                type="text"
                required
                placeholder="AUTUMN-2026-B1"
                value={formData.batchCode}
                onChange={e => setFormData({ ...formData, batchCode: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chỉ tiêu số lượng *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.targetCount}
                onChange={e => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 10 })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban chủ quản *</label>
            <select
              value={formData.departmentId}
              onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày bắt đầu *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày kết thúc *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả mục tiêu khóa thực tập</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả nội dung đào tạo, yêu cầu và tiêu chuẩn đầu ra..."
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Tạo Đợt Thực Tập
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: DANH SÁCH THÀNH VIÊN TRONG ĐỢT & PHÂN CÔNG MENTOR (Story 12) */}
      {selectedProgram && (
        <Modal
          isOpen={!!selectedProgram}
          onClose={() => setSelectedProgram(null)}
          title={`Chi Tiết: ${selectedProgram.name}`}
          subtitle={`Mã: ${selectedProgram.batchCode} | Thời gian: ${selectedProgram.startDate} → ${selectedProgram.endDate}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Danh sách thực tập sinh ({interns.filter(i => i.programId === selectedProgram.id).length} bạn)
              </h4>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {interns.filter(i => i.programId === selectedProgram.id).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Chưa có thực tập sinh nào trong đợt này.
                </div>
              ) : (
                interns.filter(i => i.programId === selectedProgram.id).map(intern => {
                  const mentor = mentors.find(m => m.id === intern.mentorId);
                  return (
                    <div key={intern.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={intern.avatar}
                          alt={intern.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{intern.fullName}</div>
                          <div className="text-[11px] text-slate-500">{intern.university} • GPA {intern.gpa}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-medium text-slate-800">
                            {mentor ? mentor.fullName : <span className="text-rose-500 font-bold">Chưa có Mentor</span>}
                          </div>
                          <div className="text-[10px] text-slate-400">{mentor?.jobTitle || 'Cần phân công'}</div>
                        </div>

                        <button
                          onClick={() => {
                            setAssignModalInternId(intern.id);
                            setSelectedMentorId(intern.mentorId || mentors[0]?.id || '');
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        >
                          Đổi Mentor
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: GÁN MENTOR CHO INTERN (Story 12, 30) */}
      {assignModalInternId && (
        <Modal
          isOpen={!!assignModalInternId}
          onClose={() => setAssignModalInternId(null)}
          title="Phân Công Mentor Cho Thực Tập Sinh"
          subtitle="Chọn Mentor phù hợp chuyên môn hướng dẫn trực tiếp"
          maxWidth="sm"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn Mentor phụ trách *</label>
              <select
                value={selectedMentorId}
                onChange={e => setSelectedMentorId(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} - {m.jobTitle} (Đang kèm {m.currentMenteesCount}/{m.maxMentees})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalInternId(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
              >
                Lưu Phân Công
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
