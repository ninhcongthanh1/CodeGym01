import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const tasksRouter = Router();

tasksRouter.get('/', authorize('tasks:view'), (req, res) => {
  try {
    const { internId, status } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (internId && internId !== 'all') {
      query += ' AND assigned_to_intern_id = ?';
      params.push(internId);
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params) as any[];
    const tasks = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      assignedToInternId: r.assigned_to_intern_id,
      createdById: r.created_by_id,
      departmentId: r.department_id,
      status: r.status,
      priority: r.priority,
      dueDate: r.due_date,
      startDate: r.start_date,
      progressPercent: r.progress_percent,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

tasksRouter.post('/', authorize('tasks:create'), (req, res) => {
  try {
    const data = req.body;
    const newId = `task-${Date.now()}`;
    const today = new Date().toISOString().substring(0, 10);

    db.prepare(`
      INSERT INTO tasks (
        id, title, description, assigned_to_intern_id, created_by_id,
        department_id, status, priority, due_date, start_date, progress_percent,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.title,
      data.description,
      data.assignedToInternId,
      data.createdById || 'u-mentor-1',
      data.departmentId || 'dept-1',
      data.status || 'todo',
      data.priority || 'medium',
      data.dueDate,
      data.startDate || today,
      data.progressPercent || 0,
      today,
      today
    );

    res.status(201).json({ success: true, data: { ...data, id: newId, createdAt: today, updatedAt: today } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

tasksRouter.patch('/:id/status', authorize('tasks:update_status'), (req, res) => {
  try {
    const { status, progressPercent } = req.body;
    const today = new Date().toISOString().substring(0, 10);

    db.prepare(`
      UPDATE tasks SET status = ?, progress_percent = COALESCE(?, progress_percent), updated_at = ?
      WHERE id = ?
    `).run(status, progressPercent !== undefined ? progressPercent : null, today, req.params.id);

    res.json({ success: true, message: 'Task status updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

tasksRouter.delete('/:id', authorize('tasks:delete'), (req, res) => {
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
