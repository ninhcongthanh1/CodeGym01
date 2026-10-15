import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { 
  INITIAL_USERS, INITIAL_DEPARTMENTS, INITIAL_PROGRAMS, INITIAL_MENTORS, 
  INITIAL_INTERNS, INITIAL_TASKS, INITIAL_REPORTS, INITIAL_EVALUATIONS, 
  INITIAL_ATTENDANCE, INITIAL_LEAVES, INITIAL_ALLOWANCES, INITIAL_TICKETS, 
  INITIAL_NOTIFICATIONS, INITIAL_EMAILS, INITIAL_AUDIT_LOGS 
} from '../src/data/mockData';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/types/permissions';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ims.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // 1. Departments
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      manager_name TEXT NOT NULL,
      description TEXT
    );
  `);

  // 2. Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      password TEXT DEFAULT 'IMS@2026',
      default_password TEXT DEFAULT 'IMS@2026',
      status TEXT DEFAULT 'active',
      avatar TEXT,
      phone TEXT,
      department_id TEXT,
      intern_profile_id TEXT
    );
  `);

  // Migrate users columns if table was created previously without them
  try {
    const userCols = db.prepare('PRAGMA table_info(users)').all() as any[];
    const colNames = userCols.map(c => c.name);
    if (!colNames.includes('password')) {
      db.exec("ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'IMS@2026'");
    }
    if (!colNames.includes('default_password')) {
      db.exec("ALTER TABLE users ADD COLUMN default_password TEXT DEFAULT 'IMS@2026'");
    }
    if (!colNames.includes('status')) {
      db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'");
    }
  } catch (err) {
    console.error('User columns migration notice:', err);
  }

  // 3. Internship Programs
  db.exec(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      batch_code TEXT NOT NULL,
      department_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      target_count INTEGER NOT NULL,
      current_count INTEGER NOT NULL,
      status TEXT NOT NULL,
      description TEXT,
      milestones TEXT
    );
  `);

  // 4. Mentors
  db.exec(`
    CREATE TABLE IF NOT EXISTS mentors (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      department_id TEXT NOT NULL,
      job_title TEXT NOT NULL,
      max_mentees INTEGER NOT NULL,
      current_mentees_count INTEGER NOT NULL,
      skills TEXT,
      avatar TEXT
    );
  `);

  // 5. Intern Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS interns (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT,
      university TEXT NOT NULL,
      major TEXT NOT NULL,
      gpa REAL NOT NULL,
      graduation_year INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      avatar TEXT,
      status TEXT NOT NULL,
      department_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      mentor_id TEXT,
      start_date TEXT,
      end_date TEXT,
      contract_status TEXT NOT NULL,
      contract_signed_date TEXT,
      documents TEXT,
      notes TEXT,
      created_at TEXT
    );
  `);

  // 6. Tasks
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to_intern_id TEXT NOT NULL,
      created_by_id TEXT,
      department_id TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      due_date TEXT NOT NULL,
      start_date TEXT,
      progress_percent INTEGER NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // 7. Weekly Reports
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_reports (
      id TEXT PRIMARY KEY,
      intern_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      achievements TEXT NOT NULL,
      challenges TEXT,
      next_week_plan TEXT NOT NULL,
      learning_experience TEXT,
      submission_date TEXT NOT NULL,
      status TEXT NOT NULL,
      mentor_score REAL,
      mentor_feedback TEXT,
      mentor_feedback_date TEXT
    );
  `);

  // 8. Performance Evaluations
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      intern_id TEXT NOT NULL,
      evaluator_id TEXT NOT NULL,
      type TEXT NOT NULL,
      technical_score REAL NOT NULL,
      attitude_score REAL NOT NULL,
      discipline_score REAL NOT NULL,
      teamwork_score REAL NOT NULL,
      total_score REAL NOT NULL,
      overall_grade TEXT NOT NULL,
      general_feedback TEXT NOT NULL,
      strengths TEXT,
      areas_for_improvement TEXT,
      recommendation TEXT NOT NULL,
      evaluated_at TEXT NOT NULL,
      is_certificate_issued INTEGER DEFAULT 0
    );
  `);

  // 9. Attendance
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      intern_id TEXT NOT NULL,
      date TEXT NOT NULL,
      check_in_time TEXT,
      check_out_time TEXT,
      status TEXT NOT NULL,
      work_hours REAL NOT NULL,
      notes TEXT,
      check_in_method TEXT
    );
  `);

  // 10. Leave Requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      intern_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      type TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      reviewed_by TEXT,
      review_date TEXT,
      review_note TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 11. Allowances
  db.exec(`
    CREATE TABLE IF NOT EXISTS allowances (
      id TEXT PRIMARY KEY,
      intern_id TEXT NOT NULL,
      month TEXT NOT NULL,
      standard_work_days INTEGER NOT NULL,
      actual_work_days INTEGER NOT NULL,
      base_allowance INTEGER NOT NULL,
      meal_allowance INTEGER NOT NULL,
      bonus_allowance INTEGER NOT NULL,
      deductions INTEGER NOT NULL,
      total_amount INTEGER NOT NULL,
      status TEXT NOT NULL,
      paid_date TEXT,
      note TEXT
    );
  `);

  // 12. Support Tickets
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      intern_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      resolution_note TEXT
    );
  `);

  // 13. Notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      role TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      type TEXT NOT NULL,
      link_action TEXT
    );
  `);

  // 14. Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      timestamp TEXT NOT NULL,
      ip_address TEXT
    );
  `);

  // 15. System Emails
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_emails (
      id TEXT PRIMARY KEY,
      to_email TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      type TEXT NOT NULL
    );
  `);

  // 16. Dynamic Role Permissions (RBAC)
  db.exec(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      PRIMARY KEY (role, permission)
    );
  `);

  // Check if role permissions need seeding
  const permCount = db.prepare('SELECT count(*) as count FROM role_permissions').get() as { count: number };
  if (permCount.count === 0) {
    seedRolePermissions();
  }

  // Check if seeding is needed
  const rowCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (rowCount.count === 0) {
    seedDatabase();
  }

  // Ensure default passwords and sync user accounts for all mentors and interns
  ensureDefaultPasswordsAndSync();
}

