import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';

interface QrCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrCheckInModal: React.FC<QrCheckInModalProps> = ({ isOpen, onClose }) => {
  const { interns, currentUser, checkIn, checkOut, attendance } = useApp();
  const [selectedInternId, setSelectedInternId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('vi-VN'));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser.role === 'intern' && currentUser.internProfileId) {
      setSelectedInternId(currentUser.internProfileId);
    } else if (interns.length > 0 && !selectedInternId) {
      setSelectedInternId(interns[0].id);
    }
  }, [currentUser, interns, selectedInternId]);

  const today = new Date().toISOString().substring(0, 10);
  const currentAtt = attendance.find(a => a.internId === selectedInternId && a.date === today);

  const handleCheckIn = () => {
    if (!selectedInternId) return;
    const ok = checkIn(selectedInternId, 'qr');
    if (ok) {
      setStatusMessage({ text: 'Quét QR thành công! Ghi nhận Check-in thành công.', type: 'success' });
    } else {
      setStatusMessage({ text: 'Thực tập sinh này đã check-in ngày hôm nay rồi.', type: 'error' });
    }
  };

  const handleCheckOut = () => {
    if (!selectedInternId) return;
    const ok = checkOut(selectedInternId);
    if (ok) {
      setStatusMessage({ text: 'Quét QR thành công! Ghi nhận Check-out kết thúc ngày làm việc.', type: 'success' });
    } else {
      setStatusMessage({ text: 'Chưa có lượt check-in hôm nay hoặc đã hoàn tất check-out.', type: 'error' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Điểm Danh & Chấm Công Bằng Mã QR"
      subtitle="Quét mã QR tại cổng lễ tân hoặc máy chấm công công ty"
      maxWidth="md"
    >
      <div className="space-y-6 text-center">
        {/* Live Clock & Geofence Status */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold text-slate-800">
            <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
            <span>{currentTime || '08:30:00'}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium mt-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Vị trí: Tòa nhà Tech Innovation (Trong phạm vi cho phép)</span>
          </div>
        </div>

        {/* QR Code graphic */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative p-4 bg-white rounded-2xl border-2 border-dashed border-blue-300 shadow-md">
            {/* SVG stylized QR pattern */}
            <div className="w-52 h-52 bg-slate-900 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between">
                <div className="w-12 h-12 bg-white rounded-md p-1.5">
                  <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-xs"></div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white rounded-md p-1.5">
                  <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-xs"></div>
                  </div>
                </div>
              </div>

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <QrCode className="w-7 h-7" />
                </div>
              </div>

              <div className="flex justify-between">
                <div className="w-12 h-12 bg-white rounded-md p-1.5">
                  <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-xs"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 w-12 h-12 p-1">
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white/70 rounded-xs"></div>
                  <div className="bg-white/80 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                </div>
              </div>
            </div>

            {/* Scanning line animation */}
            <div className="absolute inset-x-4 top-4 h-0.5 bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-bounce opacity-70"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-mono">Mã phiên: IMS-QR-{today}</p>
        </div>

        {/* Intern Selection if HR/Admin */}
        {currentUser.role !== 'intern' && (
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn Thực tập sinh để giả lập quét mã:
            </label>
            <select
              value={selectedInternId}
              onChange={(e) => setSelectedInternId(e.target.value)}
              className="w-full text-sm rounded-lg border-slate-300 bg-white p-2 border focus:ring-2 focus:ring-blue-500"
            >
              {interns.map(intern => (
                <option key={intern.id} value={intern.id}>
                  {intern.fullName} - {intern.university}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current status display */}
        {currentAtt && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 text-left space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Tình trạng hôm nay ({today}):
            </div>
            <div>• Check-in: <span className="font-bold">{currentAtt.checkInTime || 'Chưa'}</span> ({currentAtt.status === 'on_time' ? 'Đúng giờ' : 'Đi muộn'})</div>
            <div>• Check-out: <span className="font-bold">{currentAtt.checkOutTime || 'Chưa kết thúc'}</span></div>
          </div>
        )}

        {statusMessage && (
          <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            statusMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
            'bg-slate-100 text-slate-800'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleCheckIn}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Quét Check-in
          </button>
          <button
            onClick={handleCheckOut}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900 shadow-sm transition-all"
          >
            <Clock className="w-4 h-4" />
            Quét Check-out
          </button>
        </div>
      </div>
    </Modal>
  );
};
