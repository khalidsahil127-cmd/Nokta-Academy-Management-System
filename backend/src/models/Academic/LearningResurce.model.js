const mongoose = require("mongoose");

const learningResourceSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  type: { type: String, enum: ["pdf", "video", "link", "image", "Audio"] },
  url: String,
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("LearningResource", learningResourceSchema);
