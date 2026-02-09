const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");


const studentSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", required:true, unique: true },
  studentCode: {type: String, required:true, unique:true, idex: true },
  status: {type: String, enum:["Active","Pending","Suspended"], default:"Pending" },
  allowedAbsence:{type:Number, default:3 },
  enrolledClasses:[{type: mongoose.Schema.Types.ObjectId, ref:"Class" }],
  payments: [{type: mongoose.Schema.Types.ObjectId, ref:"Payment" }],
  
},{ timestamps:true });

studentSchema.plugin(softDeletePlugin);


module.exports = mongoose.model("Student", studentSchema);