export function ensureDefaultPasswordsAndSync() {
  try {
    // 1. Update default passwords for standard roles
    db.prepare("UPDATE users SET password = 'Admin@2026', default_password = 'Admin@2026' WHERE role = 'admin'").run();
    db.prepare("UPDATE users SET password = 'HR@2026', default_password = 'HR@2026' WHERE role = 'hr'").run();
    db.prepare("UPDATE users SET password = 'Mentor@2026', default_password = 'Mentor@2026' WHERE role = 'mentor' AND (default_password IS NULL OR default_password = 'IMS@2026')").run();
    db.prepare("UPDATE users SET password = 'Intern@2026', default_password = 'Intern@2026' WHERE role = 'intern' AND (default_password IS NULL OR default_password = 'IMS@2026')").run();

    // 2. Ensure all mentors have user accounts in SQLite
    const mentors = db.prepare('SELECT * FROM mentors').all() as any[];
    const insertMentorUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, role, password, default_password, status, avatar, phone, department_id)
      VALUES (?, ?, ?, 'mentor', 'Mentor@2026', 'Mentor@2026', 'active', ?, ?, ?)
    `);
    for (const m of mentors) {
      insertMentorUser.run(m.user_id || `u-${m.id}`, m.full_name, m.email, m.avatar, m.phone, m.department_id);
    }

    // 3. Ensure all interns have user accounts in SQLite
    const interns = db.prepare('SELECT * FROM interns').all() as any[];
    const insertInternUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, role, password, default_password, status, avatar, phone, department_id, intern_profile_id)
      VALUES (?, ?, ?, 'intern', 'Intern@2026', 'Intern@2026', 'active', ?, ?, ?, ?)
    `);
    for (const i of interns) {
      insertInternUser.run(i.user_id || `u-${i.id}`, i.full_name, i.email, i.avatar, i.phone, i.department_id, i.id);
    }
    console.log('👤 All user accounts and default passwords verified and synced into SQLite!');
  } catch (e) {
    console.error('User sync notice:', e);
  }
}

