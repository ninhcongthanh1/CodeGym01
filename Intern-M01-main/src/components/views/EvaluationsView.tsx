import React, { useState } from 'react';
import { 
  Award, Star, Plus, CheckCircle2, Printer, 
  FileCheck, Sparkles, Building, UserCheck, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PerformanceEvaluation } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const EvaluationsView: React.FC = () => {
  const { evaluations, interns, mentors, currentUser, submitEvaluation, issueCertificate, hasPermission } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<{ eval: PerformanceEvaluation; intern: any } | null>(null);

  const [formData, setFormData] = useState({
    internId: interns[0]?.id || '',
    type: 'final' as 'mid_term' | 'final',
    technicalScore: 4.8,
    attitudeScore: 5.0,
    disciplineScore: 4.9,
    teamworkScore: 4.7,
    overallGrade: 'Xuất sắc' as 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình',
    generalFeedback: 'Thực tập sinh chủ động, hoàn thành công việc đúng tiến độ, nắm vững kiến thức chuyên môn.',
    strengths: 'Tư duy logic tốt, kỷ luật cao, tinh thần trách nhiệm',
    areasForImprovement: 'Cần nâng cao kỹ năng thuyết trình trước đám đông',
    recommendation: 'hire_fulltime' as 'hire_fulltime' | 'hire_fresher' | 'extend_internship' | 'end_program'
  });

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(((formData.technicalScore + formData.attitudeScore + formData.disciplineScore + formData.teamworkScore) / 2).toFixed(1));
    submitEvaluation({
      internId: formData.internId,
      evaluatorId: currentUser.id,
      type: formData.type,
      technicalScore: formData.technicalScore,
      attitudeScore: formData.attitudeScore,
      disciplineScore: formData.disciplineScore,
      teamworkScore: formData.teamworkScore,
      totalScore: total,
      overallGrade: formData.overallGrade,
      generalFeedback: formData.generalFeedback,
      strengths: formData.strengths,
      areasForImprovement: formData.areasForImprovement,
      recommendation: formData.recommendation
    });
    setIsAddModalOpen(false);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            Đánh Giá Năng Lực & Cấp Chứng Nhận Thực Tập
          </h2>
          <p className="text-xs text-slate-500">
            Tổng hợp kết quả giữa kỳ & cuối kỳ, xếp loại học lực, đề xuất tuyển dụng chính thức & xuất giấy chứng nhận
          </p>
        </div>

        {hasPermission('evaluations:create') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phiếu Đánh Giá Mới</span>
          </button>
        )}
      </div>

      {/* Evaluations Grid (Story 19, 20) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evaluations.map(item => {
          const intern = interns.find(i => i.id === item.internId);
          const evaluator = mentors.find(m => m.id === item.evaluatorId || m.userId === item.evaluatorId);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant={item.type === 'final' ? 'primary' : 'neutral'} size="sm">
                    {item.type === 'final' ? 'Đánh giá Cuối kỳ' : 'Đánh giá Giữa kỳ'}
                  </Badge>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Xếp loại: {item.overallGrade}
                  </span>
                </div>

                {/* Intern Info */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <img
                    src={intern?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={intern?.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{intern?.fullName}</h4>
                    <p className="text-[11px] text-slate-500">{intern?.university}</p>
                    <p className="text-[10px] text-blue-600 font-medium">Chuyên ngành: {intern?.major}</p>
                  </div>
                </div>

                {/* Scores breakdown (Story 19) */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[11px]">Kỹ thuật: </span>
                    <strong className="text-slate-800">{item.technicalScore} / 5</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Thái độ: </span>
                    <strong className="text-slate-800">{item.attitudeScore} / 5</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Kỷ luật: </span>
                    <strong className="text-slate-800">{item.disciplineScore} / 5</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Đồng đội: </span>
                    <strong className="text-slate-800">{item.teamworkScore} / 5</strong>
                  </div>
                </div>

                {/* Recommendation badge */}
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>Đề xuất:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {item.recommendation === 'hire_fulltime' ? '🔥 Ký chính thức (Fulltime)' :
                     item.recommendation === 'hire_fresher' ? 'Nhận Fresher' : 'Gia hạn thực tập'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 italic line-clamp-2">
                  "{item.generalFeedback}"
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Ngày đánh giá: {item.evaluatedAt}
                </span>

                <button
                  onClick={() => setSelectedCertificate({ eval: item, intern })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Xem & In Chứng Nhận</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: TẠO ĐÁNH GIÁ NĂNG LỰC (Story 19) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tạo Phiếu Đánh Giá Thực Tập Sinh"
        subtitle="Đánh giá kỹ năng chuyên môn, thái độ kỷ luật & định hướng tương lai"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateEvaluation} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thực tập sinh *</label>
              <select
                value={formData.internId}
                onChange={e => setFormData({ ...formData, internId: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                {interns.map(i => (
                  <option key={i.id} value={i.id}>{i.fullName} ({i.university})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kỳ đánh giá *</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                <option value="final">Tổng kết cuối kỳ (Final Evaluation)</option>
                <option value="mid_term">Đánh giá giữa kỳ (Mid-term)</option>
              </select>
            </div>
          </div>

          {/* 4 Score metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kỹ thuật (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.technicalScore}
                onChange={e => setFormData({ ...formData, technicalScore: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-bold rounded-lg border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thái độ (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.attitudeScore}
                onChange={e => setFormData({ ...formData, attitudeScore: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-bold rounded-lg border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kỷ luật (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.disciplineScore}
                onChange={e => setFormData({ ...formData, disciplineScore: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-bold rounded-lg border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đồng đội (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.teamworkScore}
                onChange={e => setFormData({ ...formData, teamworkScore: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-bold rounded-lg border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Xếp loại tổng kết *</label>
              <select
                value={formData.overallGrade}
                onChange={e => setFormData({ ...formData, overallGrade: e.target.value as any })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="Xuất sắc">Xuất sắc</option>
                <option value="Giỏi">Giỏi</option>
                <option value="Khá">Khá</option>
                <option value="Trung bình">Trung bình</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đề xuất tiếp theo *</label>
              <select
                value={formData.recommendation}
                onChange={e => setFormData({ ...formData, recommendation: e.target.value as any })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="hire_fulltime">Ký hợp đồng nhân viên chính thức (Full-time)</option>
                <option value="hire_fresher">Nhận vị trí Fresher</option>
                <option value="extend_internship">Gia hạn đợt thực tập thêm 2 tháng</option>
                <option value="end_program">Hoàn tất chương trình</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nhận xét tổng quan của Mentor & HR *</label>
            <textarea
              rows={3}
              required
              value={formData.generalFeedback}
              onChange={e => setFormData({ ...formData, generalFeedback: e.target.value })}
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
              Lưu & Cấp Kết Quả
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: HIGH-FIDELITY CERTIFICATE OF COMPLETION (Giấy Chứng Nhận Hoàn Thành Thực Tập) */}
      {selectedCertificate && (
        <Modal
          isOpen={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          title="Giấy Chứng Nhận Hoàn Thành Thực Tập (Certificate of Completion)"
          subtitle="Bản in có giá trị gửi Trường Đại học và lưu trữ hồ sơ nhân sự"
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* The Certificate Paper Design */}
            <div className="bg-[#fefdfb] border-8 border-double border-amber-700/60 p-8 sm:p-12 rounded-xl shadow-xl text-center relative overflow-hidden font-serif">
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-800"></div>
              <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-800"></div>
              <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-800"></div>
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-800"></div>

              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <Award className="w-96 h-96 text-slate-900" />
              </div>

              {/* Certificate Header */}
              <div className="space-y-2 relative z-10">
                <div className="uppercase tracking-[0.25em] text-xs font-sans font-bold text-amber-800">
                  TẬP ĐOÀN CÔNG NGHỆ TECHCORP VIỆT NAM • IMS ENTERPRISE
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-wider uppercase pt-2">
                  GIẤY CHỨNG NHẬN
                </h1>
                <p className="text-base sm:text-lg text-amber-900 italic font-medium">
                  HOÀN THÀNH CHƯƠNG TRÌNH THỰC TẬP DOANH NGHIỆP
                </p>
                <div className="w-24 h-0.5 bg-amber-700 mx-auto mt-2"></div>
              </div>

              {/* Recipient */}
              <div className="py-6 space-y-2 relative z-10 font-sans">
                <p className="text-sm text-slate-600">Trân trọng trao tặng cho:</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 tracking-wide font-serif">
                  {selectedCertificate.intern?.fullName || 'Phạm Minh Tuấn'}
                </h2>
                <p className="text-sm text-slate-700">
                  Sinh viên Trường: <strong>{selectedCertificate.intern?.university || 'Đại học Bách Khoa Hà Nội'}</strong>
                </p>
                <p className="text-xs text-slate-600">
                  Mã sinh viên: <strong>{selectedCertificate.intern?.studentId || '20210899'}</strong> • Chuyên ngành: <strong>{selectedCertificate.intern?.major || 'Khoa học Máy tính'}</strong>
                </p>
              </div>

              {/* Achievement Body */}
              <div className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed font-sans space-y-2 relative z-10">
                <p>
                  Đã hoàn thành xuất sắc toàn bộ thời gian và nhiệm vụ thực tập tại Phòng Công nghệ & Phát triển Phần mềm với kết quả:
                </p>
                <div className="inline-block bg-amber-50 border border-amber-300 px-6 py-2 rounded-xl text-base font-bold text-amber-900">
                  Xếp Loại: {selectedCertificate.eval.overallGrade.toUpperCase()} (Điểm tổng kết: {selectedCertificate.eval.totalScore} / 10)
                </div>
              </div>

              {/* Signatures & Red Seal */}
              <div className="pt-10 grid grid-cols-2 gap-8 items-end relative z-10 font-sans text-xs">
                <div>
                  <p className="text-slate-500">Hà Nội, ngày {selectedCertificate.eval.evaluatedAt}</p>
                  <p className="font-bold text-slate-800 uppercase mt-1">Mentor Phụ Trách</p>
                  <div className="h-16 flex items-center justify-center italic text-blue-800 font-serif text-lg">
                    Lê Hoàng Nam
                  </div>
                  <p className="font-semibold text-slate-700">Lê Hoàng Nam</p>
                  <p className="text-[11px] text-slate-500">Tech Lead & Software Architect</p>
                </div>

                <div className="relative">
                  {/* Digital Red Stamp (Mộc Đỏ) */}
                  <div className="absolute -top-6 right-1/2 translate-x-1/2 w-28 h-28 rounded-full border-4 border-rose-600/80 text-rose-600 flex flex-col items-center justify-center p-2 rotate-[-12deg] pointer-events-none opacity-90 select-none shadow-xs">
                    <div className="text-[8px] font-bold uppercase tracking-wider text-center leading-tight">
                      CÔNG TY CP CÔNG NGHỆ IMS CORP
                    </div>
                    <div className="w-4 h-4 my-0.5">★</div>
                    <div className="text-[9px] font-black uppercase tracking-tight">ĐÃ XÁC THỰC</div>
                    <div className="text-[7px] font-mono">2026-OK</div>
                  </div>

                  <p className="text-slate-500">Đại diện Ban Giám Đốc</p>
                  <p className="font-bold text-slate-800 uppercase mt-1">Trưởng Phòng Nhân Sự (HRD)</p>
                  <div className="h-16 flex items-center justify-center italic text-blue-800 font-serif text-lg">
                    Trần Thu Hà
                  </div>
                  <p className="font-semibold text-slate-700">Trần Thu Hà</p>
                  <p className="text-[11px] text-slate-500">Head of Human Resources</p>
                </div>
              </div>
            </div>

            {/* Actions for Certificate */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Mã chứng chỉ số: <strong className="font-mono">IMS-CERT-{selectedCertificate.eval.id}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handlePrintCertificate}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>In / Lưu Bản PDF</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
