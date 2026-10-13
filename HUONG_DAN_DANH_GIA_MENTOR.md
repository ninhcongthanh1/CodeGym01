# Đánh giá kỹ năng và thái độ thực tập sinh

User story: **Là mentor, tôi muốn đánh giá kỹ năng và thái độ của thực tập sinh để tổng kết.**

Chức năng được tích hợp vào dự án React + FastAPI trong ZIP này. Đăng nhập tài khoản `mentor` tại màn hình đăng nhập hiện có; trang chủ theo vai trò sẽ mở màn hình đánh giá.

## Chức năng bàn giao

- Danh sách TTS được phân công cho mentor đang đăng nhập; tìm theo tên/email/trường/ngành, lọc Chưa đánh giá/Bản nháp/Đã gửi.
- Thông tin tên, mã hồ sơ, vị trí, trường và thời gian thực tập.
- Phiếu đánh giá hai nhóm: Kỹ năng và Thái độ, mỗi nhóm ba tiêu chí.
- Chọn điểm nguyên 1–5 cho từng tiêu chí; ban đầu không chấm sẵn điểm để tránh đánh giá vô tình.
- Nhận xét điểm mạnh, điểm cần cải thiện/hướng phát triển và tổng kết; mỗi phần tối đa 2000 ký tự.
- Lưu nháp được phép chưa điền đầy đủ; dữ liệu được lưu vào database và tải lại được.
- Gửi tổng kết bắt buộc đủ sáu điểm và ba nhận xét; có hộp thoại xác nhận trước khi gửi.
- Đã gửi chỉ xem; API cũng chặn chỉnh sửa, không chỉ khóa nút trên giao diện.
- Hiển thị thời điểm lưu/gửi, điểm tổng kết và xếp loại gợi ý.
- Không báo thành công nếu lưu lỗi. Dữ liệu đang nhập được giữ lại; cho thử lại.
- Cảnh báo bỏ thay đổi chưa lưu khi đổi TTS, tải lại hoặc đăng xuất; trình duyệt cảnh báo khi rời trang.
- Khóa nút khi đang lưu; kiểm tra revision để ngăn phiên cũ ghi đè dữ liệu mới.
- Backend kiểm tra JWT, tài khoản hoạt động, vai trò mentor và phân công thực tế.

## Tiêu chí và cách tính

| Nhóm | Tiêu chí |
| --- | --- |
| Kỹ năng | Chuyên môn/kỹ thuật; Giải quyết vấn đề; Tiếp thu và vận dụng |
| Thái độ | Kỷ luật và trách nhiệm; Chủ động trong công việc; Hợp tác và giao tiếp |

Thang điểm: 1 Cần cải thiện nhiều; 2 Cần cải thiện; 3 Đạt; 4 Tốt; 5 Xuất sắc.

- Điểm kỹ năng = trung bình ba tiêu chí kỹ năng.
- Điểm thái độ = trung bình ba tiêu chí thái độ.
- Điểm tổng kết = trung bình sáu tiêu chí, tương đương hai nhóm có trọng số 50%/50%.
- Hiển thị điểm làm tròn hai chữ số thập phân; xếp loại dựa trên điểm chưa làm tròn.
- Xuất sắc: từ 4,5; Tốt: từ 3,5 đến dưới 4,5; Đạt: từ 2,5 đến dưới 3,5; Cần cải thiện: dưới 2,5.

Đây là bộ tiêu chí mặc định cho chức năng. Nếu nhóm/giảng viên có rubric riêng, chỉnh `backend/routers/mentor_evaluations.py` và `frontend/src/services/evaluationScoring.js` cùng nhau.

## Chạy trên Windows

Yêu cầu: Python 3.10 trở lên, Node.js 22.12 trở lên hoặc Node.js 24 và npm (Vite 8 yêu cầu phiên bản Node phù hợp).

### 1. Chuẩn bị cấu hình và backend

Mở PowerShell tại thư mục `CodeGym01-master` đã giải nén:

```powershell
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Mở `.env`, thay giá trị `SECRET_KEY` bằng chuỗi vừa tạo. Có thể giữ `DATABASE_URL=sqlite:///./codegym.db` để chạy nhanh. Nếu nhóm đã dùng MySQL, giữ cấu hình `.env` hiện có, không chép đè nó. Ví dụ MySQL: `mysql+pymysql://USER:PASSWORD@localhost:3306/codegym` (database phải tồn tại trước khi chạy).

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Khi khởi động, cơ chế `Base.metadata.create_all` hiện có của dự án tạo hai bảng mới `mentor_assignments` và `mentor_evaluations`. Không sửa cấu trúc các bảng hồ sơ/tài khoản cũ.

