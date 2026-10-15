import { 
  User, Department, InternProfile, InternshipProgram, Mentor, 
  Task, WeeklyReport, PerformanceEvaluation, AttendanceRecord, 
  LeaveRequest, AllowanceRecord, SupportTicket, NotificationItem, 
  AuditLog, SystemEmailLog 
} from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Công nghệ & Phát triển Phần mềm',
    code: 'SWE',
    managerName: 'Vũ Quốc Anh',
    description: 'Phát triển các nền tảng web, mobile và hệ thống microservices đám mây'
  },
  {
    id: 'dept-2',
    name: 'Thiết kế Sản phẩm & UI/UX',
    code: 'UIUX',
    managerName: 'Lê Thảo My',
    description: 'Nghiên cứu trải nghiệm người dùng, thiết kế giao diện Figma và Design System'
  },
  {
    id: 'dept-3',
    name: 'Quản trị Sản phẩm (Product Management)',
    code: 'PM',
    managerName: 'Trịnh Hoàng Long',
    description: 'Nghiên cứu thị trường, định hướng tính năng và tối ưu hóa trải nghiệm khách hàng'
  },
  {
    id: 'dept-4',
    name: 'Marketing Số & Tăng trưởng',
    code: 'MKT',
    managerName: 'Nguyễn Bích Ngọc',
    description: 'Triển khai chiến dịch truyền thông đa kênh, SEO, Content và Quảng cáo số'
  },
  {
    id: 'dept-5',
    name: 'Tài chính & Phân tích Dữ liệu Doanh nghiệp',
    code: 'FIN',
    managerName: 'Đặng Thanh Tùng',
    description: 'Quản trị dòng tiền, phân tích số liệu tài chính và báo cáo hiệu quả đầu tư'
  }
];

export const INITIAL_PROGRAMS: InternshipProgram[] = [
  {
    id: 'prog-1',
    name: 'Khóa Thực Tập Sinh Tài Năng Mùa Hè 2026',
    batchCode: 'SUMMER-2026-T1',
    departmentId: 'dept-1',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    targetCount: 15,
    currentCount: 12,
    status: 'ongoing',
    description: 'Chương trình 3 tháng rèn luyện thực chiến công nghệ Fullstack và Cloud dành cho sinh viên xuất sắc năm 3 & năm 4.',
    milestones: [
      { id: 'm-1', title: 'Onboarding & Làm quen công ty', date: '2026-06-01', completed: true },
      { id: 'm-2', title: 'Hoàn thành Training nền tảng', date: '2026-06-20', completed: true },
      { id: 'm-3', title: 'Đánh giá Giữa kỳ (Mid-term)', date: '2026-07-15', completed: true },
      { id: 'm-4', title: 'Bảo vệ Đồ án & Báo cáo Cuối kỳ', date: '2026-08-25', completed: false },
      { id: 'm-5', title: 'Lễ Tổng kết & Trao Offer Chính thức', date: '2026-08-31', completed: false }
    ]
  },
  {
    id: 'prog-2',
    name: 'Chương Trình AI & Dữ Liệu Tương Lai 2026',
    batchCode: 'AI-TALENT-2026',
    departmentId: 'dept-1',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    targetCount: 8,
    currentCount: 6,
    status: 'ongoing',
    description: 'Rèn luyện ứng dụng Large Language Models, MLOps và tự động hóa quy trình nghiệp vụ.',
    milestones: [
      { id: 'm-6', title: 'Onboarding & Setup Môi trường', date: '2026-07-01', completed: true },
      { id: 'm-7', title: 'Báo cáo Giữa kỳ', date: '2026-08-15', completed: false },
      { id: 'm-8', title: 'Bảo vệ Dự án AI', date: '2026-09-28', completed: false }
    ]
  },
  {
    id: 'prog-3',
    name: 'Vườn Ươm UI/UX Designer & Product 2026',
    batchCode: 'DESIGN-BATCH-03',
    departmentId: 'dept-2',
    startDate: '2026-05-15',
    endDate: '2026-08-15',
    targetCount: 10,
    currentCount: 8,
    status: 'ongoing',
    description: 'Chương trình thực tập thiết kế trải nghiệm người dùng trên các sản phẩm SaaS B2B.',
    milestones: [
      { id: 'm-9', title: 'Khởi động khóa thực tập', date: '2026-05-15', completed: true },
      { id: 'm-10', title: 'Thuyết trình Case Study', date: '2026-08-10', completed: false }
    ]
  }
];

