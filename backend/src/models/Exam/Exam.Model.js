const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  examDate: { type: Date, required: true },
  type: { type: String, enum: ["Online", "Offline"], required: true },
  totalMarks: { type: Number, required: true },
  isPublished: { type: Boolean, default: false },
  isAIProctored: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
