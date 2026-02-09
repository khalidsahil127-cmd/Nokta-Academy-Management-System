const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");

const teacherSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  employeeCode:{ type:String, required:true, unique:true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref:"Subject" }],
  baseSalary: { type:Number, required:true },
  absenceCount:{ type:Number, default:0 },
  assignedClasses:[{ type: mongoose.Schema.Types.ObjectId, ref:"Class" }],
  employmentStatus: {type: String,enum: ["Active", "Suspended", "Terminated"],default: "Active"},
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }

},{ timestamps:true });

teacherSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Teacher", teacherSchema);
