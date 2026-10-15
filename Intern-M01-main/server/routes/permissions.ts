import { Router } from 'express';
import { db, seedRolePermissions } from '../db';
import { authorize } from '../middleware/auth';
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES, ALL_PERMISSION_IDS } from '../../src/types/permissions';

export const permissionsRouter = Router();

// GET all dynamic role permissions from SQLite
permissionsRouter.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT role, permission FROM role_permissions').all() as { role: string; permission: string }[];
    
    const result: Record<string, string[]> = {
      admin: [],
      hr: [],
      mentor: [],
      intern: [],
      candidate: []
    };

    rows.forEach(r => {
      if (!result[r.role]) {
        result[r.role] = [];
      }
      result[r.role].push(r.permission);
    });

    res.json({
      success: true,
      data: result,
      modules: PERMISSION_MODULES,
      allPermissions: ALL_PERMISSION_IDS
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update permissions for a role (Protected: only admin with admin:rbac can call)
permissionsRouter.put('/', authorize('admin:rbac'), (req, res) => {
  try {
    const { role, permissions } = req.body;
    if (!role || !Array.isArray(permissions)) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin role hoặc danh sách permissions không hợp lệ' });
    }

    const deleteOld = db.prepare('DELETE FROM role_permissions WHERE role = ?');
    const insertNew = db.prepare('INSERT INTO role_permissions (role, permission) VALUES (?, ?)');

    const transaction = db.transaction(() => {
      deleteOld.run(role);
      for (const perm of permissions) {
        insertNew.run(role, perm);
      }
    });

    transaction();

    // Log to audit log
    const userRole = (req.headers['x-user-role'] as string) || 'admin';
    const userName = (req.headers['x-user-name'] as string) || 'Admin';
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity_type, entity_id, details, timestamp, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log-${Date.now()}`,
      'admin',
      userName,
      userRole,
      'Cập nhật phân quyền động',
      'RolePermission',
      role,
      `Đã điều chỉnh phân quyền cho vai trò ${role.toUpperCase()} thành ${permissions.length} quyền`,
      new Date().toISOString().replace('T', ' ').substring(0, 19),
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      message: `Đã lưu thành công ${permissions.length} quyền cho vai trò ${role.toUpperCase()} vào cơ sở dữ liệu SQLite!`,
      role,
      permissions
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST reset permissions to defaults
permissionsRouter.post('/reset', authorize('admin:rbac'), (req, res) => {
  try {
    db.prepare('DELETE FROM role_permissions').run();
    seedRolePermissions();

    res.json({
      success: true,
      message: 'Đã khôi phục ma trận phân quyền về trạng thái mặc định ban đầu',
      data: DEFAULT_ROLE_PERMISSIONS
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
