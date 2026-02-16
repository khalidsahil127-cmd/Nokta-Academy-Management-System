const AppError = require("../utils/app.error");
const AuditService = require("../modules/audit/audit.service");
const Student = require("../models/People/Student.Model");
const Teacher = require("../models/People/Teacher.model");
const Class = require("../models/Academic/Class.model");

/**
 * Role-Based Access Control Middleware
 * @param {Array} requiredPermissions - permissions required for the route
 */
exports.authorize = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        await AuditService.logFailedAccess(req, "Unauthorized - No user");
        return next(new AppError("Unauthorized", 401));
      }

      const roleName = user.role?.name?.toLowerCase();
      const permissions = user.role?.permissions?.map((p) => p.code) || [];
      const method = req.method;
      const resource = req.baseUrl.split("/").pop();
      const targetId = req.params.id;

      // ================= SUPER ADMIN =================
      if (roleName === "admin") return next();

      // ================= OWNER =================
      if (roleName === "owner") {
        const allowedOwnerPermissions = [
          "GLOBAL_RULE_UPDATE",
          "MAJOR_CHANGE_APPROVE",
        ];
        if (method === "GET") return next();
        const hasOwnerPermission = allowedOwnerPermissions.some((p) =>
          permissions.includes(p),
        );
        if (!hasOwnerPermission) {
          return next(new AppError("Owner does not have permission", 403));
        }
        return next();
      }

      // ================= PERMISSION BASED =================
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.every((perm) =>
          permissions.includes(perm),
        );
        if (!hasPermission) {
          await AuditService.logFailedAccess(req, "Insufficient permissions");
          return next(new AppError("Forbidden: Insufficient permissions", 403));
        }
      }

      // ================= BUSINESS RULES =================
      await validateBusinessRules({
        user,
        roleName,
        resource,
        method,
        targetId,
        req,
      });

      next();
    } catch (err) {
      console.error("RBAC Error:", err);
      await AuditService.logFailedAccess(req, "RBAC error");
      return next(new AppError("Authorization error", 500));
    }
  };
};

async function validateBusinessRules({
  user,
  roleName,
  resource,
  method,
  targetId,
  req,
}) {
  // ========== STUDENT ==========
  if (roleName === "student") {
    const student = await Student.findOne({ user: user._id });
    if (!student) throw new AppError("Student profile not found", 404);

    if (
      resource === "students" &&
      targetId &&
      student._id.toString() !== targetId
    ) {
      throw new AppError("Access denied: Not your profile", 403);
    }

    if (resource === "payments" && method !== "GET") {
      throw new AppError("Student cannot modify payments", 403);
    }
  }

  // ========== TEACHER ==========
  if (roleName === "teacher") {
    const teacher = await Teacher.findOne({ user: user._id }).populate(
      "assignedClasses",
    );
    if (!teacher) throw new AppError("Teacher profile not found", 404);

    if (
      resource === "teachers" &&
      targetId &&
      teacher._id.toString() === targetId
    )
      return;

    if (resource === "students" && targetId) {
      const student =
        await Student.findById(targetId).populate("enrolledClasses");
      const teacherClassIds = (teacher.assignedClasses || []).map((c) =>
        c?._id.toString(),
      );
      const studentClassIds = (student?.enrolledClasses || []).map((c) =>
        c?._id.toString(),
      );
      const hasAccess = studentClassIds.some((id) =>
        teacherClassIds.includes(id),
      );
      if (!hasAccess) throw new AppError("Student not in your class", 403);
    }

    if (resource === "salaries" && method !== "GET")
      throw new AppError("Cannot modify salary", 403);
  }

  // ========== PARENT ==========
  if (roleName === "parent") {
    const linkedStudents = (user.linkedStudents || []).map((id) =>
      id.toString(),
    );
    if (
      resource === "students" &&
      targetId &&
      !linkedStudents.includes(targetId)
    ) {
      throw new AppError("Parent cannot access unrelated student", 403);
    }
    if (method !== "GET")
      throw new AppError("Parent has read-only access", 403);
  }

  // ========== CLASS GENDER RULE ==========
  if (resource === "classes" && method === "POST") {
    const { gender, teacherId } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (teacher && teacher.gender !== gender) {
      throw new AppError("Teacher gender must match class gender", 400);
    }
  }

  // ========== BRANCH DELETE ==========
  if (resource === "branches" && method === "DELETE" && roleName !== "owner") {
    throw new AppError("Branch deletion requires Owner approval", 403);
  }
}
