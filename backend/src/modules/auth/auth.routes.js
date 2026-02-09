const express = require("express");
const controller = require("./auth.controller.js")
const asyncHandler = require("../../utils/asyncHandler.js");

const router = express.Router();

router.post("/login", asyncHandler(controller.login));
router.post("/refresh", asyncHandler(controller.refresh));
router.post("/logout", asyncHandler(controller.logout));

module.exports = router;
