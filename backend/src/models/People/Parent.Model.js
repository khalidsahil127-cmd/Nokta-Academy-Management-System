// src/model/peoples/parent.model.js
const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");

const parentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  linkedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }]
}, { timestamps: true });

parentSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Parent", parentSchema);
