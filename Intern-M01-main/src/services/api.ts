// API Client Service for connecting Frontend to Express Backend
import { UserRole } from '../types';

const API_BASE = '/api';

let currentAuth = {
  role: 'hr' as UserRole,
  name: 'Trần Thu Hà',
};

export function setApiAuth(role: UserRole, name: string) {
  currentAuth = { role, name };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  // Khởi tạo headers an toàn
  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');
  headers.set('X-User-Role', currentAuth.role);

  // Mã hóa tiếng Việt để tránh lỗi ký tự Unicode trong HTTP header
  headers.set('X-User-Name', encodeURIComponent(currentAuth.name));

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    const message =
      errorData.error ||
      errorData.message ||
      `Lỗi HTTP ${response.status}: Yêu cầu không thể thực hiện`;

    throw new Error(message);
  }

  // Một số API có thể trả về nội dung rỗng
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  // Auth header setter
  setAuth: setApiAuth,

  // Health
  checkHealth: () =>
    request<{ status: string; message: string }>('/health'),

  // Role Permissions (RBAC Dynamic Management)
  getRolePermissions: () =>
    request<{
      success: boolean;
      data: Record<UserRole, string[]>;
      modules: any[];
      allPermissions: string[];
    }>('/system/permissions'),

  updateRolePermissions: (role: UserRole, permissions: string[]) =>
    request<{
      success: boolean;
      message: string;
      role: string;
      permissions: string[];
    }>('/system/permissions', {
      method: 'PUT',
      body: JSON.stringify({ role, permissions }),
    }),

  resetRolePermissions: () =>
    request<{
      success: boolean;
      message: string;
      data: Record<UserRole, string[]>;
    }>('/system/permissions/reset', {
      method: 'POST',
    }),

  // Interns
  getInterns: (params?: Record<string, string>) => {
    const qs = params
      ? '?' + new URLSearchParams(params).toString()
      : '';

    return request<{ success: boolean; data: any[] }>(
      `/interns${qs}`,
    );
  },

  createIntern: (data: any) =>
    request<{ success: boolean; data: any }>('/interns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateIntern: (id: string, data: any) =>
    request<{ success: boolean }>(`/interns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteIntern: (id: string) =>
    request<{ success: boolean }>(`/interns/${id}`, {
      method: 'DELETE',
    }),

  updateInternStatus: (id: string, status: string) =>
    request<{ success: boolean }>(`/interns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  signContract: (id: string) =>
    request<{ success: boolean; signedDate: string }>(
      `/interns/${id}/contract/sign`,
      { method: 'PATCH' },
    ),

  uploadDocument: (id: string, doc: any) =>
    request<{ success: boolean; data: any }>(
      `/interns/${id}/documents`,
      {
        method: 'POST',
        body: JSON.stringify(doc),
      },
    ),

  verifyDocument: (
    id: string,
    docId: string,
    verifiedBy?: string,
  ) =>
    request<{ success: boolean }>(
      `/interns/${id}/documents/${docId}/verify`,
      {
        method: 'PATCH',
        body: JSON.stringify({ verifiedBy }),
      },
    ),

  // Tasks
  getTasks: (params?: Record<string, string>) => {
    const qs = params
      ? '?' + new URLSearchParams(params).toString()
      : '';

    return request<{ success: boolean; data: any[] }>(
      `/tasks${qs}`,
    );
  },

  createTask: (data: any) =>
    request<{ success: boolean; data: any }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTaskStatus: (
    id: string,
    status: string,
    progressPercent?: number,
  ) =>
    request<{ success: boolean }>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, progressPercent }),
    }),

  deleteTask: (id: string) =>
    request<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Reports
  getReports: (internId?: string) => {
    const qs = internId
      ? `?internId=${encodeURIComponent(internId)}`
      : '';

    return request<{ success: boolean; data: any[] }>(
      `/reports${qs}`,
    );
  },

  submitReport: (data: any) =>
    request<{ success: boolean; data: any }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reviewReport: (id: string, score: number, feedback: string) =>
    request<{ success: boolean }>(`/reports/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ score, feedback }),
    }),

  // Evaluations
  getEvaluations: () =>
    request<{ success: boolean; data: any[] }>('/evaluations'),

  createEvaluation: (data: any) =>
    request<{ success: boolean; data: any }>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  issueCertificate: (id: string) =>
    request<{ success: boolean }>(
      `/evaluations/${id}/certificate`,
      { method: 'PATCH' },
    ),

  // Attendance
  getAttendance: () =>
    request<{ success: boolean; data: any[] }>('/attendance'),

  checkIn: (
    internId: string,
    method?: 'web' | 'qr',
  ) =>
    request<{
      success: boolean;
      time: string;
      status: string;
    }>('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ internId, method }),
    }),

  checkOut: (internId: string) =>
    request<{
      success: boolean;
      time: string;
      workHours: number;
    }>('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ internId }),
    }),

  // Leaves
  getLeaves: () =>
    request<{ success: boolean; data: any[] }>('/leaves'),

  submitLeave: (data: any) =>
    request<{ success: boolean; data: any }>('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reviewLeave: (
    id: string,
    status: string,
    reviewedBy?: string,
    note?: string,
  ) =>
    request<{ success: boolean }>(`/leaves/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewedBy, note }),
    }),

  // Allowances
  getAllowances: () =>
    request<{ success: boolean; data: any[] }>('/allowances'),

  createAllowance: (data: any) =>
    request<{ success: boolean; data: any }>('/allowances', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAllowanceStatus: (id: string, status: string) =>
    request<{ success: boolean }>(`/allowances/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Tickets
  getTickets: () =>
    request<{ success: boolean; data: any[] }>('/tickets'),

  submitTicket: (data: any) =>
    request<{ success: boolean; data: any }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resolveTicket: (id: string, note: string) =>
    request<{ success: boolean }>(`/tickets/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    }),

  // Programs & Mentors
  getPrograms: () =>
    request<{ success: boolean; data: any[] }>('/programs'),

  createProgram: (data: any) =>
    request<{ success: boolean; data: any }>('/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  assignMentor: (internId: string, mentorId: string) =>
    request<{ success: boolean }>('/programs/assign-mentor', {
      method: 'PATCH',
      body: JSON.stringify({ internId, mentorId }),
    }),

  getMentors: () =>
    request<{ success: boolean; data: any[] }>('/mentors'),

  createMentor: (data: any) =>
    request<{ success: boolean; data: any }>('/mentors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Authentication & System
  login: (credentials: {
    email: string;
    password: string;
  }) =>
    request<{
      success: boolean;
      message: string;
      data: any;
    }>('/system/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getDepartments: () =>
    request<{ success: boolean; data: any[] }>(
      '/system/departments',
    ),

  getUsers: () =>
    request<{ success: boolean; data: any[] }>('/system/users'),

  createUser: (data: any) =>
    request<{
      success: boolean;
      message: string;
      data: any;
    }>('/system/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetUserPassword: (userId: string) =>
    request<{
      success: boolean;
      message: string;
      defaultPassword: string;
    }>(`/system/users/${userId}/reset-password`, {
      method: 'POST',
    }),

  getNotifications: () =>
    request<{ success: boolean; data: any[] }>(
      '/system/notifications',
    ),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(
      `/system/notifications/${id}/read`,
      { method: 'PATCH' },
    ),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>(
      '/system/notifications/read-all',
      { method: 'PATCH' },
    ),

  getEmails: () =>
    request<{ success: boolean; data: any[] }>(
      '/system/emails',
    ),

  sendEmail: (data: any) =>
    request<{ success: boolean; data: any }>(
      '/system/emails',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    ),

  getAuditLogs: () =>
    request<{ success: boolean; data: any[] }>(
      '/system/audit-logs',
    ),

  logAction: (data: any) =>
    request<{ success: boolean }>('/system/audit-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBackup: () => request<any>('/system/backup'),

  resetDatabase: () =>
    request<{
      success: boolean;
      message: string;
    }>('/system/reset', {
      method: 'POST',
    }),
};