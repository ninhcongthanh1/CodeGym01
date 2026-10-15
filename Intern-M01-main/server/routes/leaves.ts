import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const leavesRouter = Router();

leavesRouter.get('/', authorize('attendance:leaves_view'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM leave_requests ORDER BY created_at DESC').all() as any[];
    const leaves = rows.map(r => ({
      id: r.id,
      internId: r.intern_id,
      startDate: r.start_date,
      endDate: r.end_date,
      type: r.type,
      reason: r.reason,
      status: r.status,
      reviewedBy: r.reviewed_by,
      reviewDate: r.review_date,
      reviewNote: r.review_note,
      createdAt: r.created_at
    }));
    res.json({ success: true, data: leaves });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

leavesRouter.post('/', authorize('attendance:leaves_submit'), (req, res) => {
  try {
    const data = req.body;
    const newId = `leave-${Date.now()}`;
    const today = new Date().toISOString().substring(0, 10);

    db.prepare(`
      INSERT INTO leave_requests (id, intern_id, start_date, end_date, type, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(newId, data.internId, data.startDate, data.endDate, data.type, data.reason, today);

    res.status(201).json({ success: true, data: { ...data, id: newId, status: 'pending', createdAt: today } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

leavesRouter.patch('/:id/review', authorize('attendance:leaves_review'), (req, res) => {
  try {
    const { status, reviewedBy, note } = req.body;
    const today = new Date().toISOString().substring(0, 10);

    db.prepare(`
      UPDATE leave_requests SET status = ?, reviewed_by = ?, review_date = ?, review_note = ?
      WHERE id = ?
    `).run(status, reviewedBy || 'HR Manager', today, note || null, req.params.id);

    res.json({ success: true, message: `Đơn nghỉ phép đã được ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
