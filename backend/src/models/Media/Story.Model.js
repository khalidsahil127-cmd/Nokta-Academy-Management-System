const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: String,
  mediaUrl: String,
  expiresAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Story", storySchema);
