import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const ticketsRouter = Router();

ticketsRouter.get('/', authorize('tickets:view'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM support_tickets ORDER BY created_at DESC').all() as any[];
    const tickets = rows.map(r => ({
      id: r.id,
      internId: r.intern_id,
      title: r.title,
      category: r.category,
      description: r.description,
      status: r.status,
      priority: r.priority,
      createdAt: r.created_at,
      resolvedAt: r.resolved_at,
      resolutionNote: r.resolution_note
    }));
    res.json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

ticketsRouter.post('/', authorize('tickets:submit'), (req, res) => {
  try {
    const data = req.body;
    const newId = `tick-${Date.now()}`;
    const today = new Date().toISOString().substring(0, 10);

    db.prepare(`
      INSERT INTO support_tickets (id, intern_id, title, category, description, status, priority, created_at)
      VALUES (?, ?, ?, ?, ?, 'open', ?, ?)
    `).run(newId, data.internId, data.title, data.category, data.description, data.priority || 'medium', today);

    res.status(201).json({ success: true, data: { ...data, id: newId, status: 'open', createdAt: today } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

ticketsRouter.patch('/:id/resolve', authorize('tickets:resolve'), (req, res) => {
  try {
    const { note } = req.body;
    const today = new Date().toISOString().substring(0, 10);

    db.prepare(`
      UPDATE support_tickets SET status = 'resolved', resolved_at = ?, resolution_note = ?
      WHERE id = ?
    `).run(today, note, req.params.id);

    res.json({ success: true, message: 'Ticket resolved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
