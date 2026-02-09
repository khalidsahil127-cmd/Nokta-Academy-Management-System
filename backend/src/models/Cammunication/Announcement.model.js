const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");



const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  target: {type: String,enum: ["All", "Students", "Parents", "Teachers", "Branch"],default: "All"},
  branch: {type: mongoose.Schema.Types.ObjectId,ref: "Branch"},
  createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

announcementSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Announcement", announcementSchema);
