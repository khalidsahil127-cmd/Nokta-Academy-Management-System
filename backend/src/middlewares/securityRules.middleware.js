const AppError = require("../utils/app.error");
const Teacher = require("../models/People/Teacher.model");
const Student = require("../models/People/Student.Model");

/**
 * Middleware for Role-Based Access Control (RBAC)
 * @param {Function} resourceGetter - Async function that returns the resource object
 */
exports.validateAccess = (resourceGetter) => {
  return async (req, res, next) => {
    try {
      const resource = await resourceGetter(req);
      const user = req.user;

      if (!resource) return next(new AppError("Resource not found", 404));
      if (!user) return next(new AppError("User is not logged in", 401));

      const roleName = user.role?.name?.toLowerCase();

      // ===================== ADMIN =====================
      if (roleName === "admin") return next(); // Admin has full access

      // ===================== OWNER =====================
      if (roleName === "owner") {
        if (req.method === "GET") return next(); // Owner only has read access
        return next(new AppError("Owner has read-only access", 403));
      }

      // ===================== STUDENT =====================
      if (roleName === "student") {
        const resourceUserId =
          resource.user?._id?.toString() ||
          resource.user?.toString() ||
          resource._id?.toString() ||
          resource.studentId?.toString();

        if (resourceUserId === user._id.toString()) {
          console.log("✅ Student is accessing their own profile");
          return next();
        }

        return next(new AppError("You can only view your own profile", 403));
      }

      // ===================== TEACHER =====================
      if (roleName === "teacher") {
        // Accessing own profile
        if (resource.constructor?.modelName === "Teacher") {
          const resourceUserId =
            resource.user?._id?.toString() || resource._id?.toString();
          if (resourceUserId === user._id.toString()) {
            console.log("✅ Teacher is accessing their own profile");
            return next();
          }
        }

        // Accessing students in own classes
        if (resource.constructor?.modelName === "Student") {
          console.log("📌 Checking teacher access to student profile");

          const studentClasses = resource.enrolledClasses || [];
          const teacher = await Teacher.findOne({ user: user._id });

          if (!teacher) {
            console.log("❌ Teacher not found");
            return next(new AppError("Teacher profile not found", 404));
          }

          const teacherClassIds = (teacher.assignedClasses || []).map(
            (c) => c._id?.toString() || c.toString(),
          );

          const studentClassIds = studentClasses.map(
            (c) => c._id?.toString() || c.toString(),
          );

          console.log("🆔 Student classes:", studentClassIds);
          console.log("🆔 Teacher classes:", teacherClassIds);

          const hasAccess = studentClassIds.some((classId) =>
            teacherClassIds.includes(classId),
          );

          if (hasAccess) {
            console.log("✅ Teacher is accessing a student in their class");
            return next();
          }
        }

        // Accessing learning resources
        if (resource.constructor?.modelName === "LearningResource") {
          const teacher = await Teacher.findOne({ user: user._id });
          if (
            teacher &&
            teacher.assignedClasses?.includes(resource.classId?.toString())
          ) {
            console.log("✅ Teacher has access to the learning resource");
            return next();
          }
        }

        return next(
          new AppError(
            "You can only access your own profile and students in your classes",
            403,
          ),
        );
      }

      // ===================== PARENT =====================
      if (roleName === "parent") {
        const resourceUserId =
          resource.user?._id?.toString() ||
          resource.user?.toString() ||
          resource._id?.toString() ||
          resource.studentId?.toString();

        if (user.linkedStudents?.includes(resourceUserId)) {
          console.log("✅ Parent is accessing their linked student's profile");
          return next();
        }

        return next(
          new AppError(
            "You can only access your linked student's profile",
            403,
          ),
        );
      }

      // ===================== DEFAULT =====================
      return next(
        new AppError("You do not have permission to access this page", 403),
      );
    } catch (error) {
      console.error("Error during access validation:", error);
      return next(new AppError("Internal server error", 500));
    }
  };
};
