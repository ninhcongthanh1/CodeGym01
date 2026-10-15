import { Router } from 'express';
import { db } from '../db';
import { authorize } from '../middleware/auth';

export const allowancesRouter = Router();

allowancesRouter.get('/', authorize('allowances:view'), (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM allowances ORDER BY month DESC').all() as any[];
    const allowances = rows.map(r => ({
      id: r.id,
      internId: r.intern_id,
      month: r.month,
      standardWorkDays: r.standard_work_days,
      actualWorkDays: r.actual_work_days,
      baseAllowance: r.base_allowance,
      mealAllowance: r.meal_allowance,
      bonusAllowance: r.bonus_allowance,
      deductions: r.deductions,
      totalAmount: r.total_amount,
      status: r.status,
      paidDate: r.paid_date,
      note: r.note
    }));
    res.json({ success: true, data: allowances });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

allowancesRouter.post('/', authorize('allowances:manage'), (req, res) => {
  try {
    const data = req.body;
    const newId = `alw-${Date.now()}`;

    db.prepare(`
      INSERT INTO allowances (
        id, intern_id, month, standard_work_days, actual_work_days,
        base_allowance, meal_allowance, bonus_allowance, deductions,
        total_amount, status, paid_date, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.internId,
      data.month,
      data.standardWorkDays,
      data.actualWorkDays,
      data.baseAllowance,
      data.mealAllowance,
      data.bonusAllowance,
      data.deductions || 0,
      data.totalAmount,
      data.status || 'approved',
      data.paidDate || null,
      data.note || null
    );

    res.status(201).json({ success: true, data: { ...data, id: newId } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

allowancesRouter.patch('/:id/status', authorize('allowances:manage'), (req, res) => {
  try {
    const { status } = req.body;
    const paidDate = status === 'paid' ? new Date().toISOString().substring(0, 10) : null;

    db.prepare(`
      UPDATE allowances SET status = ?, paid_date = COALESCE(?, paid_date) WHERE id = ?
    `).run(status, paidDate, req.params.id);

    res.json({ success: true, message: `Trạng thái phụ cấp đã cập nhật thành ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
