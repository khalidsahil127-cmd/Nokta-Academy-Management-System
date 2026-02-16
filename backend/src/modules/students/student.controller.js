// src/modules/student/student.controller.js
const StudentService = require("./student.service");
const ApiResponse = require("../../utils/api.response");
const asyncHandler = require("../../utils/asyncHandler");

exports.registerByAdmin = asyncHandler(async (req, res) => {
  const student = await StudentService.registerByAdmin(req.body, req.user);
  req.createdStudentId = student.id;
  ApiResponse.success(res, student, "Student registered successfully", 201);
});

exports.selfRegister = asyncHandler(async (req, res) => {
  const result = await StudentService.selfRegister(req.body);
  ApiResponse.success(res, result, result.message, 201);
});

exports.approveStudent = asyncHandler(async (req, res) => {
  const result = await StudentService.approveStudent(req.params.id, req.user);
  req.updatedStudentId = result.id;
  ApiResponse.success(res, result, result.message);
});

exports.suspendStudent = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const result = await StudentService.suspendStudent(req.params.id, reason);
  req.updatedStudentId = result.id;
  ApiResponse.success(res, result, result.message);
});

exports.getStudentProfile = asyncHandler(async (req, res) => {
  const student = await StudentService.getStudentProfile(req.params.id, req.user);
  ApiResponse.success(res, student, "Student profile retrieved");
});
