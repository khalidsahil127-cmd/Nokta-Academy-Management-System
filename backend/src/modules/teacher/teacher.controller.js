// src/modules/teacher/teacher.controller.js
const TeacherService = require("./teacher.service");
const ApiResponse = require("../../utils/api.response");
const asyncHandler = require("../../utils/asyncHandler");

exports.registerTeacher = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.registerTeacher(req.body, req.user);
  req.createdTeacherId = teacher.id;
  ApiResponse.success(res, teacher, "Teacher registered successfully", 201);
});

exports.assignSubjects = asyncHandler(async (req, res) => {
  const { subjectIds } = req.body;
  const teacher = await TeacherService.assignSubjects(req.params.id, subjectIds);
  req.updatedTeacherId = teacher.id;
  ApiResponse.success(res, teacher, "Subjects assigned successfully");
});

exports.updateSalary = asyncHandler(async (req, res) => {
  const { salary } = req.body;
  const result = await TeacherService.updateSalary(req.params.id, salary);
  req.updatedTeacherId = result.id;
  ApiResponse.success(res, result, "Salary updated successfully");
});

exports.getTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await TeacherService.getTeacherProfile(req.params.id);
  ApiResponse.success(res, teacher, "Teacher profile retrieved");
});