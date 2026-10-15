import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const mentorsRouter = Router();

mentorsRouter.get('/', authorize('mentors:view'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM mentors').all() as any[];
    const mentors = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      departmentId: r.department_id,
      jobTitle: r.job_title,
      maxMentees: r.max_mentees,
      currentMenteesCount: r.current_mentees_count,
      skills: JSON.parse(r.skills || '[]'),
      avatar: r.avatar
    }));
    res.json({ success: true, data: mentors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

mentorsRouter.post('/', authorize('mentors:manage'), (req, res) => {
  try {
    const data = req.body;
    const newId = `men-${Date.now()}`;
    const userId = data.userId || `u-men-${Date.now()}`;

    db.prepare(`
      INSERT INTO mentors (
        id, user_id, full_name, email, phone, department_id,
        job_title, max_mentees, current_mentees_count, skills, avatar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      newId,
      userId,
      data.fullName,
      data.email,
      data.phone,
      data.departmentId,
      data.jobTitle,
      data.maxMentees || 4,
      JSON.stringify(data.skills || []),
      data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    );

    // Auto-create User account in SQLite for Mentor
    try {
      db.prepare(`
        INSERT OR REPLACE INTO users (
          id, name, email, role, password, default_password, status, avatar, phone, department_id
        ) VALUES (?, ?, ?, 'mentor', 'Mentor@2026', 'Mentor@2026', 'active', ?, ?, ?)
      `).run(
        userId,
        data.fullName,
        data.email,
        data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        data.phone || '',
        data.departmentId
      );

      // Auto-generate notification email
      db.prepare(`
        INSERT INTO system_emails (id, to_email, recipient_name, subject, content, sent_at, type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `em-${Date.now()}`,
        data.email,
        data.fullName,
        '[IMS TechCorp] Cấp tài khoản Người hướng dẫn (Mentor) hệ thống IMS',
        `Kính gửi Anh/Chị ${data.fullName},\n\nPhòng Nhân sự đã tạo tài khoản Người hướng dẫn (Mentor) cho Anh/Chị trên Hệ thống IMS:\n- Địa chỉ hệ thống: http://localhost:3000\n- Tên đăng nhập (Email): ${data.email}\n- Mật khẩu mặc định: Mentor@2026\n- Vai trò: Người hướng dẫn (Mentor)\n\nAnh/Chị có thể đăng nhập để giao việc, duyệt báo cáo tuần và đánh giá năng lực cho các thực tập sinh.`,
        new Date().toISOString().replace('T', ' ').substring(0, 19),
        'system'
      );
    } catch (uErr) {
      console.error('Lỗi sinh tài khoản mentor:', uErr);
    }

    res.status(201).json({ 
      success: true, 
      data: { 
        ...data, 
        id: newId, 
        userId, 
        currentMenteesCount: 0,
        accountCreated: true,
        defaultPassword: 'Mentor@2026'
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
