const mongoose = require("mongoose");

const graduateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  course: String,
  graduationDate: Date,
  certificateUrl: String
}, { timestamps: true });

module.exports = mongoose.model("Graduate", graduateSchema);
