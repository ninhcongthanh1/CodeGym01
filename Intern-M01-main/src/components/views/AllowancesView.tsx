import React, { useState } from 'react';
import { 
  DollarSign, Plus, CheckCircle2, Clock, Printer, 
  FileText, TrendingUp, Calendar, Download 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AllowanceRecord } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const AllowancesView: React.FC = () => {
  const { allowances, interns, currentUser, addAllowance, updateAllowanceStatus, hasPermission } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<AllowanceRecord | null>(null);

  const [formData, setFormData] = useState({
    internId: interns[0]?.id || '',
    month: '2026-07',
    standardWorkDays: 22,
    actualWorkDays: 22,
    baseAllowance: 4500000,
    mealAllowance: 1100000,
    bonusAllowance: 500000,
    deductions: 0,
    note: 'Hoàn thành tốt công việc trong tháng'
  });

  const totalCalculated = (formData.baseAllowance / formData.standardWorkDays) * formData.actualWorkDays + formData.mealAllowance + formData.bonusAllowance - formData.deductions;

  const handleCreateAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    addAllowance({
      internId: formData.internId,
      month: formData.month,
      standardWorkDays: formData.standardWorkDays,
      actualWorkDays: formData.actualWorkDays,
      baseAllowance: formData.baseAllowance,
      mealAllowance: formData.mealAllowance,
      bonusAllowance: formData.bonusAllowance,
      deductions: formData.deductions,
      totalAmount: Math.round(totalCalculated),
      status: 'approved',
      note: formData.note
    });
    setIsAddModalOpen(false);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Quản Lý Phụ Cấp & Chế Độ Quyền Lợi
          </h2>
          <p className="text-xs text-slate-500">
            Tính toán mức hỗ trợ hàng tháng theo ngày công thực tế, phụ cấp ăn trưa, thưởng dự án & xuất phiếu lương
          </p>
        </div>

        {hasPermission('allowances:manage') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phiếu Phụ Cấp Mới</span>
          </button>
        )}
      </div>

      {/* Allowances Table (Story 25, 26) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Thực Tập Sinh</th>
                <th className="py-3 px-4">Kỳ Chi Trả</th>
                <th className="py-3 px-4">Ngày Công Thực Tế</th>
                <th className="py-3 px-4">Mức Hỗ Trợ Cơ Bản</th>
                <th className="py-3 px-4">Cơm Trưa & Thưởng</th>
                <th className="py-3 px-4">Tổng Thực Nhận</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allowances.map(alw => {
                const intern = interns.find(i => i.id === alw.internId);
                return (
                  <tr key={alw.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{intern?.fullName || 'Thực tập sinh'}</div>
                      <div className="text-[11px] text-slate-500">{intern?.university}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">Tháng {alw.month}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                        {alw.actualWorkDays} / {alw.standardWorkDays} ngày
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{alw.baseAllowance.toLocaleString()} đ</td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                      +{(alw.mealAllowance + alw.bonusAllowance).toLocaleString()} đ
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-blue-700 text-sm">
                      {alw.totalAmount.toLocaleString()} đ
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={alw.status === 'paid' ? 'success' : alw.status === 'approved' ? 'primary' : 'warning'}
                        size="sm"
                      >
                        {alw.status === 'paid' ? 'Đã chi trả' : alw.status === 'approved' ? 'Đã duyệt công' : 'Bản nháp'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {alw.status !== 'paid' && hasPermission('allowances:manage') && (
                          <button
                            onClick={() => updateAllowanceStatus(alw.id, 'paid')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-colors"
                          >
                            Xác nhận Đã Chuyển
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSlip(alw)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Phiếu Chi
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TẠO PHIẾU PHỤ CẤP MỚI (Story 25) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tạo Phiếu Phụ Cấp Mới"
        subtitle="Hệ thống tự động tính theo ngày công và các khoản phụ cấp quy định"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAllowance} className="space-y-4">
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kỳ chi trả (Tháng) *</label>
              <input
                type="month"
                required
                value={formData.month}
                onChange={e => setFormData({ ...formData, month: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số ngày công tiêu chuẩn</label>
              <input
                type="number"
                value={formData.standardWorkDays}
                onChange={e => setFormData({ ...formData, standardWorkDays: parseInt(e.target.value) || 22 })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số ngày công thực tế *</label>
              <input
                type="number"
                value={formData.actualWorkDays}
                onChange={e => setFormData({ ...formData, actualWorkDays: parseInt(e.target.value) || 0 })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mức hỗ trợ cơ bản (VND)</label>
              <input
                type="number"
                step="100000"
                value={formData.baseAllowance}
                onChange={e => setFormData({ ...formData, baseAllowance: parseInt(e.target.value) || 0 })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cơm trưa (VND)</label>
              <input
                type="number"
                step="50000"
                value={formData.mealAllowance}
                onChange={e => setFormData({ ...formData, mealAllowance: parseInt(e.target.value) || 0 })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thưởng dự án (VND)</label>
              <input
                type="number"
                step="100000"
                value={formData.bonusAllowance}
                onChange={e => setFormData({ ...formData, bonusAllowance: parseInt(e.target.value) || 0 })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Realtime Calculation Box */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">Tổng phụ cấp thực nhận dự tính:</span>
            <span className="text-lg font-mono font-extrabold text-emerald-700">
              {Math.round(totalCalculated).toLocaleString()} VND
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              Phê Duyệt Phiếu
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: XEM VÀ IN PHIẾU PHỤ CẤP / PAY SLIP (Story 26) */}
      {selectedSlip && (
        <Modal
          isOpen={!!selectedSlip}
          onClose={() => setSelectedSlip(null)}
          title={`Phiếu Chi Phụ Cấp Thực Tập - Tháng ${selectedSlip.month}`}
          subtitle="Bảng kê chi tiết thu nhập và chế độ hỗ trợ thực tập sinh"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TẬP ĐOÀN CÔNG NGHỆ TECHCORP</div>
                <h3 className="text-base font-extrabold text-slate-900">PHIẾU CHI TRẢ PHỤ CẤP THỰC TẬP</h3>
                <p className="text-xs text-slate-500 font-mono">Kỳ: Tháng {selectedSlip.month}</p>
              </div>

              <div className="text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span>Họ và tên:</span>
                  <strong className="text-slate-900">{interns.find(i => i.id === selectedSlip.internId)?.fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Trường Đại học:</span>
                  <span>{interns.find(i => i.id === selectedSlip.internId)?.university}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ngày công thực tế:</span>
                  <span><strong>{selectedSlip.actualWorkDays}</strong> / {selectedSlip.standardWorkDays} ngày</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Mức hỗ trợ cơ bản:</span>
                  <span className="font-mono">{selectedSlip.baseAllowance.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phụ cấp tiền ăn trưa:</span>
                  <span className="font-mono">{selectedSlip.mealAllowance.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Thưởng hiệu quả / Dự án:</span>
                  <span className="font-mono">{selectedSlip.bonusAllowance.toLocaleString()} đ</span>
                </div>
              </div>

              <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>TỔNG THỰC NHẬN:</span>
                <span className="text-lg font-mono font-extrabold text-blue-700">
                  {selectedSlip.totalAmount.toLocaleString()} đ
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Hình thức: Chuyển khoản ngân hàng</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handlePrintSlip}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Phiếu</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