### 2. Chạy frontend

Mở terminal khác tại thư mục `frontend`:

```powershell
npm ci
npm run dev
```

Mở `http://localhost:5173`, đăng nhập bằng tài khoản Mentor của nhóm. Backend mặc định `http://127.0.0.1:8000`; có thể đổi bằng `VITE_API_URL` trong `frontend/.env` rồi khởi động lại frontend. CORS đã cho phép cả localhost và 127.0.0.1 tại cổng 5173.

### 3. Chuẩn bị tài khoản và phân công hồ sơ

Nếu đã có tài khoản và hồ sơ TTS, dùng dữ liệu hiện có. Nếu database mới chưa có tài khoản, tại `backend` chạy:

```powershell
..\.venv\Scripts\python.exe seed.py
```

Script `seed.py` gốc hỏi mật khẩu để tạo admin01/hr01/mentor01/intern01. Sau đó đăng nhập HR, tạo hồ sơ TTS bằng chức năng có sẵn. Dùng ID hồ sơ trong danh sách HR/URL sửa hồ sơ.

File gốc chưa có chức năng phân công mentor nên bản bàn giao bổ sung bảng phân công, API cho HR/Admin và helper thiết lập. Tại thư mục `backend`, chạy lệnh dưới đây với ID thực tế:

```powershell
..\.venv\Scripts\python.exe assign_mentor.py --intern-id 1 --mentor-username mentor01
```

- `--intern-id` là `intern_profiles.id`, **không phải** `users.id`.
- Mentor phải có role `mentor` và tài khoản đang hoạt động.
- Helper chỉ tạo phân công khi chưa có, hoặc xác nhận phân công cùng mentor. Nó không tự thay mentor khác.
- Nếu cần thay mentor, dùng API HR/Admin `PUT /api/mentor/assignments/{intern_id}` qua Swagger tại `http://127.0.0.1:8000/docs`, JSON `{"mentor_id": ID_TAI_KHOAN_MENTOR}`; đăng nhập HR bằng API auth gốc, dùng access token ở nút Authorize.
- Trong dự án này một TTS có một mentor phụ trách hiện tại. Khi thay mentor, các đánh giá cũ vẫn nằm trong database; mentor mới có phiếu riêng. Mentor cũ không còn đọc/sửa phiếu qua API này.

Cuối cùng đăng nhập Mentor, bấm **Tải lại** để thấy TTS được giao.

## Demo nghiệm thu

1. Mentor đăng nhập và chỉ thấy TTS của mình.
2. Bấm **Đánh giá**, chấm một tiêu chí rồi **Lưu nháp**.
3. Tải lại trang, bấm **Tiếp tục đánh giá**: điểm vừa nhập vẫn còn.
4. Bấm **Gửi đánh giá tổng kết** khi còn thiếu điểm/nhận xét: hệ thống báo yêu cầu bổ sung.
5. Điền sáu điểm `5,4,4,5,4,5`, điền ba phần nhận xét: kết quả là kỹ năng 4,33; thái độ 4,67; tổng kết 4,5; Xuất sắc.
6. Bấm gửi: hộp thoại cho quay lại kiểm tra hoặc xác nhận.
7. Xác nhận gửi, tải lại trang: trạng thái Đã gửi, nút **Xem tổng kết**, phiếu chỉ xem.
8. Thử gọi API bằng mentor không phụ trách: trả 403. Gửi lại phiếu đã gửi: trả 409.
9. Mở hai phiên cùng sửa bản nháp: phiên đã cũ không ghi đè được phiên mới, cần tải lại.

## API mới

| Method | URL | Vai trò | Mục đích |
| --- | --- | --- | --- |
| GET | /api/mentor/interns | mentor | Danh sách TTS được phân công kèm phiếu của mentor |
| GET | /api/mentor/evaluations/{intern_id} | mentor phụ trách | Lấy phiếu, trả null khi chưa có |
| PUT | /api/mentor/evaluations/{intern_id} | mentor phụ trách | Tạo/cập nhật nháp hoặc gửi tổng kết |
| PUT | /api/mentor/assignments/{intern_id} | hr/admin | Phân công hoặc thay mentor |

Body lưu phiếu gồm `technical`, `problem_solving`, `learning`, `discipline`, `initiative`, `teamwork` (điểm 1–5 hoặc null khi nháp); `strengths`, `improvements`, `conclusion`; `status` (`draft`/`submitted`); `expected_revision` (0 khi tạo, revision hiện tại khi sửa).

