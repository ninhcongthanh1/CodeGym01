import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export function authorize(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = ((req.headers['x-user-role'] as string) || 'intern').toLowerCase();

    // Check permissions dynamically in SQLite table
    const check = db.prepare(`
      SELECT count(*) as count FROM role_permissions 
      WHERE role = ? AND permission = ?
    `).get(userRole, permission) as { count: number };

    // If role has permission in SQLite, or is admin superuser
    if (check.count > 0 || userRole === 'admin') {
      return next();
    }

    console.warn(`[403 FORBIDDEN] Vai trò '${userRole}' bị từ chối truy cập quyền '${permission}' trên ${req.method} ${req.originalUrl}`);
    return res.status(403).json({
      success: false,
      error: `Truy cập bị từ chối: Vai trò '${userRole.toUpperCase()}' không được cấp quyền '${permission}' trên hệ thống. Vui lòng liên hệ Admin để cấu hình.`,
      requiredPermission: permission,
      currentRole: userRole
    });
  };
}
