const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  files: [String],
  score: Number,
  feedback: String,
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
