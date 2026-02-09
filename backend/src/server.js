require("dotenv").config();
const connectDB = require("./config/db");
const { port } = require("./config/env.js"); // توجه به نام port
const app = require("./app");
const errorHandler = require("./middlewares/error.middleware");
const { securityMiddleware } = require("./config/security.js"); // مسیر درست
// const loggingMiddleware = require("./middlewares/logging.middleware");
const AppError = require("./utils/app.error"); // کلاس AppError

// ===== Connect to MongoDB =====
connectDB();




// نمونه route
app.get("/api/forbidden", (req, res, next) => {
  next(new AppError("Access denied", 403));
});

// Error handler
app.use(errorHandler);

// ===== Start Server =====
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
