const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ms = require("ms");
const env  = require("../config/env.js");

const generateAccessToken = (userId) => {
  return jwt.sign(
    { sub: userId },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getRefreshTokenExpiry = () => {

  return new Date(Date.now() + ms(env.jwt.refreshExpiresIn));
};

module.exports = { generateAccessToken, generateRefreshToken, hashToken, getRefreshTokenExpiry };
