import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const internsRouter = Router();

// GET all interns with optional query filtering
internsRouter.get('/', authorize('interns:view'), (req, res) => {
  try {
    const { search, university, major, status, departmentId } = req.query;
    let query = 'SELECT * FROM interns WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (university && university !== 'all') {
      query += ' AND university = ?';
      params.push(university);
    }
    if (major && major !== 'all') {
      query += ' AND major = ?';
      params.push(major);
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (departmentId && departmentId !== 'all') {
      query += ' AND department_id = ?';
      params.push(departmentId);
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params) as any[];

    // Parse JSON documents field and map to camelCase
    const result = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      dateOfBirth: r.date_of_birth,
      gender: r.gender,
      university: r.university,
      major: r.major,
      gpa: r.gpa,
      graduationYear: r.graduation_year,
      studentId: r.student_id,
      avatar: r.avatar,
      status: r.status,
      departmentId: r.department_id,
      programId: r.program_id,
      mentorId: r.mentor_id,
      startDate: r.start_date,
      endDate: r.end_date,
      contractStatus: r.contract_status,
      contractSignedDate: r.contract_signed_date,
      documents: JSON.parse(r.documents || '[]'),
      notes: r.notes,
      createdAt: r.created_at
    }));

    res.json({ success: true, data: result, total: result.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single intern
internsRouter.get('/:id', authorize('interns:view'), (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM interns WHERE id = ?').get(req.params.id) as any;
    if (!row) {
      return res.status(404).json({ success: false, error: 'Intern not found' });
    }
    const intern = {
      id: row.id,
      userId: row.user_id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      university: row.university,
      major: row.major,
      gpa: row.gpa,
      graduationYear: row.graduation_year,
      studentId: row.student_id,
      avatar: row.avatar,
      status: row.status,
      departmentId: row.department_id,
      programId: row.program_id,
      mentorId: row.mentor_id,
      startDate: row.start_date,
      endDate: row.end_date,
      contractStatus: row.contract_status,
      contractSignedDate: row.contract_signed_date,
      documents: JSON.parse(row.documents || '[]'),
      notes: row.notes,
      createdAt: row.created_at
    };
    res.json({ success: true, data: intern });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create intern (Public applicant registration allowed, or protected by interns:create)
internsRouter.post('/', (req, res, next) => {
  // If it's a candidate application online (applying), allow public registration
  if (req.body.status === 'applying') {
    return next();
  }
  // Otherwise, require interns:create
  return authorize('interns:create')(req, res, next);
}, (req, res) => {
  try {
    const data = req.body;
    const newId = data.id || `intern-${Date.now()}`;
    const createdAt = new Date().toISOString().substring(0, 10);

    db.prepare(`
      INSERT INTO interns (
        id, user_id, full_name, email, phone, date_of_birth, gender,
        university, major, gpa, graduation_year, student_id, avatar,
        status, department_id, program_id, mentor_id, start_date, end_date,
        contract_status, contract_signed_date, documents, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.userId || null,
      data.fullName,
      data.email,
      data.phone || '',
      data.dateOfBirth || '2004-01-01',
      data.gender || 'male',
      data.university,
      data.major,
      data.gpa || 3.5,
      data.graduationYear || 2026,
      data.studentId || `SV${Math.floor(100000 + Math.random() * 900000)}`,
      data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      data.status || 'applying',
      data.departmentId || 'dept-1',
      data.programId || 'prog-1',
      data.mentorId || null,
      data.startDate || '2026-08-01',
      data.endDate || '2026-10-31',
      data.contractStatus || 'not_sent',
      data.contractSignedDate || null,
      JSON.stringify(data.documents || []),
      data.notes || null,
      createdAt
    );

    // Auto-create User account in SQLite with default credentials
    const userId = data.userId || `u-${newId}`;
    try {
      db.prepare(`
        INSERT OR REPLACE INTO users (
          id, name, email, role, password, default_password, status, avatar, phone, department_id, intern_profile_id
        ) VALUES (?, ?, ?, 'intern', 'Intern@2026', 'Intern@2026', 'active', ?, ?, ?, ?)
      `).run(
        userId,
        data.fullName,
        data.email,
        data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        data.phone || '',
        data.departmentId || 'dept-1',
        newId
      );

      // Auto-generate notification email with default credentials
      db.prepare(`
        INSERT INTO system_emails (id, to_email, recipient_name, subject, content, sent_at, type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `em-${Date.now()}`,
        data.email,
        data.fullName,
        '[IMS TechCorp] Cấp tài khoản đăng nhập Hệ thống Thực tập sinh IMS',
        `Kính gửi bạn ${data.fullName},\n\nBan Quản lý chương trình Thực tập sinh TechCorp trân trọng gửi thông tin tài khoản đăng nhập vào Cổng thông tin IMS:\n- Địa chỉ hệ thống: http://localhost:3000\n- Tên đăng nhập (Email): ${data.email}\n- Mật khẩu mặc định: Intern@2026\n- Vai trò: Thực tập sinh (Intern)\n\nVui lòng đăng nhập để cập nhật hồ sơ, theo dõi nhiệm vụ và thực hiện chấm công hàng ngày.`,
        new Date().toISOString().replace('T', ' ').substring(0, 19),
        'system'
      );
    } catch (userErr) {
      console.error('Lỗi tự động sinh tài khoản người dùng:', userErr);
    }

    // Auto-create audit log
    const userRole = (req.headers['x-user-role'] as string) || 'guest';
    const userName = (req.headers['x-user-name'] as string) || data.fullName;
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity_type, entity_id, details, timestamp, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log-${Date.now()}`,
      'api',
      userName,
      userRole,
      'Tiếp nhận hồ sơ thực tập sinh & Tạo tài khoản',
      'InternProfile',
      newId,
      `Hồ sơ: ${data.fullName} (${data.university}) | Tài khoản: ${data.email} | MK mặc định: Intern@2026`,
      new Date().toISOString().replace('T', ' ').substring(0, 19),
      req.ip || '127.0.0.1'
    );

    res.status(201).json({ 
      success: true, 
      data: { 
        ...data, 
        id: newId, 
        userId,
        createdAt,
        accountCreated: true,
        defaultPassword: 'Intern@2026'
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update intern
internsRouter.put('/:id', authorize('interns:edit'), (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    db.prepare(`
      UPDATE interns SET
        full_name = COALESCE(?, full_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        university = COALESCE(?, university),
        major = COALESCE(?, major),
        gpa = COALESCE(?, gpa),
        graduation_year = COALESCE(?, graduation_year),
        status = COALESCE(?, status),
        department_id = COALESCE(?, department_id),
        mentor_id = COALESCE(?, mentor_id),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(
      data.fullName,
      data.email,
      data.phone,
      data.university,
      data.major,
      data.gpa,
      data.graduationYear,
      data.status,
      data.departmentId,
      data.mentorId,
      data.notes,
      id
    );

    res.json({ success: true, message: 'Updated intern successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE intern
internsRouter.delete('/:id', authorize('interns:delete'), (req, res) => {
  try {
    const id = req.params.id;
    db.prepare('DELETE FROM interns WHERE id = ?').run(id);
    res.json({ success: true, message: 'Deleted intern successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH status (Tuyển dụng & tiếp nhận)
internsRouter.patch('/:id/status', authorize('recruitment:manage'), (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE interns SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH contract sign
internsRouter.patch('/:id/contract/sign', (req, res) => {
  try {
    const signedDate = new Date().toISOString().substring(0, 10);
    db.prepare(`
      UPDATE interns SET contract_status = 'signed', contract_signed_date = ? WHERE id = ?
    `).run(signedDate, req.params.id);
    res.json({ success: true, message: 'Contract signed successfully', signedDate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST upload document
internsRouter.post('/:id/documents', (req, res) => {
  try {
    const row = db.prepare('SELECT documents FROM interns WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Intern not found' });

    const docs = JSON.parse(row.documents || '[]');
    const newDoc = {
      id: `doc-${Date.now()}`,
      ...req.body,
      uploadedAt: new Date().toISOString().substring(0, 10),
      isVerified: false
    };
    docs.unshift(newDoc);

    db.prepare('UPDATE interns SET documents = ? WHERE id = ?').run(JSON.stringify(docs), req.params.id);
    res.json({ success: true, data: newDoc });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH verify document
internsRouter.patch('/:id/documents/:docId/verify', authorize('interns:verify_docs'), (req, res) => {
  try {
    const row = db.prepare('SELECT documents FROM interns WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Intern not found' });

    let docs = JSON.parse(row.documents || '[]');
    docs = docs.map((d: any) => {
      if (d.id === req.params.docId) {
        return {
          ...d,
          isVerified: true,
          verifiedBy: req.body.verifiedBy || 'HR Manager',
          verifiedAt: new Date().toISOString().substring(0, 10)
        };
      }
      return d;
    });

    db.prepare('UPDATE interns SET documents = ? WHERE id = ?').run(JSON.stringify(docs), req.params.id);
    res.json({ success: true, message: 'Document verified' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
