const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const softDeletePlugin = require("../plugins/softDelete.plugin");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true, select: false },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },

  // وضعیت کاربر
  isActive: { type: Boolean, default: true },       // فعال یا غیر فعال
  isSuspended: { type: Boolean, default: false },  // تعلیق شده یا نه
  deletedAt: { type: Date, default: null },        // حذف نرم
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }
}, { timestamps: true });

// پلاگین soft delete (اگر نیاز باشد)
userSchema.plugin(softDeletePlugin);

// ------------------ هش کردن پسورد ------------------
// بدون next
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  if (update?.password) {
    update.password = await bcrypt.hash(update.password, 12);
    this.setUpdate(update);
  }
});

// ------------------ مقایسه پسورد ------------------
userSchema.methods.comparePassword = async function (plain) {
  const hashed = this.get("password"); // مطمئن شدن از مقدار واقعی
  return bcrypt.compare(plain, hashed);
};

// ------------------ Export ------------------
module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
