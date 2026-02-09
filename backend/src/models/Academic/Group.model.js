const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);
