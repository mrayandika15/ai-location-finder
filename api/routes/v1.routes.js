const express = require("express");
const router = express.Router();
const AIService = require("../services/ai.service");
const { http, openwebui, logs } = require("../utils");

const aiService = new AIService();
router.get("/models", async (req, res) => {
  try {
    logs.logOperation("Models", "Fetching available AI models");

    const result = await aiService.getAvailableModels();

    logs.logOperation("Models", "Models retrieved successfully", {
      totalCount: result.totalCount,
    });

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
    logs.logOperation("Models", "Failed to fetch models", { error: true });

    http.sendError(res, error, { includeStack: true });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { title, message, models } = req.body;

    logs.logOperation("Chat", "Creating new chat with completion", {
      title: title || "AI Chat",
      hasMessage: !!message,
      models: models,
    });

    const result = await aiService.createChatCompletion({
      title: title || "AI Chat",
      userMessage: message,
      models: models,
    });

    http.sendSuccess(
      res,
      {
        ...result,
      },
      "Chat with completion created successfully"
    );
  } catch (error) {
    logs.logOperation("Chat", "Failed to create chat with completion", {
      error: true,
    });

    http.sendError(res, error, { includeStack: true });
  }
});

module.exports = router;
