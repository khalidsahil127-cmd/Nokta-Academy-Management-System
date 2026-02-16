// app.js (به‌روزرسانی شده)
const express = require("express");
const { securityMiddleware } = require("./config/security");
const errorHandler = require("./middlewares/error.middleware");
const userRoutes = require("./modules/user/user.routes");
const authRoutes = require("./modules/auth/auth.routes");
const branchRoutes = require("./modules/branches/branch.routes");
const studentRoutes = require("./modules/students/student.routes");
const teacherRoutes = require("./modules/teacher/teacher.routes");
const classRoutes = require("./modules/class/class.routes");

const app = express();

app.use(express.json());
securityMiddleware(app);

app.get("/", (req, res) => {
  res.send("NMS API is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

module.exports = app;
