const express = require("express");
const router = express.Router();

// Store server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Business Purpose: Monitor system availability and service connectivity status
 * Returns: Service health status, uptime, version, and external service connectivity
 */
router.get("/", async (req, res) => {
  try {
    const currentTime = Date.now();
    const uptime = Math.floor((currentTime - serverStartTime) / 1000);

    // Check external services connectivity
    const services = await checkExternalServices();

    // Determine overall health status
    const allServicesHealthy = Object.values(services).every(
      (status) => status === "connected" || status === "not_configured"
    );

    const healthStatus = allServicesHealthy ? "healthy" : "degraded";
    const httpStatus = allServicesHealthy ? 200 : 503;

    res.status(httpStatus).json({
      success: true,
      data: {
        status: healthStatus,
        uptime: uptime,
        version: "1.0.0",
        services: services,
        server_info: {
          node_version: process.version,
          environment: process.env.NODE_ENV || "development",
          memory_usage: process.memoryUsage(),
          pid: process.pid,
        },
      },
      message: `Service is ${healthStatus}`,
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
 * Check connectivity to external services
 * @returns {Object} Service connectivity status
 */
async function checkExternalServices() {
  const services = {};

  // Check Google Maps API
  services.google_maps = await checkGoogleMapsAPI();

  // Check OpenWebUI
  services.openwebui = await checkOpenWebUI();

  // Database check (placeholder - will be implemented when database is added)
  services.database = "not_implemented";

  return services;
}

/**
 * Check Google Maps API connectivity
 * @returns {string} Connection status
 */
async function checkGoogleMapsAPI() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === "your_google_maps_api_key") {
      return "not_configured";
    }

    // Simple ping to Google Places API
    const axios = require("axios");
    const testUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=test&inputtype=textquery&key=${apiKey}`;

    const response = await axios.get(testUrl, { timeout: 5000 });

    if (response.status === 200) {
      return "connected";
    } else {
      return "error";
    }
  } catch (error) {
    console.error("Google Maps API check failed:", error.message);
    return "error";
  }
}

/**
 * Check OpenWebUI connectivity
 * @returns {string} Connection status
 */
async function checkOpenWebUI() {
  try {
    const apiUrl = process.env.OPENWEBUI_API_URL;
    const apiKey = process.env.OPENWEBUI_API_KEY;

    if (
      !apiUrl ||
      !apiKey ||
      apiUrl === "your_openwebui_endpoint" ||
      apiKey === "your_openwebui_api_key"
    ) {
      return "not_configured";
    }

    const axios = require("axios");

    // Simple ping to OpenWebUI
    const response = await axios.get(`${apiUrl}/health`, {
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.status === 200) {
      return "connected";
    } else {
      return "error";
    }
  } catch (error) {
    console.error("OpenWebUI check failed:", error.message);
    return "error";
  }
}

module.exports = router;
