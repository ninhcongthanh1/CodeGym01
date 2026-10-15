import { UserRole } from './index';

export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface ModulePermissionGroup {
  moduleId: string;
  moduleName: string;
  permissions: PermissionDefinition[];
}

export const PERMISSION_MODULES: ModulePermissionGroup[] = [
  {
    moduleId: 'interns',
    moduleName: 'Hồ Sơ Thực Tập Sinh',
    permissions: [
      { id: 'interns:view', name: 'Xem hồ sơ thực tập sinh', description: 'Xem danh sách và chi tiết thông tin thực tập sinh', module: 'interns' },
      { id: 'interns:create', name: 'Thêm mới thực tập sinh', description: 'Tạo mới hồ sơ thực tập sinh vào hệ thống', module: 'interns' },
      { id: 'interns:edit', name: 'Chỉnh sửa thông tin', description: 'Sửa thông tin cá nhân, trường, ngành, GPA', module: 'interns' },
      { id: 'interns:delete', name: 'Xóa hồ sơ', description: 'Xóa vĩnh viễn hồ sơ thực tập sinh', module: 'interns' },
      { id: 'interns:verify_docs', name: 'Xác thực / Duyệt tài liệu', description: 'Duyệt tính hợp lệ của CV và đơn thực tập trường', module: 'interns' },
      { id: 'interns:export', name: 'Xuất file Excel', description: 'Tải xuống danh sách thực tập sinh ra file Excel (.xlsx)', module: 'interns' }
    ]
  },
  {
    moduleId: 'recruitment',
    moduleName: 'Tiếp Nhận & Xét Duyệt Ứng Viên',
    permissions: [
      { id: 'recruitment:view', name: 'Xem phễu ứng tuyển', description: 'Xem danh sách ứng viên nộp hồ sơ trực tuyến', module: 'recruitment' },
      { id: 'recruitment:manage', name: 'Xét duyệt hồ sơ', description: 'Mời phỏng vấn, tiếp nhận hoặc từ chối ứng viên', module: 'recruitment' }
    ]
  },
  {
    moduleId: 'programs',
    moduleName: 'Đợt Thực Tập & Phân Công',
    permissions: [
      { id: 'programs:view', name: 'Xem đợt thực tập', description: 'Xem danh sách đợt thực tập, kế hoạch và milestones', module: 'programs' },
      { id: 'programs:create', name: 'Tạo đợt thực tập mới', description: 'Thiết lập đợt tuyển dụng và chỉ tiêu theo phòng ban', module: 'programs' },
      { id: 'programs:assign_mentor', name: 'Phân công Mentor', description: 'Gán người hướng dẫn phụ trách thực tập sinh', module: 'programs' }
    ]
  },
  {
    moduleId: 'mentors',
    moduleName: 'Quản Lý Mentor & Phòng Ban',
    permissions: [
      { id: 'mentors:view', name: 'Xem đội ngũ Mentor', description: 'Xem danh bạ và chỉ số tải công việc (Workload)', module: 'mentors' },
      { id: 'mentors:manage', name: 'Thêm & Quản lý Mentor', description: 'Thêm mentor mới và điều chỉnh hạn ngạch mentee', module: 'mentors' }
    ]
  },
  {
    moduleId: 'tasks',
    moduleName: 'Nhiệm Vụ & Bảng Kanban',
    permissions: [
      { id: 'tasks:view', name: 'Xem danh sách nhiệm vụ', description: 'Xem các thẻ công việc trên bảng Kanban', module: 'tasks' },
      { id: 'tasks:create', name: 'Giao nhiệm vụ mới', description: 'Tạo task mới, đặt deadline và gán cho sinh viên', module: 'tasks' },
      { id: 'tasks:update_status', name: 'Cập nhật tiến độ task', description: 'Chuyển cột Kanban và kéo thanh trượt % tiến độ', module: 'tasks' },
      { id: 'tasks:delete', name: 'Xóa nhiệm vụ', description: 'Xóa công việc khỏi hệ thống', module: 'tasks' }
    ]
  },
  {
    moduleId: 'reports',
    moduleName: 'Báo Cáo Tiến Độ Tuần',
    permissions: [
      { id: 'reports:view', name: 'Xem báo cáo tuần', description: 'Xem danh sách báo cáo định kỳ hàng tuần', module: 'reports' },
      { id: 'reports:submit', name: 'Nộp báo cáo tuần', description: 'Tạo và gửi báo cáo kết quả công việc tuần', module: 'reports' },
      { id: 'reports:review', name: 'Chấm điểm & Nhận xét', description: 'Mentor chấm điểm thang 10 và để lại phản hồi', module: 'reports' }
    ]
  },
  {
    moduleId: 'evaluations',
    moduleName: 'Đánh Giá & Chứng Nhận',
    permissions: [
      { id: 'evaluations:view', name: 'Xem phiếu đánh giá', description: 'Xem điểm số kỹ thuật, thái độ và xếp loại', module: 'evaluations' },
      { id: 'evaluations:create', name: 'Tạo phiếu đánh giá', description: 'Đánh giá giữa kỳ và cuối kỳ thực tập', module: 'evaluations' },
      { id: 'evaluations:issue_cert', name: 'Cấp chứng nhận hoàn thành', description: 'Xuất và in Giấy chứng nhận có mộc đỏ', module: 'evaluations' }
    ]
  },
  {
    moduleId: 'attendance',
    moduleName: 'Chấm Công & Nghỉ Phép',
    permissions: [
      { id: 'attendance:view', name: 'Xem nhật ký chấm công', description: 'Xem bảng giờ làm và trạng thái đi muộn/đúng giờ', module: 'attendance' },
      { id: 'attendance:checkin', name: 'Thực hiện Check-in/out', description: 'Tự bấm điểm danh trực tuyến hoặc quét mã QR', module: 'attendance' },
      { id: 'attendance:leaves_view', name: 'Xem đơn nghỉ phép', description: 'Xem danh sách đơn xin nghỉ phép', module: 'attendance' },
      { id: 'attendance:leaves_submit', name: 'Nộp đơn xin nghỉ phép', description: 'Gửi đơn xin nghỉ phép mới (ốm, thi cử)', module: 'attendance' },
      { id: 'attendance:leaves_review', name: 'Duyệt đơn nghỉ phép', description: 'HR duyệt hoặc từ chối đơn xin nghỉ', module: 'attendance' }
    ]
  },
  {
    moduleId: 'allowances',
    moduleName: 'Phụ Cấp & Chế Độ',
    permissions: [
      { id: 'allowances:view', name: 'Xem bảng phụ cấp', description: 'Xem danh sách phụ cấp và phiếu chi lương', module: 'allowances' },
      { id: 'allowances:manage', name: 'Lập & Duyệt phụ cấp', description: 'Tạo phiếu tính tiền theo ngày công và xác nhận chi trả', module: 'allowances' }
    ]
  },
  {
    moduleId: 'support',
    moduleName: 'Yêu Cầu Hỗ Trợ (Helpdesk)',
    permissions: [
      { id: 'tickets:view', name: 'Xem yêu cầu hỗ trợ', description: 'Xem danh sách ticket hỗ trợ của sinh viên', module: 'support' },
      { id: 'tickets:submit', name: 'Gửi yêu cầu hỗ trợ', description: 'Gửi yêu cầu mộc trường, máy tính, thẻ xe', module: 'support' },
      { id: 'tickets:resolve', name: 'Xử lý & Phản hồi ticket', description: 'HR giải quyết yêu cầu và ghi chú phản hồi', module: 'support' }
    ]
  },
  {
    moduleId: 'analytics',
    moduleName: 'Báo Cáo & Thống Kê',
    permissions: [
      { id: 'analytics:view', name: 'Xem báo cáo chiến lược', description: 'Xem biểu đồ phân bổ trường/ngành và tỷ lệ tuyển dụng', module: 'analytics' }
    ]
  },
  {
    moduleId: 'admin',
    moduleName: 'Quản Trị Hệ Thống',
    permissions: [
      { id: 'admin:users', name: 'Quản lý tài khoản người dùng', description: 'Xem danh sách tài khoản hệ thống', module: 'admin' },
      { id: 'admin:rbac', name: 'Cấu hình phân quyền động', description: 'Bật/tắt phân quyền cho từng vai trò', module: 'admin' },
      { id: 'admin:audit', name: 'Xem nhật ký Audit Log', description: 'Theo dõi lịch sử thao tác toàn hệ thống kèm IP', module: 'admin' },
      { id: 'admin:backup', name: 'Sao lưu & Khôi phục database', description: 'Xuất tải file JSON và nạp lại cơ sở dữ liệu', module: 'admin' }
    ]
  }
];

