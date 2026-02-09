const express = require("express");
const router = express.Router();
const controller = require("./user.controller");
const asyncHandler = require("../../utils/asyncHandler");


const { protect } = require("../auth/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");
const { audit } = require("../audit/audit.middleware");
const {validateAccess,} = require("../../middlewares/securityRules.middleware");

const User = require("../../models/Core/User.Model");
const PERMS = require("../../constants/permissions");
const { USER_CREATE, USER_DELETE, USER_UPDATE  } = require("../../constants/auditActions");

// ================= CREATE USER =================

router.post(
  "/",
  protect(),
  authorize([PERMS.CREATE_USER]),
  audit({
    action: "USER_CREATE",
    entity: "User",
    model: User,
    getEntityId: (req) => req.createdUserId,
  }),
  controller.createUser
);



// ================= DEACTIVATE USER =================

// ---------- DEACTIVATE USER ----------
router.patch(
  "/:id/deactivate",
  protect(),
  authorize([PERMS.DEACTIVATE_USER]),
  validateAccess((req) => User.findById(req.params.id)),

  audit({
    action: USER_DELETE,
    entity: "User",
    model: User,
    getEntityId: (req) => req.params.id,
  }),

  controller.deactivateUser

);

// ------------- ASSIGN ROLE--------
router.patch(
  "/:id/role",
  protect(),
  authorize([PERMS.MANAGE_ROLES]),
  validateAccess((req) => User.findById(req.params.id)),
  audit({
    action: USER_UPDATE,
    entity: "User",
    model: User,
    getEntityId: (req) => req.params.id,
  }),
  controller.assignRole
);

//---------------- RESET PASSWORD -----------

router.patch(
  "/:id/reset-password",
  protect(),
  authorize([PERMS.UPDATE_USER]),
  validateAccess((req) => User.findById(req.params.id)),
  audit({
    action:USER_UPDATE,
    entity: "User", 
    model: User,
    getEntityId: (req) => req.params.id,
  }),
  controller.resetPassword
);






module.exports = router;
