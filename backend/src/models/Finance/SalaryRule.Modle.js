const mongoose = require("mongoose");

const salaryRuleSchema = new mongoose.Schema({
  teacherSharePercent: {type: Number,default: 35,min: 0,max: 100},
  deductionPerAbsence: {type: Number,default: 50},
  updatedBy: {type: mongoose.Schema.Types.ObjectId,ref: "User"}
}, { timestamps: true });

module.exports = mongoose.model("SalaryRule", salaryRuleSchema);
