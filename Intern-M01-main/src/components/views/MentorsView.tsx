import React, { useState } from 'react';
import { 
  Briefcase, Plus, Users, Mail, Phone, 
  Building2, CheckCircle2, Award, ChevronRight, BarChart2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Mentor } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const MentorsView: React.FC = () => {
  const { mentors, departments, interns, currentUser, addMentor } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    departmentId: departments[0]?.id || '',
    jobTitle: 'Senior Tech Lead',
    maxMentees: 4,
    skills: 'React, TypeScript, Node.js, Clean Architecture'
  });

  const handleCreateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    addMentor({
      userId: `u-men-${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      departmentId: formData.departmentId,
      jobTitle: formData.jobTitle,
      maxMentees: formData.maxMentees,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Quản Lý Đội Ngũ Mentor & Cân Bằng Khối Lượng Công Việc
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi năng lực hướng dẫn của từng Mentor, cân đối số lượng mentee để đảm bảo chất lượng đào tạo (Workload Balance)
          </p>
        </div>

        {currentUser.role !== 'intern' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mentor Mới</span>
          </button>
        )}
      </div>

      {/* Mentors Grid (Story 29, 31) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mentors.map(mentor => {
          const dept = departments.find(d => d.id === mentor.departmentId);
          const menteeList = interns.filter(i => i.mentorId === mentor.id);
          const loadPercent = Math.min(100, Math.round((menteeList.length / mentor.maxMentees) * 100));

          return (
            <div
              key={mentor.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="text-center space-y-2">
                  <img
                    src={mentor.avatar}
                    alt={mentor.fullName}
                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{mentor.fullName}</h4>
                    <p className="text-xs text-blue-600 font-semibold">{mentor.jobTitle}</p>
                    <p className="text-[11px] text-slate-500">{dept?.name}</p>
                  </div>
                </div>

                {/* Workload Bar (Story 31: Cân bằng khối lượng công việc) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Tải công việc (Mentees):</span>
                    <span className={loadPercent >= 100 ? 'text-rose-600' : 'text-emerald-700'}>
                      {menteeList.length} / {mentor.maxMentees} sinh viên
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        loadPercent >= 100 ? 'bg-rose-500' : loadPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    {loadPercent >= 100 ? 'Đã đủ tải tối đa' : `Còn nhận thêm ${mentor.maxMentees - menteeList.length} bạn`}
                  </div>
                </div>

                {/* Skills tags */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chuyên môn:</div>
                  <div className="flex flex-wrap gap-1">
                    {mentor.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedMentor(mentor)}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Xem {menteeList.length} Thực Tập Sinh</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: THÊM MENTOR MỚI (Story 29) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Mới Mentor Hướng Dẫn"
        subtitle="Mở rộng đội ngũ chuyên gia kèm cặp thực tập sinh"
        maxWidth="md"
      >
        <form onSubmit={handleCreateMentor} className="space-y-4">
          {/* Account Auto-Creation Callout */}
          <div className="p-3.5 rounded-xl bg-purple-50/90 border border-purple-200 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              🔑
            </div>
            <div className="text-xs">
              <span className="font-bold text-purple-900 block mb-0.5">
                Tự Động Tạo Tài Khoản Mentor & Lưu SQLite Database Thật
              </span>
              <p className="text-purple-800 text-[11px] leading-relaxed">
                Hệ thống tự động đồng bộ tài khoản vào bảng <code className="font-mono font-semibold bg-purple-100/80 px-1 rounded">users</code> trong SQLite với:
                <br />
                • Tên đăng nhập: <b>Email mentor</b>
                <br />
                • Mật khẩu mặc định: <code className="font-mono font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">Mentor@2026</code>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên Mentor *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email công ty *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chức danh / Vị trí chuyên môn *</label>
            <input
              type="text"
              required
              value={formData.jobTitle}
              onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban *</label>
              <select
                value={formData.departmentId}
                onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số mentee tối đa *</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxMentees}
                onChange={e => setFormData({ ...formData, maxMentees: parseInt(e.target.value) || 4 })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kỹ năng chuyên môn (cách nhau bởi dấu phẩy)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Lưu Mentor
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: XEM DANH SÁCH MENTEES CỦA MENTOR (Story 30, 31) */}
      {selectedMentor && (
        <Modal
          isOpen={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
          title={`Thực Tập Sinh Do ${selectedMentor.fullName} Hướng Dẫn`}
          subtitle={`${selectedMentor.jobTitle} | Đang kèm ${interns.filter(i => i.mentorId === selectedMentor.id).length} bạn`}
          maxWidth="md"
        >
          <div className="space-y-3">
            {interns.filter(i => i.mentorId === selectedMentor.id).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                Mentor này hiện chưa được phân công thực tập sinh nào
              </div>
            ) : (
              interns.filter(i => i.mentorId === selectedMentor.id).map(intern => (
                <div key={intern.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={intern.avatar}
                      alt={intern.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{intern.fullName}</h4>
                      <p className="text-[11px] text-slate-500">{intern.university} • GPA {intern.gpa}</p>
                    </div>
                  </div>
                  <Badge variant={intern.status === 'active' ? 'primary' : 'success'} size="sm">
                    {intern.status === 'active' ? 'Đang thực tập' : 'Hoàn thành'}
                  </Badge>
                </div>
              ))
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedMentor(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
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
