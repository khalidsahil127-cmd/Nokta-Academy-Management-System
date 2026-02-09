const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  teacher: {type: mongoose.Schema.Types.ObjectId,ref: "Teacher",required: true},
  month: {type: String, required: true},
  totalIncome: {type: Number,required: true},
  baseSalary: {type: Number,required: true},
  absences: {type: Number,default: 0},
  deductions: {type: Number,default: 0},
  netSalary: {type: Number,required: true},
  generatedBy: {type: mongoose.Schema.Types.ObjectId,ref: "User"},
  paid: {type: Boolean,default: false}
}, { timestamps: true });

salarySchema.index({ teacher: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Salary", salarySchema);
