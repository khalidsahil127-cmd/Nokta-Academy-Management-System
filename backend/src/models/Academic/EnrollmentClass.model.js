const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    enrolledAt: { type: Date, default: Date.now },
    source: { type: String, enum: ["Admin", "Student"], required: true },
    enrolledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin if source is Admin

    status: {
      type: String,
      enum: ["Active", "Dropped", "Completed", "Suspended"],
      default: "Active",
    },

    droppedAt: Date,
    droppedReason: String,
    droppedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    completedAt: Date,

    // آمار حضور برای این کلاس خاص
    attendanceCount: { type: Number, default: 0 },
    absenceCount: { type: Number, default: 0 },

    // نمرات نهایی
    finalGrade: { type: Number },
    gradeLetter: { type: String },
  },
  { timestamps: true },
);

// اطمینان از عدم ثبت‌نام تکراری در یک کلاس
enrollmentSchema.index({ student: 1, class: 1 }, { unique: true });

// متد برای افزایش حضور
enrollmentSchema.methods.markPresent = function () {
  this.attendanceCount += 1;
  return this.save();
};

// متد برای افزایش غیبت
enrollmentSchema.methods.markAbsent = function () {
  this.absenceCount += 1;
  return this.save();
};

module.exports = mongoose.model("Enrollment", enrollmentSchema);