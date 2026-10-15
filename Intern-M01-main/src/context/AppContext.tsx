import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { 
  User, UserRole, Department, InternProfile, InternshipProgram, Mentor, 
  Task, WeeklyReport, PerformanceEvaluation, AttendanceRecord, 
  LeaveRequest, AllowanceRecord, SupportTicket, NotificationItem, 
  AuditLog, SystemEmailLog, DocumentAttachment, InternStatus, TaskStatus 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_DEPARTMENTS, INITIAL_PROGRAMS, INITIAL_MENTORS, 
  INITIAL_INTERNS, INITIAL_TASKS, INITIAL_REPORTS, INITIAL_EVALUATIONS, 
  INITIAL_ATTENDANCE, INITIAL_LEAVES, INITIAL_ALLOWANCES, INITIAL_TICKETS, 
  INITIAL_NOTIFICATIONS, INITIAL_EMAILS, INITIAL_AUDIT_LOGS 
} from '../data/mockData';
import { DEFAULT_ROLE_PERMISSIONS } from '../types/permissions';
import { api } from '../services/api';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  departments: Department[];
  programs: InternshipProgram[];
  mentors: Mentor[];
  interns: InternProfile[];
  tasks: Task[];
  reports: WeeklyReport[];
  evaluations: PerformanceEvaluation[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  allowances: AllowanceRecord[];
  tickets: SupportTicket[];
  notifications: NotificationItem[];
  emails: SystemEmailLog[];
  auditLogs: AuditLog[];
  users: User[];
  isBackendConnected: boolean;
  
  // Dynamic RBAC Permission System
  rolePermissions: Record<UserRole, string[]>;
  hasPermission: (permissionId: string) => boolean;
  updateRolePermissions: (role: UserRole, permissions: string[]) => Promise<boolean>;
  resetRolePermissions: () => Promise<boolean>;
  
  // Actions
  addIntern: (intern: Omit<InternProfile, 'id' | 'createdAt'>) => void;
  updateIntern: (id: string, data: Partial<InternProfile>) => void;
  deleteIntern: (id: string) => void;
  updateInternStatus: (id: string, status: InternStatus) => void;
  verifyDocument: (internId: string, docId: string) => void;
  uploadDocument: (internId: string, doc: Omit<DocumentAttachment, 'id' | 'uploadedAt'>) => void;
  signContract: (internId: string) => void;
  
  addProgram: (program: Omit<InternshipProgram, 'id'>) => void;
  updateProgram: (id: string, data: Partial<InternshipProgram>) => void;
  assignMentor: (internId: string, mentorId: string) => void;
  
  addMentor: (mentor: Omit<Mentor, 'id' | 'currentMenteesCount'>) => void;
  updateMentor: (id: string, data: Partial<Mentor>) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus, progressPercent?: number) => void;
  deleteTask: (id: string) => void;
  
  submitReport: (report: Omit<WeeklyReport, 'id' | 'submissionDate' | 'status'>) => void;
  reviewReport: (id: string, score: number, feedback: string) => void;
  
  submitEvaluation: (evalData: Omit<PerformanceEvaluation, 'id' | 'evaluatedAt'>) => void;
  issueCertificate: (evaluationId: string) => void;
  
  checkIn: (internId: string, method?: 'web' | 'qr') => boolean;
  checkOut: (internId: string) => boolean;
  
  submitLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void;
  reviewLeave: (leaveId: string, status: 'approved' | 'rejected', note?: string) => void;
  
  addAllowance: (allowance: Omit<AllowanceRecord, 'id'>) => void;
  updateAllowanceStatus: (id: string, status: 'approved' | 'paid') => void;
  
  submitTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => void;
  resolveTicket: (id: string, note: string) => void;
  
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  
  sendSystemEmail: (email: Omit<SystemEmailLog, 'id' | 'sentAt'>) => void;
  logAction: (action: string, entityType: string, details: string, entityId?: string) => void;
  
  exportInternsToExcel: () => void;
  exportAttendanceToExcel: () => void;
  exportBackupJson: () => void;
  importBackupJson: (jsonData: string) => boolean;
  resetToDefaultData: () => void;
  createUser: (user: Omit<User, 'id'>) => Promise<boolean>;
  resetUserPassword: (userId: string) => Promise<string>;
}

