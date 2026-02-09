const mongoose = require("mongoose");

const attendancePolicySchema = new mongoose.Schema({
  class:{ type: mongoose.Schema.Types.ObjectId, ref:"Class", required:true },
  maxAbsence:{ type:Number, default:3 },
  autoSuspend:{ type:Boolean, default:true }
},{ timestamps:true });


attendancePolicySchema.index({ class: 1 },{ unique: true });


module.exports = mongoose.model("AttendancePolicy", attendancePolicySchema);