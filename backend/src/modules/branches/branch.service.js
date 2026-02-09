//src/module/branch/branch.service.js
const Branch = require("../../models/Core/Branch.Mdel");
const User = require("../../models/Core/User.Model");
const AppError = require("../../utils/app.error");

class BranchService {
  //-------CREATE BRANCH-------
  static async createBranch(payload) {
    const { name, location } = payload;

    if (!name || !location)
      throw new AppError("Name and location are required", 400);

    const exists = await Branch.findOne({ name });
    if (exists) throw new AppError("Branch name already exists", 409);

    const branch = await Branch.create({ name, location });
    
    return {
      id: branch._id,
      name: branch.name,
      location: branch.location,
      manager: branch.manager || null,
      isActive: branch.isActive,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
      deletedAt: branch.deletedAt,
    };
  }

  //--------UPDATE BRANCH------
  static async updateBranch(branchId, payload) {
    const branch = await Branch.findById(branchId);
    if (!branch) throw new AppError("Branch not found", 404);

    if (payload.name && payload.name !== branch.name) {
      const exists = await Branch.findOne({ name: payload.name });
      if (exists) throw new AppError("Branch name already exists", 409);
      branch.name = payload.name;
    }

    if (payload.location) branch.location = payload.location;

    await branch.save();
    return {
      id: branch._id,
      name: branch.name,
      location: branch.location,
      manager: branch.manager || null,
      isActive: branch.isActive,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
      deletedAt: branch.deletedAt,
    };
  }

  //---------ASSIGN MANAGER-------------
  static async assignManager(branchId, userId) {
    const branch = await Branch.findById(branchId);
    if (!branch) throw new AppError("Branch not found", 404);

    const user = await User.findById(userId);
    

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("Inactive user cannot be manager", 400);
    }

    if (user.isSuspended) {
      throw new AppError("Suspended user cannot be manager", 400);
    }

    if (user.deletedAt) {
      throw new AppError("Deleted user cannot be manager", 400);
    }

    branch.manager = user._id;
    await branch.save();

    return {
      id: branch._id,
      name: branch.name,
      location: branch.location,
      manager: branch.manager,
      isActive: branch.isActive,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
      deletedAt: branch.deletedAt,
    };
  }
}

module.exports = BranchService;
