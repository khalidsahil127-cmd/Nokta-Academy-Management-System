const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  maxScore: { type: Number, default: 100 },
  isGroupBased: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
