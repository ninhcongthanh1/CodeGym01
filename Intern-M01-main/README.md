# 🎓 HỆ THỐNG QUẢN LÝ THỰC TẬP SINH TOÀN DIỆN (IMS - INTERNSHIP MANAGEMENT SYSTEM)

Hệ thống quản lý thực tập sinh chuẩn doanh nghiệp với kiến trúc **Fullstack**, tích hợp cơ chế phân quyền động (**Dynamic RBAC**), lưu trữ cơ sở dữ liệu thật với **SQLite (WAL mode)**, tài liệu hóa API chuẩn **Swagger UI/OpenAPI**, và giao diện người dùng hiện đại xây dựng trên **React 19 + Tailwind CSS**.

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Quản lý Hồ sơ Thực tập sinh toàn diện (Full Lifecycle)**:
   - Tiếp nhận, phân loại trường, chuyên ngành, GPA, hợp đồng thực tập.
   - Phân bổ phòng ban và gán Mentor hướng dẫn chuyên trách.
   - Nhập/xuất dữ liệu hồ sơ qua file Excel linh hoạt.
2. **Quản lý Đội ngũ Mentor (Người hướng dẫn)**:
   - Theo dõi danh sách Mentee đang hướng dẫn, hạn mức kèm tối đa (`maxMentees`).
   - Đánh giá năng lực chuyên môn, phản hồi định kỳ.
3. **Phân quyền Động chuẩn doanh nghiệp (Dynamic RBAC)**:
   - Hỗ trợ 4 vai trò chính: **Admin**, **HR (Quản lý)**, **Mentor**, **Intern (Thực tập sinh)**.
   - Admin có thể tùy biến bật/tắt hơn **24+ quyền hạn chi tiết** (theo Module hoặc theo Ma trận quyền).
   - Backend Express xác thực quyền nghiêm ngặt qua middleware `authorize()`, đồng bộ tức thời với Frontend.
4. **Cơ sở dữ liệu thật (Real SQLite Database)**:
   - Lưu trữ tại file `data/ims.db`, kích hoạt chế độ **WAL (Write-Ahead Logging)** cho tốc độ cao và toàn vẹn dữ liệu.
   - Tự động đồng bộ tài khoản người dùng vào bảng `users` khi thêm Thực tập sinh hoặc Mentor mới.
   - Tự động tạo thư chào mừng/kích hoạt tài khoản vào bảng `system_emails`.
5. **Tài liệu API tương tác Swagger UI**:
   - Tích hợp sẵn tại endpoint `/api-docs` giúp tra cứu và thử nghiệm API trực tiếp.
6. **Sao lưu & Phục hồi (Backup & Restore)**:
   - Xuất/nhập snapshot toàn bộ cơ sở dữ liệu dưới định dạng JSON an toàn.

---

## 👥 THÔNG TIN TÀI KHOẢN VÀ MẬT KHẨU MẶC ĐỊNH

Khi hệ thống khởi chạy hoặc khi Admin/HR tạo mới nhân sự, tài khoản sẽ được tự động lưu vào SQLite với thông tin đăng nhập mặc định:

