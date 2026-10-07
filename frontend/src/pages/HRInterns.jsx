import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMentorsWorkload, assignMentor } from "../services/api";
import "./HRInterns.css";

function HRInterns() {
  const navigate = useNavigate();

  const [interns, setInterns] = useState([]);
  const [mentorsWorkload, setMentorsWorkload] = useState([]);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
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

  const loadWorkload = async () => {
    try {
      const data = await getMentorsWorkload(token);
      setMentorsWorkload(data);
      setShowWorkloadModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignMentor = async (internId, mentorId) => {
    if (!mentorId) return;
    try {
      await assignMentor(token, internId, mentorId);
      alert("Phân công mentor thành công!");
      loadInterns();
    } catch (err) {
      alert(err.message);
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

          <button onClick={loadWorkload}>
            👨‍🏫 &nbsp; Xem Workload Mentor
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
            <p>Quản lý hồ sơ, quá trình thực tập và phân công mentor</p>
          </div>

          <div className="hr-user">
            <div className="hr-avatar">HR</div>
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
              <div className="hr-stat-title">Tổng thực tập sinh</div>
              <div className="hr-stat-value">{totalInterns}</div>
            </div>

            <div className="hr-stat-card">
              <div className="hr-stat-title">Đã duyệt</div>
              <div className="hr-stat-value">{approvedCount}</div>
            </div>

            <div className="hr-stat-card">
              <div className="hr-stat-title">Chờ duyệt</div>
              <div className="hr-stat-value">{pendingCount}</div>
            </div>
          </div>

          {/* TABLE */}
          <section className="hr-table-card">
            <div className="hr-table-header">
              <div className="hr-table-title">
                <h2>Danh sách thực tập sinh</h2>
                <p>Theo dõi hồ sơ, trạng thái và phân công mentor</p>
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
                placeholder="🔎 Tìm theo trường..."
                value={school}
                onChange={(e) =>
                  setSchool(e.target.value)
                }
              />

              <input
                type="text"
                placeholder="🔎 Tìm theo ngành..."
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
                      <th>TRẠNG THÁI</th>
                      <th>MENTOR PHỤ TRÁCH</th>
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
                            {/* Chọn mentor gán trực tiếp */}
                            <select
                              defaultValue={intern.mentor_id || ""}
                              onChange={(e) =>
                                handleAssignMentor(
                                  intern.id,
                                  e.target.value
                                )
                              }
                              style={{ padding: "4px 8px", borderRadius: "4px" }}
                            >
                              <option value="" disabled>
                                -- Chọn Mentor --
                              </option>
                              {mentorsWorkload.map((m) => (
                                <option key={m.mentor_id} value={m.mentor_id}>
                                  {m.full_name} ({m.intern_count} TTS)
                                </option>
                              ))}
                            </select>
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

      {/* MODAL XEM WORKLOAD MENTOR */}
      {showWorkloadModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "500px", maxWidth: "90%" }}>
            <h3>Khối lượng công việc của Mentor (Workload)</h3>
            <table style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Tên Mentor</th>
                  <th style={{ padding: "8px" }}>Email</th>
                  <th style={{ padding: "8px" }}>Số lượng TTS</th>
                </tr>
              </thead>
              <tbody>
                {mentorsWorkload.map((m) => (
                  <tr key={m.mentor_id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{m.full_name}</td>
                    <td style={{ padding: "8px" }}>{m.email}</td>
                    <td style={{ padding: "8px", fontWeight: "bold", textAlign: "center" }}>{m.intern_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setShowWorkloadModal(false)}
              style={{ marginTop: "20px", padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default HRInterns;