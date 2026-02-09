// src/modules/branch/branch.controller.js
const BranchService = require("./branch.service");
const ApiResponse = require("../../utils/api.response");
const asyncHandler = require("../../utils/asyncHandler");

//----------------CREATE BRANCH -----------
exports.createBranch = asyncHandler(async (req, res) => {
    const branch = await BranchService.createBranch(req.body);
    req.createdBranchId = branch.id;
    req.createdBranchDoc = branch;
    ApiResponse.success(res, branch, "Branch created successfully", 201);
});

//------------------UPDATE BRANCH------------
exports.updateBranch = asyncHandler(async (req, res) => {
    const branch = await BranchService.updateBranch(req.params.id, req.body);
    req.updateBranchId = branch.id;
    req.updateBranchDoc = branch;
    ApiResponse.success(res, branch, "Branch updated successfully", 201);

});

//-----------------ASSIGN  MANAGER--------------
exports.assignManager = asyncHandler(async (req, res) => {
    const { managerId } = req.body;
    const branch = await BranchService.assignManager(req.params.id, managerId);
    req.updateBranchId = branch.id;
    req.updateBranchDoc = branch;
    ApiResponse.success(res, branch, "Branch assignd successfully", 201);
})
