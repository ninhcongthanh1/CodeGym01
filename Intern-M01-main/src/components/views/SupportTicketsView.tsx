import React, { useState } from 'react';
import { 
  HelpCircle, Plus, CheckCircle2, Clock, MessageSquare, 
  FileCheck, Laptop, Stamp, CreditCard, ChevronRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupportTicket } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const SupportTicketsView: React.FC = () => {
  const { tickets, interns, currentUser, submitTicket, resolveTicket } = useApp();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'certificate' as 'certificate' | 'equipment' | 'stamp_request' | 'parking_card' | 'hr_inquiry' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high',
    description: ''
  });

  const myProfile = currentUser.role === 'intern'
    ? interns.find(i => i.id === currentUser.internProfileId || i.email === currentUser.email)
    : null;

  const currentInternId = myProfile ? myProfile.id : (interns[0]?.id || 'intern-1');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    submitTicket({
      internId: currentInternId,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      priority: formData.priority
    });
    setIsSubmitModalOpen(false);
    setFormData({
      title: '',
      category: 'certificate',
      priority: 'medium',
      description: ''
    });
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    resolveTicket(selectedTicket.id, resolutionText);
    setSelectedTicket(null);
    setResolutionText('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'certificate': return <FileCheck className="w-4 h-4 text-blue-600" />;
      case 'equipment': return <Laptop className="w-4 h-4 text-purple-600" />;
      case 'stamp_request': return <Stamp className="w-4 h-4 text-rose-600" />;
      case 'parking_card': return <CreditCard className="w-4 h-4 text-emerald-600" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Hỗ Trợ & Tiếp Nhận Yêu Cầu Thực Tập Sinh
          </h2>
          <p className="text-xs text-slate-500">
            Tiếp nhận và giải quyết yêu cầu cấp giấy xác nhận gửi trường, mượn trang thiết bị, đóng mộc báo cáo & thẻ gửi xe
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Gửi Yêu Cầu Hỗ Trợ Mới</span>
        </button>
      </div>

      {/* Tickets List (Story 27, 28) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map(t => {
          const intern = interns.find(i => i.id === t.internId);
          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      {getCategoryIcon(t.category)}
                    </div>
                    <Badge
                      variant={t.status === 'resolved' ? 'success' : t.status === 'in_progress' ? 'warning' : 'neutral'}
                      size="sm"
                    >
                      {t.status === 'resolved' ? 'Đã xử lý' : t.status === 'in_progress' ? 'Đang giải quyết' : 'Chờ tiếp nhận'}
                    </Badge>
                  </div>

                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                    t.priority === 'high' ? 'bg-rose-50 text-rose-700' :
                    t.priority === 'medium' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {t.priority === 'high' ? 'Ưu tiên cao' : t.priority === 'medium' ? 'Bình thường' : 'Thấp'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{t.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <span>Sinh viên: <strong>{intern?.fullName || 'Thực tập sinh'}</strong> ({intern?.university})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {t.description}
                </p>

                {t.resolutionNote && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Phản hồi xử lý của HR:
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {t.resolutionNote}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Gửi: {t.createdAt}
                </span>

                {currentUser.role !== 'intern' && t.status !== 'resolved' ? (
                  <button
                    onClick={() => {
                      setSelectedTicket(t);
                      setResolutionText('');
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                  >
                    Xử Lý Yêu Cầu
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    {t.status === 'resolved' ? 'Hoàn tất' : 'Đang xử lý'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: GỬI YÊU CẦU MỚI (Story 27) */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Gửi Yêu Cầu Hỗ Trợ Mới"
        subtitle="Phòng Nhân sự sẽ phản hồi trong vòng 24 giờ làm việc"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Loại yêu cầu hỗ trợ *</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            >
              <option value="certificate">Xin Giấy xác nhận thực tập / Giấy giới thiệu trường</option>
              <option value="stamp_request">Xin đóng dấu mộc Báo cáo tốt nghiệp</option>
              <option value="equipment">Mượn thiết bị làm việc (Laptop, Màn hình, Wacom)</option>
              <option value="parking_card">Cấp / Đổi vé gửi xe tháng</option>
              <option value="hr_inquiry">Hỏi đáp chế độ phụ cấp & phúc lợi</option>
              <option value="other">Yêu cầu khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề yêu cầu *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Xin dấu mộc công ty cho Báo cáo thực tập tốt nghiệp HUST"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả cụ thể yêu cầu *</label>
            <textarea
              rows={3}
              required
              placeholder="Nêu rõ thời hạn cần nộp, số lượng bản cần đóng mộc..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
              Gửi Yêu Cầu
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: HR XỬ LÝ & PHẢN HỒI (Story 28) */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Xử Lý Yêu Cầu: ${selectedTicket.title}`}
          subtitle="Gửi kết quả giải quyết và thông báo tới thực tập sinh"
          maxWidth="md"
        >
          <form onSubmit={handleResolveSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div><strong>Nội dung yêu cầu:</strong> {selectedTicket.description}</div>
              <div><strong>Ngày gửi:</strong> {selectedTicket.createdAt}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phản hồi giải quyết của HR *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: Đã ký đóng dấu hoàn tất. Em qua bàn lễ tân tầng 3 nhận bản cứng nhé!"
                value={resolutionText}
                onChange={e => setResolutionText(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                Xác Nhận Giải Quyết Xong
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
