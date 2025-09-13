const express = require("express");
const router = express.Router();
const HealthService = require("../services/health.service");

// Initialize health service
const healthService = new HealthService();

/**
 * System Health Check Endpoint
 * GET /api/health
 *
 * Business Purpose: Monitor system availability and service connectivity status
 * Returns: Service health status, uptime, version, and external service connectivity
 */
router.get("/", async (req, res) => {
  try {
    const healthData = await healthService.getSystemHealth();

    res.status(healthData.httpStatus).json({
      success: true,
      data: {
        status: healthData.status,
        uptime: healthData.uptime,
        version: healthData.version,
        services: healthData.services,
        server_info: healthData.serverInfo,
      },
      message: `Service is ${healthData.status}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      success: false,
      error: {
        code: "HEALTH_CHECK_FAILED",
        message: "Health check failed",
        details: process.env.NODE_ENV === "development" ? error.message : {},
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Service-Specific Health Check
 * GET /api/health/:serviceName
 *
 * Business Purpose: Get detailed health information for specific service
 */
router.get("/:serviceName", async (req, res) => {
  try {
    const { serviceName } = req.params;
    const serviceHealth = await healthService.getServiceHealth(serviceName);

    const statusCode = serviceHealth.status === "healthy" ? 200 : 503;

    res.status(statusCode).json({
      success: serviceHealth.status === "healthy",
      data: serviceHealth,
      message: `${serviceHealth.service} is ${serviceHealth.status}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Service health check failed:`, error);

    const statusCode = error.message.includes("Unknown service") ? 404 : 503;

    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 404 ? "SERVICE_NOT_FOUND" : "HEALTH_CHECK_FAILED",
        message: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : {},
      },
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
