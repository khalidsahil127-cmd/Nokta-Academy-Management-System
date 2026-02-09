const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");



const advertisementSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  targetAudience: { type: String, enum: ["student", "parent", "public"] },
  activeFrom: Date,
  activeTo: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

advertisementSchema.plugin(softDeletePlugin);
module.exports = mongoose.model("Advertisement", advertisementSchema);
