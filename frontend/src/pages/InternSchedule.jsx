// frontend/src/pages/InternSchedule.jsx
import React, { useEffect, useState } from 'react';
import { getMySchedules } from '../services/api';
import './InternDashboard.css'; // Dùng chung CSS hoặc tạo file CSS riêng

const InternSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await getMySchedules();
      setSchedules(data);
    } catch (err) {
      console.error("Lỗi khi tải lịch thực tập:", err);
      setError("Không thể tải lịch thực tập. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span style={{ color: 'green', fontWeight: 'bold' }}>Hoàn thành</span>;
      case 'In Progress':
        return <span style={{ color: 'orange', fontWeight: 'bold' }}>Đang thực hiện</span>;
      default:
        return <span style={{ color: 'gray', fontWeight: 'bold' }}>Chưa bắt đầu</span>;
    }
  };

  if (loading) return <div className="loading">Đang tải lịch thực tập...</div>;

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <h2>📅 Lịch Thực Tập Cá Nhân</h2>
      <p>Danh sách các công việc và kế hoạch thực tập của bạn:</p>

      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      {schedules.length === 0 ? (
        <p>Hiện chưa có lịch thực tập nào được phân công.</p>
      ) : (
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ngày</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Thời gian</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nội dung công việc</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Mô tả chi tiết</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.date}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {item.start_time ? item.start_time.slice(0, 5) : '--:--'} - {item.end_time ? item.end_time.slice(0, 5) : '--:--'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{item.title}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.description || 'Không có mô tả'}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{getStatusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InternSchedule;