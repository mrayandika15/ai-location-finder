/**
 * Service Layer Index
 * Central export point for all business logic services
 */

const HealthService = require("./health.service");
const OpenWebUIService = require("./openwebui.service");

module.exports = {
  HealthService,
  OpenWebUIService,
};
