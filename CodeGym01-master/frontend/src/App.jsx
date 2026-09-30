import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [interns, setInterns] = useState([])
  const [search, setSearch] = useState('')
  const [school, setSchool] = useState('')
  const [major, setMajor] = useState('')

  const searchInterns = async () => {
    const params = new URLSearchParams()

    if (search) {
      params.append('search', search)
    }

    if (school) {
      params.append('school', school)
    }

    if (major) {
      params.append('major', major)
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách thực tập sinh')
      }

      const data = await response.json()

      setInterns(data)
    } catch (error) {
      console.error(error)
      setInterns([])
    }
  }

  useEffect(() => {
    searchInterns()
  }, [])

  const clearFilter = () => {
    setSearch('')
    setSchool('')
    setMajor('')

    setTimeout(() => {
      searchInterns()
    }, 0)
  }

  return (
    <div className="container">
      <h1>Quản lý thực tập sinh</h1>

      <div className="filter-box">

        <input
          type="text"
          placeholder="Tìm tên, username hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={school}
          onChange={(e) => setSchool(e.target.value)}
        >
          <option value="">-- Tất cả trường --</option>
          <option value="Đại học Thái Nguyên">
            Đại học Thái Nguyên
          </option>
          <option value="Đại học Bách Khoa Hà Nội">
            Đại học Bách Khoa Hà Nội
          </option>
        </select>

        <select
          value={major}
          onChange={(e) => setMajor(e.target.value)}
        >
          <option value="">-- Tất cả ngành --</option>
          <option value="Công nghệ thông tin">
            Công nghệ thông tin
          </option>
          <option value="Kinh tế">
            Kinh tế
          </option>
        </select>

        <button onClick={searchInterns}>
          Tìm kiếm
        </button>

        <button onClick={clearFilter}>
          Xóa bộ lọc
        </button>

      </div>

      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Trường</th>
            <th>Ngành</th>
          </tr>
        </thead>

        <tbody>
          {interns.map((intern) => (
            <tr key={intern.id}>
              <td>{intern.username}</td>
              <td>{intern.full_name}</td>
              <td>{intern.email}</td>
              <td>{intern.school || 'Chưa cập nhật'}</td>
              <td>{intern.major || 'Chưa cập nhật'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {interns.length === 0 && (
        <p className="no-result">
          Không tìm thấy thực tập sinh.
        </p>
      )}
    </div>
  )
}

export default App