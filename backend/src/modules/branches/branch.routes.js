// src/modules/branch/branch.routes.js
const express = require("express");
const router = express.Router();
const BranchController = require("./branch.controller");
const Branch = require("../../models/Core/Branch.Mdel");
const { protect } = require("../auth/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");
const { audit } = require("../audit/audit.middleware");
const { validateAccess } = require("../../middlewares/securityRules.middleware");
const PERMS = require("../../constants/permissions");

//-------------CREATE BRANCH------------
router.post(
    "/",
    protect(),
    authorize([PERMS.CREATE_BRANCH]),
    audit({
        action: "BRANCH_CREATE",
        entity: "Branch",
        model: Branch,
        getEntityId: (req) => req.createdBranchId,
    }),
    BranchController.createBranch
)

//----------------UPDATE BRANCH-----------

router.patch(
    "/:id",
    protect(),
    authorize([PERMS.APPROVE_BRANCH_CHANGE]),
    validateAccess((req) => Branch.findById(req.params.id)),
    audit({
        action: "BRANCH_UPDATE",
        entity: "Branch",
        model: Branch,
        getEntityId: (req) => req.params.id,
    }),
    BranchController.updateBranch
);

//--------------ASSIGN MANAGER-------------
router.patch(
    "/:id/manager",
    protect(),
    authorize([PERMS.APPROVE_BRANCH_CHANGE]),
    validateAccess((req) => Branch.findById(req.params.id)),
    audit({
        action: "BRANCH_UPDATE",
        entity: "Branch",
        model: Branch,
        getEntityId: (req) => req.params.id,
    }),
    BranchController.assignManager
)

module.exports = router;