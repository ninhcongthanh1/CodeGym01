import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./InternDashboard.css";

function InternDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="intern-dashboard">

      {/* SIDEBAR */}
      <aside className="intern-sidebar">
        <div className="intern-logo">
          Intern<span>Manage</span>
        </div>

        <nav className="intern-nav">

          <button
            className="active"
            onClick={() => navigate("/")}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => navigate("/intern/application")}
          >
            📄 Hồ sơ thực tập
          </button>

          <button
            onClick={() => navigate("/intern/application")}
          >
            📎 Tài liệu
          </button>

          <button>
            📅 Lịch thực tập
          </button>

        </nav>

        <div className="intern-sidebar-bottom">
          <div className="intern-sidebar-user">
            <div className="intern-avatar-small">
              {user?.sub?.charAt(0).toUpperCase() || "I"}
            </div>

            <div>
              <strong>{user?.sub || "Intern"}</strong>
              <span>Thực tập sinh</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="intern-main">

        {/* HEADER */}
        <header className="intern-header">

          <div>
            <h1>Intern Dashboard</h1>
            <p>Quản lý quá trình thực tập của bạn</p>
          </div>

          <div className="intern-header-user">

            <div className="intern-avatar">
              {user?.sub?.charAt(0).toUpperCase() || "I"}
            </div>

            <div className="intern-header-info">
              <strong>{user?.sub || "Intern"}</strong>
              <span>Thực tập sinh</span>
            </div>

            <button
              className="intern-logout"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>

          </div>

        </header>

        {/* CONTENT */}
        <section className="intern-content">

          {/* WELCOME */}
          <div className="intern-welcome">
            <div>
              <h2>Xin chào, {user?.sub || "bạn"} 👋</h2>

              <p>
                Chào mừng bạn quay trở lại hệ thống quản lý thực tập.
              </p>
            </div>

            <button
              className="intern-primary-button"
              onClick={() => navigate("/intern/application")}
            >
              Xem hồ sơ →
            </button>
          </div>

          {/* STATUS CARD */}
          <div className="intern-status-card">

            <div className="intern-status-icon">
              📋
            </div>

            <div className="intern-status-content">
              <span className="intern-status-label">
                TRẠNG THÁI HỒ SƠ
              </span>

              <h3>Hồ sơ thực tập</h3>

              <p>
                Kiểm tra thông tin hồ sơ, CV và tài liệu thực tập
                của bạn.
              </p>
            </div>

            <div className="intern-status-badge pending">
              Đang xử lý
            </div>

          </div>

          {/* QUICK ACTIONS */}
          <div className="intern-section-title">
            <div>
              <h3>Thao tác nhanh</h3>
              <p>Các chức năng bạn có thể sử dụng</p>
            </div>
          </div>

          <div className="intern-action-grid">

            <div
              className="intern-action-card"
              onClick={() => navigate("/intern/application")}
            >
              <div className="intern-action-icon blue">
                📄
              </div>

              <h4>Hồ sơ thực tập</h4>

              <p>
                Xem và kiểm tra thông tin hồ sơ cá nhân.
              </p>

              <span>
                Xem hồ sơ →
              </span>
            </div>

            <div
              className="intern-action-card"
              onClick={() => navigate("/intern/application")}
            >
              <div className="intern-action-icon purple">
                📎
              </div>

              <h4>Tài liệu</h4>

              <p>
                Quản lý CV và hồ sơ đăng ký thực tập.
              </p>

              <span>
                Quản lý tài liệu →
              </span>
            </div>
                     <div
              className="intern-action-card"
              onClick={() => navigate("/intern/schedule")}
            >
              <div className="intern-action-icon green">
                📅
              </div>

              <h4>Lịch thực tập</h4>

              <p>
                Theo dõi thời gian và lịch trình thực tập.
              </p>

              <span>
                Xem lịch →
              </span>
            </div>
          </div>
          {/* INFORMATION */}
          <div className="intern-information-card">

            <div className="intern-information-header">
              <div>
                <h3>Thông tin cần lưu ý</h3>
                <p>
                  Một số điều bạn nên kiểm tra trong quá trình thực tập.
                </p>
              </div>
            </div>

            <div className="intern-information-list">

              <div className="intern-information-item">
                <div className="information-number">
                  01
                </div>

                <div>
                  <strong>Kiểm tra hồ sơ</strong>
                  <p>
                    Đảm bảo thông tin cá nhân và thông tin học tập
                    được cập nhật chính xác.
                  </p>
                </div>
              </div>

              <div className="intern-information-item">
                <div className="information-number">
                  02
                </div>

                <div>
                  <strong>Kiểm tra tài liệu</strong>
                  <p>
                    Đảm bảo CV và đơn đăng ký thực tập đã được tải lên
                    đầy đủ.
                  </p>
                </div>
              </div>

              <div className="intern-information-item">
                <div className="information-number">
                  03
                </div>

                <div>
                  <strong>Theo dõi trạng thái</strong>
                  <p>
                    Thường xuyên kiểm tra trạng thái hồ sơ để biết
                    kết quả xét duyệt.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default InternDashboard;