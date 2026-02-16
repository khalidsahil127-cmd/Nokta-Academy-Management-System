const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");

const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    mode: { type: String, enum: ["Online", "Physical"], required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    capacity: { type: Number, required: true, min: 1 },

    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],

    schedule: {
      days: [
        {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
      ],
      startTime: String,
      endTime: String,
      room: String,
    },

    isActive: { type: Boolean, default: true },
    currentEnrollment: { type: Number, default: 0 },

    description: { type: String },
    prerequisites: [{ type: String }],

    onlineLink: { type: String },

    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true },
);

classSchema.plugin(softDeletePlugin);

classSchema.pre("validate", async function () {
  if (!this.code) {
    try {
      const count = await this.constructor.countDocuments();
      this.code = `CLS${String(count + 1).padStart(6, "0")}`;
      console.log("✅ کد ساخته شد:", this.code);
    } catch (error) {
      return next(error);
    }
  }
  // next();
});

classSchema.methods.hasCapacity = function () {
  return this.currentEnrollment < this.capacity;
};

classSchema.methods.incrementEnrollment = function () {
  this.currentEnrollment += 1;
  return this.save();
};

classSchema.methods.decrementEnrollment = function () {
  if (this.currentEnrollment > 0) {
    this.currentEnrollment -= 1;
  }
  return this.save();
};

const Class = mongoose.models.Class || mongoose.model("Class", classSchema);
module.exports = Class;