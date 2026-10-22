import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HRInterns.css";

function HRInterns() {
  const navigate = useNavigate();

  const [interns, setInterns] = useState([]);
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadInterns = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (school.trim()) {
        params.append("school", school.trim());
      }

      if (major.trim()) {
        params.append("major", major.trim());
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/interns/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Không thể lấy danh sách thực tập sinh"
        );
      }

      setInterns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterns();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadInterns();
  };

  const getStatusText = (status) => {
    if (status === "approved") return "Đã duyệt";
    if (status === "rejected") return "Từ chối";
    return "Chờ duyệt";
  };

  const getStatusClass = (status) => {
    if (status === "approved") return "approved";
    if (status === "rejected") return "rejected";
    return "pending";
  };

  const totalInterns = interns.length;

  const approvedCount = interns.filter(
    (intern) => intern.status === "approved"
  ).length;

  const pendingCount = interns.filter(
    (intern) => intern.status === "pending"
  ).length;

  const rejectedCount = interns.filter(
    (intern) => intern.status === "rejected"
  ).length;

  return (
    <div className="hr-page">

      {/* SIDEBAR */}
      <aside className="hr-sidebar">

        <div className="hr-logo">
          Intern<span>Management</span>
        </div>

        <nav className="hr-nav">

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

      {/* MAIN */}
      <main className="hr-main">

        {/* HEADER */}
        <header className="hr-header">

          <div className="hr-header-left">
            <h1>Quản lý thực tập sinh</h1>

            <p>
              Quản lý hồ sơ và quá trình thực tập
            </p>
          </div>

          <div className="hr-user">

            <div className="hr-avatar">
              HR
            </div>

            <span>HR</span>

            <button
              className="hr-logout"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>

          </div>

        </header>

        {/* CONTENT */}
        <div className="hr-content">

          {/* STATISTICS */}
          <div className="hr-stats">

            <div className="hr-stat-card">

              <div className="hr-stat-title">
                Tổng thực tập sinh
              </div>

              <div className="hr-stat-value">
                {totalInterns}
              </div>

            </div>

            <div className="hr-stat-card">

              <div className="hr-stat-title">
                Đã duyệt
              </div>

              <div className="hr-stat-value">
                {approvedCount}
              </div>

            </div>

            <div className="hr-stat-card">

              <div className="hr-stat-title">
                Chờ duyệt
              </div>

              <div className="hr-stat-value">
                {pendingCount}
              </div>

            </div>

          </div>

          {/* TABLE */}
          <section className="hr-table-card">

            <div className="hr-table-header">

              <div className="hr-table-title">

                <h2>
                  Danh sách thực tập sinh
                </h2>

                <p>
                  Theo dõi hồ sơ và trạng thái xét duyệt
                </p>

              </div>

              <button
                className="hr-add-button"
                onClick={() =>
                  navigate("/hr/interns/create")
                }
              >
                + Thêm thực tập sinh
              </button>

            </div>

            {/* FILTER */}
            <form
              className="hr-filter"
              onSubmit={handleSearch}
            >

              <input
                type="text"
                placeholder="🔎  Tìm theo trường..."
                value={school}
                onChange={(e) =>
                  setSchool(e.target.value)
                }
              />

              <input
                type="text"
                placeholder="🔎  Tìm theo ngành..."
                value={major}
                onChange={(e) =>
                  setMajor(e.target.value)
                }
              />

              <button
                className="hr-search-button"
                type="submit"
              >
                Tìm kiếm
              </button>

              <button
                className="hr-clear-button"
                type="button"
                onClick={() => {
                  setSchool("");
                  setMajor("");

                  setTimeout(() => {
                    loadInterns();
                  }, 0);
                }}
              >
                Xóa
              </button>

            </form>

            {loading && (
              <div className="hr-message">
                Đang tải danh sách...
              </div>
            )}

            {error && (
              <div className="hr-error">
                {error}
              </div>
            )}

            {!loading && !error && (

              <div className="hr-table-wrapper">

                <table className="hr-table">

                  <thead>

                    <tr>
                      <th>HỌ TÊN</th>
                      <th>MÃ SV</th>
                      <th>TRƯỜNG</th>
                      <th>NGÀNH</th>
                      <th>VỊ TRÍ</th>
                      <th>TRẠNG THÁI</th>
                      <th>THAO TÁC</th>
                    </tr>

                  </thead>

                  <tbody>

                    {interns.length === 0 ? (

                      <tr>

                        <td
                          colSpan="7"
                          className="hr-message"
                        >
                          Không tìm thấy thực tập sinh
                        </td>

                      </tr>

                    ) : (

                      interns.map((intern) => (

                        <tr key={intern.id}>

                          <td className="hr-name">
                            {intern.full_name}
                          </td>

                          <td>
                            {intern.student_id || "-"}
                          </td>

                          <td className="hr-muted">
                            {intern.school || "-"}
                          </td>

                          <td className="hr-muted">
                            {intern.major || "-"}
                          </td>

                          <td>
                            {intern.internship_position || "-"}
                          </td>

                          <td>

                            <span
                              className={`hr-status ${getStatusClass(
                                intern.status
                              )}`}
                            >
                              {getStatusText(
                                intern.status
                              )}
                            </span>

                          </td>

                          <td>

                            <div className="hr-actions">

                              <button
                                className="hr-action primary"
                                onClick={() =>
                                  navigate(
                                    `/hr/interns/${intern.id}/edit`
                                  )
                                }
                              >
                                Sửa
                              </button>

                              <button
                                className="hr-action document"
                                onClick={() =>
                                  navigate(
                                    `/hr/interns/${intern.id}/documents`
                                  )
                                }
                              >
                                Tài liệu
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default HRInterns;