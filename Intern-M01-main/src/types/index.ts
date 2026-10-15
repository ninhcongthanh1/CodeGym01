export type UserRole = 'admin' | 'hr' | 'mentor' | 'intern' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  departmentId?: string;
  internProfileId?: string;
  password?: string;
  defaultPassword?: string;
  status?: 'active' | 'locked';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerName: string;
  description: string;
}

export type InternStatus = 
  | 'applying'      // Đang ứng tuyển
  | 'interviewing'  // Phỏng vấn
  | 'accepted'       // Đã trúng tuyển, chờ onboard
  | 'active'        // Đang thực tập
  | 'completed'     // Đã hoàn thành
  | 'hired'         // Được tuyển chính thức
  | 'terminated';   // Thôi thực tập

export interface DocumentAttachment {
  id: string;
  name: string;
  type: 'cv' | 'intern_application' | 'contract' | 'report' | 'certificate' | 'other';
  url: string;
  uploadedAt: string;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  fileSize?: string;
}

export interface InternProfile {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  university: string;
  major: string;
  gpa: number;
  graduationYear: number;
  studentId: string;
  avatar: string;
  status: InternStatus;
  departmentId: string;
  programId: string;
  mentorId?: string;
  startDate: string;
  endDate: string;
  contractStatus: 'not_sent' | 'sent' | 'signed' | 'expired';
  contractSignedDate?: string;
  documents: DocumentAttachment[];
  notes?: string;
  createdAt: string;
}

export interface InternshipProgram {
  id: string;
  name: string;
  batchCode: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  targetCount: number;
  currentCount: number;
  status: 'planning' | 'ongoing' | 'finished';
  description: string;
  milestones: {
    id: string;
    title: string;
    date: string;
    completed: boolean;
  }[];
}

export interface Mentor {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  jobTitle: string;
  maxMentees: number;
  currentMenteesCount: number;
  skills: string[];
  avatar: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToInternId: string;
  createdById: string; // Mentor or HR
  departmentId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  startDate?: string;
  progressPercent: number;
  attachments?: string[];
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReport {
  id: string;
  internId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  achievements: string;
  challenges: string;
  nextWeekPlan: string;
  learningExperience?: string;
  submissionDate: string;
  status: 'submitted' | 'reviewed';
  mentorScore?: number; // thang 10
  mentorFeedback?: string;
  mentorFeedbackDate?: string;
}

export interface PerformanceEvaluation {
  id: string;
  internId: string;
  evaluatorId: string;
  type: 'mid_term' | 'final';
  technicalScore: number; // 1-5
  attitudeScore: number;  // 1-5
  disciplineScore: number; // 1-5
  teamworkScore: number;  // 1-5
  totalScore: number;     // 10 or 100
  overallGrade: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Không đạt';
  generalFeedback: string;
  strengths: string;
  areasForImprovement: string;
  recommendation: 'hire_fulltime' | 'hire_fresher' | 'extend_internship' | 'end_program';
  evaluatedAt: string;
  isCertificateIssued?: boolean;
}

export interface AttendanceRecord {
  id: string;
  internId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'on_time' | 'late' | 'early_leave' | 'absent' | 'leave_approved';
  workHours: number;
  notes?: string;
  checkInMethod?: 'web' | 'qr' | 'manual';
}

export interface LeaveRequest {
  id: string;
  internId: string;
  startDate: string;
  endDate: string;
  type: 'sick' | 'personal' | 'exam' | 'other';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface AllowanceRecord {
  id: string;
  internId: string;
  month: string; // YYYY-MM
  standardWorkDays: number;
  actualWorkDays: number;
  baseAllowance: number; // VND
  mealAllowance: number; // VND
  bonusAllowance: number; // VND
  deductions: number; // VND
  totalAmount: number; // VND
  status: 'draft' | 'approved' | 'paid';
  paidDate?: string;
  note?: string;
}

export interface SupportTicket {
  id: string;
  internId: string;
  title: string;
  category: 'certificate' | 'equipment' | 'stamp_request' | 'parking_card' | 'hr_inquiry' | 'other';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // target user or 'all'
  role?: UserRole;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'task' | 'report' | 'evaluation' | 'leave' | 'contract' | 'system' | 'email';
  linkAction?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemEmailLog {
  id: string;
  toEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  sentAt: string;
  type: 'interview_invitation' | 'offer_letter' | 'rejection' | 'meeting' | 'contract_ready' | 'task_assigned';
}