| Vai Trò | Tên Đăng Nhập (Username) | Mật Khẩu Mặc Định | Mô Tả Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@ims.corp` | `Admin@2026` | Toàn quyền cấu hình RBAC, phân quyền, người dùng, sao lưu |
| **Quản lý / Tuyển dụng (HR)** | `hr.ha@ims.corp` | `HR@2026` | Quản lý hồ sơ, duyệt hợp đồng, phân công mentor, chấm công |
| **Người hướng dẫn (Mentor)** | Email công ty của mentor (VD: `mentor.nam@ims.corp`) | `Mentor@2026` | Đánh giá thực tập sinh, theo dõi tiến độ, chấm điểm báo cáo |
| **Thực tập sinh (Intern)** | Email của sinh viên (VD: `intern.tuan@student.hust.edu.vn`) | `Intern@2026` | Điểm danh, xem lộ trình đào tạo, nộp báo cáo thực tập |

> **Lưu ý:** Admin có thể đặt lại mật khẩu của bất kỳ tài khoản nào về mặc định tại mục **Quản Trị Hệ Thống > Tài Khoản & Người Dùng**.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express 5, TypeScript (`tsx`).
- **Database**: SQLite 3 via `better-sqlite3` (WAL mode).
- **API Documentation**: Swagger UI Express (`/api-docs`).
- **File Processing**: SheetJS (`xlsx`).

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY CHƯƠNG TRÌNH

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản 20.x trở lên (khuyến nghị LTS).
- **npm**: Phiên bản 10.x trở lên.
- **Git** đã được cài đặt trên máy tính.

### 2. Clone mã nguồn dự án
```bash
git clone https://github.com/ninhcongthanh1/Intern-M01.git
cd Intern-M01
```

### 3. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### 4. Khởi chạy ứng dụng

#### Cách 1: Chạy đồng thời cả Frontend và Backend (Khuyến nghị)
```bash
npm run dev
```

#### Cách 2: Khởi chạy riêng biệt từng phần
- **Khởi chạy Backend Server (Port 5000)**:
  ```bash
  npm run server
  ```
- **Khởi chạy Frontend Client (Port 3000)**:
  ```bash
  npm run dev:frontend
  ```

---

## 🌐 ĐỊA CHỈ TRUY CẬP HỆ THỐNG

Sau khi khởi chạy thành công, truy cập các địa chỉ sau trên trình duyệt:

- 💻 **Giao diện Ứng dụng (Frontend Web App)**: [http://localhost:3000](http://localhost:3000)
- 📑 **Tài liệu Swagger API (Backend API Docs)**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- 📡 **API Endpoint**: [http://localhost:5000/api](http://localhost:5000/api)
- 💾 **File Cơ sở dữ liệu SQLite**: `data/ims.db`

---

# 📧 TÍNH NĂNG GỬI EMAIL THÔNG BÁO TUYỂN DỤNG

Sau khi **HR duyệt CV** (trúng tuyển hoặc không trúng), hệ thống sẽ tự động gửi email tới thực tập sinh bằng **Nodemailer** (SMTP Gmail).  
- **Biến môi trường cần cấu hình** (đặt trong `.env`):
  ```dotenv
  SMTP_USER=your_gmail_address@gmail.com
  SMTP_PASS=your_app_password_or_oauth_token
  ```
- Nội dung email gồm tiêu đề và nội dung tương ứng:
  - *Trúng tuyển*: `Chúc mừng! Bạn đã được tuyển thực tập tại IMS`
  - *Trượt*: `Kết quả xét duyệt CV thực tập tại IMS`
- Email được lưu vào bảng `system_emails` để có thể xem lại trong API `/api/system/emails`.

## 📡 API MỚI

| Method | Endpoint | Mô tả |
| ------ | -------- | ----- |
| `POST` | `/api/system/interns/:id/decision` | HR duyệt CV cho intern (body: `{ "decision": "selected" | "rejected" }`). Cập nhật trạng thái, gửi email, và lưu bản ghi email. |

---


```text
├── data/                      # Thư mục lưu trữ database SQLite (ims.db)
├── server/                    # Mã nguồn Backend Express
│   ├── routes/                # Các router API (interns, mentors, rbac, system...)
│   ├── db.ts                  # Kết nối SQLite, khởi tạo bảng, migration và sync dữ liệu
│   ├── middleware.ts          # Middleware xác thực và phân quyền RBAC
│   ├── swagger.ts             # Cấu hình OpenAPI / Swagger Documentation
│   └── index.ts               # Điểm khởi chạy Express server
├── src/                       # Mã nguồn Frontend React
│   ├── components/            # UI components & Views theo từng nghiệp vụ
│   ├── context/               # Quản lý State toàn cục & đồng bộ Backend API
│   ├── services/              # Client gọi API Backend
│   ├── types/                 # Định nghĩa TypeScript Types & Permissions
│   ├── App.tsx                # Layout và điều hướng màn hình
│   └── main.tsx               # Entrypoint React
├── requirements.txt           # Yêu cầu hệ thống và danh sách thư viện
├── package.json               # Cấu hình NPM scripts và dependencies
└── README.md                  # Hướng dẫn chi tiết dự án
```

---

## 🛡️ BẢN QUYỀN & GIẤY PHÉP
Dự án được xây dựng phục vụ công tác quản lý và đào tạo thực tập sinh doanh nghiệp. Bản quyền thuộc về tác giả và nhóm phát triển.
