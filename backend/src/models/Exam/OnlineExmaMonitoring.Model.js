const mongoose = require("mongoose");

const onlineExamMonitoringSchema = new mongoose.Schema({
  examAttempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamAttempt",
    required: true
  },

  // رویدادهای رفتاری
  events: [{
    type: {
      type: String,
      enum: [
        "TAB_SWITCH",
        "WINDOW_BLUR",
        "COPY_PASTE",
        "IDLE_TOO_LONG",
        "FAST_ANSWER",
        "MULTIPLE_FACES",
        "MIC_NOISE"
      ]
    },
    timestamp: { type: Date, default: Date.now },
    meta: Object
  }],

  // امتیاز ریسک که AI حساب می‌کند
  riskScore: { type: Number, min: 0, max: 100 },

  // نتیجه نهایی AI
  aiDecision: {
    type: String,
    enum: ["CLEAR", "SUSPICIOUS", "CHEATING"],
    default: "CLEAR"
  },

  aiNote: String
}, { timestamps: true });

onlineExamMonitoringSchema.index(
  { examAttempt: 1 },
  { unique: true }
);

module.exports = mongoose.model("OnlineExamMonitoring",onlineExamMonitoringSchema);
