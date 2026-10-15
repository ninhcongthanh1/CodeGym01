import React, { useState } from 'react';
import { 
  GraduationCap, Bell, QrCode, Mail, UserCheck, 
  ChevronDown, Check, UserPlus, RefreshCw, LogOut, CheckCircle2, BookOpen 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenQr: () => void;
  onOpenPublicApply: () => void;
  onOpenEmailLog: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQr,
  onOpenPublicApply,
  onOpenEmailLog
}) => {
  const { 
    currentUser, notifications, logout,
    markNotificationAsRead, markAllNotificationsAsRead
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">IMS Corp</span>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                v2.6 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Hệ Thống Quản Lý Thực Tập Sinh Toàn Diện</p>
          </div>
        </div>

        {/* Center / Action Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Mở máy quét điểm danh QR"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Chấm công QR</span>
          </button>

          <button
            onClick={onOpenPublicApply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            title="Mở cổng ứng tuyển sinh viên"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Cổng nộp hồ sơ</span>
          </button>

          <button
            onClick={onOpenEmailLog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Xem hộp thư email tự động hệ thống"
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>Hòm thư hệ thống</span>
          </button>

          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
            title="Mở tài liệu Swagger OpenAPI"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Swagger API</span>
          </a>
        </div>

        {/* Right: Role Switcher & Notification & Profile */}
        <div className="flex items-center gap-3">
          {/* Role switcher dropdown */}
          {/* Current User Info & Logout Button */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 shadow-2xs">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                  currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  currentUser.role === 'hr' ? 'bg-emerald-100 text-emerald-700' :
                  currentUser.role === 'mentor' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {currentUser.role}
                </span>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono leading-tight">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
                    logout();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 text-xs font-bold transition-all shadow-2xs"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng Xuất</span>
              </button>
            </div>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">THÔNG BÁO</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({unreadCount} chưa đọc)</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>
                <div className="py-1 max-h-80 overflow-y-auto space-y-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Không có thông báo nào</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                          !n.read ? 'bg-blue-50/60 font-semibold' : 'hover:bg-slate-50 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-slate-900">
                          <span className="font-bold truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 font-normal leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
