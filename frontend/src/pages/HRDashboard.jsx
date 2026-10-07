import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInterns } from "../services/api";
import "./HRDashboard.css";

function HRDashboard() {
  const navigate = useNavigate();

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadInterns();
  }, []);

  const loadInterns = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInterns(token);
      setInterns(data);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const total = interns.length;

  const approved = interns.filter(
    (intern) => intern.status === "approved"
  ).length;

  const pending = interns.filter(
    (intern) => intern.status === "pending"
  ).length;

  const rejected = interns.filter(
    (intern) => intern.status === "rejected"
  ).length;

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return status || "Không xác định";
    }
  };

  return (
    <div className="hr-dashboard">

      {/* SIDEBAR */}
      <aside className="hr-dashboard-sidebar">
        <div className="hr-dashboard-logo">
          Intern<span>Manage</span>
        </div>

        <nav className="hr-dashboard-nav">
          <button
            className="active"
            onClick={() => navigate("/")}
          >
            📊 Dashboard
          </button>

          <button onClick={() => navigate("/hr/interns")}>
            👥 Thực tập sinh
          </button>

          <button onClick={() => navigate("/hr/interns")}>
            📄 Tài liệu
          </button>

          <button>
            👤 Người dùng
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="hr-dashboard-main">

        {/* HEADER */}
        <header className="hr-dashboard-header">
          <div>
            <h1>HR Dashboard</h1>
            <p>Tổng quan quản lý thực tập sinh</p>
          </div>

          <div className="hr-dashboard-user">
            <div className="hr-dashboard-avatar">
              HR
            </div>

            <button
              className="hr-dashboard-logout"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <section className="hr-dashboard-content">

          {/* WELCOME */}
          <div className="hr-dashboard-welcome">
            <h2>Xin chào, HR 👋</h2>
            <p>
              Đây là tổng quan tình hình thực tập sinh trong hệ thống.
            </p>
          </div>

          {error && (
            <div className="hr-dashboard-error">
              {error}
            </div>
          )}

          {/* STATS */}
          <div className="hr-dashboard-stats">

            <div className="hr-dashboard-stat">
              <div className="hr-dashboard-stat-top">
                <span className="hr-dashboard-stat-title">
                  Tổng thực tập sinh
                </span>

                <span className="hr-dashboard-stat-icon">
                  👥
                </span>
              </div>

              <div className="hr-dashboard-stat-value">
                {loading ? "..." : total}
              </div>
            </div>

            <div className="hr-dashboard-stat">
              <div className="hr-dashboard-stat-top">
                <span className="hr-dashboard-stat-title">
                  Đã duyệt
                </span>

                <span className="hr-dashboard-stat-icon">
                  ✓
                </span>
              </div>

              <div className="hr-dashboard-stat-value">
                {loading ? "..." : approved}
              </div>
            </div>

            <div className="hr-dashboard-stat">
              <div className="hr-dashboard-stat-top">
                <span className="hr-dashboard-stat-title">
                  Chờ duyệt
                </span>

                <span className="hr-dashboard-stat-icon">
                  ⏳
                </span>
              </div>

              <div className="hr-dashboard-stat-value">
                {loading ? "..." : pending}
              </div>
            </div>

            <div className="hr-dashboard-stat">
              <div className="hr-dashboard-stat-top">
                <span className="hr-dashboard-stat-title">
                  Từ chối
                </span>

                <span className="hr-dashboard-stat-icon">
                  !
                </span>
              </div>

              <div className="hr-dashboard-stat-value">
                {loading ? "..." : rejected}
              </div>
            </div>

          </div>

          {/* GRID */}
          <div className="hr-dashboard-grid">

            {/* STATUS CARD */}
            <div className="hr-dashboard-card">

              <div className="hr-dashboard-card-header">
                <div>
                  <h3>Tổng quan trạng thái</h3>
                  <p>Phân loại thực tập sinh</p>
                </div>
              </div>

              <div className="hr-dashboard-status-list">

                <div className="hr-dashboard-status-row">
                  <div className="hr-dashboard-status-name">
                    <span className="hr-dashboard-status-dot total"></span>
                    Tổng số
                  </div>

                  <span className="hr-dashboard-status-number">
                    {loading ? "..." : total}
                  </span>
                </div>

                <div className="hr-dashboard-status-row">
                  <div className="hr-dashboard-status-name">
                    <span className="hr-dashboard-status-dot approved"></span>
                    Đã duyệt
                  </div>

                  <span className="hr-dashboard-status-number">
                    {loading ? "..." : approved}
                  </span>
                </div>

                <div className="hr-dashboard-status-row">
                  <div className="hr-dashboard-status-name">
                    <span className="hr-dashboard-status-dot pending"></span>
                    Chờ duyệt
                  </div>

                  <span className="hr-dashboard-status-number">
                    {loading ? "..." : pending}
                  </span>
                </div>

                <div className="hr-dashboard-status-row">
                  <div className="hr-dashboard-status-name">
                    <span className="hr-dashboard-status-dot rejected"></span>
                    Từ chối
                  </div>

                  <span className="hr-dashboard-status-number">
                    {loading ? "..." : rejected}
                  </span>
                </div>

              </div>
            </div>

            {/* RECENT INTERNS */}
            <div className="hr-dashboard-card">

              <div className="hr-dashboard-card-header">
                <div>
                  <h3>Thực tập sinh gần đây</h3>
                  <p>Danh sách mới nhất trong hệ thống</p>
                </div>

                <button
                  className="hr-dashboard-view-all"
                  onClick={() => navigate("/hr/interns")}
                >
                  Xem tất cả →
                </button>
              </div>

              {loading ? (
                <div className="hr-dashboard-message">
                  Đang tải dữ liệu...
                </div>
              ) : interns.length === 0 ? (
                <div className="hr-dashboard-message">
                  Chưa có thực tập sinh nào.
                </div>
              ) : (
                <div className="hr-dashboard-table-wrapper">

                  <table className="hr-dashboard-table">
                    <thead>
                      <tr>
                        <th>HỌ TÊN</th>
                        <th>TRƯỜNG</th>
                        <th>NGÀNH</th>
                        <th>TRẠNG THÁI</th>
                      </tr>
                    </thead>

                    <tbody>
                      {interns.slice(0, 5).map((intern) => (
                        <tr key={intern.id}>

                          <td>
                            <div className="hr-dashboard-name">
                              {intern.full_name || "Chưa cập nhật"}
                            </div>
                          </td>

                          <td>
                            <span className="hr-dashboard-muted">
                              {intern.school || "—"}
                            </span>
                          </td>

                          <td>
                            <span className="hr-dashboard-muted">
                              {intern.major || "—"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`hr-dashboard-badge ${intern.status}`}
                            >
                              {getStatusText(intern.status)}
                            </span>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              )}

            </div>

          </div>

        </section>
      </main>
    </div>
  );
}

export default HRDashboard;