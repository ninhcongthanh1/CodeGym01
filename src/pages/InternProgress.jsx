import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./InternProgress.css";

function InternProgress() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    progress_percent: 0,
    status: "in_progress",
    note: "",
  });

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "intern") {
        navigate("/");
        return;
      }
      setUser(decoded);
      fetchProgressList();
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate, token]);

  // Lấy danh sách tiến độ
  const fetchProgressList = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/progress/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Không lấy được dữ liệu");

      const data = await res.json();
      setProgressList(data);
    } catch (err) {
      setMessage("Lỗi khi tải danh sách tiến độ");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "progress_percent" ? Number(value) : value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      progress_percent: 0,
      status: "in_progress",
      note: "",
    });
    setIsEditing(false);
    setEditId(null);
  };

  // Submit form (Tạo mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.title.trim()) {
      setMessage("Vui lòng nhập tiêu đề công việc");
      return;
    }

    try {
      const url = isEditing
        ? `http://localhost:8000/api/progress/${editId}`
        : "http://localhost:8000/api/progress/";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Có lỗi xảy ra");
      }

      setMessage(isEditing ? "Cập nhật thành công!" : "Tạo tiến độ thành công!");
      resetForm();
      fetchProgressList();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Bấm nút Sửa
  const handleEdit = (item) => {
    setForm({
      title: item.title,
      description: item.description || "",
      progress_percent: item.progress_percent,
      status: item.status,
      note: item.note || "",
    });
    setIsEditing(true);
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Hiển thị trạng thái đẹp hơn
  const getStatusLabel = (status) => {
    switch (status) {
      case "in_progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "blocked":
        return "Bị chặn";
      default:
        return status;
    }
  };

  return (
    <div className="progress-page">
      {/* SIDEBAR */}
      <aside className="progress-sidebar">
        <div className="progress-logo">
          Intern<span>Manage</span>
        </div>

        <nav className="progress-nav">
          <button onClick={() => navigate("/")}>📊 Dashboard</button>
          <button onClick={() => navigate("/intern/application")}>
            📄 Hồ sơ thực tập
          </button>
          <button className="active" onClick={() => navigate("/intern/progress")}>
            📈 Cập nhật tiến độ
          </button>
        </nav>

        <div className="progress-sidebar-bottom">
          <div className="progress-sidebar-user">
            <div className="progress-avatar-small">
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
      <main className="progress-main">
        <header className="progress-header">
          <div>
            <h1>Cập nhật tiến độ công việc</h1>
            <p>Ghi lại và cập nhật tiến độ để mentor theo dõi</p>
          </div>

          <div className="progress-header-user">
            <button className="progress-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <section className="progress-content">
          {/* FORM */}
          <div className="progress-form-card">
            <h2>{isEditing ? "Chỉnh sửa tiến độ" : "Thêm tiến độ mới"}</h2>

            {message && (
              <div
                className={`progress-message ${
                  message.includes("thành công") ? "success" : "error"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tiêu đề công việc *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ví dụ: Hoàn thành module đăng nhập"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Mô tả chi tiết công việc..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tiến độ (%)</label>
                  <input
                    type="number"
                    name="progress_percent"
                    value={form.progress_percent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="in_progress">Đang thực hiện</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="blocked">Bị chặn</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Ghi chú thêm (nếu có)..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {isEditing ? "Cập nhật" : "Thêm mới"}
                </button>

                {isEditing && (
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* DANH SÁCH */}
          <div className="progress-list-card">
            <h2>Danh sách tiến độ của bạn</h2>

            {loading ? (
              <p>Đang tải...</p>
            ) : progressList.length === 0 ? (
              <p className="empty-text">Chưa có tiến độ nào. Hãy thêm mới!</p>
            ) : (
              <div className="progress-list">
                {progressList.map((item) => (
                  <div key={item.id} className="progress-item">
                    <div className="progress-item-header">
                      <h3>{item.title}</h3>
                      <span className={`status-badge ${item.status}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    {item.description && <p className="desc">{item.description}</p>}

                    <div className="progress-bar-wrapper">
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${item.progress_percent}%` }}
                        />
                      </div>
                      <span>{item.progress_percent}%</span>
                    </div>

                    {item.note && (
                      <p className="note">
                        <strong>Ghi chú:</strong> {item.note}
                      </p>
                    )}

                    <div className="progress-item-footer">
                      <small>
                        Cập nhật: {new Date(item.updated_at).toLocaleString("vi-VN")}
                      </small>
                      <button className="btn-edit" onClick={() => handleEdit(item)}>
                        Sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default InternProgress;