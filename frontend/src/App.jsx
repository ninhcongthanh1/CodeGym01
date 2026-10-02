import { useEffect, useState } from 'react'
import './App.css'

const TOKEN_KEY = 'intern-profile-token'
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']

function getErrorMessage(payload, fallback) {
  if (typeof payload?.detail === 'string') return payload.detail
  if (Array.isArray(payload?.detail)) {
    return payload.detail.map((item) => item.msg).join(', ')
  }
  return fallback
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [profile, setProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(() => !localStorage.getItem(TOKEN_KEY))
  const [authMode, setAuthMode] = useState('login')
  const [credentials, setCredentials] = useState({ username: '', email: '', password: '' })
  const [details, setDetails] = useState({ school: '', major: '', phone: '' })
  const [cvFile, setCvFile] = useState(null)
  const [applicationFile, setApplicationFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!token) return
    fetch('/api/intern-profile/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem(TOKEN_KEY)
            setToken(null)
          }
          throw new Error(getErrorMessage(payload, 'Không thể tải hồ sơ.'))
        }
        setProfile(payload)
        if (payload) {
          setDetails({ school: payload.school, major: payload.major, phone: payload.phone })
        }
      })
      .catch((error) => setNotice({ type: 'error', text: error.message }))
      .finally(() => setProfileLoaded(true))
  }, [token])

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setNotice(null)
    try {
      let body
      let headers
      if (authMode === 'register') {
        body = JSON.stringify(credentials)
        headers = { 'Content-Type': 'application/json' }
      } else {
        body = new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
        })
        headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
      }

      const response = await fetch(`/api/auth/${authMode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        headers,
        body,
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(getErrorMessage(payload, 'Không thể xác thực tài khoản.'))
      localStorage.setItem(TOKEN_KEY, payload.access_token)
      setProfileLoaded(false)
      setToken(payload.access_token)
      setNotice({ type: 'success', text: 'Đăng nhập thành công. Hãy hoàn thiện hồ sơ của bạn.' })
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }

  function validateFile(file, label) {
    if (!file) return true
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setNotice({ type: 'error', text: `${label}: chỉ nhận file PDF, DOC hoặc DOCX.` })
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      setNotice({ type: 'error', text: `${label}: dung lượng tối đa là 10 MB.` })
      return false
    }
    setNotice(null)
    return true
  }

  function handleFileChange(event, setFile, label) {
    const file = event.target.files?.[0]
    if (validateFile(file, label)) setFile(file ?? null)
    else event.target.value = ''
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    if (!profile && (!cvFile || !applicationFile)) {
      setNotice({ type: 'error', text: 'Hồ sơ mới cần có cả CV và đơn xin thực tập.' })
      return
    }

    setBusy(true)
    setNotice(null)
    const formData = new FormData()
    Object.entries(details).forEach(([key, value]) => formData.append(key, value))
    if (cvFile) formData.append('cv_file', cvFile)
    if (applicationFile) formData.append('application_file', applicationFile)

    try {
      const response = await fetch('/api/intern-profile/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(getErrorMessage(payload, 'Không thể lưu hồ sơ.'))
      setProfile(payload)
      setCvFile(null)
      setApplicationFile(null)
      setNotice({ type: 'success', text: 'Hồ sơ đã được lưu và cập nhật thành công.' })
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }

  async function downloadDocument(documentType, filename) {
    try {
      const response = await fetch(`/api/intern-profile/me/files/${documentType}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(getErrorMessage(payload, 'Không thể tải tài liệu.'))
      }
      const objectUrl = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setProfile(null)
    setProfileLoaded(true)
    setDetails({ school: '', major: '', phone: '' })
    setNotice(null)
  }

  const completedItems = [
    Boolean(details.school.trim()),
    Boolean(details.major.trim()),
    Boolean(details.phone.trim()),
    Boolean(cvFile || profile?.cv_filename),
    Boolean(applicationFile || profile?.application_filename),
  ].filter(Boolean).length
  const completion = Math.round((completedItems / 5) * 100)

  if (!token) {
    return (
      <main className="auth-layout">
        <section className="auth-panel">
          <a className="brand" href="/" aria-label="Trang chủ Internly">
            <span className="brand-mark">i</span>
            <span>internly<span className="brand-period">.</span></span>
          </a>
          <div className="auth-copy">
            <p className="eyebrow">HỒ SƠ THỰC TẬP · 2026</p>
            <h1>{authMode === 'register' ? 'Bắt đầu hành trình.' : 'Chào mừng trở lại.'}</h1>
            <p>Đăng nhập để hoàn thiện hồ sơ và gửi tài liệu ứng tuyển của bạn.</p>
          </div>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <label className="field">
              <span>Tên đăng nhập</span>
              <input
                autoComplete="username"
                minLength="3"
                required
                value={credentials.username}
                onChange={(event) => setCredentials({ ...credentials, username: event.target.value })}
                placeholder="vd: nguyenvana"
              />
            </label>
            {authMode === 'register' && (
              <label className="field">
                <span>Email</span>
                <input
                  autoComplete="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
                  placeholder="ban@email.com"
                />
              </label>
            )}
            <label className="field">
              <span>Mật khẩu</span>
              <input
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                type="password"
                minLength="8"
                required
                value={credentials.password}
                onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
                placeholder="Ít nhất 8 ký tự"
              />
            </label>
            {notice && <p className={`notice ${notice.type}`} role="alert">{notice.text}</p>}
            <button className="primary-button auth-submit" type="submit" disabled={busy}>
              {busy ? 'Đang xử lý...' : authMode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}
              <span aria-hidden="true">↗</span>
            </button>
          </form>
          <p className="auth-switch">
            {authMode === 'register' ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'register' ? 'login' : 'register')
                setNotice(null)
              }}
            >
              {authMode === 'register' ? 'Đăng nhập' : 'Đăng ký thực tập sinh'}
            </button>
          </p>
          <span className="auth-note">Mỗi bước nhỏ đưa bạn gần hơn với cơ hội phù hợp.</span>
        </section>
        <aside className="auth-aside" aria-label="Thông tin chương trình">
          <div className="aside-grid" />
          <div className="aside-content">
            <span className="aside-index">01 / 03</span>
            <p className="aside-quote">Một hồ sơ tốt mở ra những cuộc trò chuyện tốt.</p>
            <span className="aside-caption">HỒ SƠ CỦA BẠN, CƠ HỘI CỦA BẠN</span>
          </div>
          <span className="aside-year">INTERNSHIP SEASON 2026</span>
        </aside>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Internly">
          <span className="brand-mark">i</span>
          <span>internly<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="season-label"><span /> MÙA THỰC TẬP 2026</span>
          <button className="quiet-button" type="button" onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      <main className="workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">KHU VỰC ỨNG VIÊN <span>/</span> HỒ SƠ CÁ NHÂN</p>
            <h1>Hoàn thiện hồ sơ<span className="heading-dot">.</span></h1>
            <p className="page-subtitle">Thông tin đầy đủ giúp nhà tuyển dụng hiểu rõ hơn về bạn.</p>
          </div>
          <div className="completion-stamp" aria-label={`Đã hoàn thành ${completion}%`}>
            <span className="completion-number">{completion}<small>%</small></span>
            <span className="completion-label">HOÀN THÀNH</span>
          </div>
        </div>

        <div className="progress-track" aria-hidden="true"><span style={{ width: `${completion}%` }} /></div>

        {notice && <p className={`notice ${notice.type} page-notice`} role="status">{notice.text}</p>}

        <div className="content-grid">
          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <section className="form-section">
              <div className="section-heading">
                <span className="section-number">01</span>
                <div>
                  <h2>Thông tin học vấn</h2>
                  <p>Cho chúng tôi biết về nền tảng học tập của bạn.</p>
                </div>
              </div>
              <div className="fields-grid">
                <label className="field field-wide">
                  <span>Trường / cơ sở đào tạo <b>*</b></span>
                  <input
                    autoComplete="organization"
                    maxLength="150"
                    minLength="2"
                    required
                    value={details.school}
                    onChange={(event) => setDetails({ ...details, school: event.target.value })}
                    placeholder="Ví dụ: Đại học Bách khoa Hà Nội"
                  />
                </label>
                <label className="field">
                  <span>Chuyên ngành <b>*</b></span>
                  <input
                    maxLength="150"
                    minLength="2"
                    required
                    value={details.major}
                    onChange={(event) => setDetails({ ...details, major: event.target.value })}
                    placeholder="Ví dụ: Công nghệ thông tin"
                  />
                </label>
                <label className="field">
                  <span>Số điện thoại <b>*</b></span>
                  <input
                    autoComplete="tel"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    required
                    type="tel"
                    value={details.phone}
                    onChange={(event) => setDetails({ ...details, phone: event.target.value })}
                    placeholder="09xx xxx xxx"
                  />
                </label>
              </div>
            </section>

            <section className="form-section documents-section">
              <div className="section-heading">
                <span className="section-number">02</span>
                <div>
                  <h2>Tài liệu ứng tuyển</h2>
                  <p>PDF, DOC hoặc DOCX · tối đa 10 MB mỗi tệp</p>
                </div>
              </div>
              <div className="upload-grid">
                <UploadField
                  title="CV cá nhân"
                  description="Thể hiện kinh nghiệm và kỹ năng của bạn"
                  file={cvFile}
                  existingName={profile?.cv_filename}
                  inputId="cv-upload"
                  onChange={(event) => handleFileChange(event, setCvFile, 'CV')}
                  onDownload={() => downloadDocument('cv', profile.cv_filename)}
                />
                <UploadField
                  title="Đơn xin thực tập"
                  description="Thư ngỏ gửi đến đơn vị tuyển dụng"
                  file={applicationFile}
                  existingName={profile?.application_filename}
                  inputId="application-upload"
                  onChange={(event) => handleFileChange(event, setApplicationFile, 'Đơn xin thực tập')}
                  onDownload={() => downloadDocument('application', profile.application_filename)}
                />
              </div>
            </section>

            <div className="form-footer">
              <span><b>*</b> Trường bắt buộc</span>
              <button className="primary-button save-button" type="submit" disabled={busy || !profileLoaded}>
                {busy ? 'Đang lưu...' : 'Lưu hồ sơ'}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>

          <aside className="profile-aside">
            <div className="aside-card-title">
              <span className="mini-symbol">✳</span>
              <span>HỒ SƠ CỦA BẠN</span>
            </div>
            <div className="aside-progress">
              <div className="aside-progress-head"><span>Tiến độ hoàn thiện</span><strong>{completion}%</strong></div>
              <div className="aside-progress-track"><span style={{ width: `${completion}%` }} /></div>
            </div>
            <ul className="checklist">
              <ChecklistItem done={Boolean(details.school.trim())} label="Trường đào tạo" />
              <ChecklistItem done={Boolean(details.major.trim())} label="Chuyên ngành" />
              <ChecklistItem done={Boolean(details.phone.trim())} label="Thông tin liên hệ" />
              <ChecklistItem done={Boolean(cvFile || profile?.cv_filename)} label="CV cá nhân" />
              <ChecklistItem done={Boolean(applicationFile || profile?.application_filename)} label="Đơn xin thực tập" />
            </ul>
            <div className="aside-tip">
              <span className="tip-mark">i</span>
              <p>Tài liệu được lưu riêng tư và chỉ bạn mới có thể xem hoặc tải xuống.</p>
            </div>
            <div className="saved-status">
              <span className={profile ? 'status-dot is-saved' : 'status-dot'} />
              {profile ? 'Hồ sơ đã được tạo' : 'Chưa có hồ sơ'}
            </div>
          </aside>
        </div>
        <footer className="page-footer"><span>INTERNLY © 2026</span><span>ỨNG TUYỂN BẮT ĐẦU TỪ ĐÂY</span></footer>
      </main>
    </div>
  )
}