Các điểm nhóm/tổng kết/xếp loại được backend tính từ tiêu chí. Client không thể tự gửi một điểm tổng kết tùy ý để thay kết quả.

## Tệp bàn giao / ghép vào dự án nhóm

| Tệp | Thay đổi |
| --- | --- |
| frontend/src/pages/MentorDashboard.jsx | Thay màn hình khung bằng chức năng đánh giá đầy đủ |
| frontend/src/pages/MentorDashboard.css | Giao diện desktop/mobile, hộp thoại xác nhận |
| frontend/src/services/evaluations.js | Gọi API, chuyển lỗi thành thông báo |
| frontend/src/services/evaluationScoring.js | Tiêu chí và tính điểm xem trước |
| frontend/tests/evaluationScoring.test.js | Kiểm tra điểm và các ngưỡng xếp loại |
| frontend/package.json | Thêm lệnh test:evaluation |
| backend/models/mentor_evaluation.py | Hai bảng phân công và đánh giá |
| backend/schemas/mentor_evaluation.py | Kiểm tra điểm/nhận xét/trạng thái |
| backend/routers/mentor_evaluations.py | API với giới hạn quyền và revision |
| backend/main.py | Đăng ký model/router mới và CORS 127.0.0.1 |
| backend/assign_mentor.py | Helper phân công dữ liệu hiện có |
| backend/tests/test_mentor_evaluations.py | Kiểm tra API có JWT và database SQLite |
| backend/requirements-dev.txt | Phụ thuộc chạy kiểm tra |
| backend/requirements.txt | Chuyển UTF-16 sang UTF-8, giữ nguyên phiên bản thư viện |
| .env.example | Ví dụ cấu hình chạy nhanh và nhắc thay SECRET_KEY |

Không phải ghép sang dự án HTML/Node của file trước: bản này làm trực tiếp trên dự án React/FastAPI mới bạn gửi. Nếu nhóm có thay đổi mới, hãy so sánh và ghép từng tệp thay vì chép đè toàn bộ thư mục.

## Kiểm tra đã thực hiện

- Frontend build thành công bằng `npm run build`.
- ESLint đạt đối với các tệp chức năng đánh giá mới và tệp kiểm tra.
- 17 kiểm tra API đạt với thư viện đúng phiên bản trong requirements gốc và SQLite thật: JWT/vai trò, giới hạn phân công, lưu/cập nhật nháp, điểm không hợp lệ, nhận xét thiếu, revision xung đột, khóa phiếu, thay mentor và giữ lịch sử.
- 7 kiểm tra tính điểm frontend đạt.
- Chromium kết nối React/FastAPI với SQLite thật: kiểm tra lưu lỗi, giữ dữ liệu nhập, lưu nháp và tải lại, xác nhận gửi, điểm tổng kết, phiếu đã khóa và bố cục desktop/mobile (390 px, không tràn ngang toàn trang).
- `npm run lint` trên toàn bộ dự án vẫn có 7 lỗi và 4 cảnh báo từ các màn hình HR/Intern có sẵn. Chưa sửa các màn hình đó vì không thuộc nhiệm vụ đánh giá Mentor.
- Chưa chạy thử với MySQL/database thực tế của nhóm; cần nghiệm thu lại trên môi trường đó, đặc biệt việc khóa bản ghi khi truy cập đồng thời.

Chạy kiểm tra backend, từ thư mục `backend` (database kiểm tra riêng, không ghi database nhóm):

```powershell
..\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
..\.venv\Scripts\python.exe -m pytest -q tests/test_mentor_evaluations.py
```

Chạy kiểm tra frontend, từ thư mục `frontend`:

```powershell
npm run test:evaluation
npm run build
```

## Mô tả task để đưa vào Jira

Triển khai chức năng Mentor đánh giá kỹ năng và thái độ TTS được phân công: sáu tiêu chí theo thang 1–5, nhận xét điểm mạnh/cần cải thiện/tổng kết, lưu nháp, xem trước điểm và xếp loại, xác nhận gửi và xem phiếu đã gửi. Tích hợp API lưu database, kiểm tra vai trò/phân công và chống ghi đè phiên bản cũ. Nghiệm thu theo các bước demo ở trên trước khi chuyển task sang Done.

Phạm vi: một phiếu tổng kết cho mỗi cặp Mentor–TTS. Chưa thêm đánh giá theo từng tuần/tháng, màn hình HR đọc tổng kết, gửi email hay xuất PDF.
