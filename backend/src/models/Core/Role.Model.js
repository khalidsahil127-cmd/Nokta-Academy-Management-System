const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: {type: String,required: true,unique: true,uppercase: true,},
    permissions: [{type: mongoose.Schema.Types.ObjectId,ref: "Permission",},],
    isSystem: {type: Boolean,default: false,},
  },
  { timestamps: true }
);

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
console.log("🟢 Role model loaded");
module.exports = Role;

