export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'IMS Enterprise API - Hệ Thống Quản Lý Thực Tập Sinh Doanh Nghiệp',
    version: '2.6.0',
    description: `Tài liệu API Swagger hoàn chỉnh cho Hệ thống Quản lý Thực tập sinh (Internship Management System - IMS).
Bao gồm 10 Epics & 42 User Stories:
- Quản lý hồ sơ thực tập sinh & tài liệu (CV, đơn xin thực tập)
- Tiếp nhận, xét duyệt ứng viên & hợp đồng điện tử
- Quản lý đợt thực tập, chỉ tiêu & phân công mentor
- Giao việc Kanban, báo cáo tiến độ tuần & đánh giá năng lực đa chiều
- Chấm công thời gian thực (Web / Mã QR) & xét duyệt nghỉ phép
- Quản lý bảng phụ cấp & Helpdesk yêu cầu hỗ trợ
- Quản trị hệ thống, phân quyền RBAC, nhật ký kiểm toán (Audit Trail) & sao lưu dữ liệu.`,
    contact: {
      name: 'IMS Enterprise Engineering Team',
      email: 'dev@ims.corp'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Máy chủ Backend Node.js Express cục bộ'
    },
    {
      url: 'http://localhost:3000',
      description: 'Frontend Proxy'
    }
  ],
  tags: [
    { name: 'Health', description: 'Kiểm tra trạng thái server' },
    { name: 'Interns', description: 'Quản lý hồ sơ thực tập sinh, duyệt tài liệu & ký hợp đồng' },
    { name: 'Tasks', description: 'Nhiệm vụ công việc & tiến độ Kanban' },
    { name: 'Reports', description: 'Báo cáo tuần & Mentor phản hồi chấm điểm' },
    { name: 'Evaluations', description: 'Đánh giá năng lực & cấp Giấy chứng nhận hoàn thành' },
    { name: 'Attendance', description: 'Chấm công (Check-in/out Web & Mã QR)' },
    { name: 'Leaves', description: 'Đăng ký và xét duyệt đơn xin nghỉ phép' },
    { name: 'Allowances', description: 'Bảng tính phụ cấp & phiếu chi lương' },
    { name: 'Tickets', description: 'Yêu cầu hỗ trợ (Helpdesk) sinh viên' },
    { name: 'Programs', description: 'Khóa thực tập, chỉ tiêu & lộ trình mốc' },
    { name: 'Mentors', description: 'Đội ngũ mentor & phân bổ khối lượng hướng dẫn' },
    { name: 'System', description: 'Phòng ban, người dùng, thông báo, email & Audit Logs' }
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Kiểm tra tình trạng hoạt động của API',
        responses: {
          200: {
            description: 'Server đang hoạt động bình thường'
          }
        }
      }
    },
    '/api/interns': {
      get: {
        tags: ['Interns'],
        summary: 'Lấy danh sách thực tập sinh (kèm tìm kiếm & bộ lọc)',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Tìm theo tên, email hoặc mã SV' },
          { name: 'university', in: 'query', schema: { type: 'string' }, description: 'Lọc theo trường đại học' },
          { name: 'major', in: 'query', schema: { type: 'string' }, description: 'Lọc theo chuyên ngành' },
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Trạng thái (active, applying, interviewing, completed)' },
          { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Lọc theo phòng ban' }
        ],
        responses: {
          200: { description: 'Danh sách hồ sơ thực tập sinh' }
        }
      },
      post: {
        tags: ['Interns'],
        summary: 'Thêm mới hồ sơ thực tập sinh / Đăng ký nộp hồ sơ trực tuyến',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'university', 'major'],
                properties: {
                  fullName: { type: 'string', example: 'Nguyễn Văn An' },
                  email: { type: 'string', example: 'an.nv@student.hust.edu.vn' },
                  phone: { type: 'string', example: '0987 654 321' },
                  university: { type: 'string', example: 'Đại học Bách Khoa Hà Nội' },
                  major: { type: 'string', example: 'Khoa học Máy tính' },
                  gpa: { type: 'number', example: 3.65 },
                  graduationYear: { type: 'integer', example: 2026 },
                  departmentId: { type: 'string', example: 'dept-1' },
                  programId: { type: 'string', example: 'prog-1' },
                  status: { type: 'string', example: 'applying' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Tạo hồ sơ thành công' }
        }
      }
    },
    '/api/interns/{id}': {
      get: {
        tags: ['Interns'],
        summary: 'Xem chi tiết một hồ sơ thực tập sinh',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Chi tiết hồ sơ' }, 404: { description: 'Không tìm thấy' } }
      },
      put: {
        tags: ['Interns'],
        summary: 'Chỉnh sửa thông tin hồ sơ thực tập sinh',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } }
        },
        responses: { 200: { description: 'Cập nhật thành công' } }
      },
      delete: {
        tags: ['Interns'],
        summary: 'Xóa hồ sơ thực tập sinh',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Xóa thành công' } }
      }
    },
    '/api/interns/{id}/status': {
      patch: {
        tags: ['Interns'],
        summary: 'Cập nhật trạng thái ứng tuyển / thực tập',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { status: { type: 'string', example: 'accepted' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Cập nhật trạng thái thành công' } }
      }
    },
    '/api/interns/{id}/contract/sign': {
      patch: {
        tags: ['Interns'],
        summary: 'Ký xác nhận hợp đồng thực tập điện tử',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Đã ký hợp đồng điện tử thành công' } }
      }
    },
    '/api/interns/{id}/documents': {
      post: {
        tags: ['Interns'],
        summary: 'Tải lên tài liệu mới (CV, đơn xin thực tập)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'CV_BoSung.pdf' },
                  type: { type: 'string', example: 'cv' },
                  fileSize: { type: 'string', example: '1.2 MB' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Tải lên thành công' } }
      }
    },
    '/api/interns/{id}/documents/{docId}/verify': {
      patch: {
        tags: ['Interns'],
        summary: 'HR duyệt và xác thực tính hợp lệ của tài liệu',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'docId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Đã duyệt tài liệu' } }
      }
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Lấy danh sách công việc & nhiệm vụ',
        parameters: [
          { name: 'internId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Danh sách nhiệm vụ' } }
      },
      post: {
        tags: ['Tasks'],
        summary: 'Giao nhiệm vụ mới cho thực tập sinh',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'assignedToInternId', 'dueDate'],
                properties: {
                  title: { type: 'string', example: 'Xây dựng API xác thực JWT' },
                  description: { type: 'string', example: 'Thiết kế middleware bảo mật...' },
                  assignedToInternId: { type: 'string', example: 'intern-1' },
                  priority: { type: 'string', example: 'high' },
                  dueDate: { type: 'string', example: '2026-07-25' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Tạo nhiệm vụ thành công' } }
      }
    },
    '/api/tasks/{id}/status': {
      patch: {
        tags: ['Tasks'],
        summary: 'Cập nhật tiến độ Kanban & % hoàn thành',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'in_progress' },
                  progressPercent: { type: 'integer', example: 75 }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Cập nhật trạng thái công việc thành công' } }
      }
    },
    '/api/reports': {
      get: {
        tags: ['Reports'],
        summary: 'Lấy danh sách báo cáo tuần',
        parameters: [{ name: 'internId', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Danh sách báo cáo tuần' } }
      },
      post: {
        tags: ['Reports'],
        summary: 'Nộp báo cáo tuần mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['internId', 'weekNumber', 'achievements', 'nextWeekPlan'],
                properties: {
                  internId: { type: 'string', example: 'intern-1' },
                  weekNumber: { type: 'integer', example: 6 },
                  startDate: { type: 'string', example: '2026-07-13' },
                  endDate: { type: 'string', example: '2026-07-19' },
                  achievements: { type: 'string', example: 'Hoàn thành API...' },
                  challenges: { type: 'string', example: 'Tối ưu query...' },
                  nextWeekPlan: { type: 'string', example: 'Bảo vệ sprint...' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Nộp báo cáo thành công' } }
      }
    },
    '/api/reports/{id}/review': {
      patch: {
        tags: ['Reports'],
        summary: 'Mentor chấm điểm thang 10 & gửi nhận xét cho báo cáo tuần',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  score: { type: 'number', example: 9.5 },
                  feedback: { type: 'string', example: 'Làm rất tốt, code sạch sẽ!' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Chấm điểm thành công' } }
      }
    },
    '/api/evaluations': {
      get: {
        tags: ['Evaluations'],
        summary: 'Lấy danh sách đánh giá năng lực & xếp loại',
        responses: { 200: { description: 'Danh sách đánh giá' } }
      },
      post: {
        tags: ['Evaluations'],
        summary: 'Tạo phiếu đánh giá năng lực thực tập sinh',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  internId: { type: 'string', example: 'intern-1' },
                  type: { type: 'string', example: 'final' },
                  technicalScore: { type: 'number', example: 4.8 },
                  attitudeScore: { type: 'number', example: 5.0 },
                  disciplineScore: { type: 'number', example: 4.9 },
                  teamworkScore: { type: 'number', example: 4.7 },
                  totalScore: { type: 'number', example: 9.6 },
                  overallGrade: { type: 'string', example: 'Xuất sắc' },
                  recommendation: { type: 'string', example: 'hire_fulltime' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Tạo đánh giá thành công' } }
      }
    },
    '/api/evaluations/{id}/certificate': {
      patch: {
        tags: ['Evaluations'],
        summary: 'Phát hành Giấy chứng nhận hoàn thành thực tập (Certificate)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Cấp chứng nhận thành công' } }
      }
    },
    '/api/attendance': {
      get: {
        tags: ['Attendance'],
        summary: 'Lấy bảng chấm công chi tiết',
        responses: { 200: { description: 'Nhật ký chấm công' } }
      }
    },
    '/api/attendance/check-in': {
      post: {
        tags: ['Attendance'],
        summary: 'Ghi nhận Check-in (Web hoặc quét mã QR)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  internId: { type: 'string', example: 'intern-1' },
                  method: { type: 'string', example: 'qr' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Check-in thành công' }, 400: { description: 'Đã check-in rồi' } }
      }
    },
    '/api/attendance/check-out': {
      post: {
        tags: ['Attendance'],
        summary: 'Ghi nhận Check-out và tự động tính số giờ làm việc',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { internId: { type: 'string', example: 'intern-1' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Check-out thành công' } }
      }
    },
    '/api/leaves': {
      get: {
        tags: ['Leaves'],
        summary: 'Danh sách đơn xin nghỉ phép',
        responses: { 200: { description: 'Danh sách đơn' } }
      },
      post: {
        tags: ['Leaves'],
        summary: 'Nộp đơn xin nghỉ phép mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  internId: { type: 'string', example: 'intern-1' },
                  startDate: { type: 'string', example: '2026-07-28' },
                  endDate: { type: 'string', example: '2026-07-28' },
                  type: { type: 'string', example: 'exam' },
                  reason: { type: 'string', example: 'Về trường thi môn Cấu trúc Dữ liệu' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Nộp đơn thành công' } }
      }
    },
    '/api/leaves/{id}/review': {
      patch: {
        tags: ['Leaves'],
        summary: 'HR duyệt hoặc từ chối đơn xin nghỉ phép',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'approved' },
                  note: { type: 'string', example: 'Chúc em thi tốt!' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Xét duyệt thành công' } }
      }
    },
    '/api/allowances': {
      get: {
        tags: ['Allowances'],
        summary: 'Danh sách phiếu phụ cấp hàng tháng',
        responses: { 200: { description: 'Danh sách phụ cấp' } }
      },
      post: {
        tags: ['Allowances'],
        summary: 'Tạo phiếu phụ cấp mới theo ngày công',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  internId: { type: 'string', example: 'intern-1' },
                  month: { type: 'string', example: '2026-07' },
                  standardWorkDays: { type: 'integer', example: 22 },
                  actualWorkDays: { type: 'integer', example: 22 },
                  baseAllowance: { type: 'integer', example: 4500000 },
                  mealAllowance: { type: 'integer', example: 1100000 },
                  bonusAllowance: { type: 'integer', example: 500000 },
                  totalAmount: { type: 'integer', example: 6100000 }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Tạo phiếu phụ cấp thành công' } }
      }
    },
    '/api/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Danh sách yêu cầu hỗ trợ (Helpdesk)',
        responses: { 200: { description: 'Danh sách tickets' } }
      },
      post: {
        tags: ['Tickets'],
        summary: 'Thực tập sinh gửi yêu cầu hỗ trợ mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  internId: { type: 'string', example: 'intern-1' },
                  title: { type: 'string', example: 'Xin dấu mộc Báo cáo tốt nghiệp' },
                  category: { type: 'string', example: 'stamp_request' },
                  description: { type: 'string', example: 'Em cần dấu mộc công ty cho trường HUST...' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Gửi yêu cầu thành công' } }
      }
    },
    '/api/system/audit-logs': {
      get: {
        tags: ['System'],
        summary: 'Lấy nhật ký kiểm toán hệ thống (Audit Trail)',
        responses: { 200: { description: 'Danh sách audit logs' } }
      }
    },
    '/api/system/backup': {
      get: {
        tags: ['System'],
        summary: 'Xuất toàn bộ cơ sở dữ liệu SQLite dưới dạng JSON',
        responses: { 200: { description: 'Gói sao lưu cơ sở dữ liệu JSON' } }
      }
    },
    '/api/system/reset': {
      post: {
        tags: ['System'],
        summary: 'Đặt lại cơ sở dữ liệu về dữ liệu mẫu ban đầu',
        responses: { 200: { description: 'Reset thành công' } }
      }
    }
  }
};
