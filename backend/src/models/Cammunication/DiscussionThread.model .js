const mongoose = require("mongoose");

const discussionThreadSchema = new mongoose.Schema({
  class:{ type: mongoose.Schema.Types.ObjectId, ref:"Class", required:true },
  topic:{ type:String, required:true },
  createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "User"},
  isClosed: { type: Boolean, default: false }
},{ timestamps:true });



module.exports = mongoose.model("DiscussionThread", discussionThreadSchema);

