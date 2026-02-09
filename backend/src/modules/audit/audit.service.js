// src/modules/audit/audit.service.js
const AuditLog = require("../../models/Core/auditLog.model"); // مسیر دقیق به مدل
class AuditService {
  static async log(data) {
    try {
      await AuditLog.create({
        ...data,
        ip: data.req.ip,
        userAgent: data.req.headers["user-agent"],
        method: data.req.method,
        path: data.req.originalUrl
      });
    } catch (err) {
      console.error("Audit failed:", err.message);
    }
  }

  // ---------- logFailed Access ----------
  static async logFailedAccess(req, reason = "Unauthorized") {
    try {
      await AuditLog.create({
        actor: req.user?._id || null,
        action: "FAILED_ACCESS",
        entityType: "System",
        entityId: null,
        oldValue: null,
        newValue: null,
        changes: null,
        req,
        note: reason
      });
    } catch (err) {
      console.error("Failed access audit failed:", err.message);
    }
  }
}

module.exports = AuditService;
