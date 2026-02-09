const  AuthService  = require("./auth.service.js");
const ApiResponse = require("../../utils/api.response.js");

const login = async (req, res) => {
  const tokens = await AuthService.login(req.body, req);
  ApiResponse.success(res, tokens, "Login successful");
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await AuthService.refresh(refreshToken);
  ApiResponse.success(res, tokens, "Token refreshed");
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  await AuthService.logout(refreshToken);
  ApiResponse.success(res, null, "Logged out");
};

module.exports = {login, refresh, logout}
