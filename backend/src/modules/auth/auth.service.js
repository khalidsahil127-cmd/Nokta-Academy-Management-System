const User = require("../../models/Core/User.Model.js");
const RefreshToken = require("../../models/Core/RefreshToken.model.js");
const AppError = require("../../utils/app.error.js");
const AuditService = require("../audit/audit.service");

const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} = require("../../utils/token.utils.js");

class AuthService {

  static async login({ email, password }, req) {

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new AppError("Invalid credentials", 401);

    if (user.deletedAt) throw new AppError("Account deleted", 403);
    if (user.isSuspended) throw new AppError("Account suspended", 403);
    if (!user.isActive) throw new AppError("Account inactive", 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError("Invalid credentials", 401);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiry(),
      revoked: false,
    });

    await AuditService.log({
      actor: user._id,
      action: "LOGIN",
      entityType: "User",
      entityId: user._id,
      req
    });

    return { accessToken, refreshToken };
  }

  static async refresh(refreshToken) {

    if (!refreshToken) throw new AppError("Refresh token required", 400);

    const tokenHash = hashToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
      tokenHash,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) throw new AppError("Invalid refresh token", 401);

    const user = await User.findById(storedToken.user);
    if (!user) throw new AppError("Invalid refresh token", 401);

    storedToken.revoked = true;
    await storedToken.save();

    const newRefreshToken = generateRefreshToken();

    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: getRefreshTokenExpiry(),
      revoked: false,
    });

    const accessToken = generateAccessToken(user._id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async logout(refreshToken) {

    if (!refreshToken) return;

    const tokenHash = hashToken(refreshToken);

    await RefreshToken.findOneAndUpdate(
      { tokenHash, revoked: false },
      { revoked: true }
    );
  }
}

module.exports = AuthService;
