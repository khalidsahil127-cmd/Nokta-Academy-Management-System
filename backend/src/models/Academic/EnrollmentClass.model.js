const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  student:{ type: mongoose.Schema.Types.ObjectId, ref:"Student", required:true },
  class:  { type: mongoose.Schema.Types.ObjectId, ref:"Class", required:true },
  source: { type:String, enum:["Admin","Student"], required:true },
  status: { type:String, enum:["Active","Suspended"], default:"Active" }
},{ timestamps:true });

enrollmentSchema.index({ student:1, class:1 },{ unique:true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
