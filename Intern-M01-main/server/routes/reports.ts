import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const reportsRouter = Router();

reportsRouter.get('/', authorize('reports:view'), (req, res) => {
  try {
    const { internId } = req.query;
    let query = 'SELECT * FROM weekly_reports WHERE 1=1';
    const params: any[] = [];
    if (internId) {
      query += ' AND intern_id = ?';
      params.push(internId);
    }
    query += ' ORDER BY week_number DESC';

    const rows = db.prepare(query).all(...params) as any[];
    const reports = rows.map(r => ({
      id: r.id,
      internId: r.intern_id,
      weekNumber: r.week_number,
      startDate: r.start_date,
      endDate: r.end_date,
      achievements: r.achievements,
      challenges: r.challenges,
      nextWeekPlan: r.next_week_plan,
      learningExperience: r.learning_experience,
      submissionDate: r.submission_date,
      status: r.status,
      mentorScore: r.mentor_score,
      mentorFeedback: r.mentor_feedback,
      mentorFeedbackDate: r.mentor_feedback_date
    }));

    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

reportsRouter.post('/', authorize('reports:submit'), (req, res) => {
  try {
    const data = req.body;
    const newId = `rep-${Date.now()}`;
    const today = new Date().toISOString().substring(0, 10);

    db.prepare(`
      INSERT INTO weekly_reports (
        id, intern_id, week_number, start_date, end_date,
        achievements, challenges, next_week_plan, learning_experience,
        submission_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.internId,
      data.weekNumber,
      data.startDate,
      data.endDate,
      data.achievements,
      data.challenges || null,
      data.nextWeekPlan,
      data.learningExperience || null,
      today,
      'submitted'
    );

    res.status(201).json({ success: true, data: { ...data, id: newId, submissionDate: today, status: 'submitted' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

reportsRouter.patch('/:id/review', authorize('reports:review'), (req, res) => {
  try {
    const { score, feedback } = req.body;
    const today = new Date().toISOString().substring(0, 10);

    db.prepare(`
      UPDATE weekly_reports SET
        status = 'reviewed',
        mentor_score = ?,
        mentor_feedback = ?,
        mentor_feedback_date = ?
      WHERE id = ?
    `).run(score, feedback, today, req.params.id);

    res.json({ success: true, message: 'Report reviewed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