export const INITIAL_MENTORS: Mentor[] = [
  {
    id: 'men-1',
    userId: 'u-mentor-1',
    fullName: 'Lê Hoàng Nam',
    email: 'mentor.nam@ims.corp',
    phone: '0912 345 678',
    departmentId: 'dept-1',
    jobTitle: 'Senior Tech Lead & Software Architect',
    maxMentees: 5,
    currentMenteesCount: 3,
    skills: ['React', 'Node.js', 'System Architecture', 'Clean Code', 'TypeScript'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'men-2',
    userId: 'u-mentor-2',
    fullName: 'Hoàng Minh Đức',
    email: 'mentor.duc@ims.corp',
    phone: '0988 765 432',
    departmentId: 'dept-1',
    jobTitle: 'Principal Backend Engineer',
    maxMentees: 4,
    currentMenteesCount: 2,
    skills: ['Golang', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'men-3',
    userId: 'u-mentor-3',
    fullName: 'Nguyễn Mai Chi',
    email: 'mentor.chi@ims.corp',
    phone: '0903 112 233',
    departmentId: 'dept-2',
    jobTitle: 'Senior Product Designer',
    maxMentees: 4,
    currentMenteesCount: 2,
    skills: ['Figma', 'User Research', 'Design Systems', 'Prototyping'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'men-4',
    userId: 'u-mentor-4',
    fullName: 'Phạm Hồng Quân',
    email: 'mentor.quan@ims.corp',
    phone: '0934 556 789',
    departmentId: 'dept-4',
    jobTitle: 'Lead Growth Marketer',
    maxMentees: 4,
    currentMenteesCount: 2,
    skills: ['Performance Ads', 'Analytics', 'Content Strategy', 'Automation'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_INTERNS: InternProfile[] = [
  {
    id: 'intern-1',
    userId: 'u-intern-1',
    fullName: 'Phạm Minh Tuấn',
    email: 'intern.tuan@student.hust.edu.vn',
    phone: '0971 889 900',
    dateOfBirth: '2004-05-18',
    gender: 'male',
    university: 'Đại học Bách Khoa Hà Nội (HUST)',
    major: 'Khoa học Máy tính',
    gpa: 3.65,
    graduationYear: 2026,
    studentId: '20210899',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    departmentId: 'dept-1',
    programId: 'prog-1',
    mentorId: 'men-1',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    contractStatus: 'signed',
    contractSignedDate: '2026-05-28',
    documents: [
      {
        id: 'doc-1',
        name: 'CV_PhamMinhTuan_HUST_2026.pdf',
        type: 'cv',
        url: '#',
        uploadedAt: '2026-05-20',
        isVerified: true,
        verifiedBy: 'Trần Thu Hà (HR)',
        verifiedAt: '2026-05-22',
        fileSize: '1.8 MB'
      },
      {
        id: 'doc-2',
        name: 'Don_Xin_Thuc_Tap_Co_Xac_Nhan_Truong.pdf',
        type: 'intern_application',
        url: '#',
        uploadedAt: '2026-05-20',
        isVerified: true,
        verifiedBy: 'Trần Thu Hà (HR)',
        verifiedAt: '2026-05-22',
        fileSize: '850 KB'
      },
      {
        id: 'doc-3',
        name: 'Hop_Dong_Thuc_Tap_Doanh_Nghiep_Ky_Dien_Tu.pdf',
        type: 'contract',
        url: '#',
        uploadedAt: '2026-05-28',
        isVerified: true,
        verifiedBy: 'Trần Thu Hà (HR)',
        verifiedAt: '2026-05-28',
        fileSize: '2.1 MB'
      }
    ],
    notes: 'Thực tập sinh xuất sắc, giải Nhì Olympic Tin học Sinh viên toàn quốc, hoàn thành tốt task giao.',
    createdAt: '2026-05-18'
  },
  {
    id: 'intern-2',
    fullName: 'Đỗ Thùy Linh',
    email: 'thuylinh.do@ftu.edu.vn',
    phone: '0983 221 445',
    dateOfBirth: '2004-11-20',
    gender: 'female',
    university: 'Đại học Ngoại Thương (FTU)',
    major: 'Kinh doanh Quốc tế & Marketing',
    gpa: 3.78,
    graduationYear: 2026,
    studentId: '22110455',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    departmentId: 'dept-4',
    programId: 'prog-1',
    mentorId: 'men-4',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    contractStatus: 'signed',
    contractSignedDate: '2026-05-29',
    documents: [
      {
        id: 'doc-4',
        name: 'CV_DoThuyLinh_FTU.pdf',
        type: 'cv',
        url: '#',
        uploadedAt: '2026-05-21',
        isVerified: true,
        verifiedBy: 'Trần Thu Hà (HR)',
        verifiedAt: '2026-05-23',
        fileSize: '1.2 MB'
      }
    ],
    notes: 'Kỹ năng tiếng Anh IELTS 8.0, giao tiếp linh hoạt, sáng tạo nội dung rất tốt.',
    createdAt: '2026-05-20'
  },
  {
    id: 'intern-3',
    fullName: 'Trần Gia Bảo',
    email: 'giabao.tran@vnu.edu.vn',
    phone: '0915 678 123',
    dateOfBirth: '2003-08-14',
    gender: 'male',
    university: 'ĐH Công Nghệ - ĐHQG Hà Nội (UET)',
    major: 'Hệ thống Thông tin',
    gpa: 3.52,
    graduationYear: 2025,
    studentId: '21020088',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    departmentId: 'dept-1',
    programId: 'prog-1',
    mentorId: 'men-1',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    contractStatus: 'signed',
    contractSignedDate: '2026-05-28',
    documents: [
      {
        id: 'doc-5',
        name: 'CV_TranGiaBao_UET.pdf',
        type: 'cv',
        url: '#',
        uploadedAt: '2026-05-19',
        isVerified: true,
        verifiedBy: 'Trần Thu Hà (HR)',
        verifiedAt: '2026-05-21',
        fileSize: '1.5 MB'
      }
    ],
    createdAt: '2026-05-19'
  },
  {
    id: 'intern-4',
    fullName: 'Nguyễn Thị Hồng Hạnh',
    email: 'honghanh.design@fpt.edu.vn',
    phone: '0966 333 444',
    dateOfBirth: '2004-03-02',
    gender: 'female',
    university: 'Đại học FPT Hà Nội',
    major: 'Thiết kế Mỹ thuật Số',
    gpa: 3.82,
    graduationYear: 2026,
    studentId: 'FE180921',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    departmentId: 'dept-2',
    programId: 'prog-3',
    mentorId: 'men-3',
    startDate: '2026-05-15',
    endDate: '2026-08-15',
    contractStatus: 'signed',
    contractSignedDate: '2026-05-12',
    documents: [
      {
        id: 'doc-6',
        name: 'Portfolio_CV_HongHanh.pdf',
        type: 'cv',
        url: '#',
        uploadedAt: '2026-05-08',
        isVerified: true,
        verifiedBy: 'Trần Thu Hà (HR)',
        verifiedAt: '2026-05-10',
        fileSize: '4.5 MB'
      }
    ],
    createdAt: '2026-05-08'
  },
  {
    id: 'intern-5',
    fullName: 'Lê Thanh Bình',
    email: 'binh.le@neu.edu.vn',
    phone: '0945 889 122',
    dateOfBirth: '2003-12-10',
    gender: 'male',
    university: 'Đại học Kinh tế Quốc dân (NEU)',
    major: 'Phân tích Dữ liệu Kinh doanh',
    gpa: 3.60,
    graduationYear: 2025,
    studentId: '11210988',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'completed',
    departmentId: 'dept-5',
    programId: 'prog-1',
    mentorId: 'men-2',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    contractStatus: 'signed',
    contractSignedDate: '2026-02-25',
    documents: [],
    createdAt: '2026-02-20'
  },
  {
    id: 'intern-6',
    fullName: 'Vũ Hoàng Yến',
    email: 'hoangyen.vu@hcmut.edu.vn',
    phone: '0909 888 777',
    dateOfBirth: '2004-07-22',
    gender: 'female',
    university: 'ĐH Bách Khoa - ĐHQG TP.HCM (HCMUT)',
    major: 'Kỹ thuật Phần mềm',
    gpa: 3.90,
    graduationYear: 2026,
    studentId: '2213456',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    status: 'applying',
    departmentId: 'dept-1',
    programId: 'prog-2',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    contractStatus: 'not_sent',
    documents: [
      {
        id: 'doc-7',
        name: 'CV_VuHoangYen_BKTPHCM.pdf',
        type: 'cv',
        url: '#',
        uploadedAt: '2026-06-25',
        isVerified: false,
        fileSize: '2.0 MB'
      }
    ],
    notes: 'Ứng viên nộp hồ sơ trực tuyến qua Cổng tiếp nhận, GPA cực cao 3.90/4.0.',
    createdAt: '2026-06-25'
  },
  {
    id: 'intern-7',
    fullName: 'Ngô Quang Huy',
    email: 'quanghuy.ngo@hust.edu.vn',
    phone: '0977 112 334',
    dateOfBirth: '2004-09-05',
    gender: 'male',
    university: 'Đại học Bách Khoa Hà Nội (HUST)',
    major: 'Trí tuệ Nhân tạo',
    gpa: 3.72,
    graduationYear: 2026,
    studentId: '20214432',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    status: 'interviewing',
    departmentId: 'dept-1',
    programId: 'prog-2',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    contractStatus: 'not_sent',
    documents: [
      {
        id: 'doc-8',
        name: 'CV_NgoQuangHuy_AI.pdf',
        type: 'cv',
        url: '#',
        uploadedAt: '2026-06-20',
        isVerified: true,
        verifiedBy: 'Trần Thu Hà (HR)',
        verifiedAt: '2026-06-22',
        fileSize: '1.9 MB'
      }
    ],
    notes: 'Lịch phỏng vấn kỹ thuật với anh Lê Hoàng Nam vào 14:00 ngày mai.',
    createdAt: '2026-06-20'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin-1',
    name: 'Nguyễn Văn Quản Trị',
    email: 'admin@ims.corp',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '0901 000 001'
  },
  {
    id: 'u-hr-1',
    name: 'Trần Thu Hà',
    email: 'hr.ha@ims.corp',
    role: 'hr',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '0902 000 002',
    departmentId: 'dept-4'
  },
  {
    id: 'u-mentor-1',
    name: 'Lê Hoàng Nam',
    email: 'mentor.nam@ims.corp',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '0912 345 678',
    departmentId: 'dept-1'
  },
  {
    id: 'u-intern-1',
    name: 'Phạm Minh Tuấn',
    email: 'intern.tuan@student.hust.edu.vn',
    role: 'intern',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    phone: '0971 889 900',
    departmentId: 'dept-1',
    internProfileId: 'intern-1'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Xây dựng module xác thực Authentication với JWT & Refresh Token',
    description: 'Thiết kế middleware bảo mật, kiểm tra role-based access control (RBAC), viết unit test với Jest.',
    assignedToInternId: 'intern-1',
    createdById: 'men-1',
    departmentId: 'dept-1',
    status: 'done',
    priority: 'high',
    dueDate: '2026-06-15',
    startDate: '2026-06-05',
    progressPercent: 100,
    createdAt: '2026-06-05',
    updatedAt: '2026-06-14'
  },
  {
    id: 'task-2',
    title: 'Tối ưu hóa truy vấn cơ sở dữ liệu PostgreSQL cho báo cáo thống kê',
    description: 'Thêm Index cho các bảng log chấm công và hồ sơ sinh viên, giảm thời gian phản hồi API xuống dưới 200ms.',
    assignedToInternId: 'intern-1',
    createdById: 'men-1',
    departmentId: 'dept-1',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: '2026-07-20',
    startDate: '2026-07-10',
    progressPercent: 65,
    createdAt: '2026-07-10',
    updatedAt: '2026-07-15'
  },
  {
    id: 'task-3',
    title: 'Tích hợp tính năng xuất file Excel và in PDF hợp đồng thực tập',
    description: 'Sử dụng thư viện chuyên dụng để trích xuất báo cáo chấm công và hợp đồng có định dạng chuẩn văn bản.',
    assignedToInternId: 'intern-1',
    createdById: 'men-1',
    departmentId: 'dept-1',
    status: 'review',
    priority: 'medium',
    dueDate: '2026-07-25',
    startDate: '2026-07-16',
    progressPercent: 90,
    createdAt: '2026-07-16',
    updatedAt: '2026-07-18'
  },
  {
    id: 'task-4',
    title: 'Nghiên cứu thị trường và lập kế hoạch chiến dịch tuyển dụng Gen Z',
    description: 'Khảo sát nhu cầu thực tập của sinh viên khối kinh tế tại NEU, FTU; lên 5 chủ đề nội dung TikTok/LinkedIn.',
    assignedToInternId: 'intern-2',
    createdById: 'men-4',
    departmentId: 'dept-4',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-07-22',
    startDate: '2026-07-12',
    progressPercent: 50,
    createdAt: '2026-07-12',
    updatedAt: '2026-07-16'
  },
  {
    id: 'task-5',
    title: 'Thiết kế Design System Component Kit trên Figma cho Mobile App',
    description: 'Đồng bộ màu sắc, typography và 20 icon cơ bản theo thương hiệu công ty.',
    assignedToInternId: 'intern-4',
    createdById: 'men-3',
    departmentId: 'dept-2',
    status: 'done',
    priority: 'medium',
    dueDate: '2026-06-30',
    startDate: '2026-06-15',
    progressPercent: 100,
    createdAt: '2026-06-15',
    updatedAt: '2026-06-29'
  }
];

export const INITIAL_REPORTS: WeeklyReport[] = [
  {
    id: 'rep-1',
    internId: 'intern-1',
    weekNumber: 5,
    startDate: '2026-07-06',
    endDate: '2026-07-12',
    achievements: '- Đã hoàn thành 100% API đăng nhập, cấp refresh token và logout.\n- Viết tài liệu Swagger API chi tiết cho đội ngũ Frontend.\n- Hỗ trợ bạn Bảo gỡ lỗi kết nối Redis cache.',
    challenges: 'Thời gian phản hồi truy vấn nhiều quan hệ (JOIN 4 bảng) còn hơi chậm, cần mentor hướng dẫn thêm về indexing.',
    nextWeekPlan: '- Nghiên cứu Query Optimizer trong PostgreSQL.\n- Tham gia sprint review cùng bộ phận Backend vào thứ 4.\n- Bắt đầu module xuất dữ liệu Excel.',
    learningExperience: 'Hiểu sâu hơn về vòng đời JWT và cách tổ chức migration trong cơ sở dữ liệu thực tế.',
    submissionDate: '2026-07-12',
    status: 'reviewed',
    mentorScore: 9.5,
    mentorFeedback: 'Làm rất tốt! Code sạch sẽ, cấu trúc rõ ràng. Phần index tuần tới anh sẽ có buổi pair-programming 30 phút hướng dẫn em trực tiếp nhé.',
    mentorFeedbackDate: '2026-07-13'
  },
  {
    id: 'rep-2',
    internId: 'intern-1',
    weekNumber: 6,
    startDate: '2026-07-13',
    endDate: '2026-07-19',
    achievements: '- Đã hoàn thành chức năng xuất Excel báo cáo chấm công.\n- Viết template PDF in giấy giới thiệu thực tập chuẩn form.',
    challenges: 'Định dạng tiếng Việt có dấu khi render PDF cần load đúng font chữ UTF-8.',
    nextWeekPlan: '- Hoàn thiện giao diện Modal ký hợp đồng điện tử.\n- Chuẩn bị slide báo cáo tiến độ tuần 7.',
    submissionDate: '2026-07-19',
    status: 'submitted'
  }
];

export const INITIAL_EVALUATIONS: PerformanceEvaluation[] = [
  {
    id: 'eval-1',
    internId: 'intern-1',
    evaluatorId: 'men-1',
    type: 'mid_term',
    technicalScore: 4.8,
    attitudeScore: 5.0,
    disciplineScore: 4.9,
    teamworkScore: 4.7,
    totalScore: 9.6,
    overallGrade: 'Xuất sắc',
    generalFeedback: 'Tuấn là một trong những thực tập sinh xuất sắc nhất mà tôi từng hướng dẫn. Nắm bắt công nghệ cực nhanh, chủ động giải quyết vấn đề và có tinh thần đồng đội cao.',
    strengths: 'Tư duy thuật toán vững, viết mã nguồn sạch sẽ, tính kỷ luật giờ giấc tuyệt vời.',
    areasForImprovement: 'Cần tự tin hơn trong các buổi thuyết trình trước toàn ban lãnh đạo.',
    recommendation: 'hire_fulltime',
    evaluatedAt: '2026-07-15',
    isCertificateIssued: true
  },
  {
    id: 'eval-2',
    internId: 'intern-5',
    evaluatorId: 'men-2',
    type: 'final',
    technicalScore: 4.5,
    attitudeScore: 4.6,
    disciplineScore: 4.8,
    teamworkScore: 4.5,
    totalScore: 9.2,
    overallGrade: 'Giỏi',
    generalFeedback: 'Hoàn thành xuất sắc toàn bộ chỉ tiêu thực tập phân tích dữ liệu, báo cáo được ban giám đốc đánh giá cao.',
    strengths: 'Kỹ năng Excel, SQL và tư duy logic kinh doanh rất tốt.',
    areasForImprovement: 'Nên tìm hiểu thêm về công cụ BI tự động hóa như Power BI / Tableau.',
    recommendation: 'hire_fresher',
    evaluatedAt: '2026-05-30',
    isCertificateIssued: true
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    internId: 'intern-1',
    date: '2026-07-14',
    checkInTime: '08:25',
    checkOutTime: '17:35',
    status: 'on_time',
    workHours: 8.5,
    checkInMethod: 'qr',
    notes: 'Chấm công qua cổng QR phòng 402'
  },
  {
    id: 'att-2',
    internId: 'intern-1',
    date: '2026-07-15',
    checkInTime: '08:28',
    checkOutTime: '17:40',
    status: 'on_time',
    workHours: 8.5,
    checkInMethod: 'web'
  },
  {
    id: 'att-3',
    internId: 'intern-1',
    date: '2026-07-16',
    checkInTime: '08:45',
    checkOutTime: '17:30',
    status: 'late',
    workHours: 8.0,
    checkInMethod: 'web',
    notes: 'Đi muộn 15 phút do tắc đường Ngã Tư Sở'
  },
  {
    id: 'att-4',
    internId: 'intern-2',
    date: '2026-07-16',
    checkInTime: '08:20',
    checkOutTime: '17:30',
    status: 'on_time',
    workHours: 8.5,
    checkInMethod: 'qr'
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    internId: 'intern-1',
    startDate: '2026-07-28',
    endDate: '2026-07-28',
    type: 'exam',
    reason: 'Về trường thi môn Cấu trúc Dữ liệu & Giải thuật nâng cao (Buổi sáng 8:00 - 11:30)',
    status: 'approved',
    reviewedBy: 'Trần Thu Hà (HR)',
    reviewDate: '2026-07-15',
    reviewNote: 'Đồng ý nghỉ thi. Chúc em thi tốt!',
    createdAt: '2026-07-14'
  },
  {
    id: 'leave-2',
    internId: 'intern-3',
    startDate: '2026-07-22',
    endDate: '2026-07-23',
    type: 'sick',
    reason: 'Bị sốt xuất huyết cần nghỉ ngơi theo chỉ định bác sĩ',
    status: 'pending',
    createdAt: '2026-07-16'
  }
];

export const INITIAL_ALLOWANCES: AllowanceRecord[] = [
  {
    id: 'alw-1',
    internId: 'intern-1',
    month: '2026-06',
    standardWorkDays: 22,
    actualWorkDays: 22,
    baseAllowance: 4500000,
    mealAllowance: 1100000,
    bonusAllowance: 1000000,
    deductions: 0,
    totalAmount: 6600000,
    status: 'paid',
    paidDate: '2026-07-05',
    note: 'Thưởng hoàn thành xuất sắc module API bảo mật'
  },
  {
    id: 'alw-2',
    internId: 'intern-1',
    month: '2026-07',
    standardWorkDays: 23,
    actualWorkDays: 21,
    baseAllowance: 4500000,
    mealAllowance: 1050000,
    bonusAllowance: 500000,
    deductions: 0,
    totalAmount: 6050000,
    status: 'approved',
    note: 'Đã duyệt bảng công tháng 7'
  },
  {
    id: 'alw-3',
    internId: 'intern-2',
    month: '2026-06',
    standardWorkDays: 22,
    actualWorkDays: 22,
    baseAllowance: 4500000,
    mealAllowance: 1100000,
    bonusAllowance: 500000,
    deductions: 0,
    totalAmount: 6100000,
    status: 'paid',
    paidDate: '2026-07-05'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tick-1',
    internId: 'intern-1',
    title: 'Xin cấp Giấy xác nhận thực tập có mộc đỏ gửi trường ĐH Bách Khoa',
    category: 'certificate',
    description: 'Em cần giấy xác nhận số giờ thực tập và nhận xét sơ bộ để nộp cho phòng Đào tạo HUST trước ngày 30/07/2026.',
    status: 'resolved',
    priority: 'high',
    createdAt: '2026-07-10',
    resolvedAt: '2026-07-12',
    resolutionNote: 'Đã ký đóng dấu và gửi bản scan qua email + gửi bản cứng tại quầy lễ tân tầng 3.'
  },
  {
    id: 'tick-2',
    internId: 'intern-1',
    title: 'Đăng ký cấp vé gửi xe tháng tại tầng hầm B2 toà nhà',
    category: 'parking_card',
    description: 'Biển số xe: 29B1-889.90, xe máy Honda AirBlade màu đen.',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2026-07-15'
  },
  {
    id: 'tick-3',
    internId: 'intern-4',
    title: 'Mượn bảng vẽ Wacom phục vụ thiết kế UI đồ họa dự án',
    category: 'equipment',
    description: 'Phòng Thiết kế cần thêm 1 bảng vẽ chuyên dụng để vẽ icon vector.',
    status: 'open',
    priority: 'medium',
    createdAt: '2026-07-16'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Nhiệm vụ mới được giao',
    message: 'Mentor Lê Hoàng Nam vừa giao cho bạn nhiệm vụ: "Tối ưu hóa truy vấn cơ sở dữ liệu PostgreSQL"',
    timestamp: '10 phút trước',
    read: false,
    type: 'task'
  },
  {
    id: 'notif-2',
    title: 'Đơn xin nghỉ phép đã được duyệt',
    message: 'HR Trần Thu Hà đã duyệt đơn xin nghỉ phép ngày 28/07/2026 của bạn.',
    timestamp: '2 giờ trước',
    read: false,
    type: 'leave'
  },
  {
    id: 'notif-3',
    title: 'Phiếu phụ cấp tháng 6 đã chi trả',
    message: 'Số tiền 6,600,000 VND đã được chuyển vào tài khoản Techcombank của bạn.',
    timestamp: '1 ngày trước',
    read: true,
    type: 'system'
  },
  {
    id: 'notif-4',
    title: 'Báo cáo tuần #5 đã được chấm điểm',
    message: 'Mentor Lê Hoàng Nam đã chấm điểm 9.5/10 và để lại lời nhận xét.',
    timestamp: '2 ngày trước',
    read: true,
    type: 'report'
  }
];

export const INITIAL_EMAILS: SystemEmailLog[] = [
  {
    id: 'em-1',
    toEmail: 'quanghuy.ngo@hust.edu.vn',
    recipientName: 'Ngô Quang Huy',
    subject: '[IMS TechCorp] Thư mời phỏng vấn Vị trí Thực tập sinh AI & Data',
    content: 'Kính gửi bạn Ngô Quang Huy, Ban tuyển dụng Công ty trân trọng kính mời bạn tham gia buổi phỏng vấn trực tiếp vào lúc 14:00 ngày 18/07/2026 tại Phòng Họp 301, Tòa nhà Tech Innovation...',
    sentAt: '2026-07-15 09:30',
    type: 'interview_invitation'
  },
  {
    id: 'em-2',
    toEmail: 'intern.tuan@student.hust.edu.vn',
    recipientName: 'Phạm Minh Tuấn',
    subject: '[IMS TechCorp] Chúc mừng bạn đã trúng tuyển & Hướng dẫn ký hợp đồng thực tập',
    content: 'Chào mừng Minh Tuấn gia nhập Đội ngũ Kỹ thuật TechCorp trong Khóa Thực tập sinh Mùa Hè 2026. Vui lòng đăng nhập hệ thống IMS để xác nhận hợp đồng điện tử đính kèm...',
    sentAt: '2026-05-28 14:00',
    type: 'offer_letter'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'u-hr-1',
    userName: 'Trần Thu Hà',
    userRole: 'hr',
    action: 'Duyệt tài liệu hồ sơ',
    entityType: 'InternProfile',
    entityId: 'intern-1',
    details: 'Đã xác thực CV và Đơn xin thực tập trường ĐH Bách Khoa cho sinh viên Phạm Minh Tuấn',
    timestamp: '2026-07-16 09:15:30',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-2',
    userId: 'u-mentor-1',
    userName: 'Lê Hoàng Nam',
    userRole: 'mentor',
    action: 'Chấm điểm báo cáo tuần',
    entityType: 'WeeklyReport',
    entityId: 'rep-1',
    details: 'Đã chấm điểm 9.5 và phản hồi báo cáo Tuần #5 của Phạm Minh Tuấn',
    timestamp: '2026-07-15 16:20:10',
    ipAddress: '192.168.1.88'
  },
  {
    id: 'log-3',
    userId: 'u-intern-1',
    userName: 'Phạm Minh Tuấn',
    userRole: 'intern',
    action: 'Chấm công trực tuyến',
    entityType: 'Attendance',
    entityId: 'att-2',
    details: 'Check-in thành công lúc 08:28 ngày 2026-07-15',
    timestamp: '2026-07-15 08:28:05',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'log-4',
    userId: 'u-admin-1',
    userName: 'Nguyễn Văn Quản Trị',
    userRole: 'admin',
    action: 'Cấu hình phân quyền hệ thống',
    entityType: 'SystemSettings',
    details: 'Cập nhật quyền hạn cho vai trò Mentor: Cho phép tạo nhiệm vụ và đánh giá năng lực',
    timestamp: '2026-07-14 11:00:00',
    ipAddress: '192.168.1.10'
  }
];
