const Class = require("../../models/Academic/Class.model");
const Enrollment = require("../../models/Academic/EnrollmentClass.model");
const Student = require("../../models/People/Student.model");
const Teacher = require("../../models/People/Teacher.model");
const AppError = require("../../utils/app.error");
const { ONLINE, PHYSICAL } = require("../../constants/classMode");
const { ADMIN, STUDENT } = require("../../constants/enrollmentSource");

class ClassService {
  
  // ایجاد کلاس (UC-A17)
  static async createClass(payload, creatorId) {
    const { 
      title, mode, gender, capacity, branchId, 
      teacherId, subjects, schedule, description,
      startDate, endDate, onlineLink, prerequisites
    } = payload;

    // اعتبارسنجی استاد اگر انتخاب شده باشد
    if (teacherId) {
      const teacher = await Teacher.findById(teacherId).populate('user');
      if (!teacher) throw new AppError("Teacher not found", 404);
      
      // بررسی تطابق جنسیت (BR-01)
      if (teacher.user.gender !== gender) {
        throw new AppError(`This class is for ${gender} teachers only`, 400);
      }

      // بررسی وضعیت استاد
      if (teacher.employmentStatus !== "Active") {
        throw new AppError("Teacher is not active", 400);
      }
    }

    // ایجاد کلاس
    const newClass = await Class.create({
      title,
      mode,
      gender,
      capacity,
      branch: branchId,
      teacher: teacherId,
      subjects: subjects || [],
      schedule,
      description,
      startDate,
      endDate,
      onlineLink: mode === ONLINE ? onlineLink : undefined,
      prerequisites,
      currentEnrollment: 0
    });

    // اگر استاد انتخاب شده، به لیست کلاس‌های استاد اضافه کن
    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, {
        $addToSet: { assignedClasses: newClass._id }
      });
    }

    return newClass;
  }

  // ثبت‌نام دانش‌آموز در کلاس (UC-A10)
  static async enrollStudent(classId, studentId, source = ADMIN, enrolledBy = null) {
    const classObj = await Class.findById(classId);
    if (!classObj) throw new AppError("Class not found", 404);

    const student = await Student.findById(studentId).populate('user');
    if (!student) throw new AppError("Student not found", 404);

    // بررسی تطابق جنسیت (BR-01)
    if (student.user.gender !== classObj.gender) {
      throw new AppError(`This class is for ${classObj.gender} students only`, 400);
    }

    // بررسی ظرفیت کلاس
    if (!classObj.hasCapacity()) {
      throw new AppError("Class has reached maximum capacity", 400);
    }

    // بررسی وضعیت دانش‌آموز
    if (student.status !== "Active") {
      throw new AppError("Student is not active", 400);
    }

    // بررسی ثبت‌نام قبلی
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      class: classId,
      status: "Active"
    });

    if (existingEnrollment) {
      throw new AppError("Student already enrolled in this class", 409);
    }

    // ایجاد ثبت‌نام
    const enrollment = await Enrollment.create({
      student: studentId,
      class: classId,
      source,
      enrolledBy,
      status: "Active",
      enrolledAt: new Date()
    });

    // افزایش ظرفیت مصرف‌شده کلاس
    await classObj.incrementEnrollment();

    // اضافه کردن کلاس به لیست دانش‌آموز
    await Student.findByIdAndUpdate(studentId, {
      $addToSet: { enrolledClasses: classId }
    });

    return enrollment;
  }

  // ثبت‌نام گروهی دانش‌آموزان در کلاس
  static async bulkEnroll(classId, studentIds, enrolledBy) {
    const results = {
      success: [],
      failed: []
    };

    for (const studentId of studentIds) {
      try {
        const enrollment = await this.enrollStudent(classId, studentId, ADMIN, enrolledBy);
        results.success.push({
          studentId,
          enrollmentId: enrollment._id
        });
      } catch (error) {
        results.failed.push({
          studentId,
          reason: error.message
        });
      }
    }

    return results;
  }

  // اختصاص استاد به کلاس (UC-A20)
  static async assignTeacher(classId, teacherId) {
    const classObj = await Class.findById(classId);
    if (!classObj) throw new AppError("Class not found", 404);

    const teacher = await Teacher.findById(teacherId).populate('user');
    if (!teacher) throw new AppError("Teacher not found", 404);

    // بررسی تطابق جنسیت (BR-01)
    if (teacher.user.gender !== classObj.gender) {
      throw new AppError(`This class is for ${classObj.gender} teachers only`, 400);
    }

    // بررسی وضعیت استاد
    if (teacher.employmentStatus !== "Active") {
      throw new AppError("Teacher is not active", 400);
    }

    // به‌روزرسانی کلاس
    const oldTeacherId = classObj.teacher;
    classObj.teacher = teacherId;
    await classObj.save();

    // اگر استاد قبلی داشت، از لیستش حذف کن
    if (oldTeacherId) {
      await Teacher.findByIdAndUpdate(oldTeacherId, {
        $pull: { assignedClasses: classId }
      });
    }

    // اضافه کردن به لیست استاد جدید
    await Teacher.findByIdAndUpdate(teacherId, {
      $addToSet: { assignedClasses: classId }
    });

    return classObj;
  }

  // دریافت جزئیات کامل کلاس با لیست دانش‌آموزان
  static async getClassDetails(classId) {
    const classObj = await Class.findById(classId)
      .populate('teacher', 'employeeCode baseSalary')
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'firstName lastName email' }
      })
      .populate('subjects')
      .populate('branch');
    
    if (!classObj) throw new AppError("Class not found", 404);

    // دریافت لیست دانش‌آموزان فعال
    const enrollments = await Enrollment.find({ 
      class: classId, 
      status: "Active" 
    })
    .populate({
      path: 'student',
      populate: { 
        path: 'user', 
        select: 'firstName lastName email gender' 
      }
    })
    .sort({ enrolledAt: -1 });

    // آمار کلاس
    const totalStudents = enrollments.length;
    const availableSpots = classObj.capacity - totalStudents;

    return {
      class: classObj,
      students: enrollments.map(e => ({
        enrollmentId: e._id,
        studentId: e.student._id,
        name: `${e.student.user.firstName} ${e.student.user.lastName}`,
        gender: e.student.user.gender,
        studentCode: e.student.studentCode,
        enrolledAt: e.enrolledAt,
        attendanceCount: e.attendanceCount,
        absenceCount: e.absenceCount
      })),
      statistics: {
        totalStudents,
        availableSpots,
        capacity: classObj.capacity,
        utilizationRate: (totalStudents / classObj.capacity) * 100
      }
    };
  }

  // به‌روزرسانی کلاس (UC-A18)
  static async updateClass(classId, updates, updaterId) {
    const classObj = await Class.findById(classId);
    if (!classObj) throw new AppError("Class not found", 404);

    // اگر استاد تغییر می‌کند، بررسی تطابق جنسیت
    if (updates.teacherId && updates.teacherId !== classObj.teacher.toString()) {
      const teacher = await Teacher.findById(updates.teacherId).populate('user');
      if (!teacher) throw new AppError("Teacher not found", 404);
      
      if (teacher.user.gender !== (updates.gender || classObj.gender)) {
        throw new AppError("Teacher gender must match class gender", 400);
      }

      // به‌روزرسانی استاد قدیم و جدید
      if (classObj.teacher) {
        await Teacher.findByIdAndUpdate(classObj.teacher, {
          $pull: { assignedClasses: classId }
        });
      }

      await Teacher.findByIdAndUpdate(updates.teacherId, {
        $addToSet: { assignedClasses: classId }
      });

      classObj.teacher = updates.teacherId;
    }

    // اگر ظرفیت تغییر می‌کند
    if (updates.capacity && updates.capacity < classObj.currentEnrollment) {
      throw new AppError(`Cannot reduce capacity below current enrollment (${classObj.currentEnrollment})`, 400);
    }

    // به‌روزرسانی سایر فیلدها
    const allowedUpdates = ['title', 'mode', 'gender', 'capacity', 'schedule', 'description', 'onlineLink', 'isActive'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        classObj[field] = updates[field];
      }
    });

    await classObj.save();

    return classObj;
  }

  // حذف دانش‌آموز از کلاس (Dropping)
  static async dropStudent(classId, studentId, reason, droppedBy) {
    const enrollment = await Enrollment.findOne({
      student: studentId,
      class: classId,
      status: "Active"
    });

    if (!enrollment) {
      throw new AppError("Active enrollment not found", 404);
    }

    // به‌روزرسانی وضعیت ثبت‌نام
    enrollment.status = "Dropped";
    enrollment.droppedAt = new Date();
    enrollment.droppedReason = reason;
    enrollment.droppedBy = droppedBy;
    await enrollment.save();

    // کاهش ظرفیت مصرف‌شده کلاس
    const classObj = await Class.findById(classId);
    await classObj.decrementEnrollment();

    // حذف کلاس از لیست دانش‌آموز
    await Student.findByIdAndUpdate(studentId, {
      $pull: { enrolledClasses: classId }
    });

    return enrollment;
  }

  // دریافت کلاس‌های یک استاد
  static async getTeacherClasses(teacherId) {
    const classes = await Class.find({ 
      teacher: teacherId,
      isActive: true 
    })
    .populate('subjects')
    .populate('branch');

    return classes;
  }

  // دریافت کلاس‌های یک دانش‌آموز
  static async getStudentClasses(studentId) {
    const enrollments = await Enrollment.find({
      student: studentId,
      status: "Active"
    })
    .populate({
      path: 'class',
      populate: [
        { path: 'teacher', populate: { path: 'user', select: 'firstName lastName' } },
        { path: 'subjects' },
        { path: 'branch' }
      ]
    });

    return enrollments.map(e => e.class);
  }
}

module.exports = ClassService;