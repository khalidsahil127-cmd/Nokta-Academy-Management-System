const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");



const notificationSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
  title: String,
  message: { type: String, required: true },
  type: {type: String,enum: ["System", "Exam", "Payment", "Message"],default: "System"},
  read: { type: Boolean, default: false },
  priority: {type: String,enum: ["Low", "Medium", "High"],default: "Medium"},

}, { timestamps: true });
notificationSchema.plugin(softDeletePlugin);


module.exports = mongoose.model("Notification", notificationSchema);
