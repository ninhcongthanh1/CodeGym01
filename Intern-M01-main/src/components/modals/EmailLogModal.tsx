import React, { useState } from 'react';
import { Mail, Clock, Send, Eye, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

interface EmailLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailLogModal: React.FC<EmailLogModalProps> = ({ isOpen, onClose }) => {
  const { emails } = useApp();
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');

  const activeEmail = emails.find(e => e.id === selectedEmailId) || emails[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhật Ký Email Tự Động Từ Hệ Thống"
      subtitle="Danh sách các email thông báo, thư mời phỏng vấn & kết quả xét duyệt đã gửi"
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[420px]">
        {/* Email list */}
        <div className="md:col-span-5 border-r border-slate-200 pr-4 space-y-2 max-h-[460px] overflow-y-auto">
          {emails.map(email => (
            <div
              key={email.id}
              onClick={() => setSelectedEmailId(email.id)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                activeEmail?.id === email.id
                  ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {email.recipientName}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {email.sentAt.split(' ')[0]}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-700 truncate">{email.subject}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 truncate">{email.toEmail}</span>
                <Badge 
                  variant={email.type === 'offer_letter' ? 'success' : email.type === 'interview_invitation' ? 'primary' : 'neutral'}
                  size="sm"
                >
                  {email.type === 'offer_letter' ? 'Trúng tuyển' : email.type === 'interview_invitation' ? 'Phỏng vấn' : 'Thông báo'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Email Content Detail */}
        <div className="md:col-span-7 flex flex-col justify-between">
          {activeEmail ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-900">{activeEmail.subject}</div>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Đã gửi thành công
                  </span>
                </div>
                <div className="text-xs text-slate-600 grid grid-cols-2 gap-1 pt-1 border-t border-slate-200">
                  <div><strong>Người gửi:</strong> IMS TechCorp &lt;noreply@ims.corp&gt;</div>
                  <div><strong>Người nhận:</strong> {activeEmail.recipientName}</div>
                  <div><strong>Email:</strong> {activeEmail.toEmail}</div>
                  <div><strong>Thời gian:</strong> {activeEmail.sentAt}</div>
                </div>
              </div>

              {/* Email Body */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans shadow-xs whitespace-pre-wrap">
                {activeEmail.content}
                
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <p>Trân trọng,</p>
                  <p className="font-semibold text-slate-700">Ban Tuyển Dụng & Đào Tạo Thực Tập Sinh IMS TechCorp</p>
                  <p>Tòa nhà Tech Innovation, Cầu Giấy, Hà Nội | Hotline: 1900 6868</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Mail className="w-12 h-12 stroke-[1.5] mb-2" />
              <p className="text-sm">Chọn một email bên trái để xem nội dung</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
