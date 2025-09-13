const express = require("express");
const router = express.Router();
const OpenWebUIService = require("../services/openwebui.service");
const { http, openwebui } = require("../utils");

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

    // Log operation start
    openwebui.logOperation("Query", "Processing AI query", {
      prompt: prompt?.substring(0, 50) + (prompt?.length > 50 ? "..." : ""),
      model: model || "default",
    });

    // Prepare options
    const options = {};
    if (model) options.model = model;
    if (max_tokens) options.max_tokens = parseInt(max_tokens);
    if (temperature !== undefined)
      options.temperature = parseFloat(temperature);

    // Process query through service layer
    const result = await openWebUIService.processQuery(prompt, options);

    // Log successful operation
    openwebui.logOperation("Query", "Query processed successfully", {
      model: result.model,
      responseLength: result.response.length,
    });

    // Send standardized success response
    http.sendSuccess(
      res,
      {
        prompt: result.prompt,
        response: result.response,
        model: result.model,
        usage: result.usage,
        metadata: result.metadata,
      },
      "Query processed successfully"
    );
  } catch (error) {
    // Log error operation
    openwebui.logOperation("Query", "Query processing failed", {
      error: true,
      prompt: req.body.prompt?.substring(0, 50),
    });

    // Send standardized error response
    http.sendError(res, error, { includeStack: true });
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
    // Log operation start
    openwebui.logOperation("Models", "Fetching available AI models");

    const result = await openWebUIService.getAvailableModels();

    // Log successful operation
    openwebui.logOperation("Models", "Models retrieved successfully", {
      totalCount: result.totalCount,
    });

    // Send standardized success response
    http.sendSuccess(
      res,
      {
        models: result.models,
        total_count: result.totalCount,
        default_model: result.defaultModel,
      },
      "Models retrieved successfully"
    );
  } catch (error) {
    // Log error operation
    openwebui.logOperation("Models", "Failed to fetch models", { error: true });

    // Send standardized error response
    http.sendError(res, error, { includeStack: true });
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
    // Log operation start
    openwebui.logOperation("Status", "Checking AI service status");

    const healthCheck = await openWebUIService.checkServiceHealth();

    // Log operation result
    openwebui.logOperation("Status", `Service is ${healthCheck.status}`, {
      status: healthCheck.status,
    });

    // Determine status code
    const statusCode = healthCheck.success
      ? http.StatusCodes.OK
      : http.StatusCodes.SERVICE_UNAVAILABLE;

    // Send response with appropriate status code
    http.sendResponse(
      res,
      statusCode,
      healthCheck.success,
      {
        service: healthCheck.service,
        status: healthCheck.status,
        version: healthCheck.version,
        uptime: healthCheck.uptime,
        api_url: healthCheck.apiUrl,
        default_model: healthCheck.defaultModel,
      },
      `AI service is ${healthCheck.status}`
    );
  } catch (error) {
    // Log error operation
    openwebui.logOperation("Status", "Service status check failed", {
      error: true,
    });

    // Send service unavailable response
    http.sendResponse(
      res,
      http.StatusCodes.SERVICE_UNAVAILABLE,
      false,
      null,
      "AI service status check failed",
      {
        code: "SERVICE_UNAVAILABLE",
        message: "AI service status check failed",
        details:
          process.env.NODE_ENV === "development"
            ? { error: error.message }
            : {},
      }
    );
  }
});

module.exports = router;
