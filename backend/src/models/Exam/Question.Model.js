const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  text: { type: String, required: true },
  type: {type: String,enum: ["MCQ", "ShortAnswer", "Essay"],required: true},
  options: [String], 
  correctAnswer: String,
  marks: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
