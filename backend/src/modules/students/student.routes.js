// // src/modules/student/student.routes.js
// const express = require("express");
// const router = express.Router();
// const StudentController = require("./student.controller");
// const Student = require("../../models/people/student.model");
// const { protect } = require("../auth/auth.middleware");
// const { authorize } = require("../../middlewares/rbac.middleware");
// const { audit } = require("../audit/audit.middleware");
// const { validateAccess } = require("../../middlewares/securityRules.middleware");
// const PERMS = require("../../constants/permissions");

// // Admin registers student
// router.post(
//   "/admin-register",
//   protect(),
//   authorize([PERMS.REGISTER_STUDENT]),
//   audit({
//     action: "STUDENT_CREATE",
//     entity: "Student",
//     model: Student,
//     getEntityId: (req) => req.createdStudentId
//   }),
//   StudentController.registerByAdmin
// );

// // Student self-registration (public - no auth required)
// router.post(
//   "/self-register",
//   StudentController.selfRegister
// );

// // Approve self-registered student
// router.patch(
//   "/:id/approve",
//   protect(),
//   authorize([PERMS.REGISTER_STUDENT]),
//   validateAccess((req) => Student.findById(req.params.id)),
//   audit({
//     action: "STUDENT_UPDATE",
//     entity: "Student",
//     model: Student,
//     getEntityId: (req) => req.params.id
//   }),
//   StudentController.approveStudent
// );

// // Suspend student
// router.patch(
//   "/:id/suspend",
//   protect(),
//   authorize([PERMS.SUSPEND_STUDENT]),
//   validateAccess((req) => Student.findById(req.params.id)),
//   audit({
//     action: "STUDENT_SUSPEND",
//     entity: "Student",
//     model: Student,
//     getEntityId: (req) => req.params.id
//   }),
//   StudentController.suspendStudent
// );

// // Get student profile
// // router.get(
// //   "/:id",
// //   protect(),
// //   authorize([PERMS.VIEW_STUDENT]),
// //   validateAccess((req) => Student.findById(req.params.id)),
// //   StudentController.getStudentProfile
// // );

// router.get(
//   "/:id",
//   protect(),                    // 1. اول چک کن لاگین کرده
//   authorize([PERMS.VIEW_STUDENT]), // ⚠️ این رو موقتاً غیرفعال کن تا role مشکل رو حل کنی
//   validateAccess((req) => {      // 2. بعد چک کن دسترسی داره
//     return Student.findById(req.params.id).populate('user');
//   }),
//   StudentController.getStudentProfile
// )

// module.exports = router;

const express = require("express");
const router = express.Router();
const StudentController = require("./student.controller");
const Student = require("../../models/people/student.model");
const { protect } = require("../auth/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");
const { audit } = require("../audit/audit.middleware");
const { validateAccess } = require("../../middlewares/securityRules.middleware");
const PERMS = require("../../constants/permissions");

// Admin registers student (UC-A09)
router.post(
  "/admin-register",
  protect(),
  authorize([PERMS.REGISTER_STUDENT]),
  audit({
    action: "STUDENT_CREATE",
    entity: "Student",
    model: Student,
    getEntityId: (req) => req.createdStudentId
  }),
  StudentController.registerByAdmin
);

// Student self-registration (UC-S01) - public
router.post(
  "/self-register",
  StudentController.selfRegister
);

// Approve self-registered student (UC-A03)
router.patch(
  "/:id/approve",
  protect(),
  authorize([PERMS.REGISTER_STUDENT]),
  validateAccess((req) => Student.findById(req.params.id)),
  audit({
    action: "STUDENT_UPDATE",
    entity: "Student",
    model: Student,
    getEntityId: (req) => req.params.id
  }),
  StudentController.approveStudent
);

// Suspend student (UC-A12)
router.patch(
  "/:id/suspend",
  protect(),
  authorize([PERMS.SUSPEND_STUDENT]),
  validateAccess((req) => Student.findById(req.params.id)),
  audit({
    action: "STUDENT_SUSPEND",
    entity: "Student",
    model: Student,
    getEntityId: (req) => req.params.id
  }),
  StudentController.suspendStudent
);

// Get student profile (UC-A11 for admin, UC-S04 for student, UC-T09 for teacher, UC-P03 for parent)
router.get(
  "/:id",
  protect(),
  authorize([PERMS.VIEW_STUDENT]),
  validateAccess(async (req) => {
    return Student.findById(req.params.id).populate('user enrolledClasses');
  }),
  StudentController.getStudentProfile
);

module.exports = router;