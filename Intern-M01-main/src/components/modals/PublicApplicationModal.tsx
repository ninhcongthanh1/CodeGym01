import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, Send, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';

interface PublicApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicApplicationModal: React.FC<PublicApplicationModalProps> = ({ isOpen, onClose }) => {
  const { departments, programs, addIntern, sendSystemEmail } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: 'Đại học Bách Khoa Hà Nội (HUST)',
    major: 'Khoa học Máy tính',
    gpa: '3.6',
    graduationYear: '2026',
    departmentId: departments[0]?.id || '',
    programId: programs[0]?.id || '',
    fileName: 'CV_UngVien_2026.pdf',
    notes: 'Mong muốn được thực tập thực chiến và cống hiến cho công ty lâu dài.'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Add to Interns with status 'applying'
    addIntern({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: '2004-01-01',
      gender: 'male',
      university: formData.university,
      major: formData.major,
      gpa: parseFloat(formData.gpa) || 3.5,
      graduationYear: parseInt(formData.graduationYear) || 2026,
      studentId: `SV${Math.floor(100000 + Math.random() * 900000)}`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: 'applying',
      departmentId: formData.departmentId,
      programId: formData.programId,
      startDate: '2026-08-01',
      endDate: '2026-10-31',
      contractStatus: 'not_sent',
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: formData.fileName,
          type: 'cv',
          url: '#',
          uploadedAt: new Date().toISOString().substring(0, 10),
          isVerified: false,
          fileSize: '1.4 MB'
        }
      ],
      notes: formData.notes
    });

    // Send confirmation email
    sendSystemEmail({
      toEmail: formData.email,
      recipientName: formData.fullName,
      subject: '[IMS TechCorp] Xác nhận tiếp nhận hồ sơ ứng tuyển thực tập sinh',
      content: `Kính gửi bạn ${formData.fullName},\n\nBộ phận Tuyển dụng đã tiếp nhận thành công hồ sơ của bạn cho chương trình thực tập. Phòng Nhân sự sẽ xem xét hồ sơ và liên hệ phỏng vấn trong vòng 3-5 ngày làm việc tới.`,
      type: 'interview_invitation'
    });

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Cổng Đăng Ký & Nộp Hồ Sơ Thực Tập Trực Tuyến"
      subtitle="Dành cho sinh viên các trường Đại học ứng tuyển vào IMS TechCorp"
      maxWidth="2xl"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Nộp Hồ Sơ Thành Công!</h4>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Hồ sơ của bạn đã được chuyển đến hàng chờ xét duyệt của phòng Nhân sự (HR). Email xác nhận kèm mã theo dõi đã được gửi đến <strong>{formData.email}</strong>.
          </p>
          <div className="pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-md transition-all"
            >
              Đóng và Quay lại
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Hãy điền chính xác thông tin để bộ phận Tuyển dụng dễ dàng xét duyệt hồ sơ và gửi thông báo kết quả qua email sớm nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và Tên *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn An"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email sinh viên / cá nhân *</label>
              <input
                type="email"
                required
                placeholder="an.nv@student.edu.vn"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                required
                placeholder="0987 654 321"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trường Đại học *</label>
              <input
                type="text"
                required
                value={formData.university}
                onChange={e => setFormData({ ...formData, university: e.target.value })}
                className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên ngành đào tạo *</label>
              <input
                type="text"
                required
                value={formData.major}
                onChange={e => setFormData({ ...formData, major: e.target.value })}
                className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm GPA (hệ 4) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  required
                  value={formData.gpa}
                  onChange={e => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Năm tốt nghiệp *</label>
                <input
                  type="number"
                  required
                  value={formData.graduationYear}
                  onChange={e => setFormData({ ...formData, graduationYear: e.target.value })}
                  className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban mong muốn *</label>
              <select
                value={formData.departmentId}
                onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đợt tuyển dụng *</label>
              <select
                value={formData.programId}
                onChange={e => setFormData({ ...formData, programId: e.target.value })}
                className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload CV simulated */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-blue-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-700">Tải lên CV & Đơn xin thực tập (PDF, DOCX)</p>
            <p className="text-[11px] text-slate-500">Dung lượng tối đa 10MB</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{formData.fileName}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú hoặc lời nhắn tới nhà tuyển dụng</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-sm rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
              Gửi Hồ Sơ Ứng Tuyển
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
