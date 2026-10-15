import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, Edit2, Trash2, 
  FileText, CheckCircle2, XCircle, FileSpreadsheet, 
  Eye, Upload, ShieldCheck, Mail, Phone, GraduationCap 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InternProfile, InternStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const InternProfilesView: React.FC = () => {
  const { 
    interns, departments, programs, mentors, 
    addIntern, updateIntern, deleteIntern, verifyDocument, 
    uploadDocument, signContract, exportInternsToExcel,
    hasPermission
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [selectedMajor, setSelectedMajor] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIntern, setEditingIntern] = useState<InternProfile | null>(null);
  const [viewingIntern, setViewingIntern] = useState<InternProfile | null>(null);

  // New Intern Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '2004-01-01',
    gender: 'male' as 'male' | 'female',
    university: 'Đại học Bách Khoa Hà Nội (HUST)',
    major: 'Khoa học Máy tính',
    gpa: 3.6,
    graduationYear: 2026,
    studentId: '20210001',
    departmentId: departments[0]?.id || '',
    programId: programs[0]?.id || '',
    mentorId: mentors[0]?.id || '',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    notes: ''
  });

  // Extract unique universities & majors for filter dropdowns
  const universities = Array.from(new Set(interns.map(i => i.university)));
  const majors = Array.from(new Set(interns.map(i => i.major)));

  // Filtered interns
  const filteredInterns = interns.filter(intern => {
    const matchesSearch = 
      intern.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.university.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUni = selectedUniversity === 'all' || intern.university === selectedUniversity;
    const matchesMajor = selectedMajor === 'all' || intern.major === selectedMajor;
    const matchesDept = selectedDept === 'all' || intern.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'all' || intern.status === selectedStatus;

    return matchesSearch && matchesUni && matchesMajor && matchesDept && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIntern({
      ...formData,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?w=150&auto=format&fit=crop&q=80`,
      status: 'active',
      contractStatus: 'sent',
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: `CV_${formData.fullName.replace(/\s+/g, '')}.pdf`,
          type: 'cv',
          url: '#',
          uploadedAt: new Date().toISOString().substring(0, 10),
          isVerified: false,
          fileSize: '1.5 MB'
        }
      ]
    });
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIntern) return;
    updateIntern(editingIntern.id, editingIntern);
    setEditingIntern(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Quản Lý Hồ Sơ Thực Tập Sinh
          </h2>
          <p className="text-xs text-slate-500">
            Tổng số: <strong>{interns.length}</strong> thực tập sinh | Quản lý thông tin cá nhân, hồ sơ tài liệu & hợp đồng
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('interns:export') && (
            <button
              onClick={exportInternsToExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>
          )}
          {hasPermission('interns:create') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Thực Tập Sinh Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar (Story 3) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, email, trường..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter University */}
          <div>
            <select
              value={selectedUniversity}
              onChange={e => setSelectedUniversity(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả Trường ĐH</option>
              {universities.map(uni => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>
          </div>

          {/* Filter Major */}
          <div>
            <select
              value={selectedMajor}
              onChange={e => setSelectedMajor(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả Chuyên ngành</option>
              {majors.map(major => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </div>

          {/* Filter Department */}
          <div>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả Phòng ban</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="active">Đang thực tập</option>
              <option value="applying">Đang ứng tuyển</option>
              <option value="interviewing">Phỏng vấn</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="hired">Đã nhận chính thức</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interns Table (Story 1, 2, 3, 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Thực Tập Sinh</th>
                <th className="py-3 px-4">Trường & Chuyên Ngành</th>
                <th className="py-3 px-4">GPA</th>
                <th className="py-3 px-4">Phòng Ban & Mentor</th>
                <th className="py-3 px-4">Hợp Đồng</th>
                <th className="py-3 px-4">Tài Liệu</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInterns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không tìm thấy thực tập sinh nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredInterns.map(intern => {
                  const dept = departments.find(d => d.id === intern.departmentId);
                  const mentor = mentors.find(m => m.id === intern.mentorId);
                  const verifiedDocs = intern.documents.filter(d => d.isVerified).length;

                  return (
                    <tr key={intern.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={intern.avatar}
                            alt={intern.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{intern.fullName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{intern.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Uni & Major */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{intern.university}</div>
                        <div className="text-[11px] text-slate-500">{intern.major} (K{intern.graduationYear})</div>
                      </td>

                      {/* GPA */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {intern.gpa.toFixed(2)}
                        </span>
                      </td>

                      {/* Dept & Mentor */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{dept?.name || 'Chưa gán'}</div>
                        <div className="text-[11px] text-blue-600">
                          {mentor ? `Mentor: ${mentor.fullName}` : 'Chưa có Mentor'}
                        </div>
                      </td>

                      {/* Contract */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={intern.contractStatus === 'signed' ? 'success' : intern.contractStatus === 'sent' ? 'warning' : 'neutral'}
                          size="sm"
                        >
                          {intern.contractStatus === 'signed' ? 'Đã ký HĐ' : intern.contractStatus === 'sent' ? 'Chờ ký' : 'Chưa gửi'}
                        </Badge>
                      </td>

                      {/* Document Verification status (Story 5) */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setViewingIntern(intern)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{intern.documents.length} tài liệu ({verifiedDocs} đã duyệt)</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            intern.status === 'active' ? 'primary' :
                            intern.status === 'completed' ? 'success' :
                            intern.status === 'hired' ? 'success' :
                            intern.status === 'interviewing' ? 'warning' : 'neutral'
                          }
                          size="sm"
                        >
                          {intern.status === 'active' ? 'Đang thực tập' :
                           intern.status === 'completed' ? 'Hoàn thành' :
                           intern.status === 'hired' ? 'Đã nhận chính thức' :
                           intern.status === 'interviewing' ? 'Phỏng vấn' : 'Ứng tuyển'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingIntern(intern)}
                            title="Xem chi tiết & Tài liệu"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasPermission('interns:edit') && (
                            <button
                              onClick={() => setEditingIntern(intern)}
                              title="Chỉnh sửa thông tin"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('interns:delete') && (
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa hồ sơ của ${intern.fullName}?`)) {
                                  deleteIntern(intern.id);
                                }
                              }}
                              title="Xóa hồ sơ"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW INTERN (Story 1) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Mới Hồ Sơ Thực Tập Sinh"
        subtitle="Nhập thông tin cá nhân, trường đại học và phân công ban đầu"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {/* Account Auto-Creation Callout */}
          <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              🔑
            </div>
            <div className="text-xs">
              <span className="font-bold text-blue-900 block mb-0.5">
                Tự Động Tạo Tài Khoản & Lưu Vào SQLite Database Thật
              </span>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Hệ thống sẽ tự động thêm tài khoản vào bảng <code className="font-mono font-semibold bg-blue-100/80 px-1 rounded">users</code> trong SQLite với:
                <br />
                • Tên đăng nhập: <b>Email bên dưới</b>
                <br />
                • Mật khẩu mặc định: <code className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Intern@2026</code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã sinh viên *</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trường Đại học *</label>
              <input
                type="text"
                required
                value={formData.university}
                onChange={e => setFormData({ ...formData, university: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên ngành *</label>
              <input
                type="text"
                required
                value={formData.major}
                onChange={e => setFormData({ ...formData, major: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GPA *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.gpa}
                  onChange={e => setFormData({ ...formData, gpa: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Năm tốt nghiệp *</label>
                <input
                  type="number"
                  required
                  value={formData.graduationYear}
                  onChange={e => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 2026 })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban tiếp nhận *</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mentor hướng dẫn</label>
              <select
                value={formData.mentorId}
                onChange={e => setFormData({ ...formData, mentorId: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chưa gán Mentor --</option>
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.jobTitle})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đợt thực tập *</label>
              <select
                value={formData.programId}
                onChange={e => setFormData({ ...formData, programId: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
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
              Lưu Hồ Sơ
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT INTERN (Story 2) */}
      {editingIntern && (
        <Modal
          isOpen={!!editingIntern}
          onClose={() => setEditingIntern(null)}
          title="Chỉnh Sửa Hồ Sơ Thực Tập Sinh"
          subtitle={`Cập nhật thông tin cho ${editingIntern.fullName}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={editingIntern.fullName}
                  onChange={e => setEditingIntern({ ...editingIntern, fullName: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingIntern.email}
                  onChange={e => setEditingIntern({ ...editingIntern, email: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={editingIntern.phone}
                  onChange={e => setEditingIntern({ ...editingIntern, phone: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trường Đại học</label>
                <input
                  type="text"
                  value={editingIntern.university}
                  onChange={e => setEditingIntern({ ...editingIntern, university: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên ngành</label>
                <input
                  type="text"
                  value={editingIntern.major}
                  onChange={e => setEditingIntern({ ...editingIntern, major: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingIntern.gpa}
                  onChange={e => setEditingIntern({ ...editingIntern, gpa: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mentor phụ trách</label>
                <select
                  value={editingIntern.mentorId || ''}
                  onChange={e => setEditingIntern({ ...editingIntern, mentorId: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chưa gán Mentor --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái thực tập</label>
                <select
                  value={editingIntern.status}
                  onChange={e => setEditingIntern({ ...editingIntern, status: e.target.value as InternStatus })}
                  className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Đang thực tập (Active)</option>
                  <option value="applying">Đang ứng tuyển (Applying)</option>
                  <option value="interviewing">Phỏng vấn (Interviewing)</option>
                  <option value="completed">Đã hoàn thành (Completed)</option>
                  <option value="hired">Được tuyển dụng chính thức (Hired)</option>
                  <option value="terminated">Thôi thực tập (Terminated)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingIntern(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
              >
                Cập Nhật
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: VIEW INTERN & VERIFY DOCUMENTS (Story 4, 5, 10) */}
      {viewingIntern && (
        <Modal
          isOpen={!!viewingIntern}
          onClose={() => setViewingIntern(null)}
          title={`Hồ Sơ & Tài Liệu: ${viewingIntern.fullName}`}
          subtitle={`Mã SV: ${viewingIntern.studentId} | ${viewingIntern.university}`}
          maxWidth="4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Profile card */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                <img
                  src={viewingIntern.avatar}
                  alt={viewingIntern.fullName}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-md"
                />
                <h4 className="font-bold text-slate-900 text-base">{viewingIntern.fullName}</h4>
                <div className="text-xs text-slate-500">{viewingIntern.university}</div>
                <div className="text-xs font-semibold text-blue-700 bg-blue-50 py-1 px-3 rounded-full inline-block">
                  {viewingIntern.major} • GPA {viewingIntern.gpa}
                </div>

                <div className="pt-2 text-left text-xs space-y-2 border-t border-slate-200 mt-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{viewingIntern.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{viewingIntern.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Năm tốt nghiệp: {viewingIntern.graduationYear}</span>
                  </div>
                </div>
              </div>

              {/* Contract Status (Story 9, 10) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Hợp đồng thực tập</span>
                  <Badge variant={viewingIntern.contractStatus === 'signed' ? 'success' : 'warning'} size="sm">
                    {viewingIntern.contractStatus === 'signed' ? 'Đã ký điện tử' : 'Chờ xác nhận'}
                  </Badge>
                </div>
                {viewingIntern.contractSignedDate && (
                  <p className="text-[11px] text-slate-500">
                    Ngày ký: {viewingIntern.contractSignedDate}
                  </p>
                )}
                {viewingIntern.contractStatus !== 'signed' && (
                  <button
                    onClick={() => {
                      signContract(viewingIntern.id);
                      setViewingIntern({ ...viewingIntern, contractStatus: 'signed', contractSignedDate: new Date().toISOString().substring(0, 10) });
                    }}
                    className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    Xác nhận / Ký hợp đồng thay
                  </button>
                )}
              </div>
            </div>

            {/* Right: Document Verification Management (Story 4, 5) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Danh Mục Hồ Sơ & Tài Liệu</h4>
                  <p className="text-xs text-slate-500">Xem xét và duyệt tính hợp lệ của CV, đơn thực tập trường</p>
                </div>
                <button
                  onClick={() => {
                    uploadDocument(viewingIntern.id, {
                      name: `TaiLieu_BoSung_${Date.now().toString().slice(-4)}.pdf`,
                      type: 'report',
                      url: '#',
                      fileSize: '1.1 MB'
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Thêm tài liệu</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {viewingIntern.documents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    Chưa có tài liệu nào được tải lên
                  </div>
                ) : (
                  viewingIntern.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">{doc.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{doc.fileSize || '1.2 MB'}</span>
                            <span>•</span>
                            <span>Tải lên: {doc.uploadedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.isVerified ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã duyệt</span>
                          </div>
                        ) : hasPermission('interns:verify_docs') ? (
                          <button
                            onClick={() => {
                              verifyDocument(viewingIntern.id, doc.id);
                              setViewingIntern({
                                ...viewingIntern,
                                documents: viewingIntern.documents.map(d => d.id === doc.id ? { ...d, isVerified: true, verifiedAt: new Date().toISOString().substring(0, 10) } : d)
                              });
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Duyệt tài liệu</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Chờ HR duyệt
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {viewingIntern.notes && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <strong>Ghi chú từ HR:</strong> {viewingIntern.notes}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
