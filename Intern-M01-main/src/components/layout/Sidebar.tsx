import React from 'react';
import { 
  LayoutDashboard, UserCheck, Users, CalendarDays, 
  Briefcase, CheckSquare, FileText, Award, 
  Clock, DollarSign, HelpCircle, BarChart3, 
  ShieldCheck, UserPlus, ChevronRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type ActiveTab = 
  | 'dashboard'
  | 'recruitment'
  | 'interns'
  | 'programs'
  | 'mentors'
  | 'tasks'
  | 'reports'
  | 'evaluations'
  | 'attendance'
  | 'allowances'
  | 'support'
  | 'analytics'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenPublicApply: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPublicApply
}) => {
  const { currentUser, interns, tasks, reports, leaves, tickets, hasPermission } = useApp();

  // Badges calculation
  const pendingApplicants = interns.filter(i => i.status === 'applying' || i.status === 'interviewing').length;
  const pendingReports = reports.filter(r => r.status === 'submitted').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tổng quan (Dashboard)',
      icon: LayoutDashboard,
      permission: null
    },
    {
      id: 'recruitment' as ActiveTab,
      label: 'Tiếp nhận & Xét duyệt',
      icon: UserPlus,
      badge: pendingApplicants > 0 ? pendingApplicants : undefined,
      badgeColor: 'bg-amber-500 text-white',
      permission: 'recruitment:view'
    },
    {
      id: 'interns' as ActiveTab,
      label: 'Hồ sơ Thực tập sinh',
      icon: Users,
      badge: interns.length,
      permission: 'interns:view'
    },
    {
      id: 'programs' as ActiveTab,
      label: 'Đợt & Lịch thực tập',
      icon: CalendarDays,
      permission: 'programs:view'
    },
    {
      id: 'mentors' as ActiveTab,
      label: 'Mentor & Phòng ban',
      icon: Briefcase,
      permission: 'mentors:view'
    },
    {
      id: 'tasks' as ActiveTab,
      label: 'Nhiệm vụ & Kanban',
      icon: CheckSquare,
      badge: tasks.filter(t => t.status !== 'done').length,
      permission: 'tasks:view'
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Báo cáo tuần',
      icon: FileText,
      badge: pendingReports > 0 ? pendingReports : undefined,
      badgeColor: 'bg-blue-600 text-white',
      permission: 'reports:view'
    },
    {
      id: 'attendance' as ActiveTab,
      label: 'Chấm công & Nghỉ phép',
      icon: Clock,
      badge: pendingLeaves > 0 ? pendingLeaves : undefined,
      badgeColor: 'bg-rose-500 text-white',
      permission: 'attendance:view'
    },
    {
      id: 'allowances' as ActiveTab,
      label: 'Phụ cấp & Chế độ',
      icon: DollarSign,
      permission: 'allowances:view'
    },
    {
      id: 'evaluations' as ActiveTab,
      label: 'Đánh giá & Chứng nhận',
      icon: Award,
      permission: 'evaluations:view'
    },
    {
      id: 'support' as ActiveTab,
      label: 'Yêu cầu hỗ trợ',
      icon: HelpCircle,
      badge: openTickets > 0 ? openTickets : undefined,
      badgeColor: 'bg-indigo-600 text-white',
      permission: 'tickets:view'
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Báo cáo & Thống kê',
      icon: BarChart3,
      permission: 'analytics:view'
    },
    {
      id: 'admin' as ActiveTab,
      label: 'Quản trị & Nhật ký',
      icon: ShieldCheck,
      permission: 'admin:rbac'
    }
  ];

  const filteredNav = navItems.filter(item => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Phân hệ nghiệp vụ
          </div>
          {filteredNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom callout */}
      <div className="pt-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-3.5 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-blue-300">Cổng Tiếp Nhận</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-sm">Online</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Trang nộp hồ sơ công khai cho sinh viên HUST, VNU, FTU...
          </p>
          <button
            onClick={onOpenPublicApply}
            className="mt-3 w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <span>Mở Cổng Tuyển Dụng</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
