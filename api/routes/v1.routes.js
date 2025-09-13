const express = require("express");
const router = express.Router();
const AIService = require("../services/ai.service");
const { http, openwebui } = require("../utils");

// Initialize AI service
const aiService = new AIService();

/**
 * AI Query Endpoint
 * POST /api/v1/query
 *
 * Business Purpose: Direct AI model interaction for natural language processing
 * Use Case: Send prompts to AI models and receive generated responses
 * Service: Handles all AI-related business logic through AIService
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

    // Process query through AI service layer
    const result = await aiService.processQuery(prompt, options);

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
 * Service: Retrieves model information through AIService
 */
router.get("/models", async (req, res) => {
  try {
    // Log operation start
    openwebui.logOperation("Models", "Fetching available AI models");

    const result = await aiService.getAvailableModels();

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

module.exports = router;
