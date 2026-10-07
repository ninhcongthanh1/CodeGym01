# Intern Management System

Hệ thống quản lý thực tập sinh được xây dựng phục vụ môn Thực tập cơ sở.

Mục tiêu của project là xây dựng một hệ thống quản lý thực tập sinh theo mô hình Frontend – Backend – Database, đồng thời giúp các thành viên trong nhóm thực hành quy trình phát triển phần mềm thực tế: Git/GitHub, phân chia User Story, phân quyền, REST API, database, frontend, backend và làm việc nhóm.

## 1. Công nghệ sử dụng

### Frontend

* React
* Vite
* JavaScript
* npm

### Backend

* Python
* FastAPI
* SQLAlchemy
* PyMySQL
* JWT Authentication
* bcrypt

### Database

* MySQL
* Database name: `intern_management`

### Công cụ

* Git
* GitHub
* Jira
* Swagger / OpenAPI

## 2. Cấu trúc project

```text
CodeGym01/
│
├── backend/
│   ├── dependencies/
│   │   ├── __init__.py
│   │   └── auth.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── users.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── user.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   └── user_service.py
│   │
│   ├── database.py
│   ├── main.py
│   ├── seed.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .env.example
├── .gitignore
└── README.md
```

## 3. Yêu cầu môi trường

Trước khi chạy project, cần cài:

* Git
* Python 3.x
* Node.js và npm
* MySQL

Kiểm tra:

```powershell
git --version
python --version
node --version
npm --version
mysql --version
```

## 4. Clone project

Clone repository:

```powershell
git clone https://github.com/ninhcongthanh1/CodeGym01.git
```

Sau đó:

```powershell
cd CodeGym01
```

## 5. Thiết lập Backend

Di chuyển vào thư mục backend:

```powershell
cd backend
```

Tạo Python Virtual Environment:

```powershell
python -m venv venv
```

Do một số máy Windows có thể chặn PowerShell Script, project sử dụng trực tiếp Python trong virtual environment thay vì bắt buộc phải Activate.

Cài các thư viện:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 6. Cấu hình MySQL

Mở MySQL và tạo database:

```sql
CREATE DATABASE intern_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Database được sử dụng bởi Backend:

```text
intern_management
```

## 7. Cấu hình file .env

File `.env` không được đưa lên GitHub vì chứa thông tin cấu hình và secret.

Tạo file:

```text
backend/.env
```

Nội dung mẫu:

```env
DATABASE_URL=mysql+pymysql://root:MAT_KHAU_MYSQL@localhost:3306/intern_management
SECRET_KEY=YOUR_SECRET_KEY
```

Thay:

```text
MAT_KHAU_MYSQL
```

bằng mật khẩu MySQL của máy cá nhân.

`SECRET_KEY` cũng nên được thay bằng một giá trị riêng của máy.

Không commit file:

```text
.env
```

lên GitHub.

Có thể tham khảo file:

```text
.env.example
```

để biết các biến môi trường cần thiết.

## 8. Chạy Backend

Từ thư mục:

```text
CodeGym01/backend
```

chạy:

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```

Nếu chạy thành công, Backend mặc định hoạt động tại:

```text
http://127.0.0.1:8000
```

Swagger API:

```text
http://127.0.0.1:8000/docs
```

Có thể mở Swagger để kiểm tra và test các API.

## 9. Database tự động tạo bảng

Khi Backend khởi động, project sử dụng SQLAlchemy để tạo các bảng được khai báo trong model nếu bảng chưa tồn tại.

Hiện tại hệ thống đã có model `User`.

Database có thể kiểm tra bằng MySQL:

```sql
USE intern_management;

SHOW TABLES;
```

Kiểm tra dữ liệu User:

```sql
SELECT id, username, email, role, is_active
FROM users;
```

## 10. Tạo tài khoản demo

Project có file:

```text
backend/seed.py
```

File này dùng để tạo các tài khoản demo.

Chạy:

```powershell
.\venv\Scripts\python.exe seed.py
```

Chương trình sẽ yêu cầu nhập password cho từng tài khoản.

Các tài khoản demo:

```text
admin01
hr01
mentor01
intern01
```

Password không được lưu trực tiếp trong source code.

Password được hash bằng bcrypt trước khi lưu vào database.

Nếu username đã tồn tại, chương trình sẽ bỏ qua tài khoản đó.

## 11. Các role trong hệ thống

Hiện tại hệ thống có 4 role:

```text
admin
hr
mentor
intern
```

### Admin

Có quyền quản lý tài khoản và phân quyền:

* Tạo tài khoản
* Xem danh sách tài khoản
* Xem chi tiết tài khoản
* Sửa thông tin tài khoản
* Thay đổi role
* Khóa / mở khóa tài khoản

### HR

Hiện tại có quyền:

* Xem danh sách tài khoản
* Xem chi tiết tài khoản

Các quyền nghiệp vụ HR sẽ được bổ sung thông qua các User Story tiếp theo.

### Mentor