export function seedRolePermissions() {
  const insertPerm = db.prepare('INSERT OR IGNORE INTO role_permissions (role, permission) VALUES (?, ?)');
  for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS as Record<string, string[]>)) {
    for (const p of perms) {
      insertPerm.run(role, p);
    }
  }
  console.log('🛡️ Dynamic RBAC Permissions seeded successfully into SQLite!');
}

export function seedDatabase() {
  console.log('🌱 Seeding IMS Database with initial data...');

  // Departments
  const insertDept = db.prepare(`
    INSERT INTO departments (id, name, code, manager_name, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  INITIAL_DEPARTMENTS.forEach(d => {
    insertDept.run(d.id, d.name, d.code, d.managerName, d.description);
  });

  // Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, role, avatar, phone, department_id, intern_profile_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_USERS.forEach(u => {
    insertUser.run(u.id, u.name, u.email, u.role, u.avatar, u.phone || null, u.departmentId || null, u.internProfileId || null);
  });

  // Programs
  const insertProgram = db.prepare(`
    INSERT INTO programs (id, name, batch_code, department_id, start_date, end_date, target_count, current_count, status, description, milestones)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_PROGRAMS.forEach(p => {
    insertProgram.run(p.id, p.name, p.batchCode, p.departmentId, p.startDate, p.endDate, p.targetCount, p.currentCount, p.status, p.description, JSON.stringify(p.milestones));
  });

  // Mentors
  const insertMentor = db.prepare(`
    INSERT INTO mentors (id, user_id, full_name, email, phone, department_id, job_title, max_mentees, current_mentees_count, skills, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_MENTORS.forEach(m => {
    insertMentor.run(m.id, m.userId, m.fullName, m.email, m.phone, m.departmentId, m.jobTitle, m.maxMentees, m.currentMenteesCount, JSON.stringify(m.skills), m.avatar);
  });

  // Interns
  const insertIntern = db.prepare(`
    INSERT INTO interns (id, user_id, full_name, email, phone, date_of_birth, gender, university, major, gpa, graduation_year, student_id, avatar, status, department_id, program_id, mentor_id, start_date, end_date, contract_status, contract_signed_date, documents, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_INTERNS.forEach(i => {
    insertIntern.run(
      i.id, i.userId || null, i.fullName, i.email, i.phone, i.dateOfBirth, i.gender, 
      i.university, i.major, i.gpa, i.graduationYear, i.studentId, i.avatar, 
      i.status, i.departmentId, i.programId, i.mentorId || null, i.startDate, i.endDate, 
      i.contractStatus, i.contractSignedDate || null, JSON.stringify(i.documents), i.notes || null, i.createdAt
    );
  });

  // Tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, assigned_to_intern_id, created_by_id, department_id, status, priority, due_date, start_date, progress_percent, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_TASKS.forEach(t => {
    insertTask.run(t.id, t.title, t.description, t.assignedToInternId, t.createdById, t.departmentId, t.status, t.priority, t.dueDate, t.startDate || null, t.progressPercent, t.createdAt, t.updatedAt);
  });

  // Reports
  const insertReport = db.prepare(`
    INSERT INTO weekly_reports (id, intern_id, week_number, start_date, end_date, achievements, challenges, next_week_plan, learning_experience, submission_date, status, mentor_score, mentor_feedback, mentor_feedback_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_REPORTS.forEach(r => {
    insertReport.run(r.id, r.internId, r.weekNumber, r.startDate, r.endDate, r.achievements, r.challenges || null, r.nextWeekPlan, r.learningExperience || null, r.submissionDate, r.status, r.mentorScore || null, r.mentorFeedback || null, r.mentorFeedbackDate || null);
  });

  // Evaluations
  const insertEval = db.prepare(`
    INSERT INTO evaluations (id, intern_id, evaluator_id, type, technical_score, attitude_score, discipline_score, teamwork_score, total_score, overall_grade, general_feedback, strengths, areas_for_improvement, recommendation, evaluated_at, is_certificate_issued)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_EVALUATIONS.forEach(e => {
    insertEval.run(e.id, e.internId, e.evaluatorId, e.type, e.technicalScore, e.attitudeScore, e.disciplineScore, e.teamworkScore, e.totalScore, e.overallGrade, e.generalFeedback, e.strengths || null, e.areasForImprovement || null, e.recommendation, e.evaluatedAt, e.isCertificateIssued ? 1 : 0);
  });

  // Attendance
  const insertAtt = db.prepare(`
    INSERT INTO attendance (id, intern_id, date, check_in_time, check_out_time, status, work_hours, notes, check_in_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_ATTENDANCE.forEach(a => {
    insertAtt.run(a.id, a.internId, a.date, a.checkInTime || null, a.checkOutTime || null, a.status, a.workHours, a.notes || null, a.checkInMethod || null);
  });

  // Leave Requests
  const insertLeave = db.prepare(`
    INSERT INTO leave_requests (id, intern_id, start_date, end_date, type, reason, status, reviewed_by, review_date, review_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_LEAVES.forEach(l => {
    insertLeave.run(l.id, l.internId, l.startDate, l.endDate, l.type, l.reason, l.status, l.reviewedBy || null, l.reviewDate || null, l.reviewNote || null, l.createdAt);
  });

  // Allowances
  const insertAlw = db.prepare(`
    INSERT INTO allowances (id, intern_id, month, standard_work_days, actual_work_days, base_allowance, meal_allowance, bonus_allowance, deductions, total_amount, status, paid_date, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_ALLOWANCES.forEach(a => {
    insertAlw.run(a.id, a.internId, a.month, a.standardWorkDays, a.actualWorkDays, a.baseAllowance, a.mealAllowance, a.bonusAllowance, a.deductions, a.totalAmount, a.status, a.paidDate || null, a.note || null);
  });

  // Support Tickets
  const insertTicket = db.prepare(`
    INSERT INTO support_tickets (id, intern_id, title, category, description, status, priority, created_at, resolved_at, resolution_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_TICKETS.forEach(t => {
    insertTicket.run(t.id, t.internId, t.title, t.category, t.description, t.status, t.priority, t.createdAt, t.resolvedAt || null, t.resolutionNote || null);
  });

  // Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, role, title, message, timestamp, read, type, link_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_NOTIFICATIONS.forEach(n => {
    insertNotif.run(n.id, n.userId || null, n.role || null, n.title, n.message, n.timestamp, n.read ? 1 : 0, n.type, n.linkAction || null);
  });

  // System Emails
  const insertEmail = db.prepare(`
    INSERT INTO system_emails (id, to_email, recipient_name, subject, content, sent_at, type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_EMAILS.forEach(em => {
    insertEmail.run(em.id, em.toEmail, em.recipientName, em.subject, em.content, em.sentAt, em.type);
  });

  // Audit Logs
  const insertLog = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity_type, entity_id, details, timestamp, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_AUDIT_LOGS.forEach(l => {
    insertLog.run(l.id, l.userId, l.userName, l.userRole, l.action, l.entityType, l.entityId || null, l.details, l.timestamp, l.ipAddress || null);
  });

  console.log('✅ IMS Database seeded successfully!');
}
