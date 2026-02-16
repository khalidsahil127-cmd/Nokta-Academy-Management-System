const express = require("express");
const router = express.Router();
const TeacherController = require("./teacher.controller");
const Teacher = require("../../models/People/Teacher.model");
const { protect } = require("../auth/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");
const { audit } = require("../audit/audit.middleware");
const { validateAccess } = require("../../middlewares/securityRules.middleware");
const PERMS = require("../../constants/permissions");

// Register teacher (UC-A13)
router.post(
  "/",
  protect(),
  authorize([PERMS.REGISTER_TEACHER]),
  audit({
    action: "TEACHER_CREATE",
    entity: "Teacher",
    model: Teacher,
    getEntityId: (req) => req.createdTeacherId
  }),
  TeacherController.registerTeacher
);

// Assign subjects to teacher (UC-A14)
router.patch(
  "/:id/subjects",
  protect(),
  authorize([PERMS.REGISTER_TEACHER]),
  validateAccess((req) => Teacher.findById(req.params.id)),
  audit({
    action: "TEACHER_UPDATE",
    entity: "Teacher",
    model: Teacher,
    getEntityId: (req) => req.params.id
  }),
  TeacherController.assignSubjects
);

// Update salary (UC-A15)
router.patch(
  "/:id/salary",
  protect(),
  authorize([PERMS.REGISTER_TEACHER]),
  validateAccess((req) => Teacher.findById(req.params.id)),
  audit({
    action: "TEACHER_UPDATE",
    entity: "Teacher",
    model: Teacher,
    getEntityId: (req) => req.params.id
  }),
  TeacherController.updateSalary
);

// Get teacher profile (UC-A11 for admin, UC-T12 for teacher)
router.get(
  "/:id",
  protect(),
  authorize([PERMS.VIEW_TEACHER]),
  validateAccess(async (req) => {
    return Teacher.findById(req.params.id).populate('user subjects assignedClasses');
  }),
  TeacherController.getTeacherProfile
);

module.exports = router;