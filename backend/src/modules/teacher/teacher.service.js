const Teacher = require("../../models/People/Teacher.model");
const User = require("../../models/Core/User.Model");
const Subject = require("../../models/Academic/Subject.model");
const TeacherEvaluation = require("../../models/Evaluation/TeacherEvaluation.Model");
const Class = require("../../models/Academic/Class.model");
const AppError = require("../../utils/app.error");

class TeacherService {
  
  // ثبت استاد توسط Admin (UC-A13)
  static async registerTeacher(payload, adminUser) {
    const { 
      email, firstName, lastName, password, gender, branchId, 
      subjects, baseSalary, qualification, specialization, experience,
      joinDate, contractEndDate, role, ...teacherData 
    } = payload;

    // اعتبارسنجی ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    // اعتبارسنجی مضامین اگر انتخاب شده باشند
    if (subjects && subjects.length > 0) {
      const subjectDocs = await Subject.find({ _id: { $in: subjects } });
      if (subjectDocs.length !== subjects.length) {
        throw new AppError("Some subjects not found", 400);
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
      role: role
    });

    // ایجاد پروفایل استاد
    const teacher = await Teacher.create({
      user: user._id,
      branch: branchId,
      subjects: subjects || [],
      baseSalary,
      currentSalary: baseSalary,
      qualification,
      specialization,
      experience,
      joinDate: joinDate || new Date(),
      contractEndDate,
      ...teacherData
    });

    return {
      id: teacher._id,
      employeeCode: teacher.employeeCode,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        role: user.role
      },
      subjects: teacher.subjects,
      baseSalary: teacher.baseSalary,
      employmentStatus: teacher.employmentStatus
    };
  }

  // اختصاص مضامین به استاد (UC-A14)
  static async assignSubjects(teacherId, subjectIds) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) throw new AppError("Teacher not found", 404);

    const subjects = await Subject.find({ _id: { $in: subjectIds } });
    if (subjects.length !== subjectIds.length) {
      throw new AppError("Some subjects not found", 400);
    }

    // اضافه کردن مضامین جدید بدون تکرار
    teacher.subjects = [...new Set([...teacher.subjects, ...subjectIds])];
    await teacher.save();

    return {
      id: teacher._id,
      subjects: teacher.subjects
    };
  }

  // اختصاص استاد به کلاس (UC-A20)
  static async assignToClass(teacherId, classId) {
    const teacher = await Teacher.findById(teacherId).populate('user');
    if (!teacher) throw new AppError("Teacher not found", 404);

    const targetClass = await Class.findById(classId);
    if (!targetClass) throw new AppError("Class not found", 404);

    // بررسی تطابق جنسیت (BR-01)
    if (targetClass.gender !== teacher.user.gender) {
      throw new AppError(`Class is for ${targetClass.gender} teachers only`, 400);
    }

    // بررسی تکراری نبودن
    if (teacher.assignedClasses.includes(classId)) {
      throw new AppError("Teacher already assigned to this class", 409);
    }

    // اختصاص استاد به کلاس
    teacher.assignedClasses.push(classId);
    await teacher.save();

    // به‌روزرسانی کلاس
    targetClass.teacher = teacherId;
    await targetClass.save();

    return {
      id: teacher._id,
      assignedClasses: teacher.assignedClasses,
      message: "Teacher assigned to class successfully"
    };
  }

  // تنظیم حقوق (UC-A15)
  static async updateSalary(teacherId, newSalary, reason) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) throw new AppError("Teacher not found", 404);

    const oldSalary = teacher.baseSalary;
    teacher.baseSalary = newSalary;
    await teacher.save();

    // محاسبه مجدد حقوق خالص
    await teacher.calculateNetSalary();

    return {
      id: teacher._id,
      oldSalary,
      newSalary: teacher.baseSalary,
      currentSalary: teacher.currentSalary,
      message: "Salary updated successfully"
    };
  }

  // افزایش تعداد غیبت استاد (برای کرون جاب)
  static async incrementAbsence(teacherId) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) throw new AppError("Teacher not found", 404);

    teacher.absenceCount += 1;
    await teacher.save();

    // محاسبه مجدد حقوق با کسر جریمه (BR-04)
    const netSalary = teacher.calculateNetSalary();

    return {
      id: teacher._id,
      absenceCount: teacher.absenceCount,
      netSalary
    };
  }

  // ✅ ارزیابی استاد با مدل جدید (UC-A16)
  static async evaluateTeacher(teacherId, evaluationData, evaluatorId) {
    const { period, criteria, note } = evaluationData;

    // بررسی وجود استاد
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) throw new AppError("Teacher not found", 404);

    // بررسی وجود ارزیاب
    const evaluator = await User.findById(evaluatorId);
    if (!evaluator) throw new AppError("Evaluator not found", 404);

    // ایجاد ارزیابی جدید
    const evaluation = await TeacherEvaluation.create({
      teacher: teacherId,
      evaluator: evaluatorId,
      criteria: {
        teachingQuality: criteria?.teachingQuality || 0,
        punctuality: criteria?.punctuality || 0,
        classManagement: criteria?.classManagement || 0,
        studentInteraction: criteria?.studentInteraction || 0
      },
      note,
      period
    });

    return {
      id: evaluation._id,
      teacher: teacherId,
      evaluator: evaluatorId,
      criteria: evaluation.criteria,
      overallScore: evaluation.overallScore,
      period: evaluation.period,
      createdAt: evaluation.createdAt
    };
  }

  // ✅ دریافت ارزیابی‌های یک استاد
  static async getTeacherEvaluations(teacherId) {
    const evaluations = await TeacherEvaluation.find({ teacher: teacherId })
      .populate('evaluator', 'firstName lastName email')
      .sort('-createdAt');
    
    return evaluations;
  }

  // ✅ دریافت میانگین نمرات یک استاد
  static async getTeacherAverageScore(teacherId) {
    const evaluations = await TeacherEvaluation.find({ teacher: teacherId });
    
    if (evaluations.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = evaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0);
    const average = total / evaluations.length;

    return {
      average: Math.round(average * 10) / 10,
      count: evaluations.length,
      maxScore: 40
    };
  }

  // ✅ دریافت پروفایل کامل استاد
  static async getTeacherProfile(teacherId) {
    const teacher = await Teacher.findById(teacherId)
      .populate('user', '-password')
      .populate('subjects')
      .populate('branch')
      .populate({
        path: 'assignedClasses',
        populate: { path: 'subjects' }
      });
    
    if (!teacher) throw new AppError("Teacher not found", 404);
    
    // محاسبه حقوق خالص
    const netSalary = teacher.calculateNetSalary();
    
    // دریافت ارزیابی‌ها از مدل جدید
    const evaluations = await TeacherEvaluation.find({ teacher: teacherId })
      .populate('evaluator', 'firstName lastName')
      .sort('-createdAt');
    
    // دریافت میانگین نمرات
    const averageScore = await this.getTeacherAverageScore(teacherId);
    
    return {
      ...teacher.toObject(),
      netSalary,
      evaluations,
      averageScore,
      totalEvaluations: evaluations.length
    };
  }
}

module.exports = TeacherService;