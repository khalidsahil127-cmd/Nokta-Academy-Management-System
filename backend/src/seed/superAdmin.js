const User = require("../models/Core/User.Model.js");
const Role = require("../models/Core/Role.Model.js");

module.exports = async function seedSuperAdmin() {
  try {
    const adminRole = await Role.findOne({ name: "ADMIN" });
    if (!adminRole) {
      console.log("❌ Admin role not found. Run RBAC seed first!");
      return;
    }

    const existingAdmin = await User.findOne({ email: "admin@test.com" });
    if (existingAdmin) {
      console.log("✅ Super Admin already exists");
      return;
    }
    await User.deleteOne({ email: "admin@test.com" });
    console.log("🗑️  Old admin removed (if existed)");

    const admin = new User({
      firstName: "Admin",
      lastName: "TestAdmin",
      email: "admin@test.com",
      password: "admin123", // هش خودکار با pre-save
      gender: "Male",
      role: adminRole._id,
      isActive: true,
      isSuspended: false,
      deletedAt: null
    });
    await admin.save();

    

    console.log("✅ Super Admin created successfully!");
  } catch (err) {
    console.error("❌ Super Admin seed failed:", err.message);
  }
};
