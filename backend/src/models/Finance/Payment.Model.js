const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  enrollment: {type: mongoose.Schema.Types.ObjectId,ref: "Enrollment",required: true},
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: {type: String,enum: ["Cash", "Bank", "Online"],required: true},
  receiptNumber: {type: String,unique: true,required: true},
  paidAt: {type: Date,default: Date.now},
  recordedBy: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
   student: {type: mongoose.Schema.Types.ObjectId,ref: "Student",required: true},
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