const STORAGE_KEY = 'IMS_STORAGE_DATA_V1';
const AUTH_USER_KEY = 'IMS_AUTH_USER_V1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved user', e);
    }
    return INITIAL_USERS[0]; // Admin by default fallback
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(AUTH_USER_KEY));
  });
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [programs, setPrograms] = useState<InternshipProgram[]>(INITIAL_PROGRAMS);
  const [mentors, setMentors] = useState<Mentor[]>(INITIAL_MENTORS);
  const [interns, setInterns] = useState<InternProfile[]>(INITIAL_INTERNS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [reports, setReports] = useState<WeeklyReport[]>(INITIAL_REPORTS);
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>(INITIAL_EVALUATIONS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [allowances, setAllowances] = useState<AllowanceRecord[]>(INITIAL_ALLOWANCES);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [emails, setEmails] = useState<SystemEmailLog[]>(INITIAL_EMAILS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>(DEFAULT_ROLE_PERMISSIONS);

  // Keep API client auth in sync with current user
  useEffect(() => {
    if (currentUser) {
      api.setAuth(currentUser.role, currentUser.name);
    }
  }, [currentUser]);

  // Sync with Backend API on mount
  useEffect(() => {
    async function loadFromBackend() {
      try {
        const [
          internsRes, tasksRes, reportsRes, evalsRes, attRes,
          leavesRes, alwRes, tickRes, progRes, menRes, deptRes, notifRes, emailsRes, logsRes, permsRes, usersRes
        ] = await Promise.all([
          api.getInterns(),
          api.getTasks(),
          api.getReports(),
          api.getEvaluations(),
          api.getAttendance(),
          api.getLeaves(),
          api.getAllowances(),
          api.getTickets(),
          api.getPrograms(),
          api.getMentors(),
          api.getDepartments(),
          api.getNotifications(),
          api.getEmails(),
          api.getAuditLogs(),
          api.getRolePermissions().catch(() => null),
          api.getUsers().catch(() => null)
        ]);

        if (internsRes?.data) setInterns(internsRes.data);
        if (tasksRes?.data) setTasks(tasksRes.data);
        if (reportsRes?.data) setReports(reportsRes.data);
        if (evalsRes?.data) setEvaluations(evalsRes.data);
        if (attRes?.data) setAttendance(attRes.data);
        if (leavesRes?.data) setLeaves(leavesRes.data);
        if (alwRes?.data) setAllowances(alwRes.data);
        if (tickRes?.data) setTickets(tickRes.data);
        if (progRes?.data) setPrograms(progRes.data);
        if (menRes?.data) setMentors(menRes.data);
        if (deptRes?.data) setDepartments(deptRes.data);
        if (notifRes?.data) setNotifications(notifRes.data);
        if (emailsRes?.data) setEmails(emailsRes.data);
        if (logsRes?.data) setAuditLogs(logsRes.data);
        if (permsRes?.data) setRolePermissions(permsRes.data);
        if (usersRes?.data) setUsers(usersRes.data);

        setIsBackendConnected(true);
        console.log('✅ Connected to IMS Backend SQLite API at /api');
      } catch (e) {
        console.warn('Backend SQLite API not connected yet, using local state:', e);
        // Fallback to local storage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.interns) setInterns(parsed.interns);
          if (parsed.tasks) setTasks(parsed.tasks);
          if (parsed.reports) setReports(parsed.reports);
          if (parsed.evaluations) setEvaluations(parsed.evaluations);
          if (parsed.attendance) setAttendance(parsed.attendance);
          if (parsed.leaves) setLeaves(parsed.leaves);
          if (parsed.allowances) setAllowances(parsed.allowances);
          if (parsed.tickets) setTickets(parsed.tickets);
          if (parsed.programs) setPrograms(parsed.programs);
          if (parsed.mentors) setMentors(parsed.mentors);
        }
      }
    }

    loadFromBackend();
  }, []);

  // Save to local storage as client-side backup
  useEffect(() => {
    try {
      const dataToSave = {
        interns, tasks, reports, evaluations, 
        attendance, leaves, allowances, tickets, 
        programs, mentors, notifications, emails, auditLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [interns, tasks, reports, evaluations, attendance, leaves, allowances, tickets, programs, mentors, notifications, emails, auditLogs]);

  // Actions
  const logAction = (action: string, entityType: string, details: string, entityId?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '127.0.0.1'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    api.logAction(newLog).catch(() => {});
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Vừa xong',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Try real backend login first
      const res = await api.login({ email, password });
      if (res?.success && res.data) {
        const user: User = res.data;
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        api.setAuth(user.role, user.name);
        return { success: true };
      }
      return { success: false, error: res?.message || 'Email hoặc mật khẩu không chính xác' };
    } catch (err: any) {
      // Fallback local check if backend is offline
      const cleanEmail = email.trim().toLowerCase();
      const matched = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (matched) {
        const expectedPwd = matched.password || matched.defaultPassword || (
          matched.role === 'admin' ? 'Admin@2026' : matched.role === 'hr' ? 'HR@2026' : matched.role === 'mentor' ? 'Mentor@2026' : 'Intern@2026'
        );
        if (password === expectedPwd) {
          setCurrentUser(matched);
          setIsAuthenticated(true);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matched));
          api.setAuth(matched.role, matched.name);
          return { success: true };
        }
      }
      return { success: false, error: err?.message || 'Email hoặc mật khẩu không chính xác!' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_USER_KEY);
    api.setAuth('intern', 'Khách');
  };

  const switchRole = (role: UserRole) => {
    const matchedUser = users.find(u => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matchedUser));
    } else {
      const tempUser: User = {
        id: `u-${role}-temp`,
        name: `Tài khoản ${role.toUpperCase()}`,
        email: `${role}@ims.corp`,
        role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
      setCurrentUser(tempUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(tempUser));
    }
    logAction('Chuyển đổi vai trò', 'UserRole', `Chuyển sang góc nhìn vai trò ${role.toUpperCase()}`);
  };

  // Dynamic RBAC Permission Logic
  const hasPermission = (permissionId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const currentPerms = rolePermissions[currentUser.role] || [];
    return currentPerms.includes(permissionId);
  };

  const updateRolePermissions = async (role: UserRole, permissions: string[]): Promise<boolean> => {
    try {
      const res = await api.updateRolePermissions(role, permissions);
      if (res?.success) {
        setRolePermissions(prev => ({
          ...prev,
          [role]: permissions
        }));
        logAction('Phân quyền hệ thống', 'RBAC', `Cập nhật phân quyền cho vai trò ${role.toUpperCase()} (${permissions.length} quyền)`);
        addNotification({
          title: 'Cập nhật phân quyền thành công',
          message: `Đã lưu cấu hình phân quyền cho vai trò ${role.toUpperCase()} vào cơ sở dữ liệu SQLite!`,
          type: 'system'
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Lỗi cập nhật phân quyền:', err);
      addNotification({
        title: 'Lỗi cập nhật phân quyền',
        message: err.message || 'Không thể lưu phân quyền do thiếu thẩm quyền hoặc lỗi hệ thống.',
        type: 'system'
      });
      throw err;
    }
  };

  const resetRolePermissions = async (): Promise<boolean> => {
    try {
      const res = await api.resetRolePermissions();
      if (res?.success && res.data) {
        setRolePermissions(res.data);
        logAction('Khôi phục phân quyền', 'RBAC', 'Khôi phục toàn bộ phân quyền hệ thống về mặc định');
        addNotification({
          title: 'Khôi phục phân quyền',
          message: 'Đã hoàn nguyên bảng ma trận phân quyền về cấu hình chuẩn ban đầu.',
          type: 'system'
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Lỗi khôi phục phân quyền:', err);
      throw err;
    }
  };

  // Intern Actions
  const addIntern = (internData: Omit<InternProfile, 'id' | 'createdAt'>) => {
    const newId = `intern-${Date.now()}`;
    const newUserId = `u-${newId}`;
    const newIntern: InternProfile = {
      ...internData,
      id: newId,
      userId: newUserId,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setInterns(prev => [newIntern, ...prev]);
    setUsers(prev => [
      {
        id: newUserId,
        name: internData.fullName,
        email: internData.email,
        role: 'intern',
        password: 'Intern@2026',
        defaultPassword: 'Intern@2026',
        status: 'active',
        avatar: internData.avatar || 'https://images.unsplash.com/photo-1535713875002?w=150',
        phone: internData.phone,
        departmentId: internData.departmentId,
        internProfileId: newId
      },
      ...prev
    ]);
    api.createIntern(newIntern).catch(e => console.error(e));
    logAction('Thêm hồ sơ thực tập sinh & Tạo tài khoản', 'InternProfile', `Tạo hồ sơ & tài khoản cho ${internData.fullName} (${internData.university}) | MK mặc định: Intern@2026`, newId);
    addNotification({
      title: 'Tài khoản & Hồ sơ mới được tạo',
      message: `Thực tập sinh ${internData.fullName} đã được thêm vào hệ thống với mật khẩu mặc định Intern@2026.`,
      type: 'system'
    });
  };

  const updateIntern = (id: string, data: Partial<InternProfile>) => {
    setInterns(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    api.updateIntern(id, data).catch(e => console.error(e));
    logAction('Chỉnh sửa hồ sơ thực tập sinh', 'InternProfile', `Cập nhật thông tin thực tập sinh ID: ${id}`, id);
  };

  const deleteIntern = (id: string) => {
    setInterns(prev => prev.filter(i => i.id !== id));
    api.deleteIntern(id).catch(e => console.error(e));
    logAction('Xóa hồ sơ thực tập sinh', 'InternProfile', `Xóa thực tập sinh ID: ${id}`, id);
  };

  const updateInternStatus = (id: string, status: InternStatus) => {
    setInterns(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    api.updateInternStatus(id, status).catch(e => console.error(e));
    const target = interns.find(i => i.id === id);
    logAction('Cập nhật trạng thái thực tập', 'InternProfile', `Chuyển trạng thái của ${target?.fullName} thành ${status}`, id);

    if (status === 'accepted' && target) {
      sendSystemEmail({
        toEmail: target.email,
        recipientName: target.fullName,
        subject: '[IMS TechCorp] Chúc mừng bạn đã trúng tuyển chương trình thực tập!',
        content: `Kính gửi ${target.fullName},\n\nChúc mừng bạn đã trúng tuyển trở thành Thực tập sinh tại Công ty. Vui lòng đăng nhập hệ thống để xác nhận hợp đồng.`,
        type: 'offer_letter'
      });
      addNotification({
        title: 'Trúng tuyển thực tập',
        message: `Đã duyệt tiếp nhận ${target.fullName}. Thư mời đã được tự động gửi qua email.`,
        type: 'email'
      });
    }
  };

  const verifyDocument = (internId: string, docId: string) => {
    setInterns(prev => prev.map(intern => {
      if (intern.id === internId) {
        return {
          ...intern,
          documents: intern.documents.map(doc => {
            if (doc.id === docId) {
              return {
                ...doc,
                isVerified: true,
                verifiedBy: currentUser.name,
                verifiedAt: new Date().toISOString().substring(0, 10)
              };
            }
            return doc;
          })
        };
      }
      return intern;
    }));
    api.verifyDocument(internId, docId, currentUser.name).catch(e => console.error(e));
    logAction('Xác thực tài liệu', 'Document', `Duyệt tài liệu ${docId} cho thực tập sinh ${internId}`, internId);
  };

  const uploadDocument = (internId: string, doc: Omit<DocumentAttachment, 'id' | 'uploadedAt'>) => {
    const newDoc: DocumentAttachment = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().substring(0, 10)
    };
    setInterns(prev => prev.map(intern => {
      if (intern.id === internId) {
        return {
          ...intern,
          documents: [newDoc, ...intern.documents]
        };
      }
      return intern;
    }));
    api.uploadDocument(internId, newDoc).catch(e => console.error(e));
  };

  const signContract = (internId: string) => {
    const today = new Date().toISOString().substring(0, 10);
    setInterns(prev => prev.map(i => {
      if (i.id === internId) {
        return {
          ...i,
          contractStatus: 'signed',
          contractSignedDate: today
        };
      }
      return i;
    }));
    api.signContract(internId).catch(e => console.error(e));
    logAction('Ký hợp đồng thực tập', 'Contract', `Sinh viên ${internId} đã ký hợp đồng điện tử`, internId);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  // Program & Mentor Actions
  const addProgram = (program: Omit<InternshipProgram, 'id'>) => {
    const newProg: InternshipProgram = {
      ...program,
      id: `prog-${Date.now()}`
    };
    setPrograms(prev => [newProg, ...prev]);
    api.createProgram(newProg).catch(e => console.error(e));
  };

  const updateProgram = (id: string, data: Partial<InternshipProgram>) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const assignMentor = (internId: string, mentorId: string) => {
    setInterns(prev => prev.map(i => i.id === internId ? { ...i, mentorId } : i));
    setMentors(prev => prev.map(m => m.id === mentorId ? { ...m, currentMenteesCount: m.currentMenteesCount + 1 } : m));
    api.assignMentor(internId, mentorId).catch(e => console.error(e));
  };

  const addMentor = (mentor: Omit<Mentor, 'id' | 'currentMenteesCount'>) => {
    const newId = `men-${Date.now()}`;
    const newUserId = `u-${newId}`;
    const newMentor: Mentor = {
      ...mentor,
      id: newId,
      userId: newUserId,
      currentMenteesCount: 0
    };
    setMentors(prev => [newMentor, ...prev]);
    setUsers(prev => [
      {
        id: newUserId,
        name: mentor.fullName,
        email: mentor.email,
        role: 'mentor',
        password: 'Mentor@2026',
        defaultPassword: 'Mentor@2026',
        status: 'active',
        avatar: mentor.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        phone: mentor.phone,
        departmentId: mentor.departmentId
      },
      ...prev
    ]);
    api.createMentor(newMentor).catch(e => console.error(e));
    logAction('Thêm Người hướng dẫn & Tạo tài khoản', 'Mentor', `Tạo hồ sơ & tài khoản cho Mentor ${mentor.fullName} (${mentor.email}) | MK mặc định: Mentor@2026`, newId);
    addNotification({
      title: 'Tài khoản Mentor mới',
      message: `Đã cấp tài khoản Mentor cho ${mentor.fullName} với mật khẩu mặc định Mentor@2026.`,
      type: 'system'
    });
  };

  const updateMentor = (id: string, data: Partial<Mentor>) => {
    setMentors(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const createUser = async (userData: Omit<User, 'id'>) => {
    try {
      const res = await api.createUser(userData);
      if (res?.success && res.data) {
        setUsers(prev => [res.data, ...prev]);
        logAction('Tạo tài khoản người dùng', 'User', `Tạo tài khoản ${userData.email} (${userData.role})`);
        addNotification({
          title: 'Tạo tài khoản thành công',
          message: `Đã tạo tài khoản cho ${userData.name} (${userData.email}). Mật khẩu: ${res.data.defaultPassword}`,
          type: 'system'
        });
        return true;
      }
      return false;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  };

  const resetUserPassword = async (userId: string) => {
    try {
      const res = await api.resetUserPassword(userId);
      if (res?.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, defaultPassword: res.defaultPassword } : u));
        logAction('Đặt lại mật khẩu', 'User', `Đặt lại mật khẩu cho tài khoản ${userId} về mặc định`);
        addNotification({
          title: 'Đặt lại mật khẩu thành công',
          message: `Mật khẩu đã được hoàn nguyên về mặc định: ${res.defaultPassword}`,
          type: 'system'
        });
        return res.defaultPassword;
      }
      throw new Error('Reset password failed');
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  };

  // Task Actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const today = new Date().toISOString().substring(0, 10);
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: today,
      updatedAt: today
    };
    setTasks(prev => [newTask, ...prev]);
    api.createTask(newTask).catch(e => console.error(e));
    logAction('Giao nhiệm vụ mới', 'Task', `Giao "${taskData.title}" cho Intern ${taskData.assignedToInternId}`, newTask.id);
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString().substring(0, 10) } : t));
  };

  const updateTaskStatus = (id: string, status: TaskStatus, progressPercent?: number) => {
    const today = new Date().toISOString().substring(0, 10);
    const newPercent = progressPercent !== undefined 
      ? progressPercent 
      : (status === 'done' ? 100 : status === 'in_progress' ? 50 : status === 'review' ? 90 : 0);

    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, progressPercent: newPercent, updatedAt: today } : t));
    api.updateTaskStatus(id, status, newPercent).catch(e => console.error(e));
    if (status === 'done') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    api.deleteTask(id).catch(e => console.error(e));
  };

  // Weekly Report Actions
  const submitReport = (reportData: Omit<WeeklyReport, 'id' | 'submissionDate' | 'status'>) => {
    const today = new Date().toISOString().substring(0, 10);
    const newReport: WeeklyReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      submissionDate: today,
      status: 'submitted'
    };
    setReports(prev => [newReport, ...prev]);
    api.submitReport(newReport).catch(e => console.error(e));
  };

  const reviewReport = (id: string, score: number, feedback: string) => {
    const today = new Date().toISOString().substring(0, 10);
    setReports(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'reviewed',
      mentorScore: score,
      mentorFeedback: feedback,
      mentorFeedbackDate: today
    } : r));
    api.reviewReport(id, score, feedback).catch(e => console.error(e));
  };

  // Evaluation Actions
  const submitEvaluation = (evalData: Omit<PerformanceEvaluation, 'id' | 'evaluatedAt'>) => {
    const today = new Date().toISOString().substring(0, 10);
    const newEval: PerformanceEvaluation = {
      ...evalData,
      id: `eval-${Date.now()}`,
      evaluatedAt: today,
      isCertificateIssued: evalData.totalScore >= 7.0
    };
    setEvaluations(prev => [newEval, ...prev]);
    api.createEvaluation(newEval).catch(e => console.error(e));
  };

  const issueCertificate = (evaluationId: string) => {
    setEvaluations(prev => prev.map(e => e.id === evaluationId ? { ...e, isCertificateIssued: true } : e));
    api.issueCertificate(evaluationId).catch(e => console.error(e));
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  };

  // Attendance Actions
  const checkIn = (internId: string, method: 'web' | 'qr' = 'web'): boolean => {
    const today = new Date().toISOString().substring(0, 10);
    const existing = attendance.find(a => a.internId === internId && a.date === today);
    if (existing && existing.checkInTime) return false;

    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5);
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      internId,
      date: today,
      checkInTime: timeStr,
      status: isLate ? 'late' : 'on_time',
      workHours: 0,
      checkInMethod: method,
      notes: isLate ? 'Đi muộn sau 08:30' : 'Đúng giờ'
    };

    setAttendance(prev => [newRecord, ...prev.filter(a => !(a.internId === internId && a.date === today))]);
    api.checkIn(internId, method).catch(e => console.error(e));
    return true;
  };

  const checkOut = (internId: string): boolean => {
    const today = new Date().toISOString().substring(0, 10);
    const record = attendance.find(a => a.internId === internId && a.date === today);
    if (!record || !record.checkInTime) return false;

    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5);
    const [inH, inM] = record.checkInTime.split(':').map(Number);
    const hours = Math.max(1, Number(((now.getHours() * 60 + now.getMinutes() - (inH * 60 + inM)) / 60).toFixed(1)));

    setAttendance(prev => prev.map(a => a.id === record.id ? { ...a, checkOutTime: timeStr, workHours: hours } : a));
    api.checkOut(internId).catch(e => console.error(e));
    return true;
  };

  // Leave Actions
  const submitLeave = (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `leave-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setLeaves(prev => [newLeave, ...prev]);
    api.submitLeave(newLeave).catch(e => console.error(e));
  };

  const reviewLeave = (leaveId: string, status: 'approved' | 'rejected', note?: string) => {
    const today = new Date().toISOString().substring(0, 10);
    setLeaves(prev => prev.map(l => l.id === leaveId ? {
      ...l,
      status,
      reviewedBy: currentUser.name,
      reviewDate: today,
      reviewNote: note
    } : l));
    api.reviewLeave(leaveId, status, currentUser.name, note).catch(e => console.error(e));
  };

  // Allowance Actions
  const addAllowance = (allowance: Omit<AllowanceRecord, 'id'>) => {
    const newAlw: AllowanceRecord = {
      ...allowance,
      id: `alw-${Date.now()}`
    };
    setAllowances(prev => [newAlw, ...prev]);
    api.createAllowance(newAlw).catch(e => console.error(e));
  };

  const updateAllowanceStatus = (id: string, status: 'approved' | 'paid') => {
    const today = new Date().toISOString().substring(0, 10);
    setAllowances(prev => prev.map(a => a.id === id ? {
      ...a,
      status,
      paidDate: status === 'paid' ? today : a.paidDate
    } : a));
    api.updateAllowanceStatus(id, status).catch(e => console.error(e));
  };

  // Support Tickets
  const submitTicket = (ticketData: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `tick-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setTickets(prev => [newTicket, ...prev]);
    api.submitTicket(newTicket).catch(e => console.error(e));
  };

  const resolveTicket = (id: string, note: string) => {
    const today = new Date().toISOString().substring(0, 10);
    setTickets(prev => prev.map(t => t.id === id ? {
      ...t,
      status: 'resolved',
      resolvedAt: today,
      resolutionNote: note
    } : t));
    api.resolveTicket(id, note).catch(e => console.error(e));
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    api.markNotificationRead(id).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api.markAllNotificationsRead().catch(() => {});
  };

  // System Emails
  const sendSystemEmail = (emailData: Omit<SystemEmailLog, 'id' | 'sentAt'>) => {
    const sentAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newEmail: SystemEmailLog = {
      ...emailData,
      id: `em-${Date.now()}`,
      sentAt
    };
    setEmails(prev => [newEmail, ...prev]);
    api.sendEmail(newEmail).catch(e => console.error(e));
  };

  // Excel Exports
  const exportInternsToExcel = () => {
    const exportData = interns.map((intern, idx) => {
      const dept = departments.find(d => d.id === intern.departmentId);
      const prog = programs.find(p => p.id === intern.programId);
      const mentor = mentors.find(m => m.id === intern.mentorId);
      return {
        'STT': idx + 1,
        'Họ và Tên': intern.fullName,
        'Email': intern.email,
        'Số điện thoại': intern.phone,
        'Trường Đại học': intern.university,
        'Chuyên ngành': intern.major,
        'GPA': intern.gpa,
        'Năm tốt nghiệp': intern.graduationYear,
        'Phòng ban': dept?.name || 'Chưa gán',
        'Đợt thực tập': prog?.name || 'Chưa gán',
        'Mentor phụ trách': mentor?.fullName || 'Chưa có',
        'Trạng thái': intern.status === 'active' ? 'Đang thực tập' : 
                      intern.status === 'completed' ? 'Đã hoàn thành' : 
                      intern.status === 'applying' ? 'Đang ứng tuyển' : 
                      intern.status === 'interviewing' ? 'Đang phỏng vấn' : 'Khác',
        'Tình trạng Hợp đồng': intern.contractStatus === 'signed' ? 'Đã ký' : 'Chưa ký',
        'Ngày bắt đầu': intern.startDate,
        'Ngày kết thúc': intern.endDate
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachThucTapSinh');
    XLSX.writeFile(workbook, `Bao_Cao_Thuc_Tap_Sinh_IMS_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  const exportAttendanceToExcel = () => {
    const exportData = attendance.map((att, idx) => {
      const intern = interns.find(i => i.id === att.internId);
      return {
        'STT': idx + 1,
        'Họ tên thực tập sinh': intern?.fullName || att.internId,
        'Trường ĐH': intern?.university || '',
        'Ngày': att.date,
        'Giờ Check-in': att.checkInTime || '',
        'Giờ Check-out': att.checkOutTime || '',
        'Số giờ làm việc': att.workHours || 0,
        'Trạng thái': att.status === 'on_time' ? 'Đúng giờ' : att.status === 'late' ? 'Đi muộn' : 'Vắng',
        'Phương thức': att.checkInMethod === 'qr' ? 'Quét QR' : 'Trang Web',
        'Ghi chú': att.notes || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BangChamCong');
    XLSX.writeFile(workbook, `Bang_Cham_Cong_Thuc_Tap_IMS_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  const exportBackupJson = async () => {
    try {
      const res = await api.getBackup();
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonStr);
      downloadAnchor.setAttribute("download", `IMS_Database_Backup_${new Date().toISOString().substring(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      // Local fallback
      const backupObj = {
        backupDate: new Date().toISOString(),
        version: '1.0.0',
        data: { interns, tasks, reports, evaluations, attendance, leaves, allowances, tickets, programs, mentors, notifications, emails, auditLogs }
      };
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonStr);
      downloadAnchor.setAttribute("download", `IMS_Local_Backup_${new Date().toISOString().substring(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.data) {
        const d = parsed.data;
        if (d.interns) setInterns(d.interns);
        if (d.tasks) setTasks(d.tasks);
        if (d.reports) setReports(d.reports);
        if (d.evaluations) setEvaluations(d.evaluations);
        if (d.attendance) setAttendance(d.attendance);
        if (d.leaves) setLeaves(d.leaves);
        if (d.allowances) setAllowances(d.allowances);
        if (d.tickets) setTickets(d.tickets);
        if (d.programs) setPrograms(d.programs);
        if (d.mentors) setMentors(d.mentors);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToDefaultData = () => {
    api.resetDatabase().catch(() => {});
    localStorage.removeItem(STORAGE_KEY);
    setInterns(INITIAL_INTERNS);
    setTasks(INITIAL_TASKS);
    setReports(INITIAL_REPORTS);
    setEvaluations(INITIAL_EVALUATIONS);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaves(INITIAL_LEAVES);
    setAllowances(INITIAL_ALLOWANCES);
    setTickets(INITIAL_TICKETS);
    setPrograms(INITIAL_PROGRAMS);
    setMentors(INITIAL_MENTORS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setEmails(INITIAL_EMAILS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, 
      isAuthenticated,
      login, logout, switchRole,
      departments, programs, mentors, interns, tasks, 
      reports, evaluations, attendance, leaves, allowances, 
      tickets, notifications, emails, auditLogs, users,
      isBackendConnected,
      rolePermissions, hasPermission, updateRolePermissions, resetRolePermissions,
      addIntern, updateIntern, deleteIntern, updateInternStatus, 
      verifyDocument, uploadDocument, signContract,
      addProgram, updateProgram, assignMentor,
      addMentor, updateMentor,
      addTask, updateTask, updateTaskStatus, deleteTask,
      submitReport, reviewReport,
      submitEvaluation, issueCertificate,
      checkIn, checkOut,
      submitLeave, reviewLeave,
      addAllowance, updateAllowanceStatus,
      submitTicket, resolveTicket,
      markNotificationAsRead, markAllNotificationsAsRead, addNotification,
      sendSystemEmail, logAction,
      exportInternsToExcel, exportAttendanceToExcel, exportBackupJson, importBackupJson,
      resetToDefaultData, createUser, resetUserPassword
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
