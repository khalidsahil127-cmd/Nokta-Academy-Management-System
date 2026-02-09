const mongoose = require("mongoose");

const financialReportSchema = new mongoose.Schema({
  period: {type: String,required: true},
  totalIncome: Number,
  totalSalaries: Number,
  profit: Number,
  generatedAt: {type: Date,default: Date.now},
  generatedBy: {type: mongoose.Schema.Types.ObjectId,ref: "User"}
}, { timestamps: true });

module.exports = mongoose.model("FinancialReport", financialReportSchema);
