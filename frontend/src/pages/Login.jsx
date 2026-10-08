import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Tên đăng nhập hoặc mật khẩu không đúng."
        );
      }

      localStorage.setItem("token", data.access_token);

      const decoded = jwtDecode(data.access_token);

      if (decoded.role === "admin") {
        navigate("/");
      } else if (decoded.role === "hr") {
        navigate("/");
      } else if (decoded.role === "mentor") {
        navigate("/");
      } else if (decoded.role === "intern") {
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT */}
      <div className="login-left">
        <div className="login-brand">
          Intern<span>Manage</span>
        </div>

        <div className="login-intro">
          <div className="login-icon">
            🎓
          </div>

          <h1>
            Quản lý thực tập sinh
            <br />
            <span>đơn giản và hiệu quả</span>
          </h1>

          <p>
            Hệ thống hỗ trợ HR, Mentor và thực tập sinh
            trong toàn bộ quá trình thực tập.
          </p>
        </div>

        <div className="login-features">
          <div className="login-feature">
            <div className="feature-icon">✓</div>
            <div>
              <strong>Quản lý tập trung</strong>
              <span>Thông tin thực tập sinh được quản lý dễ dàng.</span>
            </div>
          </div>

          <div className="login-feature">
            <div className="feature-icon">✓</div>
            <div>
              <strong>Phân quyền rõ ràng</strong>
              <span>Mỗi vai trò có quyền truy cập phù hợp.</span>
            </div>
          </div>

          <div className="login-feature">
            <div className="feature-icon">✓</div>
            <div>
              <strong>Theo dõi hồ sơ</strong>
              <span>Quản lý CV và hồ sơ thực tập nhanh chóng.</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">

        <div className="login-card">

          <div className="login-card-header">
            <div className="login-mobile-logo">
              Intern<span>Manage</span>
            </div>

            <h2>Đăng nhập</h2>

            <p>
              Đăng nhập vào tài khoản của bạn để tiếp tục.
            </p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="login-field">
              <label htmlFor="username">
                Tên đăng nhập
              </label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  👤
                </span>

                <input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">
                Mật khẩu
              </label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

          </form>

          <div className="login-footer">
            <span>Intern Management System</span>
            <span>•</span>
            <span>CodeGym01</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;