import test from 'node:test';
import assert from 'node:assert/strict';
import { keys, calculateScores, toEditor } from '../src/services/evaluationScoring.js';
const form = values => Object.fromEntries(keys.map((key, i) => [key, values[i]]));
test('incomplete or invalid scores do not produce a summary', () => {
  assert.equal(calculateScores(toEditor(null)), null);
  assert.equal(calculateScores(form([5, 4, 4, 5, 4, null])), null);
  assert.equal(calculateScores(form([5, 4, 4, 5, 4, 6])), null);
});
test('group means and exact 4.5 threshold', () => {
  assert.deepEqual(calculateScores(form([5, 4, 4, 5, 4, 5])), { skills: 4.33, attitude: 4.67, overall: 4.5, rating: 'Xuất sắc' });
});
for (const [values, rating] of [[[4,3,3,4,3,4], 'Tốt'], [[3,2,2,3,2,3], 'Đạt'], [[2,2,2,2,2,2], 'Cần cải thiện'], [[5,4,4,4,4,5], 'Tốt']]) {
  test(`classifies ${values.join(',')} as ${rating}`, () => assert.equal(calculateScores(form(values)).rating, rating));
}
test('draft revision round-trips into editor; empty values remain unscored', () => {
  const editor = toEditor({ revision: 3, technical: 4, conclusion: 'Draft' });
  assert.equal(editor.expected_revision, 3); assert.equal(editor.technical, 4); assert.equal(editor.teamwork, null); assert.equal(editor.conclusion, 'Draft');
});
