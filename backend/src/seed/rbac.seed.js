// src/seed/rbac.seed.js
const Permission = require("../models/Core/Permission.Model");
const Role = require("../models/Core/Role.Model");
const PERMS = require("../constants/permissions");

module.exports = async function seedRBAC() {
  try {
    // Insert Permissions
    const permissions = await Permission.insertMany(
      Object.values(PERMS).map(key => ({ key, description: key })),
      { ordered: false }
    );

    // Map key → _id
    const map = {};
    permissions.forEach(p => (map[p.key] = p._id));

    // Insert Roles
    await Role.insertMany([
      {
        name: "ADMIN",
        isSystem: true,
        permissions: Object.values(map),
      },
      {
        name: "TEACHER",
        isSystem: true,
        permissions: [
          map.VIEW_CLASS,
          map.MARK_ATTENDANCE,
          map.CREATE_EXAM,
          map.GRADE_EXAM,
          map.VIEW_STUDENT,
          map.SEND_MESSAGE,
        ],
      },
      {
        name: "STUDENT",
        isSystem: true,
        permissions: [
          map.VIEW_CLASS,
          map.VIEW_ATTENDANCE,
          map.VIEW_EXAM,
          map.VIEW_ANNOUNCEMENT,
        ],
      },
      {
        name: "PARENT",
        isSystem: true,
        permissions: [
          map.VIEW_STUDENT,
          map.VIEW_ATTENDANCE,
          map.VIEW_EXAM,
        ],
      },
      {
        name: "OWNER",
        isSystem: true,
        permissions: [
          map.VIEW_FINANCIAL_REPORT,
          map.VIEW_AUDIT_LOGS,
          map.MANAGE_POLICIES,
          map.APPROVE_CHANGES,
        ],
      },
    ]);

    console.log("✅ RBAC Seed Completed!");
  } catch (err) {
    if (err.code === 11000) {
      console.log("⚠️ Some Permissions or Roles already exist.");
    } else {
      console.error(err);
    }
  }
};
