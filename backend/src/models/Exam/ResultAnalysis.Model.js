const mongoose = require("mongoose");

const resultAnalysisSchema = new mongoose.Schema({
  examAttempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamAttempt",
    required: true
  },
  // نقاط ضعف دانش آموز به صورت خودکار توسط AI شناسایی می‌شود
  weaknessAreas: [{ type: String }],
  
  // نقاط قوت نیز توسط AI تحلیل و پر می‌شوند
  strengths: [{ type: String }],
  
  // توضیح مختصر یا توصیه توسط AI
  aiNote: { type: String },

  // درصد تسلط یا نمره ارزیابی شده توسط AI (0 تا 100)
  masteryScore: { type: Number, min: 0, max: 100 }
}, { timestamps: true });

// Index برای جلوگیری از تکرار چندبار تحلیل یک آزمون
resultAnalysisSchema.index({ examAttempt: 1 }, { unique: true });

module.exports = mongoose.model("ResultAnalysis", resultAnalysisSchema);
