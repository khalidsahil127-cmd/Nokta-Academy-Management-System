const env = require("./env");

module.exports = {
  accessSecret: env.jwt.accessSecret,
  refreshSecret: env.jwt.refreshSecret,
  accessExpiresIn: env.jwt.accessExpiresIn,
  refreshExpiresIn: env.jwt.refreshExpiresIn
};
