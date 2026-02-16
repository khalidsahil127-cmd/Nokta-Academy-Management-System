const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    studentCode: {
      type: String,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["Active", "Pending", "Suspended", "Dropped"],
      default: "Pending",
    },

    allowedAbsence: { type: Number, default: 3 },
    currentAbsenceCount: { type: Number, default: 0 },

    enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],

    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],

    registrationSource: {
      type: String,
      enum: ["Admin", "Self"],
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: { type: Date },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    selfRegisteredAt: { type: Date },
    rejectionReason: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

studentSchema.plugin(softDeletePlugin);
studentSchema.pre("save", async function () {
  try {
    if (!this.studentCode) {
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 20; // بیشتر تلاش کن

      while (!isUnique && attempts < maxAttempts) {
        // 1. یه کد رندوم بر اساس timestamp بساز
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        const candidateCode = `STU${timestamp}${random}`;

        // 2. چک کن این کد قبلاً استفاده شده؟
        const existingStudent = await this.constructor.findOne({
          studentCode: candidateCode,
        });

        if (!existingStudent) {
          this.studentCode = candidateCode;
          isUnique = true;
          console.log(`✅ کد یکتا ساخته شد: ${this.studentCode}`);
          break;
        }

        attempts++;
        console.log(`⚠️ کد ${candidateCode} تکراریه، تلاش ${attempts}...`);
      }

      // 3. اگه نتونست کد یکتا پیدا کنه (خیلی بعیده)
      if (!isUnique) {
        this.studentCode = `STU${Date.now()}${Math.random()}`;
        console.log(`⚠️ کد اضطراری ساخته شد: ${this.studentCode}`);
      }
    }
    // next();
  } catch (error) {
    console.log(error);
  }
});

//
// ✅ METHODS
//
studentSchema.methods.incrementAbsence = function () {
  this.currentAbsenceCount += 1;
  return this.save();
};

studentSchema.methods.shouldBeSuspended = function () {
  return this.currentAbsenceCount >= this.allowedAbsence;
};

const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

module.exports = Student;
