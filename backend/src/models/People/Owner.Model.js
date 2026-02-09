const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema({
  user:{ type: mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  permissions: [{
    type: String,
    enum: ["VIEW_REPORTS", "MANAGE_FINANCE", "MANAGE_USERS", "SYSTEM_SETTINGS"]
  }]

},{ timestamps:true });

module.exports = mongoose.model("Owner", ownerSchema);
