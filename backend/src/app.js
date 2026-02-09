const express = require("express");
const { securityMiddleware } = require("./config/security");
const errorHandler = require("./middlewares/error.middleware");
const userRoutes = require("./modules/user/user.routes");
const authRoutes = require("./modules/auth/auth.routes");
const branchRoutes = require("./modules/branches/branch.routes");

const app = express();

app.use(express.json());

securityMiddleware(app);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/users", userRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
