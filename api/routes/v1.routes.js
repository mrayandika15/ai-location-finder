const express = require("express");
const router = express.Router();
const OpenWebUIService = require("../services/openwebui.service");

// Initialize OpenWebUI service
const openWebUIService = new OpenWebUIService();

/**
 * AI Query Endpoint
 * POST /api/v1/query
 *
 * Business Purpose: Direct AI model interaction for natural language processing
 * Use Case: Send prompts to AI models and receive generated responses
 */
router.post("/query", async (req, res) => {
  try {
    const { prompt, model, max_tokens, temperature } = req.body;

    console.log(`🚀 Processing AI query: ${prompt?.substring(0, 50)}...`);

    // Prepare options
    const options = {};
    if (model) options.model = model;
    if (max_tokens) options.max_tokens = parseInt(max_tokens);
    if (temperature !== undefined)
      options.temperature = parseFloat(temperature);

    // Process query through service layer
    const result = await openWebUIService.processQuery(prompt, options);

    res.json({
      success: result.success,
      data: {
        prompt: result.prompt,
        response: result.response,
        model: result.model,
        usage: result.usage,
        metadata: result.metadata,
      },
      message: "Query processed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ AI query failed:", error);

    // Map service errors to HTTP status codes
    const { statusCode, errorCode } = _mapErrorToHttpStatus(error);

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? { stack: error.stack } : {},
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Get Available Models Endpoint
 * GET /api/v1/models
 *
 * Business Purpose: List all available AI models
 * Use Case: Allow users to see what models are available for querying
 */
router.get("/models", async (req, res) => {
  try {
    console.log("📋 Fetching available AI models");

    const result = await openWebUIService.getAvailableModels();

    res.json({
      success: result.success,
      data: {
        models: result.models,
        total_count: result.totalCount,
        default_model: result.defaultModel,
      },
      message: "Models retrieved successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to fetch models:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? { stack: error.stack } : {},
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Service Status Endpoint
 * GET /api/v1/status
 *
 * Business Purpose: Check AI service connectivity and status
 * Use Case: Monitor if AI service is operational before sending queries
 */
router.get("/status", async (req, res) => {
  try {
    console.log("🔍 Checking AI service status");

    const healthCheck = await openWebUIService.checkServiceHealth();

    const statusCode = healthCheck.success ? 200 : 503;

    res.status(statusCode).json({
      success: healthCheck.success,
      data: {
        service: healthCheck.service,
        status: healthCheck.status,
        version: healthCheck.version,
        uptime: healthCheck.uptime,
        api_url: healthCheck.apiUrl,
        default_model: healthCheck.defaultModel,
      },
      message: `AI service is ${healthCheck.status}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ AI service status check failed:", error);

    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "AI service status check failed",
        details:
          process.env.NODE_ENV === "development"
            ? { error: error.message }
            : {},
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Map service layer errors to appropriate HTTP status codes
 * @private
 */
function _mapErrorToHttpStatus(error) {
  // Validation errors
  if (
    error.message.includes("required") ||
    error.message.includes("must be") ||
    error.message.includes("too long")
  ) {
    return { statusCode: 400, errorCode: "INVALID_REQUEST" };
  }

  // Service connectivity errors
  if (error.message.includes("Cannot connect")) {
    return { statusCode: 503, errorCode: "SERVICE_UNAVAILABLE" };
  }

  // Authentication errors
  if (error.message.includes("Authentication failed")) {
    return { statusCode: 401, errorCode: "AUTHENTICATION_FAILED" };
  }

  // Not found errors
  if (error.message.includes("not found")) {
    return { statusCode: 404, errorCode: "SERVICE_NOT_FOUND" };
  }

  // Default to internal server error
  return { statusCode: 500, errorCode: "INTERNAL_ERROR" };
}

module.exports = router;
