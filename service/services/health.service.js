const GoogleMapsClient = require("../lib/google-maps-client");
const OpenWebUIClient = require("../lib/openwebui-client");

/**
 * Health Service Layer
 * Business logic for system health monitoring
 *
 * Purpose: Aggregate health status from all external services and system components
 */
class HealthService {
  constructor() {
    this.googleMapsClient = new GoogleMapsClient();
    this.openWebUIClient = new OpenWebUIClient();
    this.serverStartTime = Date.now();
  }

  /**
   * Get comprehensive system health status
   * @returns {Promise<Object>} System health data
   */
  async getSystemHealth() {
    try {
      const currentTime = Date.now();
      const uptime = Math.floor((currentTime - this.serverStartTime) / 1000);

      // Check all external services
      const externalServices = await this._checkExternalServices();

      // Determine overall health
      const overallHealth = this._determineOverallHealth(externalServices);

      return {
        success: true,
        status: overallHealth.status,
        uptime,
        version: "1.0.0",
        services: externalServices,
        serverInfo: this._getServerInfo(),
        httpStatus: overallHealth.httpStatus,
      };
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error("System health check failed");
    }
  }

  /**
   * Check health of all external services
   * @private
   */
  async _checkExternalServices() {
    const services = {};

    // Check services in parallel for better performance
    const [googleMapsStatus, openWebUIStatus] = await Promise.allSettled([
      this._checkGoogleMapsHealth(),
      this._checkOpenWebUIHealth(),
    ]);

    services.google_maps =
      googleMapsStatus.status === "fulfilled"
        ? googleMapsStatus.value
        : "error";

    services.openwebui =
      openWebUIStatus.status === "fulfilled" ? openWebUIStatus.value : "error";

    // Placeholder for future services
    services.database = "not_implemented";

    return services;
  }

  /**
   * Check Google Maps API health
   * @private
   */
  async _checkGoogleMapsHealth() {
    try {
      const result = await this.googleMapsClient.testPlacesConnection();
      return result.status;
    } catch (error) {
      console.error("Google Maps health check failed:", error.message);
      return "error";
    }
  }

  /**
   * Check OpenWebUI service health
   * @private
   */
  async _checkOpenWebUIHealth() {
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

      const isConnected = await this.openWebUIClient.testConnection();
      return isConnected ? "connected" : "error";
    } catch (error) {
      console.error("OpenWebUI health check failed:", error.message);
      return "error";
    }
  }

  /**
   * Determine overall system health based on service statuses
   * @private
   */
  _determineOverallHealth(services) {
    const serviceStatuses = Object.values(services);

    const allServicesHealthy = serviceStatuses.every(
      (status) =>
        status === "connected" ||
        status === "not_configured" ||
        status === "not_implemented"
    );

    const hasErroredServices = serviceStatuses.some(
      (status) => status === "error"
    );

    if (allServicesHealthy) {
      return { status: "healthy", httpStatus: 200 };
    } else if (hasErroredServices) {
      return { status: "degraded", httpStatus: 503 };
    } else {
      return { status: "unknown", httpStatus: 503 };
    }
  }

  /**
   * Get server information
   * @private
   */
  _getServerInfo() {
    return {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      memoryUsage: process.memoryUsage(),
      pid: process.pid,
      platform: process.platform,
      arch: process.arch,
    };
  }

  /**
   * Get service-specific health details
   * @param {string} serviceName - Name of the service
   * @returns {Promise<Object>} Service health details
   */
  async getServiceHealth(serviceName) {
    switch (serviceName.toLowerCase()) {
      case "openwebui":
        return await this._getOpenWebUIHealthDetails();
      case "googlemaps":
        return await this._getGoogleMapsHealthDetails();
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  /**
   * Get detailed OpenWebUI health information
   * @private
   */
  async _getOpenWebUIHealthDetails() {
    try {
      const healthData = await this.openWebUIClient.checkHealth();
      return {
        service: "OpenWebUI",
        status: "healthy",
        details: healthData,
        apiUrl: this.openWebUIClient.apiUrl,
      };
    } catch (error) {
      return {
        service: "OpenWebUI",
        status: "unhealthy",
        error: error.message,
        apiUrl: this.openWebUIClient.apiUrl,
      };
    }
  }

  /**
   * Get detailed Google Maps health information
   * @private
   */
  async _getGoogleMapsHealthDetails() {
    const result = await this.googleMapsClient.testPlacesConnection();
    return {
      service: "Google Maps",
      status: result.status,
      message: result.message,
      hasApiKey: !!this.googleMapsClient.mapsApiKey,
    };
  }
}

module.exports = HealthService;
