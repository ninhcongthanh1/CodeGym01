import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HRInternCreate.css";

function HRInternCreate() {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/interns/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Không thể tạo thực tập sinh"
        );
      }

      setSuccess(
        "Tạo hồ sơ thực tập sinh thành công. Tài khoản intern đã được tạo tự động."
      );

      setTimeout(() => {
        navigate("/hr/interns");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="create-page">

      <aside className="create-sidebar">

        <div className="create-logo">
          Intern<span>Management</span>
        </div>

        <nav className="create-nav">

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

      <main className="create-main">

        <header className="create-header">

          <div className="create-header-left">
            <h1>Thêm thực tập sinh</h1>
            <p>
              Tạo hồ sơ và tài khoản cho thực tập sinh
            </p>
          </div>

          <div className="create-user">

            <div className="create-avatar">
              HR
            </div>

            <span>HR</span>

            <button
              className="create-logout"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>

          </div>

        </header>

        <div className="create-content">

          <button
            className="create-back"
            onClick={() => navigate("/hr/interns")}
          >
            ← Quay lại danh sách
          </button>

          <section className="create-card">

            <div className="create-card-header">
              <h2>Thông tin thực tập sinh</h2>
              <p>
                Điền đầy đủ thông tin để tạo hồ sơ thực tập
              </p>
            </div>

            <form
              className="create-form"
              onSubmit={handleSubmit}
            >

              {error && (
                <div className="create-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="create-success">
                  {success}
                </div>
              )}

              {/* THÔNG TIN CÁ NHÂN */}

              <div className="create-section">

                <div className="create-section-title">

                  <div className="create-section-number">
                    01
                  </div>

                  <h3>Thông tin cá nhân</h3>

                </div>

                <div className="create-grid">

                  <div className="create-field">

                    <label>Họ và tên *</label>

                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      required
                    />

                  </div>

                  <div className="create-field">

                    <label>Mã sinh viên</label>

                    <input
                      type="text"
                      name="student_id"
                      value={form.student_id}
                      onChange={handleChange}
                      placeholder="SV001"
                    />

                  </div>

                  <div className="create-field">

                    <label>Ngày sinh</label>

                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="create-field">

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

                  <div className="create-field">

                    <label>Số điện thoại</label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="09xxxxxxxx"
                    />

                  </div>

                  <div className="create-field">

                    <label>Email *</label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="example@gmail.com"
                      required
                    />

                  </div>

                  <div className="create-field full">

                    <label>Địa chỉ</label>

                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Địa chỉ hiện tại"
                    />

                  </div>

                </div>

              </div>

              {/* THÔNG TIN HỌC TẬP */}

              <div className="create-section">

                <div className="create-section-title">

                  <div className="create-section-number">
                    02
                  </div>

                  <h3>Thông tin học tập</h3>

                </div>

                <div className="create-grid">

                  <div className="create-field">

                    <label>Trường</label>

                    <input
                      type="text"
                      name="school"
                      value={form.school}
                      onChange={handleChange}
                      placeholder="Tên trường đại học"
                    />

                  </div>

                  <div className="create-field">

                    <label>Chuyên ngành</label>

                    <input
                      type="text"
                      name="major"
                      value={form.major}
                      onChange={handleChange}
                      placeholder="Công nghệ thông tin"
                    />

                  </div>

                </div>

              </div>

              {/* THÔNG TIN THỰC TẬP */}

              <div className="create-section">

                <div className="create-section-title">

                  <div className="create-section-number">
                    03
                  </div>

                  <h3>Thông tin thực tập</h3>

                </div>

                <div className="create-grid">

                  <div className="create-field">

                    <label>Vị trí thực tập</label>

                    <input
                      type="text"
                      name="internship_position"
                      value={form.internship_position}
                      onChange={handleChange}
                      placeholder="Frontend Developer"
                    />

                  </div>

                  <div className="create-field">
                  </div>

                  <div className="create-field">

                    <label>Ngày bắt đầu</label>

                    <input
                      type="date"
                      name="internship_start_date"
                      value={form.internship_start_date}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="create-field">

                    <label>Ngày kết thúc</label>

                    <input
                      type="date"
                      name="internship_end_date"
                      value={form.internship_end_date}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </div>

              {/* TÀI KHOẢN */}

              <div className="create-account-info">

                <strong>
                  🔐 Tài khoản hệ thống
                </strong>

                Sau khi tạo hồ sơ, hệ thống sẽ tự động
                tạo tài khoản với username dựa trên mã
                sinh viên và mật khẩu mặc định.

              </div>

              {/* ACTIONS */}

              <div className="create-actions">

                <button
                  type="button"
                  className="create-cancel"
                  onClick={() =>
                    navigate("/hr/interns")
                  }
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="create-submit"
                  disabled={loading}
                >
                  {loading
                    ? "Đang tạo..."
                    : "✓ Tạo thực tập sinh"}
                </button>

              </div>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
}

export default HRInternCreate;