const jwt = require("jsonwebtoken");
const AppError = require("../../utils/app.error.js");
const User = require("../../models/Core/User.Model.js");
const  env  = require("../../config/env.js");
const AuditService = require("../audit/audit.service");

require("../../models/Core/Role.Model.js");
require("../../models/Core/Permission.Model.js");



exports.protect = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        await AuditService.logFailedAccess(req, "No token provided");
        return next(new AppError("Unauthorized: No token provided", 401));
      }

      const token = authHeader.split(" ")[1];
      console.log("TOKEN:", token);
      console.log("JWT SECRET:", env.jwt.accessSecret);

      let decoded;
      try {
        decoded = jwt.verify(token, env.jwt.accessSecret);
      } catch (err) {
        await AuditService.logFailedAccess(req, "Invalid token");
        return next(new AppError("Unauthorized: Invalid token", 401));
      }

      const user = await User.findById(decoded.sub)
        .populate({
          path: "role",
          populate: { path: "permissions" }
        });

      if (!user) return next(new AppError("User not found", 404));

      // بررسی وضعیت کاربر با فیلدهای واقعی
      if (user.deletedAt) return next(new AppError("Account deleted", 403));
      if (user.isSuspended) return next(new AppError("Account suspended", 403));
      if (!user.isActive) return next(new AppError("Account inactive", 403));

      req.user = user;
      next();
    } catch (err) {
      console.error("Auth middleware error:", err);
      next(new AppError("Unauthorized", 401));
    }
  };
};
