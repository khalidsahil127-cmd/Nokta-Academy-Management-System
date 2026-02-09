// src/models/Permission.model.js
const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
    key: {type: String, required: true, unique: true, uppercase: true, trim: true,},
    description: {type: String,required: true,},
  },{ timestamps: false });


module.exports = mongoose.model("Permission", permissionSchema);
