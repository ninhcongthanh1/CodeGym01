import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignedInterns, saveEvaluation } from '../services/evaluations';
import { calculateScores, groups, toEditor } from '../services/evaluationScoring';
import './MentorDashboard.css';

const statusLabel = evaluation => evaluation?.status === 'submitted' ? 'Đã gửi' : evaluation ? 'Bản nháp' : 'Chưa đánh giá';
const dateLabel = value => value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
const timestampLabel = value => value ? new Date(value.endsWith('Z') ? value : `${value}Z`).toLocaleString('vi-VN') : '—';

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [editor, setEditor] = useState(toEditor(null));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const savingRef = useRef(false);
  const confirmRef = useRef(null);
  const submitRef = useRef(null);
  const selected = interns.find(i => i.id === selectedId);
  const readonly = selected?.evaluation?.status === 'submitted';
  const scores = calculateScores(editor);

  useEffect(() => {
    let cancelled = false;
    getAssignedInterns().then(data => { if (!cancelled) setInterns(data); })
      .catch(e => { if (!cancelled) setLoadError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const onUnload = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);
  useEffect(() => {
    if (confirmOpen) confirmRef.current?.focus();
  }, [confirmOpen]);

  function canDiscard() { return !dirty || window.confirm('Bạn có thay đổi chưa lưu. Bỏ thay đổi này?'); }
  function choose(intern) {
    if (saving || intern.id === selectedId || !canDiscard()) return;
    setSelectedId(intern.id); setEditor(toEditor(intern.evaluation)); setDirty(false); setMessage(''); setError('');
  }
  async function refresh() {
    if (saving || !canDiscard()) return;
    setLoading(true); setLoadError('');
    try {
      const data = await getAssignedInterns(); setInterns(data);
      const current = data.find(i => i.id === selectedId);
      if (!current) setSelectedId(null);
      setEditor(toEditor(current?.evaluation)); setDirty(false); setError(''); setMessage('');
    } catch (e) { setLoadError(e.message); }
    finally { setLoading(false); }
  }
  function change(key, value) { setEditor(current => ({ ...current, [key]: value })); setDirty(true); setMessage(''); setError(''); }
  function requestSubmit(event) {
    event.preventDefault(); setError('');
    if (!scores) { setError('Vui lòng chấm đủ 6 tiêu chí theo thang 1–5.'); return; }
    if (['strengths', 'improvements', 'conclusion'].some(key => !editor[key].trim())) {
      setError('Vui lòng nhập điểm mạnh, điểm cần cải thiện và nhận xét tổng kết.'); return;
    }
    setConfirmOpen(true);
  }
  function closeConfirmation() { if (!savingRef.current) { setConfirmOpen(false); submitRef.current?.focus(); } }
  async function save(status) {
    if (!selected || readonly || loading || savingRef.current) return;
    savingRef.current = true; setSaving(true); setError(''); setMessage('');
    try {
      const evaluation = await saveEvaluation(selected.id, { ...editor, status });
      setInterns(items => items.map(i => i.id === selected.id ? { ...i, evaluation } : i));
      setEditor(toEditor(evaluation)); setDirty(false); setConfirmOpen(false);
      setMessage(status === 'submitted' ? 'Đã gửi đánh giá tổng kết. Phiếu được khóa để bảo toàn kết quả.' : 'Đã lưu bản nháp. Bạn có thể tiếp tục chỉnh sửa.');
    } catch (e) { setError(e.message); setConfirmOpen(false); }
    finally { savingRef.current = false; setSaving(false); }
  }
  const visible = interns.filter(i => `${i.full_name} ${i.email || ''} ${i.school || ''} ${i.major || ''}`.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')) && (filter === 'all' || (filter === 'none' ? !i.evaluation : i.evaluation?.status === filter)));
  const submitted = interns.filter(i => i.evaluation?.status === 'submitted').length;
  return <div className="mentor-app">
    <aside className="mentor-sidebar"><div className="mentor-brand">CG<span>CODEGYM · MENTOR</span></div><p>CỔNG NGƯỜI HƯỚNG DẪN</p><a href="#mentor-list" className="active">Đánh giá thực tập sinh</a><div className="mentor-sidebar-note">Ghi nhận tiến bộ.<br />Định hướng phát triển.</div></aside>
    <main className="mentor-main">
      <header className="mentor-header"><div><span className="mentor-eyebrow">TỔNG KẾT THỰC TẬP</span><h1>Đánh giá kỹ năng & thái độ</h1><p>Theo dõi TTS được phân công và gửi nhận xét tổng kết.</p></div><button className="mentor-btn secondary" disabled={saving} onClick={() => { if (canDiscard()) { localStorage.removeItem('token'); navigate('/login'); } }}>Đăng xuất</button></header>
      <div className="mentor-stats"><article><span>TTS được phân công</span><strong>{interns.length}</strong></article><article><span>Đã gửi tổng kết</span><strong>{submitted}</strong></article><article><span>Cần hoàn thiện</span><strong>{interns.length - submitted}</strong></article></div>
      <section id="mentor-list" className="mentor-panel">
        <div className="mentor-section-header"><div><h2>Thực tập sinh của tôi</h2><p>Chỉ hiển thị hồ sơ được HR phân công cho bạn.</p></div><button className="mentor-btn secondary" onClick={refresh} disabled={loading || saving}>Tải lại</button></div>
        <div className="mentor-toolbar"><label>Tìm TTS<input placeholder="Tên, email, trường hoặc ngành" value={query} onChange={e => setQuery(e.target.value)} /></label><label>Trạng thái đánh giá<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tất cả</option><option value="none">Chưa đánh giá</option><option value="draft">Bản nháp</option><option value="submitted">Đã gửi</option></select></label></div>
        {loadError && <p className="mentor-error" role="alert">{loadError} — Bấm Tải lại để thử lại.</p>}
        {loading ? <p className="mentor-empty" role="status">Đang tải hồ sơ…</p> : <div className="mentor-table-wrap"><table><thead><tr><th>THỰC TẬP SINH</th><th>VỊ TRÍ / TRƯỜNG</th><th>TRẠNG THÁI</th><th>KẾT QUẢ</th><th>THAO TÁC</th></tr></thead><tbody>{visible.map(i => <tr key={i.id} className={i.id === selectedId ? 'selected' : ''}><td><strong>{i.full_name}</strong><small>#{i.id} · {i.email || 'Chưa có email'}</small></td><td>{i.internship_position || i.major || 'Chưa cập nhật'}<small>{i.school || 'Chưa cập nhật trường'}</small></td><td><span className={`mentor-badge ${i.evaluation?.status || 'none'}`}>{statusLabel(i.evaluation)}</span></td><td>{i.evaluation?.overall_score != null ? `${i.evaluation.overall_score}/5 · ${i.evaluation.rating}` : '—'}</td><td><button className="mentor-btn secondary" disabled={saving} onClick={() => choose(i)}>{i.evaluation?.status === 'submitted' ? 'Xem tổng kết' : i.evaluation ? 'Tiếp tục đánh giá' : 'Đánh giá'}</button></td></tr>)}{!visible.length && <tr><td colSpan="5" className="mentor-empty">{interns.length ? 'Không có TTS phù hợp với bộ lọc.' : 'Bạn chưa được phân công TTS. Liên hệ HR để phân công hồ sơ.'}</td></tr>}</tbody></table></div>}
      </section>
      {selected ? <section className="mentor-panel mentor-editor" aria-labelledby="evaluation-heading">
        <div className="mentor-section-header"><div><span className="mentor-eyebrow">PHIẾU ĐÁNH GIÁ #{selected.id}</span><h2 id="evaluation-heading">{selected.full_name}</h2><p>{selected.internship_position || selected.major || 'Thực tập sinh'} · {dateLabel(selected.internship_start_date)} → {dateLabel(selected.internship_end_date)}</p></div><span className={`mentor-badge ${selected.evaluation?.status || 'none'}`}>{statusLabel(selected.evaluation)}</span></div>
        <div className="mentor-scale"><strong>Thang điểm:</strong> 1 · Cần cải thiện nhiều / 2 · Cần cải thiện / 3 · Đạt / 4 · Tốt / 5 · Xuất sắc</div>
        <form onSubmit={requestSubmit}>
          <fieldset disabled={saving || readonly || loading}>
            <div className="mentor-score-groups">{groups.map(group => <article key={group.title}><h3>{group.title}<span>50% kết quả tổng kết</span></h3>{group.criteria.map(([key, label]) => <label className="mentor-score-row" key={key}><span>{label}</span><select aria-label={label} value={editor[key] ?? ''} onChange={e => change(key, e.target.value === '' ? null : Number(e.target.value))}><option value="">Chọn điểm</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label>)}</article>)}</div>
            <div className="mentor-comments">{[['strengths', 'Điểm mạnh'], ['improvements', 'Điểm cần cải thiện / hướng phát triển'], ['conclusion', 'Nhận xét tổng kết']].map(([key, label]) => <label key={key}>{label}<span className="mentor-required"> *</span><textarea rows={3} maxLength={2000} value={editor[key]} onChange={e => change(key, e.target.value)} placeholder={`Nhập ${label.toLocaleLowerCase('vi')}…`} /><small>{editor[key].length}/2000 ký tự · bắt buộc khi gửi tổng kết</small></label>)}</div>
          </fieldset>
          <div className="mentor-result"><div><span>Kỹ năng</span><strong>{scores?.skills ?? '—'} / 5</strong></div><div><span>Thái độ</span><strong>{scores?.attitude ?? '—'} / 5</strong></div><div><span>Điểm tổng kết</span><strong>{scores?.overall ?? '—'} / 5</strong></div><div><span>Xếp loại gợi ý</span><strong>{scores?.rating ?? 'Chấm đủ tiêu chí'}</strong></div></div>
          <p className="mentor-rule">Điểm tổng kết là trung bình 6 tiêu chí. Xuất sắc ≥ 4,5; Tốt ≥ 3,5; Đạt ≥ 2,5; thấp hơn: Cần cải thiện.</p>
          {error && <p className="mentor-error" role="alert">{error}</p>}{message && <p className="mentor-success" role="status">{message}</p>}
          {readonly ? <p className="mentor-readonly">Đã gửi lúc {timestampLabel(selected.evaluation.submitted_at)}. Phiếu chỉ xem, không chỉnh sửa.</p> : <div className="mentor-form-actions"><span>{dirty ? 'Có thay đổi chưa lưu' : selected.evaluation ? `Lưu gần nhất: ${timestampLabel(selected.evaluation.updated_at)}` : 'Chưa có bản nháp'}</span><button type="button" className="mentor-btn secondary" disabled={saving || loading} onClick={() => save('draft')}>{saving ? 'Đang lưu…' : 'Lưu nháp'}</button><button ref={submitRef} type="submit" className="mentor-btn" disabled={saving || loading}>Gửi đánh giá tổng kết</button></div>}
        </form>
      </section> : <div className="mentor-start">Chọn một thực tập sinh ở danh sách để bắt đầu đánh giá.</div>}
    </main>
    {confirmOpen && <div className="mentor-modal-backdrop"><div className="mentor-confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onKeyDown={e => {
      if (e.key === 'Escape') closeConfirmation();
      if (e.key === 'Tab') { const buttons = Array.from(e.currentTarget.querySelectorAll('button:not(:disabled)')); const first = buttons[0], last = buttons.at(-1); if (!buttons.length) { e.preventDefault(); return; } if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }}><span className="mentor-eyebrow">XÁC NHẬN TỔNG KẾT</span><h2 id="confirm-title">Gửi đánh giá cho {selected.full_name}?</h2><p>Kết quả: <strong>{scores?.overall}/5 · {scores?.rating}</strong></p><p>Sau khi gửi, phiếu sẽ được khóa và không thể sửa. Hãy kiểm tra điểm và nhận xét trước khi xác nhận.</p><div className="mentor-confirm-actions"><button ref={confirmRef} className="mentor-btn secondary" disabled={saving} onClick={closeConfirmation}>Quay lại kiểm tra</button><button className="mentor-btn" disabled={saving} onClick={() => save('submitted')}>{saving ? 'Đang gửi…' : 'Xác nhận gửi'}</button></div></div></div>}
  </div>;
}