function UploadField({ title, description, file, existingName, inputId, onChange, onDownload }) {
  const displayedName = file?.name || existingName
  return (
    <div className="upload-field">
      <div className="upload-heading">
        <div className="file-symbol" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M7 3.75h6.2L18 8.6v11.65H7a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2Z" /><path d="M13 4v5h5M8.5 13h6M8.5 16h6" /></svg>
        </div>
        <div><h3>{title}</h3><p>{description}</p></div>
      </div>
      <label
        className={`upload-drop${displayedName ? ' has-file' : ''}`}
        htmlFor={inputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          onChange({ target: { files: event.dataTransfer.files, value: '' } })
        }}
      >
        <input id={inputId} type="file" accept=".pdf,.doc,.docx" onChange={onChange} />
        <span className="upload-icon" aria-hidden="true">↑</span>
        <span className="upload-action">{file ? 'Chọn tệp khác' : existingName ? 'Thay tệp hiện tại' : 'Chọn tệp từ thiết bị'}</span>
        <span className="upload-filename">{displayedName || 'hoặc kéo thả tệp vào đây'}</span>
      </label>
      {existingName && !file && (
        <button className="download-button" type="button" onClick={onDownload}>
          <span aria-hidden="true">↓</span> Tải tệp hiện tại
        </button>
      )}
      {file && <span className="file-ready"><span /> Đã sẵn sàng tải lên</span>}
    </div>
  )
}

function ChecklistItem({ done, label }) {
  return (
    <li className={done ? 'is-done' : ''}>
      <span className="check-indicator" aria-hidden="true">{done ? '✓' : ''}</span>
      <span>{label}</span>
      <span className="check-state">{done ? 'XONG' : 'CHỜ'}</span>
    </li>
  )
}

export default App
