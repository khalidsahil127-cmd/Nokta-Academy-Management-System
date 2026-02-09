const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  changes: { type: Object, default: {} },
  ipAddress: String,
  userAgent: String,
  method: String,
  path: String
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);
