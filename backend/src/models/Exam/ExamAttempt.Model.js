const mongoose = require("mongoose");

const examAttemptSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  onlineMonitoring: { type: mongoose.Schema.Types.ObjectId, ref: "OnlineExamMonitoring" },


  homeworkScore: { type: Number, default: 0 },
  participationScore: { type: Number, default: 0 },
  midtermScore: { type: Number, default: 0 },
  finalExamScore: { type: Number, default: 0 },

  finalScore: { type: Number, default: 0 },
  isGraded: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },

  // 🧠 اضافه کردن داده‌ها برای AI
  answers: [{question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },answerText: String,isCorrect: Boolean}],
  aiAnalysisGenerated: { type: Boolean, default: false }, 

  aiStatus: { type: String, enum: ["NOT_STARTED","IN_PROGRESS","COMPLETED"], default: "NOT_STARTED" },
  aiRiskScore: { type: Number, min: 0, max: 100 },
  aiResultAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: "ResultAnalysis" }
}, { timestamps: true });

examAttemptSchema.methods.calculateFinalScore = function() {
  this.finalScore = this.homeworkScore + this.participationScore + this.midtermScore + this.finalExamScore;
};


examAttemptSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("ExamAttempt", examAttemptSchema);
