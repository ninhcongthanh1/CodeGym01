export const groups = [
  { title: 'Kỹ năng', criteria: [['technical', 'Chuyên môn / kỹ thuật'], ['problem_solving', 'Giải quyết vấn đề'], ['learning', 'Tiếp thu và vận dụng']] },
  { title: 'Thái độ', criteria: [['discipline', 'Kỷ luật và trách nhiệm'], ['initiative', 'Chủ động trong công việc'], ['teamwork', 'Hợp tác và giao tiếp']] },
];
export const keys = groups.flatMap(g => g.criteria.map(([key]) => key));
export function calculateScores(form) {
  const values = keys.map(key => form[key]);
  if (values.some(value => !Number.isInteger(value) || value < 1 || value > 5)) return null;
  const raw = values.reduce((sum, score) => sum + score, 0) / 6;
  const round = n => Math.round(n * 100) / 100;
  return { skills: round(values.slice(0, 3).reduce((s, n) => s + n, 0) / 3), attitude: round(values.slice(3).reduce((s, n) => s + n, 0) / 3), overall: round(raw), rating: raw >= 4.5 ? 'Xuất sắc' : raw >= 3.5 ? 'Tốt' : raw >= 2.5 ? 'Đạt' : 'Cần cải thiện' };
}
export function toEditor(evaluation) {
  return { ...Object.fromEntries(keys.map(key => [key, evaluation?.[key] ?? null])), strengths: evaluation?.strengths || '', improvements: evaluation?.improvements || '', conclusion: evaluation?.conclusion || '', expected_revision: evaluation?.revision || 0 };
}
