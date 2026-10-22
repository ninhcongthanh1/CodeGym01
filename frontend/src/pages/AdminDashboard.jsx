import { useNavigate } from "react-router-dom";

function AdminDashboard() {
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
          <a>Người dùng</a>
          <a>Phân quyền</a>
          <a>Activity Logs</a>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>Dashboard Admin</h1>
            <p>Quản trị hệ thống</p>
          </div>

          <div className="user">
            <span>ADMIN</span>
            <button onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <section className="cards">
          <div className="card">
            <p>Quản lý tài khoản</p>
            <h2>US39</h2>
          </div>

          <div className="card">
            <p>Phân quyền</p>
            <h2>US40</h2>
          </div>

          <div className="card">
            <p>Sao lưu</p>
            <h2>US41</h2>
          </div>

          <div className="card">
            <p>Activity Logs</p>
            <h2>US42</h2>
          </div>
        </section>

        <section className="table-section">
          <h2>Khu vực quản trị</h2>
          <p>
            Các chức năng quản trị hệ thống sẽ được triển khai tại đây.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;