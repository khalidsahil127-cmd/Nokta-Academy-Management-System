const mongoose = require("mongoose");

const teacherEvaluationSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    criteria: {
      teachingQuality: { type: Number, min: 0, max: 10, default: 0 },
      punctuality: { type: Number, min: 0, max: 10, default: 0 },
      classManagement: { type: Number, min: 0, max: 10, default: 0 },
      studentInteraction: { type: Number, min: 0, max: 10, default: 0 },
    },
    overallScore: { type: Number, min: 0, max: 40 },
    note: String,
    period: { type: String, required: true }, // مثلاً "Spring 2026" یا "March 2026"
  },
  { timestamps: true },
);

// auto overall score
teacherEvaluationSchema.pre("save", function (next) {
  const c = this.criteria || {};
  this.overallScore =
    (c.teachingQuality || 0) +
    (c.punctuality || 0) +
    (c.classManagement || 0) +
    (c.studentInteraction || 0);
  next();
});

module.exports = mongoose.model("TeacherEvaluation", teacherEvaluationSchema);
