const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatSession: {type: mongoose.Schema.Types.ObjectId,ref: "ChatSession",required: true},
  sender: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
  content: { type: String, required: true },
  seenBy: [{type: mongoose.Schema.Types.ObjectId,ref: "User"}],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ chatSession: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
