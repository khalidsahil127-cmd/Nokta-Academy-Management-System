// src/middlewares/rbac.middleware.js
const AuditService = require("../modules/audit/audit.service"); // مسیر دقیق بسته به ساختار پروژه
const AppError = require("../utils/app.error.js");

/**
 * Middleware بررسی دسترسی کاربر بر اساس مجوزها
 * @param {Array<string>} requiredPermissions - لیست کلیدهای مجوز مورد نیاز
 */
exports.authorize = (requiredPermissions = []) => {
  // حتما یک تابع middleware برگردانده شود
  return async(req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        await AuditService.logFailedAccess(req, "User not authenticated");
        return next(new AppError("Unauthorized: User not authenticated", 401));
        
      }

      // گرفتن کلیدهای مجوز کاربر
      const permissions = user.role?.permissions || [];
      const userPermKeys = permissions.map((p) => p.key);

      // بررسی اینکه همه مجوزهای لازم وجود دارد یا خیر
      const hasAccess = requiredPermissions.every((perm) =>
        userPermKeys.includes(perm),
      );

      if (!hasAccess) {
        await AuditService.logFailedAccess(req, "Insufficient permissions");
        return next(new AppError("Forbidden: Insufficient permissions", 403));
      }


      next(); // همه چیز درست است، ادامه مسیر
    } catch (err) {
      console.error("RBAC middleware error:", err);
      await AuditService.logFailedAccess(req, "Authorization error");
      next(new AppError("Authorization error", 500));
    }
  };
};
