import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx']

async function readError(response) {
  const body = await response.json().catch(() => ({}))
  return body.detail || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}

function DocumentField({ title, description, name, savedName, onChange }) {
  return (
    <label className="document-field">
      <span className="document-icon" aria-hidden="true">PDF</span>
      <span className="document-copy">
        <span className="document-title">{title}</span>
        <span className="document-description">{name || savedName || description}</span>
        {savedName && !name && <span className="document-saved">Đã lưu trong hồ sơ</span>}
      </span>
      <span className="choose-file">{name ? 'Đổi tệp' : savedName ? 'Thay thế' : 'Chọn tệp'}</span>
      <input type="file" accept=".pdf,.doc,.docx" onChange={(event) => onChange(event.target.files?.[0] || null)} />
    </label>
  )
}

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('access_token') || '')
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(() => Boolean(sessionStorage.getItem('access_token')))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState({ school: '', major: '', phone: '' })
  const [cvFile, setCvFile] = useState(null)
  const [applicationFile, setApplicationFile] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false
    fetch(`${API_BASE}/api/intern-profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response))
        return response.json()
      })
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        if (data) setForm({ school: data.school, major: data.major, phone: data.phone })
        setError('')
      })
      .catch((requestError) => {
        if (cancelled) return
        setError(requestError.message)
        sessionStorage.removeItem('access_token')
        setToken('')
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false)
      })
    return () => { cancelled = true }
  }, [token])

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function selectFile(setFile, label) {
    return (file) => {
      if (file) {
        const extension = `.${file.name.split('.').pop()}`.toLowerCase()
        if (!ACCEPTED_EXTENSIONS.includes(extension)) {
          setError(`${label}: chỉ nhận tệp PDF, DOC hoặc DOCX.`)
          return
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(`${label}: dung lượng tối đa là 10 MB.`)
          return
        }
      }
      setError('')
      setFile(file)
    }
  }

  async function login(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!response.ok) throw new Error(await readError(response))
      const data = await response.json()
      sessionStorage.setItem('access_token', data.access_token)
      setLoadingProfile(true)
      setToken(data.access_token)
      setPassword('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveProfile(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const payload = new FormData()
    payload.append('school', form.school)
    payload.append('major', form.major)
    payload.append('phone', form.phone)
    if (cvFile) payload.append('cv_file', cvFile)
    if (applicationFile) payload.append('application_file', applicationFile)
    try {
      const response = await fetch(`${API_BASE}/api/intern-profile/me`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      })
      if (!response.ok) throw new Error(await readError(response))
      const data = await response.json()
      setProfile(data)
      setCvFile(null)
      setApplicationFile(null)
      setNotice('Hồ sơ của bạn đã được lưu.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  async function downloadDocument(documentType) {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/intern-profile/me/files/${documentType}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error(await readError(response))
      const url = URL.createObjectURL(await response.blob())
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = documentType === 'cv' ? profile.cv_filename : profile.application_filename
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function logout() {
    sessionStorage.removeItem('access_token')
    setToken('')
    setLoadingProfile(false)
    setProfile(null)
    setForm({ school: '', major: '', phone: '' })
    setCvFile(null)
    setApplicationFile(null)
    setNotice('')
    setError('')
  }

  if (!token) {
    return (
      <main className="login-layout">
        <section className="login-intro">
          <div className="brand-lockup"><span className="brand-mark">G</span> CODEGYM <span>INTERN PORTAL</span></div>
          <div className="intro-copy">
            <p className="eyebrow">HỒ SƠ ỨNG TUYỂN</p>
            <h1>Mở đầu hành trình<br />nghề nghiệp của bạn.</h1>
            <p className="intro-description">Hoàn thiện thông tin và gửi hồ sơ thực tập đến đội ngũ tuyển dụng.</p>
          </div>
          <div className="intro-foot"><span>01 / 03</span><span>Hồ sơ cá nhân</span></div>
        </section>
        <section className="login-panel">
          <form className="login-form" onSubmit={login}>
            <p className="eyebrow">CỔNG DÀNH CHO THỰC TẬP SINH</p>
            <h2>Đăng nhập</h2>
            <p className="muted">Sử dụng tài khoản thực tập sinh đã được cấp.</p>
            <label className="input-label" htmlFor="username">Tên đăng nhập</label>
            <input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
            <label className="input-label" htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <p className="alert error-alert" role="alert">{error}</p>}
            <button className="primary-button login-button" disabled={busy} type="submit">{busy ? 'Đang xác thực...' : 'Tiếp tục'} <span aria-hidden="true">→</span></button>
            <p className="login-note">Tài khoản demo: <strong>intern01</strong>. Mật khẩu là giá trị bạn đã đặt khi chạy seed.</p>
          </form>
          <footer className="login-footer">CODEGYM <span>HỆ THỐNG QUẢN LÝ THỰC TẬP</span></footer>
        </section>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand-lockup" href="#top"><span className="brand-mark">G</span> CODEGYM <span>INTERN PORTAL</span></a>
        <div className="sidebar-section-label">KHÔNG GIAN CỦA BẠN</div>
        <nav aria-label="Điều hướng chính">
          <a className="nav-item active" href="#profile"><span className="nav-number">01</span> Hồ sơ cá nhân</a>
          <span className="nav-item disabled"><span className="nav-number">02</span> Đơn ứng tuyển</span>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-mini"><span className="avatar">{username.charAt(0).toUpperCase()}</span><span><strong>{username}</strong><small>Thực tập sinh</small></span></div>
          <button className="logout-button" type="button" onClick={logout}>Đăng xuất <span aria-hidden="true">↗</span></button>
        </div>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar"><span>ỨNG TUYỂN <span className="breadcrumb-divider">/</span> HỒ SƠ CỦA TÔI</span><span className="secure-label"><i /> Phiên làm việc bảo mật</span></header>
        <section className="page-content" id="profile">
          <div className="page-heading">
            <div><p className="eyebrow">BƯỚC 01 <span>/</span> THÔNG TIN CÁ NHÂN</p><h1>Hồ sơ thực tập</h1><p className="muted">Chia sẻ thông tin học tập và tài liệu để chúng tôi hiểu bạn hơn.</p></div>
            <div className={`status-badge ${profile ? 'complete' : ''}`}><span />{profile ? 'Đã lưu hồ sơ' : 'Chưa hoàn tất'}</div>
          </div>

          {loadingProfile ? <div className="loading-state">Đang tải hồ sơ của bạn...</div> : (
            <form onSubmit={saveProfile}>
              <section className="form-section">
                <div className="section-heading"><span className="section-index">01</span><div><h2>Thông tin học tập</h2><p>Các thông tin cơ bản về quá trình học tập của bạn.</p></div></div>
                <div className="fields-grid">
                  <label className="field"><span>Trường / cơ sở đào tạo <b>*</b></span><input name="school" value={form.school} onChange={updateForm} placeholder="Ví dụ: Đại học Bách Khoa Hà Nội" maxLength="150" required /></label>
                  <label className="field"><span>Chuyên ngành <b>*</b></span><input name="major" value={form.major} onChange={updateForm} placeholder="Ví dụ: Công nghệ thông tin" maxLength="150" required /></label>
                  <label className="field"><span>Số điện thoại <b>*</b></span><input name="phone" type="tel" value={form.phone} onChange={updateForm} placeholder="Ví dụ: 0912 345 678" minLength="8" maxLength="30" required /></label>
                </div>
              </section>

              <section className="form-section documents-section">
                <div className="section-heading"><span className="section-index">02</span><div><h2>Tài liệu ứng tuyển</h2><p>Tải lên tài liệu để hoàn thiện hồ sơ của bạn.</p></div></div>
                <div className="document-list">
                  <DocumentField title="CV / Sơ yếu lý lịch" description="PDF, DOC hoặc DOCX · Tối đa 10 MB" name={cvFile?.name} savedName={profile?.cv_filename} onChange={selectFile(setCvFile, 'CV')} />
                  <DocumentField title="Đơn xin thực tập" description="PDF, DOC hoặc DOCX · Tối đa 10 MB" name={applicationFile?.name} savedName={profile?.application_filename} onChange={selectFile(setApplicationFile, 'Đơn xin thực tập')} />
                </div>
                {profile && <div className="download-row"><button type="button" onClick={() => downloadDocument('cv')}>Tải CV đã lưu <span aria-hidden="true">↓</span></button><button type="button" onClick={() => downloadDocument('application')}>Tải đơn đã lưu <span aria-hidden="true">↓</span></button></div>}
              </section>

              {error && <p className="alert error-alert" role="alert">{error}</p>}
              {notice && <p className="alert success-alert" role="status">{notice}</p>}
              <div className="form-actions"><span><b>*</b> Thông tin bắt buộc. Tài liệu được giữ riêng tư.</span><button className="primary-button" type="submit" disabled={busy}>{busy ? 'Đang lưu...' : profile ? 'Cập nhật hồ sơ' : 'Lưu hồ sơ'} <span aria-hidden="true">→</span></button></div>
            </form>
          )}
          <footer className="page-footer"><span>CODEGYM INTERN PORTAL</span><span>{profile ? `Cập nhật gần nhất: ${new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(profile.updated_at))}` : 'Hồ sơ được lưu an toàn'}</span></footer>
        </section>
      </main>
    </div>
  )
}

export default App
