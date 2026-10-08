import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./HRInternDocuments.css";

function HRInternDocuments() {
  const { internId } = useParams();
  const navigate = useNavigate();

  const [intern, setIntern] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");

  const loadData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const internResponse = await fetch(
        `http://127.0.0.1:8000/api/interns/${internId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const internData = await internResponse.json();

      if (!internResponse.ok) {
        throw new Error(
          internData.detail || "Không thể lấy thông tin thực tập sinh"
        );
      }

      const documentResponse = await fetch(
        `http://127.0.0.1:8000/api/documents/intern/${internId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const documentData = await documentResponse.json();

      if (!documentResponse.ok) {
        throw new Error(
          documentData.detail || "Không thể lấy danh sách tài liệu"
        );
      }

      setIntern(internData);
      setDocuments(documentData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [internId]);

  const updateDocumentStatus = async (documentId, action) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/documents/${documentId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Không thể cập nhật trạng thái tài liệu"
        );
      }

      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === documentId
            ? { ...document, status: data.status }
            : document
        )
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewFile = async (documentId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/documents/${documentId}/file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Không thể mở tài liệu");
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);

      window.open(fileUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (err) {
      setError(err.message);
    }
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

  const getDocumentTypeText = (type) => {
    if (type === "cv") return "CV";
    if (type === "internship_application") {
      return "Đơn đăng ký thực tập";
    }
    if (type === "internship_contract") {
      return "Hợp đồng thực tập";
    }

    return type;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setError("");
    setUploadSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(extension)) {
      setSelectedFile(null);
      setError("Chỉ chấp nhận tệp PDF, DOC hoặc DOCX.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setError("Dung lượng tệp không được vượt quá 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadContract = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Vui lòng chọn hợp đồng cần tải lên.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setUploadSuccess("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `http://127.0.0.1:8000/api/documents/intern/${internId}/contract`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Không thể tải hợp đồng lên.");
      }

      setDocuments((currentDocuments) => [data, ...currentDocuments]);
      setSelectedFile(null);
      setUploadSuccess("Hợp đồng đã được tải lên thành công.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="document-page">
        <div className="document-main">
          <div className="document-message">
            Đang tải thông tin...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-page">

      <aside className="document-sidebar">
        <div className="document-logo">
          Intern<span>Management</span>
        </div>

        <nav className="document-nav">
          <button onClick={() => navigate("/")}>
            📊 &nbsp; Dashboard
          </button>

          <button
            className="active"
            onClick={() => navigate("/hr/interns")}
          >
            👨‍🎓 &nbsp; Thực tập sinh
          </button>

          <button className="active">
            📄 &nbsp; Tài liệu
          </button>

          <button>
            👥 &nbsp; Người dùng
          </button>
        </nav>
      </aside>

      <main className="document-main">

        <header className="document-header">
          <div className="document-header-left">
            <h1>Kiểm tra hồ sơ</h1>
            <p>Xem và xét duyệt tài liệu thực tập sinh</p>
          </div>

          <div className="document-user">
            <div className="document-avatar">
              HR
            </div>

            <span>HR</span>

            <button
              className="document-logout"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <div className="document-content">

          <button
            className="document-back"
            onClick={() => navigate("/hr/interns")}
          >
            ← Quay lại danh sách
          </button>

          {error && (
            <div className="document-error">
              {error}
            </div>
          )}

          {intern && (
            <section className="document-profile">

              <div className="document-profile-header">

                <div className="document-profile-avatar">
                  {intern.full_name?.charAt(0)?.toUpperCase() || "I"}
                </div>

                <div className="document-profile-name">
                  <h2>{intern.full_name}</h2>
                  <p>
                    Mã sinh viên: {intern.student_id || "-"}
                  </p>
                </div>

              </div>

              <div className="document-profile-info">

                <div className="document-info-item">
                  <div className="document-info-label">
                    TRƯỜNG
                  </div>

                  <div className="document-info-value">
                    {intern.school || "-"}
                  </div>
                </div>

                <div className="document-info-item">
                  <div className="document-info-label">
                    NGÀNH
                  </div>

                  <div className="document-info-value">
                    {intern.major || "-"}
                  </div>
                </div>

                <div className="document-info-item">
                  <div className="document-info-label">
                    VỊ TRÍ THỰC TẬP
                  </div>

                  <div className="document-info-value">
                    {intern.internship_position || "-"}
                  </div>
                </div>

              </div>

            </section>
          )}

          <section className="document-upload-card">
            <div className="document-upload-heading">
              <div className="document-upload-icon">↥</div>
              <div>
                <h2>Tải hợp đồng thực tập</h2>
                <p>
                  Tải hợp đồng lên hồ sơ của {intern?.full_name || "thực tập sinh"}.
                  Hỗ trợ PDF, DOC, DOCX (tối đa 5 MB).
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadContract}>
              <label className="document-upload-dropzone" htmlFor="contract-file">
                <span className="document-upload-cloud">↑</span>
                <strong>
                  {selectedFile
                    ? selectedFile.name
                    : "Chọn tệp hợp đồng để tải lên"}
                </strong>
                <span>
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : "Nhấn để duyệt tệp trên thiết bị"}
                </span>
                <input
                  ref={fileInputRef}
                  id="contract-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>

              <div className="document-upload-footer">
                <span className="document-upload-hint">
                  PDF, DOC hoặc DOCX • tối đa 5 MB
                </span>
                <button
                  className="document-upload-button"
                  type="submit"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? "Đang tải lên..." : "Tải hợp đồng lên"}
                </button>
              </div>

              {uploadSuccess && (
                <p className="document-upload-success" role="status">
                  {uploadSuccess}
                </p>
              )}
            </form>
          </section>

          <section className="document-card">

            <div className="document-card-header">
              <h2>Tài liệu hồ sơ <span>{documents.length}</span></h2>
              <p>
                Kiểm tra từng tài liệu trước khi phê duyệt hồ sơ
              </p>
            </div>

            {documents.length === 0 ? (
              <div className="document-message">
                Chưa có tài liệu nào được tải lên
              </div>
            ) : (
              <div className="document-list">

                {documents.map((document) => (

                  <div
                    className="document-item"
                    key={document.id}
                  >

                    <div className="document-file">

                      <div className="document-file-icon">
                        📄
                      </div>

                      <div>
                        <div className="document-file-name">
                          {document.file_name}
                        </div>

                        <div className="document-file-type">
                          {getDocumentTypeText(
                            document.document_type
                          )}
                        </div>
                      </div>

                    </div>

                    <span
                      className={`document-status ${getStatusClass(
                        document.status
                      )}`}
                    >
                      {getStatusText(document.status)}
                    </span>

                    <div className="document-actions">

                      <button
                        className="document-button view"
                        onClick={() =>
                          handleViewFile(document.id)
                        }
                      >
                        👁 Xem
                      </button>

                      <button
                        className="document-button approve"
                        onClick={() =>
                          updateDocumentStatus(
                            document.id,
                            "approve"
                          )
                        }
                      >
                        ✓ Duyệt
                      </button>

                      <button
                        className="document-button reject"
                        onClick={() =>
                          updateDocumentStatus(
                            document.id,
                            "reject"
                          )
                        }
                      >
                        ✕ Từ chối
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default HRInternDocuments;