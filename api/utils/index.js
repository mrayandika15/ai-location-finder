/**
 * Utils Index
 * Central export point for all utility functions
 */

const httpUtils = require("./http.utils");
const openwebuiUtils = require("./openwebui.utils");

module.exports = {
  http: httpUtils,
  openwebui: openwebuiUtils,
};
