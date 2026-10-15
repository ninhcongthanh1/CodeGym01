import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const attendanceRouter = Router();

attendanceRouter.get('/', authorize('attendance:view'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM attendance ORDER BY date DESC, check_in_time DESC').all() as any[];
    const records = rows.map(r => ({
      id: r.id,
      internId: r.intern_id,
      date: r.date,
      checkInTime: r.check_in_time,
      checkOutTime: r.check_out_time,
      status: r.status,
      workHours: r.work_hours,
      notes: r.notes,
      checkInMethod: r.check_in_method
    }));
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

attendanceRouter.post('/check-in', authorize('attendance:checkin'), (req, res) => {
  try {
    const { internId, method } = req.body;
    const today = new Date().toISOString().substring(0, 10);

    // Check if already checked in
    const existing = db.prepare('SELECT * FROM attendance WHERE intern_id = ? AND date = ?').get(internId, today) as any;
    if (existing && existing.check_in_time) {
      return res.status(400).json({ success: false, error: 'Thực tập sinh đã check-in hôm nay rồi' });
    }

    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5);
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30);
    const newId = `att-${Date.now()}`;

    if (existing) {
      db.prepare(`
        UPDATE attendance SET check_in_time = ?, status = ?, check_in_method = ?, notes = ?
        WHERE id = ?
      `).run(timeStr, isLate ? 'late' : 'on_time', method || 'web', isLate ? 'Đi muộn sau 08:30' : 'Đúng giờ', existing.id);
    } else {
      db.prepare(`
        INSERT INTO attendance (id, intern_id, date, check_in_time, check_out_time, status, work_hours, notes, check_in_method)
        VALUES (?, ?, ?, ?, NULL, ?, 0, ?, ?)
      `).run(newId, internId, today, timeStr, isLate ? 'late' : 'on_time', isLate ? 'Đi muộn sau 08:30' : 'Đúng giờ', method || 'web');
    }

    res.json({ success: true, message: 'Check-in thành công', time: timeStr, status: isLate ? 'late' : 'on_time' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

attendanceRouter.post('/check-out', authorize('attendance:checkin'), (req, res) => {
  try {
    const { internId } = req.body;
    const today = new Date().toISOString().substring(0, 10);

    const existing = db.prepare('SELECT * FROM attendance WHERE intern_id = ? AND date = ?').get(internId, today) as any;
    if (!existing || !existing.check_in_time) {
      return res.status(400).json({ success: false, error: 'Chưa check-in hôm nay nên không thể check-out' });
    }

    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5);
    const [inH, inM] = existing.check_in_time.split(':').map(Number);
    const hours = Math.max(1, Number(((now.getHours() * 60 + now.getMinutes() - (inH * 60 + inM)) / 60).toFixed(1)));

    db.prepare(`
      UPDATE attendance SET check_out_time = ?, work_hours = ? WHERE id = ?
    `).run(timeStr, hours, existing.id);

    res.json({ success: true, message: 'Check-out thành công', time: timeStr, workHours: hours });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
