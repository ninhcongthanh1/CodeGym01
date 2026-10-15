import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Database, FileText, Key, 
  Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, 
  Plus, Search, Clock, Shield, Check, X, Save, RotateCcw,
  Sliders, Grid, CheckSquare, Square, Info, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { PERMISSION_MODULES, ALL_PERMISSION_IDS } from '../../types/permissions';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const SystemAdminView: React.FC = () => {
  const { 
    users, auditLogs, exportBackupJson, importBackupJson, 
    resetToDefaultData, currentUser,
    rolePermissions, updateRolePermissions, resetRolePermissions,
    resetUserPassword
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'users' | 'rbac' | 'audit' | 'backup'>('rbac');
  const [auditSearch, setAuditSearch] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Dynamic RBAC Local Editing State
  const [selectedRole, setSelectedRole] = useState<UserRole>('hr');
  const [localPermissions, setLocalPermissions] = useState<Record<UserRole, string[]>>(rolePermissions);
  const [rbacSearch, setRbacSearch] = useState('');
  const [rbacViewMode, setRbacViewMode] = useState<'by-role' | 'matrix'>('by-role');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Keep localPermissions in sync when rolePermissions from backend changes
  useEffect(() => {
    setLocalPermissions(rolePermissions);
  }, [rolePermissions]);

  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        setImportStatus('Khôi phục cơ sở dữ liệu thành công!');
      } else {
        setImportStatus('Lỗi: File JSON không đúng định dạng IMS Backup!');
      }
    };
    reader.readAsText(file);
  };

  const hasLocalPerm = (role: UserRole, permId: string) => {
    return (localPermissions[role] || []).includes(permId);
  };

  const togglePermission = (role: UserRole, permId: string) => {
    setLocalPermissions(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permId)
        ? current.filter(p => p !== permId)
        : [...current, permId];
      return { ...prev, [role]: updated };
    });
    setSaveStatus(null);
  };

  const toggleModulePermissions = (role: UserRole, moduleId: string, enable: boolean) => {
    const moduleObj = PERMISSION_MODULES.find(m => m.moduleId === moduleId);
    if (!moduleObj) return;
    const modulePermIds = moduleObj.permissions.map(p => p.id);

    setLocalPermissions(prev => {
      const current = prev[role] || [];
      let updated: string[];
      if (enable) {
        updated = Array.from(new Set([...current, ...modulePermIds]));
      } else {
        updated = current.filter(p => !modulePermIds.includes(p));
      }
      return { ...prev, [role]: updated };
    });
    setSaveStatus(null);
  };

  const handleSaveRole = async (roleToSave: UserRole) => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await updateRolePermissions(roleToSave, localPermissions[roleToSave] || []);
      setSaveStatus({
        type: 'success',
        message: `Đã lưu thành công cấu hình phân quyền cho vai trò ${roleToSave.toUpperCase()} vào cơ sở dữ liệu SQLite!`
      });
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Lỗi khi lưu phân quyền vào hệ thống backend.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục ma trận phân quyền của TẤT CẢ vai trò về thiết lập mặc định của hệ thống?')) {
      return;
    }
    setIsResetting(true);
    setSaveStatus(null);
    try {
      await resetRolePermissions();
      setSaveStatus({
        type: 'success',
        message: 'Đã khôi phục thành công toàn bộ phân quyền về mặc định ban đầu!'
      });
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Lỗi khi khôi phục phân quyền.'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Quản Trị Hệ Thống, Phân Quyền & Nhật Ký Hoạt Động
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý tài khoản người dùng, phân quyền RBAC chi tiết, sao lưu/khôi phục dữ liệu JSON & kiểm tra Audit Trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportBackupJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Sao Lưu Database (Backup JSON)</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTabSub('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTabSub === 'users' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tài Khoản & Người Dùng ({users.length})
        </button>
        <button
          onClick={() => setActiveTabSub('rbac')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTabSub === 'rbac' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ma Trận Phân Quyền (RBAC)
        </button>
        <button
          onClick={() => setActiveTabSub('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTabSub === 'audit' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Nhật Ký Thao Tác (Audit Log - {auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTabSub('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTabSub === 'backup' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sao Lưu & Khôi Phục Dữ Liệu
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT (Story 39) */}
      {activeTabSub === 'users' && (
        <div className="space-y-4">
          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Key className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-2">
                Quy Chuẩn Tài Khoản & Mật Khẩu Hệ Thống (Lưu Trữ SQLite Database Thật)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  SQLite: data/ims.db
                </span>
              </h4>
              <p className="text-[11px] text-blue-800 leading-relaxed mb-2">
                Mỗi khi Admin/HR tạo Thực tập sinh hoặc Mentor, hệ thống sẽ tự động đồng bộ tài khoản người dùng vào bảng <code className="font-mono bg-blue-100/80 px-1.5 py-0.5 rounded text-blue-900">users</code> trong cơ sở dữ liệu thật với mật khẩu mặc định an toàn:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white/80 p-2 rounded-xl border border-blue-200">
                  <span className="font-semibold text-slate-500 block text-[10px]">THỰC TẬP SINH:</span>
                  <code className="font-mono font-bold text-amber-700">Intern@2026</code>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-blue-200">
                  <span className="font-semibold text-slate-500 block text-[10px]">MENTOR:</span>
                  <code className="font-mono font-bold text-blue-700">Mentor@2026</code>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-blue-200">
                  <span className="font-semibold text-slate-500 block text-[10px]">HR / QUẢN LÝ:</span>
                  <code className="font-mono font-bold text-emerald-700">HR@2026</code>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-blue-200">
                  <span className="font-semibold text-slate-500 block text-[10px]">QUẢN TRỊ VIÊN:</span>
                  <code className="font-mono font-bold text-purple-700">Admin@2026</code>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">
                  Danh Sách Tài Khoản Đăng Nhập ({users.length} người dùng)
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Đồng bộ thời gian thực với SQLite WAL mode</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Người Dùng</th>
                    <th className="py-3 px-4">Email (Tên Đăng Nhập)</th>
                    <th className="py-3 px-4">Vai Trò Hệ Thống</th>
                    <th className="py-3 px-4">Mật Khẩu Mặc Định</th>
                    <th className="py-3 px-4">Lưu Trữ DB Thật</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => {
                    const defaultPwd = u.defaultPassword || (
                      u.role === 'admin' ? 'Admin@2026' :
                      u.role === 'hr' ? 'HR@2026' :
                      u.role === 'mentor' ? 'Mentor@2026' : 'Intern@2026'
                    );

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{u.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {u.email}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={u.role === 'admin' ? 'info' : u.role === 'hr' ? 'success' : u.role === 'mentor' ? 'primary' : 'warning'}
                            size="sm"
                          >
                            {u.role.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <code className="font-mono font-bold text-slate-800 bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded text-[11px]">
                              {defaultPwd}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(defaultPwd);
                                alert(`Đã sao chép mật khẩu mặc định: ${defaultPwd}`);
                              }}
                              title="Sao chép mật khẩu"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            SQLite `users`
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              if (confirm(`Đặt lại mật khẩu của "${u.name}" (${u.email}) về mặc định (${defaultPwd})?`)) {
                                await resetUserPassword(u.id);
                                alert(`Đã đặt lại mật khẩu cho ${u.name} về: ${defaultPwd}`);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50 border border-slate-200 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Đặt lại MK
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC RBAC MANAGEMENT (Story 40 - Fullstack Alignment) */}
      {activeTabSub === 'rbac' && (
        <div className="space-y-4">
          {/* Status Alert Banner */}
          {saveStatus && (
            <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
              saveStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {saveStatus.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{saveStatus.message}</span>
              </div>
              <button 
                onClick={() => setSaveStatus(null)} 
                className="text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Control Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-600" />
                    Trung Tâm Quản Lý Phân Quyền Động (Dynamic RBAC Engine)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    SQLite + Express Middleware
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Admin có thể bật/tắt bất kỳ quyền hạn nào theo từng vai trò. Mọi thay đổi sẽ được lưu vào cơ sở dữ liệu SQLite và có hiệu lực đồng bộ tức thì trên cả Giao diện (Frontend) và Middleware bảo mật (Backend 403 Forbidden).
                </p>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
                  <button
                    onClick={() => setRbacViewMode('by-role')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rbacViewMode === 'by-role'
                        ? 'bg-white text-purple-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Theo Vai Trò
                  </button>
                  <button
                    onClick={() => setRbacViewMode('matrix')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rbacViewMode === 'matrix'
                        ? 'bg-white text-purple-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    Ma Trận Tổng Hợp
                  </button>
                </div>

                <button
                  onClick={handleResetDefaults}
                  disabled={isResetting}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors"
                  title="Khôi phục toàn bộ phân quyền về mặc định"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin' : ''}`} />
                  <span>{isResetting ? 'Đang khôi phục...' : 'Khôi Phục Mặc Định'}</span>
                </button>
              </div>
            </div>

            {/* Role Tabs Selection */}
            {rbacViewMode === 'by-role' && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {(['hr', 'mentor', 'intern', 'candidate', 'admin'] as UserRole[]).map(roleKey => {
                  const isSelected = selectedRole === roleKey;
                  const count = (localPermissions[roleKey] || []).length;
                  const total = ALL_PERMISSION_IDS.length;
                  const isUnsaved = JSON.stringify(localPermissions[roleKey]?.sort()) !== JSON.stringify(rolePermissions[roleKey]?.slice().sort());

                  const roleMeta = {
                    admin: { label: 'Quản Trị Viên (Admin)', color: 'purple' },
                    hr: { label: 'Nhân Sự (HR Manager)', color: 'emerald' },
                    mentor: { label: 'Người Hướng Dẫn (Mentor)', color: 'blue' },
                    intern: { label: 'Thực Tập Sinh (Intern)', color: 'amber' },
                    candidate: { label: 'Ứng Viên (Candidate)', color: 'slate' }
                  }[roleKey];

                  return (
                    <button
                      key={roleKey}
                      onClick={() => setSelectedRole(roleKey)}
                      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/20'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{roleMeta.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        isSelected ? 'bg-purple-700/80 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {count}/{total}
                      </span>
                      {isUnsaved && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-1 -right-1 ring-2 ring-white" title="Có thay đổi chưa lưu" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* VIEW MODE 1: BY ROLE */}
          {rbacViewMode === 'by-role' && (
            <div className="space-y-4">
              {/* Action & Filter Toolbar for selected role */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên quyền, mã quyền..."
                    value={rbacSearch}
                    onChange={e => setRbacSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {JSON.stringify(localPermissions[selectedRole]?.sort()) !== JSON.stringify(rolePermissions[selectedRole]?.slice().sort()) && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Có thay đổi chưa lưu
                    </span>
                  )}
                  <button
                    onClick={() => handleSaveRole(selectedRole)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                    <span>{isSaving ? 'Đang lưu vào SQLite...' : `Lưu Quyền Cho ${selectedRole.toUpperCase()}`}</span>
                  </button>
                </div>
              </div>

              {/* Permission Modules Accordion / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERMISSION_MODULES.map(module => {
                  const filteredPerms = module.permissions.filter(p => 
                    p.name.toLowerCase().includes(rbacSearch.toLowerCase()) ||
                    p.id.toLowerCase().includes(rbacSearch.toLowerCase()) ||
                    p.description.toLowerCase().includes(rbacSearch.toLowerCase())
                  );

                  if (filteredPerms.length === 0 && rbacSearch) return null;

                  const allModulePermIds = module.permissions.map(p => p.id);
                  const activeCount = allModulePermIds.filter(id => hasLocalPerm(selectedRole, id)).length;
                  const isAllActive = activeCount === allModulePermIds.length;

                  return (
                    <div key={module.moduleId} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                      {/* Module Card Header */}
                      <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{module.moduleName}</h4>
                          <span className="text-[10px] text-slate-500">
                            {activeCount}/{allModulePermIds.length} quyền được cấp
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleModulePermissions(selectedRole, module.moduleId, !isAllActive)}
                            className="px-2 py-1 text-[10px] font-semibold text-purple-700 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200/60"
                          >
                            {isAllActive ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                          </button>
                        </div>
                      </div>

                      {/* Permissions List */}
                      <div className="p-3 divide-y divide-slate-100 grow space-y-2">
                        {filteredPerms.map(perm => {
                          const isChecked = hasLocalPerm(selectedRole, perm.id);
                          const isLocked = selectedRole === 'admin' && perm.id === 'admin:rbac';

                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-colors pt-2.5 ${
                                isChecked ? 'bg-purple-50/40 hover:bg-purple-50/70' : 'hover:bg-slate-50'
                              } ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isLocked}
                                onChange={() => togglePermission(selectedRole, perm.id)}
                                className="mt-1 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 shrink-0"
                              />
                              <div className="min-w-0 grow">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-xs font-bold ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {perm.name}
                                  </span>
                                  <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                    {perm.id}
                                  </code>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                  {perm.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: FULL MATRIX */}
          {rbacViewMode === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Bảng Ma Trận Phân Quyền Trực Tiếp 5 Vai Trò
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bấm vào từng ô để bật/tắt quyền tương ứng và bấm nút lưu để cập nhật vào SQLite
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(['hr', 'mentor', 'intern', 'candidate'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => handleSaveRole(r)}
                      disabled={isSaving}
                      className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                    >
                      Lưu {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200">
                    <tr className="text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 w-1/3">Quyền Hạn & Mã Phân Hệ</th>
                      <th className="py-3 px-3 text-center">Admin</th>
                      <th className="py-3 px-3 text-center">HR</th>
                      <th className="py-3 px-3 text-center">Mentor</th>
                      <th className="py-3 px-3 text-center">Intern</th>
                      <th className="py-3 px-3 text-center">Candidate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PERMISSION_MODULES.flatMap(mod => [
                      <tr key={`mod-${mod.moduleId}`} className="bg-slate-50/90 font-bold text-slate-800">
                        <td colSpan={6} className="py-2 px-4 text-[11px] uppercase tracking-wider text-purple-700">
                          {mod.moduleName}
                        </td>
                      </tr>,
                      ...mod.permissions.map(perm => (
                        <tr key={perm.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-800">{perm.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{perm.id}</div>
                          </td>
                          {(['admin', 'hr', 'mentor', 'intern', 'candidate'] as UserRole[]).map(roleKey => {
                            const isChecked = hasLocalPerm(roleKey, perm.id);
                            return (
                              <td key={roleKey} className="py-2.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(roleKey, perm.id)}
                                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ])}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Architecture & Security Notice Box */}
          <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 text-xs text-purple-900 space-y-1.5">
            <div className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              Cơ Chế Bảo Mật & Đồng Bộ Hai Chiều (Frontend & Backend Alignment)
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              1. <strong>Kiểm soát Giao diện (Frontend Guard):</strong> Các nút thao tác (Thêm, Xóa, Sửa, Duyệt CV, Chấm điểm, Chuyển Kanban) và các Tab trên thanh điều hướng Sidebar sẽ tự động ẩn/hiện tương ứng với ma trận phân quyền đã cấp.<br />
              2. <strong>Bảo vệ API Backend (Express Middleware 403 Forbidden):</strong> Mọi request gọi đến các API bảo mật (`POST`, `PUT`, `DELETE`, `GET /api/allowances`, v.v.) đều đi qua middleware <code>authorize(permission)</code> kiểm tra trực tiếp bảng <code>role_permissions</code> trong SQLite. Nếu người dùng không có quyền, backend sẽ lập tức trả về mã lỗi <code>403 Forbidden</code> kèm thông báo rõ ràng.<br />
              3. <strong>Kiểm tra Swagger:</strong> Bạn có thể theo dõi và chạy thử nghiệm các endpoint được phân quyền tại tài liệu Swagger UI ở đường dẫn <code>http://localhost:5000/api-docs</code>.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG (Story 42) */}
      {activeTabSub === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Nhật Ký Thao Tác Hệ Thống (Audit Trail)
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm người dùng, thao tác..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Thời Gian</th>
                  <th className="py-2.5 px-3">Người Thực Hiện</th>
                  <th className="py-2.5 px-3">Vai Trò</th>
                  <th className="py-2.5 px-3">Hành Động</th>
                  <th className="py-2.5 px-3">Chi Tiết Thao Tác</th>
                  <th className="py-2.5 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">{log.userName}</td>
                    <td className="py-2.5 px-3">
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700 whitespace-nowrap">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-md">{log.details}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log.ipAddress || '192.168.1.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE (Story 41) */}
      {activeTabSub === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Sao Lưu Dữ Liệu Toàn Diện</h4>
                <p className="text-xs text-slate-500">Tải về toàn bộ cơ sở dữ liệu hệ thống dưới dạng file JSON</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Gói sao lưu bao gồm: Hồ sơ thực tập sinh, Đợt tuyển dụng, Bảng chấm công, Đánh giá, Nhiệm vụ Kanban, Báo cáo tuần và Toàn bộ Audit Logs.
            </p>

            <button
              onClick={exportBackupJson}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Tải Xuống Bản Sao Lưu JSON (Download Backup)</span>
            </button>
          </div>

          {/* Restore Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Khôi Phục Dữ Liệu Hệ Thống</h4>
                <p className="text-xs text-slate-500">Tải lên file sao lưu JSON để nạp lại dữ liệu</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Chọn file JSON sao lưu đã xuất từ hệ thống IMS trước đó. Quá trình khôi phục sẽ ghi đè trạng thái hiện tại.
            </p>

            <label className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Chọn File JSON Để Khôi Phục</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {importStatus && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                importStatus.includes('thành công') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
