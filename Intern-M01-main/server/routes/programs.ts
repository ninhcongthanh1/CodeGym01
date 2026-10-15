import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const programsRouter = Router();

programsRouter.get('/', authorize('programs:view'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM programs ORDER BY start_date DESC').all() as any[];
    const programs = rows.map(r => ({
      id: r.id,
      name: r.name,
      batchCode: r.batch_code,
      departmentId: r.department_id,
      startDate: r.start_date,
      endDate: r.end_date,
      targetCount: r.target_count,
      currentCount: r.current_count,
      status: r.status,
      description: r.description,
      milestones: JSON.parse(r.milestones || '[]')
    }));
    res.json({ success: true, data: programs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

programsRouter.post('/', authorize('programs:create'), (req, res) => {
  try {
    const data = req.body;
    const newId = `prog-${Date.now()}`;

    db.prepare(`
      INSERT INTO programs (
        id, name, batch_code, department_id, start_date, end_date,
        target_count, current_count, status, description, milestones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.name,
      data.batchCode,
      data.departmentId,
      data.startDate,
      data.endDate,
      data.targetCount,
      data.currentCount || 0,
      data.status || 'planning',
      data.description || '',
      JSON.stringify(data.milestones || [])
    );

    res.status(201).json({ success: true, data: { ...data, id: newId } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

programsRouter.patch('/assign-mentor', authorize('programs:assign_mentor'), (req, res) => {
  try {
    const { internId, mentorId } = req.body;
    db.prepare('UPDATE interns SET mentor_id = ? WHERE id = ?').run(mentorId, internId);
    db.prepare('UPDATE mentors SET current_mentees_count = current_mentees_count + 1 WHERE id = ?').run(mentorId);
    res.json({ success: true, message: 'Assigned mentor successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
