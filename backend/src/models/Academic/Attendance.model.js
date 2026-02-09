const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student:{ type: mongoose.Schema.Types.ObjectId, ref:"Student", required:true },
  class:{ type: mongoose.Schema.Types.ObjectId, ref:"Class", required:true },
  date:{ type:Date, required:true },
  status:{ type:String, enum:["Present","Absent","Late"], required:true },
  autoRecorded:{ type:Boolean, default:false }
},{ timestamps:true });

attendanceSchema.index({ student: 1, class: 1, date: 1 }, { unique: true });


module.exports = mongoose.model("Attendance", attendanceSchema);