const mongoose = require("mongoose");

const studentActivityEvaluationSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },

  evaluationType: {
    type: String,
    enum: ["Homework", "Participation", "Discipline", "Behavior"],
    required: true,
  },

  score: { type: Number, min: 0, max: 10 },
  note: { type: String },

  evaluatedAt: { type: Date, default: Date.now },
},
  { timestamps: true },
);

module.exports = mongoose.model("StudentActivityEvaluation",studentActivityEvaluationSchema,);
