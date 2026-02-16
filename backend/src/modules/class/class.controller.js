const ClassService = require("./class.service");
const ApiResponse = require("../../utils/api.response");
const asyncHandler = require("../../utils/asyncHandler");

// ایجاد کلاس
exports.createClass = asyncHandler(async (req, res) => {
  const newClass = await ClassService.createClass(req.body, req.user._id);
  req.createdClassId = newClass._id;
  ApiResponse.success(res, newClass, "Class created successfully", 201);
});

// ثبت‌نام دانش‌آموز در کلاس
exports.enrollStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const enrollment = await ClassService.enrollStudent(
    req.params.id, 
    studentId, 
    "Admin",
    req.user._id
  );
  ApiResponse.success(res, enrollment, "Student enrolled successfully");
});

// ثبت‌نام گروهی دانش‌آموزان
exports.bulkEnroll = asyncHandler(async (req, res) => {
  const { studentIds } = req.body;
  const results = await ClassService.bulkEnroll(
    req.params.id, 
    studentIds,
    req.user._id
  );
  ApiResponse.success(res, results, "Bulk enrollment completed");
});

// اختصاص استاد به کلاس
exports.assignTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.body;
  const classObj = await ClassService.assignTeacher(req.params.id, teacherId);
  ApiResponse.success(res, classObj, "Teacher assigned successfully");
});

// دریافت جزئیات کلاس
exports.getClassDetails = asyncHandler(async (req, res) => {
  const details = await ClassService.getClassDetails(req.params.id);
  ApiResponse.success(res, details, "Class details retrieved");
});

// به‌روزرسانی کلاس
exports.updateClass = asyncHandler(async (req, res) => {
  const updatedClass = await ClassService.updateClass(
    req.params.id, 
    req.body,
    req.user._id
  );
  ApiResponse.success(res, updatedClass, "Class updated successfully");
});

// حذف دانش‌آموز از کلاس
exports.dropStudent = asyncHandler(async (req, res) => {
  const { studentId, reason } = req.body;
  const enrollment = await ClassService.dropStudent(
    req.params.id,
    studentId,
    reason,
    req.user._id
  );
  ApiResponse.success(res, enrollment, "Student dropped from class");
});

// دریافت کلاس‌های یک استاد
exports.getTeacherClasses = asyncHandler(async (req, res) => {
  const classes = await ClassService.getTeacherClasses(req.params.teacherId);
  ApiResponse.success(res, classes, "Teacher classes retrieved");
});

// دریافت کلاس‌های یک دانش‌آموز
exports.getStudentClasses = asyncHandler(async (req, res) => {
  const classes = await ClassService.getStudentClasses(req.params.studentId);
  ApiResponse.success(res, classes, "Student classes retrieved");
});