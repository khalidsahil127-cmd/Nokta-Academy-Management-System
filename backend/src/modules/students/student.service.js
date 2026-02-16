const Student = require("../../models/people/student.model");
const User = require("../../models/core/User.model");
const Class = require("../../models/Academic/Class.model");
const AppError = require("../../utils/app.error");
const Payment = require("../../models/Finance/Payment.Model");
const {
  ACTIVE,
  PENDING,
  SUSPENDED,
  DROPPED,
} = require("../../constants/studentStatus");
const { ADMIN, SELF } = require("../../constants/registerationSource");

class StudentService {
  // ثبت دانش‌آموز توسط Admin (UC-A09)
  static async registerByAdmin(payload, adminUser) {
    const {
      email,
      firstName,
      lastName,
      password,
      gender,
      branchId,
      enrolledClassId,
      ...studentData
    } = payload;

    // اعتبارسنجی ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    // اگر کلاس انتخاب شده، بررسی تطابق جنسیت (BR-01)
    if (enrolledClassId) {
      const targetClass = await Class.findById(enrolledClassId);
      if (!targetClass) throw new AppError("Class not found", 404);

      if (targetClass.gender !== gender) {
        throw new AppError(
          `Class is for ${targetClass.gender} students only`,
          400,
        );
      }

      // بررسی ظرفیت کلاس
      const currentEnrollments = await Student.countDocuments({
        enrolledClasses: enrolledClassId,
        status: ACTIVE,
      });

      if (currentEnrollments >= targetClass.capacity) {
        throw new AppError("Class has reached maximum capacity", 400);
      }
    }

    // ایجاد کاربر
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      gender,
      branch: branchId,
      isActive: true,
    });

    // ایجاد پروفایل دانش‌آموز
    const studentDataToCreate = {
      user: user._id,
      branch: branchId,
      status: ACTIVE,
      registrationSource: ADMIN,
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      ...studentData,
    };

    // اگر کلاس انتخاب شده بود، اضافه کن
    if (enrolledClassId) {
      studentDataToCreate.enrolledClasses = [enrolledClassId];
    }

    const student = await Student.create(studentDataToCreate);

    return {
      id: student._id,
      studentCode: student.studentCode,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
      },
      enrolledClasses: student.enrolledClasses,
      status: student.status,
    };
  }

  // ثبت‌نام آنلاین توسط دانش‌آموز (UC-S01)
  static async selfRegister(payload) {
    const {
      email,
      firstName,
      lastName,
      password,
      gender,
      branchId,
      phone,
      address,
      ...studentData
    } = payload;

    // اعتبارسنجی ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    // ایجاد کاربر (غیرفعال تا تأیید ادمین)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      gender,
      branch: branchId,
      isActive: false, // غیرفعال تا تأیید
    });

    // ایجاد پروفایل دانش‌آموز (در حالت Pending)
    const student = await Student.create({
      user: user._id,
      branch: branchId,
      status: PENDING,
      registrationSource: SELF,
      selfRegisteredAt: new Date(),
      ...studentData,
    });

    return {
      id: student._id,
      studentCode: student.studentCode,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
      },
      status: student.status,
      message: "Registration successful. Waiting for admin approval.",
    };
  }

  // تأیید دانش‌آموز self-registered توسط Admin
  static async approveStudent(studentId, adminUser) {
    const student = await Student.findById(studentId).populate("user");
    if (!student) throw new AppError("Student not found", 404);

    if (student.status !== PENDING) {
      throw new AppError("Student is not in pending state", 400);
    }

    // فعال‌سازی کاربر
    const user = await User.findById(student.user._id);
    user.isActive = true;
    await user.save();

    // به‌روزرسانی وضعیت دانش‌آموز
    student.status = ACTIVE;
    student.approvedBy = adminUser._id;
    student.approvedAt = new Date();
    student.reviewedAt = new Date();
    await student.save();

    return {
      id: student._id,
      status: student.status,
      message: "Student approved successfully",
    };
  }

  // رد درخواست دانش‌آموز توسط Admin
  static async rejectStudent(studentId, reason, adminUser) {
    const student = await Student.findById(studentId);
    if (!student) throw new AppError("Student not found", 404);

    if (student.status !== PENDING) {
      throw new AppError("Student is not in pending state", 400);
    }

    // حذف کاربر (یا غیرفعال کردن)
    await User.findByIdAndUpdate(student.user, { isActive: false });

    student.status = DROPPED;
    student.rejectionReason = reason;
    student.reviewedAt = new Date();
    await student.save();

    return {
      id: student._id,
      status: student.status,
      message: "Student registration rejected",
    };
  }

  // اختصاص دانش‌آموز به کلاس (UC-A10)
  static async assignToClass(studentId, classId, adminUser) {
    const student = await Student.findById(studentId).populate("user");
    if (!student) throw new AppError("Student not found", 404);

    const targetClass = await Class.findById(classId);
    if (!targetClass) throw new AppError("Class not found", 404);

    // بررسی تطابق جنسیت (BR-01)
    if (targetClass.gender !== student.user.gender) {
      throw new AppError(
        `Class is for ${targetClass.gender} students only`,
        400,
      );
    }

    // بررسی ظرفیت کلاس
    const currentEnrollments = await Student.countDocuments({
      enrolledClasses: classId,
      status: ACTIVE,
    });

    if (currentEnrollments >= targetClass.capacity) {
      throw new AppError("Class has reached maximum capacity", 400);
    }

    // بررسی تکراری نبودن
    if (student.enrolledClasses.includes(classId)) {
      throw new AppError("Student already enrolled in this class", 409);
    }

    // اضافه کردن کلاس به دانش‌آموز
    student.enrolledClasses.push(classId);
    await student.save();

    return {
      id: student._id,
      studentCode: student.studentCode,
      enrolledClasses: student.enrolledClasses,
      message: "Student assigned to class successfully",
    };
  }

  // تعلیق دانش‌آموز (UC-A12)
  static async suspendStudent(studentId, reason) {
    const student = await Student.findById(studentId).populate("user");
    if (!student) throw new AppError("Student not found", 404);

    student.status = SUSPENDED;
    await student.save();

    // غیرفعال کردن کاربر
    const user = await User.findById(student.user._id);
    user.isActive = false;
    await user.save();

    // حذف از کلاس‌ها (اختیاری)
    student.enrolledClasses = [];
    await student.save();

    return {
      id: student._id,
      status: student.status,
      message: "Student suspended successfully",
    };
  }

  // دریافت پروفایل کامل دانش‌آموز
  static async getStudentProfile(studentId, requestingUser) {
    const student = await Student.findById(studentId)
      .populate("user", "-password")
      .populate({
        path: "enrolledClasses",
        populate: {
          path: "teacher",
          populate: { path: "user", select: "firstName lastName" },
        },
      })
      .populate("branch")
      .populate("payments");

    if (!student) throw new AppError("Student not found", 404);

    if (
      requestingUser.role.name.toLowerCase() !== "admin" &&
      requestingUser._id.toString() !== student.user._id.toString()
    ) {
      throw new AppError("Forbidden: Insufficient permissions", 403);
    }

    return student;
    
  }

  // متد داخلی برای افزایش غیبت (برای کرون جاب)
  static async incrementAbsence(studentId) {
    const student = await Student.findById(studentId);
    if (!student) throw new AppError("Student not found", 404);

    await student.incrementAbsence();

    // اگر به حد مجاز رسید، تعلیق کن
    if (student.shouldBeSuspended()) {
      await this.suspendStudent(studentId, "Exceeded allowed absence limit");
    }

    return student;
  }
}

module.exports = StudentService;
