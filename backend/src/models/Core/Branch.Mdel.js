// src/model/core/branch.model.js
const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

branchSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Branch", branchSchema);
