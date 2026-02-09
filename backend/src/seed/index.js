require("dotenv").config();
const connectDB = require("../config/db");
const rbacSeed = require("./rbac.seed");
const superAdminSeed = require("./superAdmin");

(async () => {
  try {
    await connectDB();

    console.log("Running RBAC seed...");
    await rbacSeed();

    console.log("Running Super Admin seed...");
    await superAdminSeed();

    console.log("All seeds completed 🎉");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
})();
