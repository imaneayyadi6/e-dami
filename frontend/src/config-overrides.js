const path = require("path");

module.exports = function override(config) {
  config.resolve.fallback = { os: false };
  return config;
};
