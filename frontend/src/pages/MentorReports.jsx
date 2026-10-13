import React, { useState, useEffect } from 'react';

export default function MentorReports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('access_token');

  const fetchReports = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/reports/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải báo cáo:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reports/${selectedReport.id}/feedback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feedback })
      });

      if (res.ok) {
        setMessage('Gửi phản hồi thành công!');
        setFeedback('');
        setSelectedReport(null);
        fetchReports();
      } else {
        setMessage('Gửi phản hồi thất bại.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi phản hồi:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
      <h2>Danh sách báo cáo thực tập sinh (Mentor)</h2>
      {message && <p style={{ color: '#4caf50' }}>{message}</p>}
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#444' }}>
        <thead>
          <tr style={{ background: '#222' }}>
            <th>ID</th>
            <th>Tiêu đề</th>
            <th>Trạng thái</th>
            <th>Ngày gửi</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>Chưa có báo cáo nào.</td>
            </tr>
          ) : (
            reports.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.title}</td>
                <td>{r.status === 'reviewed' ? 'Đã phản hồi' : 'Chờ duyệt'}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => { setSelectedReport(r); setFeedback(r.feedback || ''); }}>
                    Xem & Phản hồi
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedReport && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #555', borderRadius: '8px', background: '#1a1a1a' }}>
          <h3>Chi tiết báo cáo #{selectedReport.id}: {selectedReport.title}</h3>
          <p><strong>Nội dung:</strong> {selectedReport.content}</p>

          <form onSubmit={handleSendFeedback}>
            <label><strong>Phản hồi của Mentor:</strong></label><br />
            <textarea
              rows="4"
              style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px' }}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Nhập nội dung góp ý, nhận xét cho thực tập sinh..."
              required
            />
            <br />
            <button type="submit" style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>Gửi phản hồi</button>
            <button type="button" onClick={() => setSelectedReport(null)} style={{ marginLeft: '10px', padding: '8px 16px', cursor: 'pointer' }}>Hủy</button>
          </form>
        </div>
      )}
    </div>
  );
}