export const ALL_PERMISSION_IDS: string[] = PERMISSION_MODULES.flatMap(m => m.permissions.map(p => p.id));

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [...ALL_PERMISSION_IDS],
  hr: [
    'interns:view', 'interns:create', 'interns:edit', 'interns:delete', 'interns:verify_docs', 'interns:export',
    'recruitment:view', 'recruitment:manage',
    'programs:view', 'programs:create', 'programs:assign_mentor',
    'mentors:view', 'mentors:manage',
    'tasks:view', 'tasks:create', 'tasks:update_status', 'tasks:delete',
    'reports:view', 'reports:review',
    'evaluations:view', 'evaluations:create', 'evaluations:issue_cert',
    'attendance:view', 'attendance:leaves_view', 'attendance:leaves_review',
    'allowances:view', 'allowances:manage',
    'tickets:view', 'tickets:resolve',
    'analytics:view'
  ],
  mentor: [
    'interns:view',
    'programs:view',
    'mentors:view',
    'tasks:view', 'tasks:create', 'tasks:update_status',
    'reports:view', 'reports:review',
    'evaluations:view', 'evaluations:create',
    'attendance:view'
  ],
  intern: [
    'programs:view',
    'tasks:view', 'tasks:update_status',
    'reports:view', 'reports:submit',
    'evaluations:view',
    'attendance:view', 'attendance:checkin', 'attendance:leaves_view', 'attendance:leaves_submit',
    'allowances:view',
    'tickets:view', 'tickets:submit'
  ],
  candidate: [
    'recruitment:view'
  ]
};
