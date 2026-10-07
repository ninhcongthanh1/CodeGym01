import { useNavigate } from "react-router-dom";

function MentorDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Intern Management</h2>

        <nav>
          <a className="active">Dashboard</a>
          <a>Thực tập sinh</a>
          <a>Công việc</a>
          <a>Báo cáo</a>
          <a>Đánh giá</a>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>Dashboard Mentor</h1>
            <p>Quản lý thực tập sinh được phân công</p>
          </div>

          <div className="user">
            <span>MENTOR</span>
            <button onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <section className="table-section">
          <h2>Công việc của Mentor</h2>
          <p>
            Chức năng giao việc, xem báo cáo và đánh giá
            thực tập sinh sẽ được triển khai tại đây.
          </p>
        </section>
      </main>
    </div>
  );
}

export default MentorDashboard;