import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InternApplication.css";

const API_URL = "http://127.0.0.1:8000";

function InternApplication() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const profileResponse = await fetch(
        `${API_URL}/api/interns/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!profileResponse.ok) {
        const data = await profileResponse.json().catch(() => ({}));
        throw new Error(
          data.detail || "Không thể tải hồ sơ thực tập."
        );
      }

      const profileData = await profileResponse.json();
      setProfile(profileData);

      const documentsResponse = await fetch(
        `${API_URL}/api/documents/intern/${profileData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData);
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/interns/me/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Không thể gửi hồ sơ."
        );
      }

      await loadData();

      alert("Hồ sơ đã được gửi thành công.");
    } catch (err) {
      setError(err.message || "Không thể gửi hồ sơ.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "pending":
        return "Chờ duyệt";
      default:
        return "Chưa gửi";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "approved";
      case "rejected":
        return "rejected";
      case "pending":
        return "pending";
      default:
        return "draft";
    }
  };

  const getDocumentType = (type) => {
    if (type === "cv") return "CV";
    if (type === "internship_application") {
      return "Đơn đăng ký thực tập";
    }

    return type;
  };

  const getDocumentStatus = (status) => {
    if (status === "approved") return "Đã duyệt";
    if (status === "rejected") return "Từ chối";
    return "Chờ duyệt";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="intern-application-loading">
        <div className="intern-loading-spinner"></div>
        <p>Đang tải hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="intern-application-page">

      {/* SIDEBAR */}
      <aside className="intern-application-sidebar">

        <div className="intern-application-logo">
          Intern<span>Manage</span>
        </div>

        <nav className="intern-application-nav">

          <button onClick={() => navigate("/")}>
            📊 Dashboard
          </button>

          <button
            className="active"
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

      </aside>

      {/* MAIN */}
      <main className="intern-application-main">

        {/* HEADER */}
        <header className="intern-application-header">

          <div>
            <h1>Hồ sơ thực tập</h1>
            <p>
              Quản lý thông tin và hồ sơ đăng ký thực tập
            </p>
          </div>

          <button
            className="intern-application-logout"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>

        </header>

        {/* CONTENT */}
        <section className="intern-application-content">

          {error && (
            <div className="intern-application-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {profile && (
            <>
              {/* TOP */}
              <div className="intern-application-top">

                <div>
                  <h2>{profile.full_name || "Chưa cập nhật"}</h2>

                  <p>
                    {profile.major || "Chưa cập nhật"} ·{" "}
                    {profile.school || "Chưa cập nhật"}
                  </p>
                </div>

                <div
                  className={`intern-application-status ${getStatusClass(
                    profile.status
                  )}`}
                >
                  <span className="status-dot"></span>
                  {getStatusText(profile.status)}
                </div>

              </div>

              {/* PROFILE */}
              <div className="intern-application-card">

                <div className="intern-application-card-header">
                  <div>
                    <h3>Thông tin cá nhân</h3>
                    <p>
                      Thông tin cơ bản của thực tập sinh
                    </p>
                  </div>
                </div>

                <div className="intern-profile-grid">

                  <div className="intern-profile-item">
                    <span>Họ và tên</span>
                    <strong>
                      {profile.full_name || "—"}
                    </strong>
                  </div>

                  <div className="intern-profile-item">
                    <span>Ngày sinh</span>
                    <strong>
                      {profile.dob || "—"}
                    </strong>
                  </div>

                  <div className="intern-profile-item">
                    <span>Giới tính</span>
                    <strong>
                      {profile.gender || "—"}
                    </strong>
                  </div>

                  <div className="intern-profile-item">
                    <span>Số điện thoại</span>
                    <strong>
                      {profile.phone || "—"}
                    </strong>
                  </div>

                  <div className="intern-profile-item">
                    <span>Email</span>
                    <strong>
                      {profile.email || "—"}
                    </strong>
                  </div>

                  <div className="intern-profile-item">
                    <span>Mã sinh viên</span>
                    <strong>
                      {profile.student_id || "—"}
                    </strong>
                  </div>

                  <div className="intern-profile-item">
                    <span>Địa chỉ</span>
                    <strong>
                      {profile.address || "—"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* EDUCATION */}
              <div className="intern-application-card">

                <div className="intern-application-card-header">
                  <div>
                    <h3>Thông tin học tập</h3>
                    <p>
                      Thông tin trường và chuyên ngành
                    </p>
                  </div>
                </div>

                <div className="intern-profile-grid">

                  <div className="intern-profile-item">
                    <span>Trường</span>
                    <strong>
                      {profile.school || "—"}
                    </strong>
                  </div>

                  <div className="intern-profile-item">
                    <span>Chuyên ngành</span>
                    <strong>
                      {profile.major || "—"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* INTERNSHIP */}
              <div className="intern-application-card">

                <div className="intern-application-card-header">
                  <div>
                    <h3>Thông tin thực tập</h3>
                    <p>
                      Vị trí và thời gian thực tập
                    </p>
                  </div>
                </div>

                <div className="intern-profile-grid">

                  <div className="intern-profile-item">
                    <span>Vị trí thực tập</span>
                    <strong>
                      {profile.internship_position || "—"}
                    </strong>
                  </div>

                  <div className="intern-profile-item">
                    <span>Ngày bắt đầu</span>
                    <strong>
                      {profile.internship_start_date || "—"}
                    </strong>
                  </div>

                  <div className="intern-profile-item">
                    <span>Ngày kết thúc</span>
                    <strong>
                      {profile.internship_end_date || "—"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* DOCUMENTS */}
              <div className="intern-application-card">

                <div className="intern-application-card-header">

                  <div>
                    <h3>Tài liệu thực tập</h3>
                    <p>
                      CV và đơn đăng ký thực tập
                    </p>
                  </div>

                  <span className="intern-document-count">
                    {documents.length} tài liệu
                  </span>

                </div>

                {documents.length === 0 ? (
                  <div className="intern-document-empty">
                    <div>📎</div>
                    <strong>Chưa có tài liệu</strong>
                    <p>
                      Bạn chưa tải lên CV hoặc đơn đăng ký thực tập.
                    </p>
                  </div>
                ) : (
                  <div className="intern-document-list">

                    {documents.map((document) => (
                      <div
                        className="intern-document-item"
                        key={document.id}
                      >

                        <div className="intern-document-icon">
                          📄
                        </div>

                        <div className="intern-document-info">

                          <strong>
                            {document.file_name}
                          </strong>

                          <span>
                            {getDocumentType(
                              document.document_type
                            )}
                          </span>

                        </div>

                        <div
                          className={`intern-document-status ${getStatusClass(
                            document.status
                          )}`}
                        >
                          {getDocumentStatus(document.status)}
                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

              {/* SUBMIT */}
              <div className="intern-submit-card">

                <div>
                  <h3>
                    {profile.status === "rejected"
                      ? "Gửi lại hồ sơ"
                      : "Gửi hồ sơ thực tập"}
                  </h3>

                  <p>
                    {profile.status === "rejected"
                      ? "Hồ sơ đã bị từ chối. Bạn có thể kiểm tra lại thông tin và gửi lại."
                      : profile.status === "pending"
                      ? "Hồ sơ của bạn đang được HR xem xét."
                      : profile.status === "approved"
                      ? "Hồ sơ của bạn đã được HR phê duyệt."
                      : "Kiểm tra thông tin và tài liệu trước khi gửi hồ sơ."}
                  </p>
                </div>

                {profile.status !== "approved" &&
                  profile.status !== "pending" && (
                    <button
                      className="intern-submit-button"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting
                        ? "Đang gửi..."
                        : profile.status === "rejected"
                        ? "Gửi lại hồ sơ"
                        : "Gửi hồ sơ"}
                    </button>
                  )}

              </div>

            </>
          )}

        </section>

      </main>

    </div>
  );
}

export default InternApplication;