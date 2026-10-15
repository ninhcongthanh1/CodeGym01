import React, { useState } from 'react';
import { 
  FileText, Plus, MessageSquare, Star, CheckCircle2, 
  Clock, User, Send, BookOpen, AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WeeklyReport } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const WeeklyReportsView: React.FC = () => {
  const { reports, interns, currentUser, mentors, submitReport, reviewReport, hasPermission } = useApp();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(9.0);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');

  const [formData, setFormData] = useState({
    weekNumber: 7,
    startDate: '2026-07-20',
    endDate: '2026-07-26',
    achievements: '',
    challenges: '',
    nextWeekPlan: '',
    learningExperience: ''
  });

  // Current intern profile if intern
  const myProfile = currentUser.role === 'intern' 
    ? interns.find(i => i.id === currentUser.internProfileId || i.email === currentUser.email)
    : null;

  const handleSubmitNewReport = (e: React.FormEvent) => {
    e.preventDefault();
    const internId = myProfile ? myProfile.id : interns[0]?.id || 'intern-1';
    submitReport({
      internId,
      weekNumber: formData.weekNumber,
      startDate: formData.startDate,
      endDate: formData.endDate,
      achievements: formData.achievements,
      challenges: formData.challenges,
      nextWeekPlan: formData.nextWeekPlan,
      learningExperience: formData.learningExperience
    });
    setIsSubmitModalOpen(false);
    setFormData({
      weekNumber: formData.weekNumber + 1,
      startDate: '2026-07-27',
      endDate: '2026-08-02',
      achievements: '',
      challenges: '',
      nextWeekPlan: '',
      learningExperience: ''
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    reviewReport(selectedReport.id, reviewScore, reviewFeedback);
    setSelectedReport(null);
    setReviewFeedback('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Báo Cáo Tiến Độ Tuần & Phản Hồi Mentor
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi kết quả thực tập định kỳ hàng tuần, giải quyết vướng mắc & chấm điểm hỗ trợ sinh viên
          </p>
        </div>

        {hasPermission('reports:submit') && (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nộp Báo Cáo Tuần Mới</span>
          </button>
        )}
      </div>

      {/* Reports List (Story 17, 18) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(rep => {
          const intern = interns.find(i => i.id === rep.internId);
          return (
            <div
              key={rep.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                      #{rep.weekNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Báo Cáo Tuần #{rep.weekNumber}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{rep.startDate} → {rep.endDate}</p>
                    </div>
                  </div>

                  <Badge variant={rep.status === 'reviewed' ? 'success' : 'warning'} size="sm">
                    {rep.status === 'reviewed' ? 'Đã chấm điểm' : 'Chờ nhận xét'}
                  </Badge>
                </div>

                {/* Intern Info */}
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <img
                    src={intern?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={intern?.fullName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-800 truncate">{intern?.fullName || 'Thực tập sinh'}</div>
                    <div className="text-[10px] text-slate-500 truncate">{intern?.university}</div>
                  </div>
                </div>

                {/* Achievements Preview */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-700">Đã hoàn thành:</div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rep.achievements}
                  </p>
                </div>

                {/* Mentor Score & Feedback Preview (Story 18) */}
                {rep.status === 'reviewed' && rep.mentorScore && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>Điểm đánh giá:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-300 text-emerald-700">
                        {rep.mentorScore} / 10
                      </span>
                    </div>
                    {rep.mentorFeedback && (
                      <p className="text-[11px] text-emerald-800 italic line-clamp-2">
                        "{rep.mentorFeedback}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Nộp: {rep.submissionDate}
                </span>

                <button
                  onClick={() => {
                    setSelectedReport(rep);
                    setReviewScore(rep.mentorScore || 9.0);
                    setReviewFeedback(rep.mentorFeedback || '');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  {currentUser.role === 'mentor' || currentUser.role === 'hr' ? 'Xem & Chấm Điểm' : 'Xem Chi Tiết'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: NỘP BÁO CÁO TUẦN (Story 17) */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Nộp Báo Cáo Tuần Mới"
        subtitle="Tổng kết kết quả công việc, khó khăn và kế hoạch tuần tới"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitNewReport} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tuần số *</label>
              <input
                type="number"
                min="1"
                max="52"
                required
                value={formData.weekNumber}
                onChange={e => setFormData({ ...formData, weekNumber: parseInt(e.target.value) || 1 })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Từ ngày *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đến ngày *</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">1. Kết quả công việc đạt được trong tuần *</label>
            <textarea
              rows={3}
              required
              placeholder="- Đã hoàn thành API bảo mật...&#10;- Viết tài liệu Swagger..."
              value={formData.achievements}
              onChange={e => setFormData({ ...formData, achievements: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">2. Khó khăn, vướng mắc cần hỗ trợ</label>
            <textarea
              rows={2}
              placeholder="Vướng mắc về công nghệ, môi trường hay tài liệu..."
              value={formData.challenges}
              onChange={e => setFormData({ ...formData, challenges: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">3. Kế hoạch công việc tuần tới *</label>
            <textarea
              rows={2}
              required
              placeholder="Dự kiến các task sẽ thực hiện trong tuần tiếp theo..."
              value={formData.nextWeekPlan}
              onChange={e => setFormData({ ...formData, nextWeekPlan: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">4. Bài học & kiến thức mới học được</label>
            <textarea
              rows={2}
              placeholder="Kỹ năng mềm hoặc công nghệ đã lĩnh hội được..."
              value={formData.learningExperience}
              onChange={e => setFormData({ ...formData, learningExperience: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Nộp Báo Cáo
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: XEM VÀ CHẤM ĐIỂM BÁO CÁO (Story 18) */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Báo Cáo Tuần #${selectedReport.weekNumber}`}
          subtitle={`Khoảng thời gian: ${selectedReport.startDate} → ${selectedReport.endDate}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div>
                <strong className="text-slate-900 block mb-1">Công việc đã hoàn thành:</strong>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedReport.achievements}</p>
              </div>

              {selectedReport.challenges && (
                <div>
                  <strong className="text-slate-900 block mb-1">Khó khăn & vướng mắc:</strong>
                  <p className="text-amber-800 whitespace-pre-wrap leading-relaxed">{selectedReport.challenges}</p>
                </div>
              )}

              <div>
                <strong className="text-slate-900 block mb-1">Kế hoạch tuần tới:</strong>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedReport.nextWeekPlan}</p>
              </div>

              {selectedReport.learningExperience && (
                <div>
                  <strong className="text-slate-900 block mb-1">Bài học rút ra:</strong>
                  <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">{selectedReport.learningExperience}</p>
                </div>
              )}
            </div>

            {/* Mentor Grading Form (Story 18) */}
            {hasPermission('reports:review') ? (
              <form onSubmit={handleReviewSubmit} className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Đánh Giá & Phản Hồi Từ Mentor
                </h4>

                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm số (Thang 10):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      required
                      value={reviewScore}
                      onChange={e => setReviewScore(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-bold rounded-lg border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2 text-xs text-slate-500">
                    {reviewScore >= 9 ? '🌟 Xuất sắc, vượt kỳ vọng' : reviewScore >= 8 ? '👍 Tốt, hoàn thành đúng hạn' : 'Đạt yêu cầu cơ bản'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lời nhận xét & chỉ dẫn:</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ghi nhận xét, đóng góp ý kiến hoặc hẹn lịch hỗ trợ..."
                    value={reviewFeedback}
                    onChange={e => setReviewFeedback(e.target.value)}
                    className="w-full text-xs rounded-lg border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    Lưu Đánh Giá
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
                >
                  Đóng Chi Tiết
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
