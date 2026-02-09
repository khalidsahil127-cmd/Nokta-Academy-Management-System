const mongoose = require("mongoose");

const teacherEvaluationSchema = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    evaluator: { type: Schema.Types.ObjectId, ref: "User", required: true },

    criteria: {
      teachingQuality: { type: Number, min: 0, max: 10 },
      punctuality: { type: Number, min: 0, max: 10 },
      classManagement: { type: Number, min: 0, max: 10 },
      studentInteraction: { type: Number, min: 0, max: 10 }
    },

    overallScore: { type: Number, min: 0, max: 40 },

    note: String
  },
  { timestamps: true }
);

// auto overall score
teacherEvaluationSchema.pre("save", function (next) {
  const c = this.criteria;
  this.overallScore =
    (c.teachingQuality || 0) +
    (c.punctuality || 0) +
    (c.classManagement || 0) +
    (c.studentInteraction || 0);
  next();
});

module.exports = mongoose.model(
  "TeacherEvaluation",
  teacherEvaluationSchema
);

