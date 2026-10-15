import { Router } from 'express';
import { db, seedDatabase } from '../db';
import nodemailer from 'nodemailer';
import { authorize } from '../middleware/auth';

// Nodemailer transporter using Gmail SMTP (credentials to be set in .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || '', // Gmail address
    pass: process.env.SMTP_PASS || ''   // App password or OAuth token
  }
});

export const systemRouter = Router();

// Departments
systemRouter.get('/departments', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM departments').all() as any[];
    const depts = rows.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      managerName: r.manager_name,
      description: r.description
    }));
    res.json({ success: true, data: depts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Authentication: Real Account Login
systemRouter.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ Email và Mật khẩu!' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail) as any;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu không chính xác!' });
    }

    if (user.status === 'inactive' || user.status === 'locked') {
      return res.status(403).json({ success: false, error: 'Tài khoản đã bị tạm khóa, vui lòng liên hệ Admin!' });
    }

    // Compare password (supports current password or default_password)
    // Determine the valid password: use explicit password if set and not the generic placeholder, otherwise fallback to role default
    const genericPlaceholder = 'IMS@2026';
    const roleDefault = user.role === 'admin' ? 'Admin@2026' : user.role === 'hr' ? 'HR@2026' : user.role === 'mentor' ? 'Mentor@2026' : 'Intern@2026';
    const validPassword = user.password && user.password !== genericPlaceholder ? user.password : (user.default_password || roleDefault);

    if (password !== validPassword) {
      return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu không chính xác!' });
    }

    // Success response with user profile
    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        departmentId: user.department_id,
        internProfileId: user.intern_profile_id,
        status: user.status || 'active'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Users (Protected by admin:users)
systemRouter.get('/users', authorize('admin:users'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM users ORDER BY role, name').all() as any[];
    const users = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      defaultPassword: r.default_password || (r.role === 'admin' ? 'Admin@2026' : r.role === 'hr' ? 'HR@2026' : r.role === 'mentor' ? 'Mentor@2026' : 'Intern@2026'),
      status: r.status || 'active',
      avatar: r.avatar,
      phone: r.phone,
      departmentId: r.department_id,
      internProfileId: r.intern_profile_id
    }));
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Create User manually
systemRouter.post('/users', authorize('admin:users'), (req, res) => {
  try {
    const data = req.body;
    const newId = `u-${data.role}-${Date.now()}`;
    const defaultPassword = data.role === 'admin' ? 'Admin@2026' : data.role === 'hr' ? 'HR@2026' : data.role === 'mentor' ? 'Mentor@2026' : 'Intern@2026';
    
    db.prepare(`
      INSERT INTO users (id, name, email, role, password, default_password, status, avatar, phone, department_id)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `).run(
      newId,
      data.name,
      data.email,
      data.role,
      defaultPassword,
      defaultPassword,
      data.avatar || 'https://images.unsplash.com/photo-1535713875002?w=150',
      data.phone || null,
      data.departmentId || null
    );

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người dùng thành công!',
      data: {
        id: newId,
        name: data.name,
        email: data.email,
        role: data.role,
        defaultPassword,
        status: 'active'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Reset Password
systemRouter.post('/users/:id/reset-password', authorize('admin:users'), (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const defaultPassword = user.role === 'admin' ? 'Admin@2026' : user.role === 'hr' ? 'HR@2026' : user.role === 'mentor' ? 'Mentor@2026' : 'Intern@2026';
    db.prepare('UPDATE users SET password = ?, default_password = ? WHERE id = ?').run(defaultPassword, defaultPassword, user.id);

    res.json({
      success: true,
      message: `Đã đặt lại mật khẩu cho tài khoản ${user.email} về mật khẩu mặc định: ${defaultPassword}`,
      defaultPassword
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notifications
systemRouter.get('/notifications', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC').all() as any[];
    const notifs = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      role: r.role,
      title: r.title,
      message: r.message,
      timestamp: r.timestamp,
      read: Boolean(r.read),
      type: r.type,
      linkAction: r.link_action
    }));
    res.json({ success: true, data: notifs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

systemRouter.patch('/notifications/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

systemRouter.patch('/notifications/read-all', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1').run();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Emails
systemRouter.get('/emails', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM system_emails ORDER BY sent_at DESC').all() as any[];
    const emails = rows.map(r => ({
      id: r.id,
      toEmail: r.to_email,
      recipientName: r.recipient_name,
      subject: r.subject,
      content: r.content,
      sentAt: r.sent_at,
      type: r.type
    }));
    res.json({ success: true, data: emails });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

systemRouter.post('/emails', async (req, res) => {
  try {
    try {
      const data = req.body;
      // Send email using nodemailer
      const mailOptions = {
        from: process.env.SMTP_USER || '',
        to: data.toEmail,
        subject: data.subject,
        text: data.content,
        // You can also use html if you prefer
        // html: data.content
      };
      // Await sendMail (wrap in Promise)
      await transporter.sendMail(mailOptions);

      const newId = `em-${Date.now()}`;
      const sentAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

      db.prepare(`
        INSERT INTO system_emails (id, to_email, recipient_name, subject, content, sent_at, type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(newId, data.toEmail, data.recipientName, data.subject, data.content, sentAt, data.type);

      res.status(201).json({ success: true, data: { ...data, id: newId, sentAt } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Audit Logs (Protected by admin:audit)
systemRouter.get('/audit-logs', authorize('admin:audit'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all() as any[];
    const logs = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userRole: r.user_role,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      details: r.details,
      timestamp: r.timestamp,
      ipAddress: r.ip_address
    }));
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

systemRouter.post('/audit-logs', (req, res) => {
  try {
    const data = req.body;
    const newId = `log-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity_type, entity_id, details, timestamp, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.userId || 'system',
      data.userName || 'Anonymous',
      data.userRole || 'admin',
      data.action,
      data.entityType,
      data.entityId || null,
      data.details || '',
      timestamp,
      req.ip || '127.0.0.1'
    );

    res.status(201).json({ success: true, id: newId, timestamp });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Backup (Protected by admin:backup)
systemRouter.get('/backup', authorize('admin:backup'), (req, res) => {
  try {
    const tables = [
      'users', 'departments', 'programs', 'mentors', 'interns',
      'tasks', 'weekly_reports', 'evaluations', 'attendance',
      'leave_requests', 'allowances', 'support_tickets', 'notifications',
      'audit_logs', 'system_emails', 'role_permissions'
    ];

    const backupData: Record<string, any[]> = {};
    for (const t of tables) {
      backupData[t] = db.prepare(`SELECT * FROM ${t}`).all();
    }

    res.json({
      success: true,
      backupDate: new Date().toISOString(),
      version: '2.6.0',
      data: backupData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset (Protected by admin:backup)
systemRouter.post('/reset', authorize('admin:backup'), (req, res) => {
  try {
    const tables = [
      'users', 'departments', 'programs', 'mentors', 'interns',
      'tasks', 'weekly_reports', 'evaluations', 'attendance',
      'leave_requests', 'allowances', 'support_tickets', 'notifications',
      'audit_logs', 'system_emails'
    ];
    for (const t of tables) {
      db.prepare(`DELETE FROM ${t}`).run();
    }
    seedDatabase();
    res.json({ success: true, message: 'Database reset to initial seed data' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
