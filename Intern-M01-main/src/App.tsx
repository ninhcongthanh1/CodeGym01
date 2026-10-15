import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { InternProfilesView } from './components/views/InternProfilesView';
import { RecruitmentView } from './components/views/RecruitmentView';
import { ProgramsView } from './components/views/ProgramsView';
import { MentorsView } from './components/views/MentorsView';
import { TasksView } from './components/views/TasksView';
import { WeeklyReportsView } from './components/views/WeeklyReportsView';
import { EvaluationsView } from './components/views/EvaluationsView';
import { AttendanceView } from './components/views/AttendanceView';
import { AllowancesView } from './components/views/AllowancesView';
import { SupportTicketsView } from './components/views/SupportTicketsView';
import { ReportsAnalyticsView } from './components/views/ReportsAnalyticsView';
import { SystemAdminView } from './components/views/SystemAdminView';
import { QrCheckInModal } from './components/modals/QrCheckInModal';
import { PublicApplicationModal } from './components/modals/PublicApplicationModal';
import { EmailLogModal } from './components/modals/EmailLogModal';
import { ShieldAlert } from 'lucide-react';

import { LoginView } from './components/views/LoginView';

const TAB_PERMISSIONS: Record<ActiveTab, string | null> = {
  dashboard: null,
  recruitment: 'recruitment:view',
  interns: 'interns:view',
  programs: 'programs:view',
  mentors: 'mentors:view',
  tasks: 'tasks:view',
  reports: 'reports:view',
  attendance: 'attendance:view',
  allowances: 'allowances:view',
  evaluations: 'evaluations:view',
  support: 'tickets:view',
  analytics: 'analytics:view',
  admin: 'admin:rbac',
};

const MainLayout: React.FC = () => {
  const { currentUser, isAuthenticated, hasPermission } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPublicApplyModalOpen, setIsPublicApplyModalOpen] = useState(false);
  const [isEmailLogModalOpen, setIsEmailLogModalOpen] = useState(false);

  // If user is not logged in, render the Login View
  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  // Check RBAC permission for current activeTab
  const requiredPermission = TAB_PERMISSIONS[activeTab];
  const isTabAllowed = currentUser.role === 'admin' || !requiredPermission || hasPermission(requiredPermission);

  // Render the current active view
  const renderCurrentView = () => {
    if (!isTabAllowed && requiredPermission) {
      return (
        <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center space-y-4 shadow-xs my-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">403 - Quyền Truy Cập Bị Từ Chối (Forbidden)</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Vai trò hiện tại của bạn (<strong>{currentUser.role.toUpperCase()}</strong>) không được cấp quyền <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-rose-600 font-semibold">{requiredPermission}</code> để sử dụng phân hệ này.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Quay về Trang Tổng Quan
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} onOpenQr={() => setIsQrModalOpen(true)} />;
      case 'recruitment':
        return <RecruitmentView onOpenPublicApply={() => setIsPublicApplyModalOpen(true)} />;
      case 'interns':
        return <InternProfilesView />;
      case 'programs':
        return <ProgramsView />;
      case 'mentors':
        return <MentorsView />;
      case 'tasks':
        return <TasksView />;
      case 'reports':
        return <WeeklyReportsView />;
      case 'evaluations':
        return <EvaluationsView />;
      case 'attendance':
        return <AttendanceView onOpenQr={() => setIsQrModalOpen(true)} />;
      case 'allowances':
        return <AllowancesView />;
      case 'support':
        return <SupportTicketsView />;
      case 'analytics':
        return <ReportsAnalyticsView />;
      case 'admin':
        return <SystemAdminView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} onOpenQr={() => setIsQrModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenQr={() => setIsQrModalOpen(true)}
        onOpenPublicApply={() => setIsPublicApplyModalOpen(true)}
        onOpenEmailLog={() => setIsEmailLogModalOpen(true)}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenPublicApply={() => setIsPublicApplyModalOpen(true)}
        />

        {/* Dynamic Content Container */}
        <main className="grow min-w-0">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <QrCheckInModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      <PublicApplicationModal
        isOpen={isPublicApplyModalOpen}
        onClose={() => setIsPublicApplyModalOpen(false)}
      />

      <EmailLogModal
        isOpen={isEmailLogModalOpen}
        onClose={() => setIsEmailLogModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
