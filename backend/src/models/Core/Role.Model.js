const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: {type: String,required: true,unique: true,uppercase: true,},
    permissions: [{type: mongoose.Schema.Types.ObjectId,ref: "Permission",},],
    isSystem: {type: Boolean,default: false,},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);

