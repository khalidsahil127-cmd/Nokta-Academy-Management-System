const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employeeCode: { type: String, required: true, unique: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    baseSalary: { type: Number, required: true },
    currentSalary: { type: Number }, // بعد از کسر جریمه‌ها
    absenceCount: { type: Number, default: 0 },
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    employmentStatus: {
      type: String,
      enum: ["Active", "Suspended", "Terminated", "OnLeave"],
      default: "Active",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    qualification: { type: String },
    specialization: { type: String },
    experience: { type: Number }, // سال سابقه
    joinDate: { type: Date, default: Date.now },
    contractEndDate: { type: Date },
  },
  { timestamps: true },
);

teacherSchema.plugin(softDeletePlugin);

// Generate employee code automatically
teacherSchema.pre("validate", async function () {
  if (!this.employeeCode) {
    const count = await this.constructor.countDocuments();
    this.employeeCode = `TCH${String(count + 1).padStart(6, "0")}`;
  }
});

teacherSchema.methods.calculateNetSalary = function () {
  const deductionPerAbsence = 50;
  const totalDeduction = this.absenceCount * deductionPerAbsence;
  this.currentSalary = this.baseSalary - totalDeduction;
  return this.currentSalary;
};

const Teacher =
  mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;