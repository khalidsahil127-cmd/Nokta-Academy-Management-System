const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");



const classSchema = new mongoose.Schema({
  title:{ type:String, required:true },
  mode:{ type:String, enum:["Online","Offline"], required:true },
  gender:{ type:String, enum:["Male","Female", "Mixed"], required:true },
  capacity:{ type:Number, required:true },
  isActive:{ type:Boolean, default:true },
  branch:{ type: mongoose.Schema.Types.ObjectId, ref:"Branch", required:true },
  teacher:{ type: mongoose.Schema.Types.ObjectId, ref:"Teacher" },
  subjects:[{ type: mongoose.Schema.Types.ObjectId, ref:"Subject" }],
  schedule: [{ day: String, startTime: String, endTime: String }],
  tuitionFee: {type: Number,required: true,min: 0},

},{ timestamps:true });

classSchema.plugin(softDeletePlugin);



module.exports = mongoose.model("Class", classSchema);
