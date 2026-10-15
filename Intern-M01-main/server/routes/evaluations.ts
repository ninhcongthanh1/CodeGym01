import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const evaluationsRouter = Router();

evaluationsRouter.get('/', authorize('evaluations:view'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM evaluations ORDER BY evaluated_at DESC').all() as any[];
    const evals = rows.map(r => ({
      id: r.id,
      internId: r.intern_id,
      evaluatorId: r.evaluator_id,
      type: r.type,
      technicalScore: r.technical_score,
      attitudeScore: r.attitude_score,
      disciplineScore: r.discipline_score,
      teamworkScore: r.teamwork_score,
      totalScore: r.total_score,
      overallGrade: r.overall_grade,
      generalFeedback: r.general_feedback,
      strengths: r.strengths,
      areasForImprovement: r.areas_for_improvement,
      recommendation: r.recommendation,
      evaluatedAt: r.evaluated_at,
      isCertificateIssued: Boolean(r.is_certificate_issued)
    }));
    res.json({ success: true, data: evals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

evaluationsRouter.post('/', authorize('evaluations:create'), (req, res) => {
  try {
    const data = req.body;
    const newId = `eval-${Date.now()}`;
    const today = new Date().toISOString().substring(0, 10);

    db.prepare(`
      INSERT INTO evaluations (
        id, intern_id, evaluator_id, type, technical_score, attitude_score,
        discipline_score, teamwork_score, total_score, overall_grade, general_feedback,
        strengths, areas_for_improvement, recommendation, evaluated_at, is_certificate_issued
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.internId,
      data.evaluatorId || 'u-mentor-1',
      data.type || 'final',
      data.technicalScore,
      data.attitudeScore,
      data.disciplineScore,
      data.teamworkScore,
      data.totalScore,
      data.overallGrade,
      data.generalFeedback,
      data.strengths || null,
      data.areasForImprovement || null,
      data.recommendation,
      today,
      data.totalScore >= 7.0 ? 1 : 0
    );

    res.status(201).json({ success: true, data: { ...data, id: newId, evaluatedAt: today, isCertificateIssued: data.totalScore >= 7.0 } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

evaluationsRouter.patch('/:id/certificate', authorize('evaluations:issue_cert'), (req, res) => {
  try {
    db.prepare('UPDATE evaluations SET is_certificate_issued = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Certificate issued successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
