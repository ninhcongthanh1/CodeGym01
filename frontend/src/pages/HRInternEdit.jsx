import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./HRInternEdit.css";

function HRInternEdit() {
  const { internId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    full_name: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    school: "",
    major: "",
    student_id: "",
    address: "",
    internship_position: "",
    internship_start_date: "",
    internship_end_date: "",
  });

  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  

  useEffect(() => {
    const loadIntern = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/interns/${internId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Không thể lấy thông tin thực tập sinh"
          );
        }

        setForm({
          full_name: data.full_name || "",
          dob: data.dob || "",
          gender: data.gender || "",
          phone: data.phone || "",
          email: data.email || "",
          school: data.school || "",
          major: data.major || "",
          student_id: data.student_id || "",
          address: data.address || "",
          internship_position: data.internship_position || "",
          internship_start_date:
            data.internship_start_date || "",
          internship_end_date:
            data.internship_end_date || "",
        });

        setStatus(data.status || "pending");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadIntern();
  }, [internId, navigate, token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }
    if (
  form.internship_start_date &&
  form.internship_end_date &&
  form.internship_end_date < form.internship_start_date
) {
  setError("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
  return;
}

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/interns/${internId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
  let message = "Không thể cập nhật thông tin";

  if (typeof data.detail === "string") {
    message = data.detail;
  } else if (Array.isArray(data.detail)) {
    message = data.detail
      .map((item) => item?.msg || item?.message || String(item))
      .join(", ");
  } else if (data.detail && typeof data.detail === "object") {
    message =
      data.detail.msg ||
      data.detail.message ||
      JSON.stringify(data.detail);
  }

  throw new Error(message);
}

      setSuccess("Cập nhật thông tin thành công.");

      setStatus(data.status || status);

      setTimeout(() => {
        navigate("/hr/interns");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusText = () => {
    if (status === "approved") return "Đã duyệt";
    if (status === "rejected") return "Từ chối";
    return "Chờ duyệt";
  };

  const getStatusClass = () => {
    if (status === "approved") return "approved";
    if (status === "rejected") return "rejected";
    return "pending";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="edit-page">
        <div className="edit-main">
          <div className="edit-loading">
            Đang tải thông tin thực tập sinh...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-page">

      <aside className="edit-sidebar">

        <div className="edit-logo">
          Intern<span>Management</span>
        </div>

        <nav className="edit-nav">

          <button onClick={() => navigate("/")}>
            📊 &nbsp; Dashboard
          </button>

          <button
            className="active"
            onClick={() => navigate("/hr/interns")}
          >
            👨‍🎓 &nbsp; Thực tập sinh
          </button>

          <button>
            📄 &nbsp; Tài liệu
          </button>

          <button>
            👥 &nbsp; Người dùng
          </button>

        </nav>

      </aside>

      <main className="edit-main">

        <header className="edit-header">

          <div className="edit-header-left">
            <h1>Chỉnh sửa thực tập sinh</h1>
            <p>
              Cập nhật thông tin hồ sơ thực tập
            </p>
          </div>

          <div className="edit-user">

            <div className="edit-avatar">
              HR
            </div>

            <span>HR</span>

            <button
              className="edit-logout"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>

          </div>

        </header>

        <div className="edit-content">

          <button
            className="edit-back"
            onClick={() => navigate("/hr/interns")}
          >
            ← Quay lại danh sách
          </button>

          <section className="edit-card">

            <div className="edit-card-header">

              <div>
                <h2>Thông tin thực tập sinh</h2>

                <p>
                  Cập nhật thông tin cá nhân, học tập và thực tập
                </p>
              </div>

              <span
                className={`edit-status ${getStatusClass()}`}
              >
                {getStatusText()}
              </span>

            </div>

            <form
              className="edit-form"
              onSubmit={handleSubmit}
            >

              {error && (
                <div className="edit-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="edit-success">
                  {success}
                </div>
              )}

              {/* THÔNG TIN CÁ NHÂN */}

              <div className="edit-section">

                <div className="edit-section-title">

                  <div className="edit-section-number">
                    01
                  </div>

                  <h3>Thông tin cá nhân</h3>

                </div>

                <div className="edit-grid">

                  <div className="edit-field">

                    <label>Họ và tên *</label>

                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="edit-field">

                    <label>Mã sinh viên</label>

                    <input
                      type="text"
                      name="student_id"
                      value={form.student_id}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="edit-field">

                    <label>Ngày sinh</label>

                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="edit-field">

                    <label>Giới tính</label>

                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="">
                        Chọn giới tính
                      </option>

                      <option value="male">
                        Nam
                      </option>

                      <option value="female">
                        Nữ
                      </option>

                      <option value="other">
                        Khác
                      </option>
                    </select>

                  </div>

                  <div className="edit-field">

                    <label>Số điện thoại</label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="edit-field">

                    <label>Email *</label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="edit-field full">

                    <label>Địa chỉ</label>

                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </div>

              {/* THÔNG TIN HỌC TẬP */}

              <div className="edit-section">

                <div className="edit-section-title">

                  <div className="edit-section-number">
                    02
                  </div>

                  <h3>Thông tin học tập</h3>

                </div>

                <div className="edit-grid">

                  <div className="edit-field">

                    <label>Trường</label>

                    <input
                      type="text"
                      name="school"
                      value={form.school}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="edit-field">

                    <label>Chuyên ngành</label>

                    <input
                      type="text"
                      name="major"
                      value={form.major}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </div>

              {/* THÔNG TIN THỰC TẬP */}

              <div className="edit-section">

                <div className="edit-section-title">

                  <div className="edit-section-number">
                    03
                  </div>

                  <h3>Thông tin thực tập</h3>

                </div>

                <div className="edit-grid">

                  <div className="edit-field">

                    <label>Vị trí thực tập</label>

                    <input
                      type="text"
                      name="internship_position"
                      value={form.internship_position}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="edit-field">
                  </div>

                  <div className="edit-field">

                    <label>Ngày bắt đầu</label>

                    <input
                      type="date"
                      name="internship_start_date"
                      value={form.internship_start_date}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="edit-field">

                    <label>Ngày kết thúc</label>

                    <input
                      type="date"
                      name="internship_end_date"
                      value={form.internship_end_date}
                      min={form.internship_start_date || undefined}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </div>

              <div className="edit-account-info">

                <strong>
                  🔐 Tài khoản hệ thống
                </strong>

                Thông tin tài khoản đăng nhập của thực tập
                sinh được quản lý riêng. Việc chỉnh sửa hồ
                sơ này không thay đổi mật khẩu tài khoản.

              </div>

              <div className="edit-actions">

                <button
                  type="button"
                  className="edit-cancel"
                  onClick={() =>
                    navigate("/hr/interns")
                  }
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="edit-submit"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : "✓ Lưu thay đổi"}
                </button>

              </div>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
}

export default HRInternEdit;