import { useState, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function ReviewDocuments() {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/documents/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải tài liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  const handleReview = async (status) => {
    if (!selectedDoc) return;
    try {
      const bodyPayload = {
        status: status,
      };

      // Nếu từ chối thì gửi kèm reject_reason
      if (status === "REJECTED") {
        bodyPayload.reject_reason = rejectReason;
      }

      const res = await fetch(`${API_BASE_URL}/api/documents/${selectedDoc.id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        alert(`Đã cập nhật trạng thái: ${status}`);
        setSelectedDoc(null);
        setRejectReason("");
        fetchDocuments();
      } else {
        const errData = await res.json();
        alert(`Lỗi: ${errData.detail || JSON.stringify(errData)}`);
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi kết nối!");
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(`Không thể tải file: ${errData.detail || "Lỗi xác thực hoặc không tìm thấy file"}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `document_${docId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi tải file:", err);
      alert("Đã xảy ra lỗi khi tải file!");
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (filter === "ALL") return true;
    return doc.status === filter;
  });

  const getDocName = (doc) => {
    return (
      doc.file_name ||
      doc.filename ||
      doc.title ||
      doc.original_filename ||
      `Tài liệu #${doc.id}`
    );
  };

  const getDocType = (doc) => {
    return doc.doc_type || doc.document_type || doc.type || "Chung";
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: "#fef3c7", color: "#d97706", text: "Chờ duyệt" },
      APPROVED: { bg: "#dcfce7", color: "#15803d", text: "Đã duyệt" },
      REJECTED: { bg: "#fee2e2", color: "#b91c1c", text: "Từ chối" },
    };
    const current = styles[status] || { bg: "#f3f4f6", color: "#374151", text: status || "Chưa rõ" };
    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
          backgroundColor: current.bg,
          color: current.color,
        }}
      >
        {current.text}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "30px auto", fontFamily: "Arial, sans-serif", padding: "0 16px" }}>
      <h2 style={{ color: "#1e293b", marginBottom: "20px" }}>Quản lý & Duyệt tài liệu</h2>

      {/* Ô nhập Token HR */}
      <div style={{ marginBottom: "20px", padding: "14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
        <label style={{ fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Token HR (JWT): </label>
        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <input
            type="text"
            placeholder="Dán mã Bearer token của tài khoản HR vào đây..."
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              localStorage.setItem("token", e.target.value);
            }}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
          />
          <button
            onClick={fetchDocuments}
            style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Tải lại
          </button>
        </div>
      </div>

      {/* Tabs lọc */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[
          { key: "ALL", label: "Tất cả" },
          { key: "PENDING", label: "Chờ duyệt" },
          { key: "APPROVED", label: "Đã duyệt" },
          { key: "REJECTED", label: "Từ chối" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: filter === tab.key ? "#2563eb" : "#fff",
              color: filter === tab.key ? "#fff" : "#475569",
              fontWeight: filter === tab.key ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bảng danh sách */}
      {loading ? (
        <p>Đang tải danh sách tài liệu...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }}>
              <th style={{ padding: "12px" }}>ID</th>
              <th style={{ padding: "12px" }}>Tên file</th>
              <th style={{ padding: "12px" }}>Loại</th>
              <th style={{ padding: "12px" }}>Trạng thái</th>
              <th style={{ padding: "12px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  Chưa có tài liệu nào hoặc chưa nhập Token HR hợp lệ
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px" }}>#{doc.id}</td>
                  <td style={{ padding: "12px", fontWeight: "500" }}>{getDocName(doc)}</td>
                  <td style={{ padding: "12px", color: "#64748b" }}>{getDocType(doc)}</td>
                  <td style={{ padding: "12px" }}>{getStatusBadge(doc.status)}</td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        setRejectReason(doc.reject_reason || "");
                      }}
                      style={{
                        padding: "6px 14px",
                        background: "#0284c7",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Duyệt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Modal Duyệt */}
      {selectedDoc && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", width: "480px" }}>
            <h3 style={{ marginTop: 0 }}>Duyệt tài liệu #{selectedDoc.id}</h3>
            <p><strong>Tên tài liệu:</strong> {getDocName(selectedDoc)}</p>
            <p>
              <strong>Xem file:</strong>{" "}
              <button
                type="button"
                onClick={() => handleDownload(selectedDoc.id, getDocName(selectedDoc))}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "14px",
                }}
              >
                Tải / Mở file
              </button>
            </p>

            <div style={{ marginTop: "14px" }}>
              <label><strong>Lý do từ chối / Ghi chú:</strong></label>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối (ví dụ: Ảnh bị mờ, vui lòng tải lại bản rõ hơn)..."
                style={{
                  width: "100%",
                  marginTop: "6px",
                  padding: "8px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <button
                onClick={() => setSelectedDoc(null)}
                style={{ padding: "8px 14px", border: "1px solid #cbd5e1", background: "#f1f5f9", cursor: "pointer", borderRadius: "4px" }}
              >
                Đóng
              </button>
              <button
                onClick={() => handleReview("REJECTED")}
                style={{ padding: "8px 14px", border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", borderRadius: "4px" }}
              >
                Từ chối
              </button>
              <button
                onClick={() => handleReview("APPROVED")}
                style={{ padding: "8px 14px", border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", borderRadius: "4px" }}
              >
                Phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}