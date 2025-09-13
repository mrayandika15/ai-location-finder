/**
 * Routes Index
 * Central export point for all API routes
 */

const healthRoutes = require("./health.routes");
const openwebuiRoutes = require("./openwebui.routes");

module.exports = {
  healthRoutes,
  openwebuiRoutes,
};
