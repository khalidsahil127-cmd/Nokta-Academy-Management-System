const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema({
  participants: [{type: mongoose.Schema.Types.ObjectId,ref: "User"}],
  relatedClass: {type: mongoose.Schema.Types.ObjectId,ref: "Class"},
  createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "User"},
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
