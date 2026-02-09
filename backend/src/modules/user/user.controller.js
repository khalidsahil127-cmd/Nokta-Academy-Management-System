const UserService = require("./user.Service");
const ApiResponse = require("../../utils/api.response");
const asyncHandler = require("../../utils/asyncHandler");

exports.createUser = asyncHandler(async (req, res) => {
  const user = await UserService.createUser(req.body, req.user);
  req.createdUserId = user.id;
  req.createdUserDoc = user;
  ApiResponse.success(res, user, "User created successfully", 201);
});

exports.deactivateUser = asyncHandler(async (req, res) => {
  const user = await UserService.deactivateUser(req.params.id);
  ApiResponse.success(res, user, "User deactivated");
});

exports.updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await UserService.updateUser(req.params.id, req.body);
  req.updatedUserId = updatedUser.id;
  req.updatedUserDoc = updatedUser;
  ApiResponse.success(res, updatedUser, "User updated successfully");
});

exports.assignRole = asyncHandler(async (req, res) => {
  const { roleId} = req.body;
  const user = await UserService.assignRole(req.params.id, roleId);
  req.updateUserId = user.id;
  req.updatedUserDoc = user;
  ApiResponse.success(res, user, "Role assigned successfully");

});

exports.resetPassword = asyncHandler(async (req, res) => {
const user = await UserService.resetPassword(req.params.id, newPassword);
  req.updateUserId = user.id;
  req.updatedUserDoc = user;
  ApiResponse.success(res, user, "Password reset successfully");
})


