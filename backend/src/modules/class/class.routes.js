const express = require("express");
const router = express.Router();
const ClassController = require("./class.controller");
const Class = require("../../models/academic/class.model");
const { protect } = require("../auth/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");
const { audit } = require("../audit/audit.middleware");
const { validateAccess } = require("../../middlewares/securityRules.middleware");
const PERMS = require("../../constants/permissions");

// ==================== CREATE ====================
// ایجاد کلاس
router.post(
  "/",
  protect(),
  authorize([PERMS.CREATE_CLASS]),
  audit({
    action: "CLASS_CREATE",
    entity: "Class",
    model: Class,
    getEntityId: (req) => req.createdClassId
  }),
  ClassController.createClass
);

// ==================== ENROLLMENT ====================
// ثبت‌نام دانش‌آموز در کلاس
router.post(
  "/:id/students",
  protect(),
  authorize([PERMS.CREATE_CLASS]),
  validateAccess((req) => Class.findById(req.params.id)),
  audit({
    action: "CLASS_ENROLL",
    entity: "Class",
    model: Class,
    getEntityId: (req) => req.params.id
  }),
  ClassController.enrollStudent
);

// ثبت‌نام گروهی
router.post(
  "/:id/students/bulk",
  protect(),
  authorize([PERMS.CREATE_CLASS]),
  validateAccess((req) => Class.findById(req.params.id)),
  audit({
    action: "CLASS_BULK_ENROLL",
    entity: "Class",
    model: Class,
    getEntityId: (req) => req.params.id
  }),
  ClassController.bulkEnroll
);

// حذف دانش‌آموز از کلاس
router.delete(
  "/:id/students",
  protect(),
  authorize([PERMS.CREATE_CLASS]),
  validateAccess((req) => Class.findById(req.params.id)),
  audit({
    action: "CLASS_DROP_STUDENT",
    entity: "Class",
    model: Class,
    getEntityId: (req) => req.params.id
  }),
  ClassController.dropStudent
);

// ==================== TEACHER ====================
// اختصاص استاد به کلاس
router.patch(
  "/:id/teacher",
  protect(),
  authorize([PERMS.CREATE_CLASS]),
  validateAccess((req) => Class.findById(req.params.id)),
  audit({
    action: "CLASS_ASSIGN_TEACHER",
    entity: "Class",
    model: Class,
    getEntityId: (req) => req.params.id
  }),
  ClassController.assignTeacher
);

// ==================== READ ====================
// دریافت جزئیات کلاس
router.get(
  "/:id",
  protect(),
  authorize([PERMS.VIEW_CLASS]),
  validateAccess((req) => Class.findById(req.params.id)),
  ClassController.getClassDetails
);

// دریافت کلاس‌های یک استاد
router.get(
  "/teacher/:teacherId",
  protect(),
  authorize([PERMS.VIEW_CLASS]),
  ClassController.getTeacherClasses
);

// دریافت کلاس‌های یک دانش‌آموز
router.get(
  "/student/:studentId",
  protect(),
  authorize([PERMS.VIEW_CLASS]),
  ClassController.getStudentClasses
);

// ==================== UPDATE ====================
// به‌روزرسانی کلاس
router.patch(
  "/:id",
  protect(),
  authorize([PERMS.CREATE_CLASS]),
  validateAccess((req) => Class.findById(req.params.id)),
  audit({
    action: "CLASS_UPDATE",
    entity: "Class",
    model: Class,
    getEntityId: (req) => req.params.id
  }),
  ClassController.updateClass
);

module.exports = router;