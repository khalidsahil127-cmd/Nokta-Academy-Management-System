const User = require("../../models/Core/User.Model");
const AppError = require("../../utils/app.error");
const Role = require("../../models/Core/Role.Model");

// ------CREATE USER
async function createUser(payload) {
  if (!payload.email || !payload.password || !payload.role) {
    throw new AppError("Missing required fields", 400);
  }
  const exists = await User.findOne({ email: payload.email });
  if (exists) {
    throw new AppError("Email already exists", 409);
  }
  const user = await User.create(payload);
  return user;
}
// -----------DEACTIVATE USER--------
async function deactivateUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  user.isActive = false;
  await user.save();
  return {id: user._id,email: user.email,isActive: user.isActive,};
};

//----------UPDATE USER
async function updateUser(userId, payload){
  const user = await User.findById(userId);
  if(!user) throw new AppError("User not found", 404);
  Object.keys(payload).forEach(key => {
    if(key !== "password") user[key] = payload[key];
  });

  await user.save();
  return { id: user._id, email: user.email, role: user.role};
}

//-------------ASSIGN ROLE ---------
async function assignRole(userId, roleId){
  const user = await User.findById(userId);
  if(!user) throw new AppError("User not found", 404);

  const role = await Role.findById(roleId);
  if(!role) throw new AppError("Role not found", 404);

  user.role = role._id;
  await user.save();
  return { id: user._id, email: user.email, role: user.role };
};

//---------RESET PASSWORD-------
async function resetPassword(userId, newPassword){
  if(!newPassword) throw new AppError("Password is required", 400);

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  user.password = newPassword;
  await user.save();
  return { id: user._id, email: user.email };
}

module.exports = {
  createUser,
  deactivateUser,
  updateUser,
  assignRole,
  resetPassword,
};
