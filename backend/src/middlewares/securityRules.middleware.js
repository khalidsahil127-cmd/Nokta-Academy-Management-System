// src/middlewares/securityRules.middleware.js

const AppError = require("../utils/app.error");

exports.validateAccess = (resourceGetter) => {
  return async (req, res, next) => {
    const resource = await resourceGetter(req);
    const user = req.user;

    if (!resource) {
      return next(new AppError("Resource not found", 404));
    }

    if (
      user.role.name === "STUDENT" &&
      resource.studentId?.toString() !== user._id.toString()
    ) {
      return next(new AppError("Forbidden", 403));
    }

    if (
      user.role.name === "PARENT" &&
      !user.linkedStudents.includes(resource.studentId?.toString())
    ) {
      return next(new AppError("Forbidden", 403));
    }

    if (
      user.role.name === "TEACHER" &&
      !user.assignedClasses.includes(resource.classId?.toString())
    ) {
      return next(new AppError("Forbidden", 403));
    }

    if (user.role.name === "OWNER" && req.method !== "GET") {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
};