Các quyền nghiệp vụ Mentor sẽ được triển khai trong các User Story liên quan.

### Intern

Các quyền nghiệp vụ Intern sẽ được triển khai trong các User Story liên quan.

## 12. Authentication và Authorization

Hệ thống sử dụng JWT để xác thực người dùng.

Quy trình đăng nhập:

```text
Username + Password
        ↓
POST /api/auth/login
        ↓
Backend kiểm tra tài khoản
        ↓
Kiểm tra password
        ↓
Tạo JWT
        ↓
Frontend nhận access token
```

Các API được bảo vệ sẽ kiểm tra JWT.

Sau đó Backend xác định role của người dùng để quyết định có cho phép thực hiện thao tác hay không.

Ví dụ:

```text
Admin
  ↓
POST /api/users/
  ↓
Cho phép
```

Trong khi:

```text
HR
  ↓
POST /api/users/
  ↓
403 Forbidden
```

## 13. API User hiện tại

### Đăng nhập

```http
POST /api/auth/login
```

### Tạo tài khoản

```http
POST /api/users/
```

Chỉ Admin được phép thực hiện.

### Xem danh sách tài khoản

```http
GET /api/users/
```

Admin và HR được phép.

### Xem chi tiết tài khoản

```http
GET /api/users/{user_id}
```

Admin và HR được phép.

### Sửa thông tin tài khoản

```http
PUT /api/users/{user_id}
```

Chỉ Admin được phép.

### Thay đổi role

```http
PATCH /api/users/{user_id}/role
```

Chỉ Admin được phép.

### Khóa / mở khóa tài khoản

```http
PATCH /api/users/{user_id}/status
```

Chỉ Admin được phép.

## 14. Kiểm tra quyền

Ví dụ:

```text
Admin → GET /api/users/ → 200
HR → GET /api/users/ → 200
Mentor → GET /api/users/ → 403
Intern → GET /api/users/ → 403
```

Đối với API tạo tài khoản:

```text
Admin → POST /api/users/ → được phép
HR → POST /api/users/ → 403
Mentor → POST /api/users/ → 403
Intern → POST /api/users/ → 403
```

## 15. Thiết lập Frontend

Mở terminal mới.

Từ thư mục project:

```powershell
cd frontend
```

Cài dependencies:

```powershell
npm install
```

Nếu PowerShell chặn `npm.ps1`, có thể sử dụng:

```powershell
npm.cmd install
```

## 16. Chạy Frontend

Sau khi cài dependencies:

```powershell
npm run dev
```

Nếu PowerShell chặn script:

```powershell
npm.cmd run dev
```

Vite sẽ hiển thị địa chỉ frontend, thường là:

```text
http://localhost:5173
```

Mở địa chỉ này bằng trình duyệt.

## 17. Chạy toàn bộ hệ thống

Để chạy project đầy đủ, cần mở ít nhất 2 terminal.

### Terminal 1 – Backend

```powershell
cd CodeGym01\backend

.\venv\Scripts\python.exe -m uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

### Terminal 2 – Frontend

```powershell
cd CodeGym01\frontend

npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 18. Quy trình làm việc nhóm bằng Git

Không nên code trực tiếp trên branch `master`.

Mỗi thành viên tạo branch riêng cho User Story của mình.

Ví dụ:

```powershell
git checkout -b feature/us01-intern-profile
```

Sau khi hoàn thành:

```powershell
git add .
git commit -m "feat: implement intern profile"
git push -u origin feature/us01-intern-profile
```

Sau đó tạo Pull Request trên GitHub để các thành viên review trước khi merge.

## 19. Quy tắc đặt tên branch

Có thể sử dụng:

```text
feature/us01-intern-profile
feature/us02-edit-intern-profile
feature/us15-assign-task
feature/us39-user-management
feature/us40-role-permission
```

Bug:

```text
fix/login-error
fix/user-email-validation
```

Refactor:

```text
refactor/auth-service
```

## 20. Quy tắc Commit

Khuyến khích sử dụng Conventional Commits.

Ví dụ:

```text
feat: add intern profile API
fix: validate duplicate email
refactor: improve authentication service
docs: update README
chore: update backend dependencies
```

Không nên commit message kiểu:

```text
update
fix
code
test
abc
```

## 21. Quy tắc bảo mật

Không commit các file hoặc thông tin nhạy cảm:

```text
.env
venv/
node_modules/
password thật
SECRET_KEY thật
database password
API key
```

Các thông tin này phải được đưa vào `.env`.

File `.env.example` chỉ chứa tên biến môi trường và giá trị mẫu.

## 22. Quy trình dành cho thành viên mới

Thành viên mới thực hiện theo thứ tự:

```text
1. Clone GitHub repository
        ↓
2. Cài Python / Node.js / MySQL
        ↓
3. Tạo Python venv
        ↓
4. pip install -r requirements.txt
        ↓
5. Tạo database intern_management
        ↓
6. Tạo backend/.env
        ↓
7. Chạy Backend
        ↓
8. Chạy seed.py
        ↓
9. npm install
        ↓
10. npm run dev
        ↓
11. Đăng nhập / test hệ thống
        ↓
12. Tạo branch cho User Story
        ↓
13. Code
        ↓
14. Commit
        ↓
15. Push
        ↓
16. Pull Request
```

## 23. Các User Story của hệ thống

### Quản lý hồ sơ thực tập sinh

* US01: HR thêm hồ sơ thực tập sinh
* US02: HR chỉnh sửa hồ sơ thực tập sinh
* US03: HR tìm kiếm/lọc theo trường, chuyên ngành
* US04: Intern upload CV/đơn ứng tuyển
* US05: HR xem/duyệt hồ sơ

### Tiếp nhận và xét duyệt

* US06: Intern đăng ký và nộp hồ sơ online
* US07: HR duyệt/từ chối
* US08: Hệ thống gửi email kết quả
* US09: HR upload hợp đồng thực tập
* US10: Intern xác nhận hợp đồng

### Quản lý chương trình thực tập

* US11: HR tạo chương trình thực tập
* US12: HR phân công mentor
* US13: HR thiết lập thời gian thực tập
* US14: Intern xem lịch cá nhân

### Quản lý công việc và đánh giá

* US15: Mentor giao task
* US16: Intern cập nhật tiến độ
* US17: Intern gửi báo cáo tuần
* US18: Mentor xem/phản hồi báo cáo
* US19: Mentor đánh giá kỹ năng/thái độ
* US20: HR tổng hợp báo cáo cuối kỳ

### Chấm công và thời gian

* US21: Intern check-in/check-out
* US22: HR xem báo cáo chấm công/nghỉ phép
* US23: HR thiết lập lịch làm việc
* US24: Intern gửi yêu cầu nghỉ

### Hỗ trợ và quyền lợi

* US25: HR nhập khoản hỗ trợ
* US26: Intern xem lịch sử hỗ trợ
* US27: Intern gửi yêu cầu hỗ trợ
* US28: HR duyệt/phản hồi yêu cầu

### Mentor và phòng ban

* US29: HR thêm mentor
* US30: HR phân công mentor
* US31: HR xem số lượng intern theo mentor

### Báo cáo và thống kê

* US32: HR thống kê theo trường/chuyên ngành
* US33: HR xem tỷ lệ hoàn thành
* US34: HR xuất Excel/PDF

### Tích hợp và thông báo

* US35: Hệ thống gửi email lịch họp
* US36: Intern nhận thông báo trong hệ thống
* US37: Admin tích hợp HRM
* US38: Admin tích hợp QR/card chấm công

### Quản trị

* US39: Admin tạo tài khoản
* US40: Admin phân quyền chi tiết
* US41: Hệ thống backup định kỳ
* US42: Admin xem activity log

## 24. Nguyên tắc thiết kế User và hồ sơ nghiệp vụ

`User` đại diện cho tài khoản sử dụng hệ thống:

```text
User
├── id
├── username
├── email
├── password_hash
├── full_name
├── role
├── is_active
├── created_at
└── updated_at
```

Các hồ sơ nghiệp vụ được xây dựng riêng.

Ví dụ:

```text
User
   │
   └── InternProfile
```

`User` chịu trách nhiệm về:

* Đăng nhập
* Mật khẩu
* Role
* Trạng thái tài khoản
* Authentication

`InternProfile` chịu trách nhiệm về thông tin nghiệp vụ của thực tập sinh.

## 25. Quy trình phát triển User Story

Mỗi User Story nên được thực hiện theo quy trình:

```text
User Story
    ↓
Phân tích yêu cầu
    ↓
Thiết kế database
    ↓
Backend Model
    ↓
Schema
    ↓
Service
    ↓
Router / API
    ↓
Authorization
    ↓
Test API
    ↓
Frontend
    ↓
Test toàn bộ chức năng
    ↓
Git Commit
    ↓
Pull Request
    ↓
Code Review
    ↓
Merge
```

## 26. Trạng thái hiện tại

### Đã hoàn thành

* Project structure
* Git/GitHub
* React + Vite
* FastAPI
* MySQL connection
* SQLAlchemy
* Authentication
* JWT
* bcrypt password hashing
* User management
* Role-based authorization
* Account activation/deactivation
* Duplicate username validation
* Duplicate email validation
* Demo seed users
* US39
* US40

### Đang phát triển

Các User Story còn lại sẽ được triển khai theo kế hoạch của nhóm.


## 28. Ghi chú

Đây là project phục vụ mục đích học tập và thực hành phát triển phần mềm.

Mỗi thành viên cần đảm bảo:

* Không commit secret.
* Không sửa trực tiếp code của thành viên khác nếu không cần thiết.
* Làm việc trên branch riêng.
* Commit rõ ràng.
* Pull Request trước khi merge.
* Test chức năng trước khi tạo Pull Request.
* Cập nhật README khi có thay đổi quan trọng về cách chạy hệ thống.