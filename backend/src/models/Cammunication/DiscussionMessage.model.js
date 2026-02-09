const mongoose = require("mongoose");

const discussionMessageSchema = new mongoose.Schema({
  thread: {type: mongoose.Schema.Types.ObjectId,ref: "DiscussionThread",required: true},
  author: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
  content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("DiscussionMessage", discussionMessageSchema);
