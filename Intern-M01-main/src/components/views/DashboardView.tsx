import React from 'react';
import { 
  Users, UserCheck, Award, TrendingUp, Clock, 
  Calendar, CheckCircle2, AlertCircle, FileSpreadsheet, 
  ArrowUpRight, Sparkles, Building2, BookOpen 
} from 'lucide-react';
import { StatsCard } from '../common/StatsCard';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQr: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onOpenQr }) => {
  const { 
    currentUser, interns, programs, tasks, reports, 
    attendance, leaves, allowances, auditLogs, exportInternsToExcel 
  } = useApp();

  const activeInterns = interns.filter(i => i.status === 'active');
  const completedInterns = interns.filter(i => i.status === 'completed' || i.status === 'hired');
  const hiredCount = interns.filter(i => i.status === 'hired').length;
  const hiringRate = Math.round((hiredCount / (completedInterns.length || 1)) * 100);

  // University count breakdown
  const uniMap: Record<string, number> = {};
  interns.forEach(i => {
    const uniShort = i.university.includes('HUST') || i.university.includes('Bách Khoa Hà Nội') ? 'ĐH Bách Khoa HN' :
                     i.university.includes('FTU') || i.university.includes('Ngoại Thương') ? 'ĐH Ngoại Thương' :
                     i.university.includes('UET') || i.university.includes('ĐHQG') ? 'ĐH Quốc Gia HN' :
                     i.university.includes('NEU') || i.university.includes('Kinh tế Quốc dân') ? 'ĐH KT Quốc Dân' :
                     i.university.includes('FPT') ? 'ĐH FPT' : 'Trường khác';
    uniMap[uniShort] = (uniMap[uniShort] || 0) + 1;
  });

  const uniEntries = Object.entries(uniMap).sort((a, b) => b[1] - a[1]);
  const maxUniCount = Math.max(...Object.values(uniMap), 1);

  // Intern personal view
  const myProfile = currentUser.role === 'intern' 
    ? interns.find(i => i.id === currentUser.internProfileId || i.email === currentUser.email)
    : null;

  const myTasks = myProfile ? tasks.filter(t => t.assignedToInternId === myProfile.id) : [];
  const myCompletedTasks = myTasks.filter(t => t.status === 'done');
  const myTodayAtt = myProfile ? attendance.find(a => a.internId === myProfile.id && a.date === new Date().toISOString().substring(0, 10)) : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hệ thống Quản lý Thực tập sinh Thông minh IMS 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {currentUser.name}! 👋
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            {currentUser.role === 'intern'
              ? 'Chào mừng bạn đến với không gian làm việc số. Hãy theo dõi nhiệm vụ hôm nay và hoàn thành báo cáo đúng hạn!'
              : 'Nền tảng số hóa toàn diện quy trình tiếp nhận, theo dõi tiến độ, chấm công và đánh giá thực tập sinh.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {currentUser.role === 'intern' ? (
              <>
                <button
                  onClick={onOpenQr}
                  className="px-4 py-2 bg-white text-blue-800 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all shadow-md flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Điểm danh / Chấm công ngay</span>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold text-xs hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Nộp báo cáo tuần</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('recruitment')}
                  className="px-4 py-2 bg-white text-blue-800 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all shadow-md flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Xét duyệt hồ sơ ứng viên</span>
                </button>
                <button
                  onClick={exportInternsToExcel}
                  className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold text-xs hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                  <span>Xuất báo cáo Excel (.xlsx)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentUser.role === 'intern' ? (
          <>
            <StatsCard
              title="Trạng thái làm việc"
              value={myTodayAtt?.checkInTime ? `Đã Check-in: ${myTodayAtt.checkInTime}` : 'Chưa Check-in'}
              change={myTodayAtt?.status === 'on_time' ? 'Đúng giờ' : myTodayAtt ? 'Đi muộn' : 'Hôm nay'}
              changeType={myTodayAtt?.status === 'on_time' ? 'positive' : 'warning'}
              icon={Clock}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Nhiệm vụ được giao"
              value={`${myCompletedTasks.length} / ${myTasks.length}`}
              subtitle={`${Math.round((myCompletedTasks.length / (myTasks.length || 1)) * 100)}% hoàn thành`}
              icon={CheckCircle2}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatsCard
              title="Điểm GPA & Thực tập"
              value={myProfile?.gpa ? `${myProfile.gpa} / 4.0` : '3.65 / 4.0'}
              subtitle="Xếp loại sinh viên Giỏi"
              icon={Award}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
            />
            <StatsCard
              title="Phụ cấp tháng này"
              value="6,050,000 đ"
              subtitle="21 ngày công thực tế"
              icon={TrendingUp}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
          </>
        ) : (
          <>
            <StatsCard
              title="Tổng Thực Tập Sinh"
              value={interns.length}
              change="+3 ứng viên mới"
              changeType="positive"
              icon={Users}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Đang Thực Tập"
              value={activeInterns.length}
              subtitle="Trên 5 phòng ban"
              icon={UserCheck}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatsCard
              title="Tỷ lệ Tuyển Chính Thức"
              value="82%"
              change="Chỉ tiêu vượt 12%"
              changeType="positive"
              icon={Award}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatsCard
              title="Tỷ lệ Chuyên Cần"
              value="96.5%"
              change="Đúng giờ"
              changeType="positive"
              icon={TrendingUp}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
            />
          </>
        )}
      </div>

      {/* Middle Grid: University Breakdown & Active Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* University Sources Breakdown (Goal 4 & 5: Hợp tác trường ĐH & Thống kê chiến lược) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Nguồn Sinh Viên Theo Trường Đại Học
              </h3>
              <p className="text-xs text-slate-500">Phục vụ chiến lược hợp tác doanh nghiệp - nhà trường</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem chi tiết
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {uniEntries.map(([uniName, count]) => {
              const percent = Math.round((count / interns.length) * 100);
              return (
                <div key={uniName} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="font-semibold">{uniName}</span>
                    <span className="text-slate-500">{count} sinh viên ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxUniCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Programs & Milestones */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Đợt Thực Tập Đang Diễn Ra
              </h3>
              <p className="text-xs text-slate-500">Tiến độ và các mốc thời gian (Milestones)</p>
            </div>
            <button
              onClick={() => setActiveTab('programs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Tất cả đợt
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {programs.map(prog => (
              <div key={prog.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{prog.name}</span>
                  <Badge variant="primary" size="sm">{prog.batchCode}</Badge>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Chỉ tiêu: {prog.currentCount}/{prog.targetCount} intern</span>
                  <span>{prog.startDate} → {prog.endDate}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${(prog.currentCount / prog.targetCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Audit Activity & Quick Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent System Activity / Audit Log */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Nhật Ký Thao Tác Hệ Thống (Audit Log)</h3>
            <span className="text-xs text-slate-400">Tự động ghi lại mọi thay đổi</span>
          </div>
          <div className="divide-y divide-slate-100">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="py-3 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                <div className="grow space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600">{log.details}</p>
                  <div className="text-[11px] text-slate-400">
                    Thực hiện bởi: <strong className="text-slate-700">{log.userName}</strong> ({log.userRole.toUpperCase()})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Pending Approvals Callout */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Cần Xử Lý Nhanh</h3>
          <div className="space-y-2.5">
            <button
              onClick={() => setActiveTab('recruitment')}
              className="w-full p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-amber-900">Hồ sơ ứng viên chờ duyệt</div>
                <div className="text-[11px] text-amber-700">Sinh viên nộp đơn online qua portal</div>
              </div>
              <Badge variant="warning" size="sm">
                {interns.filter(i => i.status === 'applying').length} hồ sơ
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-blue-900">Báo cáo tuần chưa chấm</div>
                <div className="text-[11px] text-blue-700">Báo cáo tiến độ của thực tập sinh</div>
              </div>
              <Badge variant="primary" size="sm">
                {reports.filter(r => r.status === 'submitted').length} báo cáo
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-rose-900">Đơn xin nghỉ phép</div>
                <div className="text-[11px] text-rose-700">Đơn nghỉ thi, ốm cần HR xác nhận</div>
              </div>
              <Badge variant="danger" size="sm">
                {leaves.filter(l => l.status === 'pending').length} đơn
              </Badge>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
