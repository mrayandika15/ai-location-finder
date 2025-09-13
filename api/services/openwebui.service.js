const OpenWebUIClient = require("../lib/openwebui-client");

/**
 * OpenWebUI Service Layer
 * Business logic for OpenWebUI operations
 *
 * Purpose: Handle business logic, validation, and data transformation for OpenWebUI
 */
class OpenWebUIService {
  constructor() {
    this.client = new OpenWebUIClient();
  }

  /**
   * Process a user query with AI model
   * @param {string} prompt - User prompt
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Processed response
   */
  async processQuery(prompt, options = {}) {
    // Validate input
    this._validatePrompt(prompt);

    // Prepare request payload
    const payload = this._buildQueryPayload(prompt, options);

    try {
      console.log(`🤖 Processing query with model: ${payload.model}`);
      console.log(
        `📝 Prompt: ${prompt.substring(0, 100)}${
          prompt.length > 100 ? "..." : ""
        }`
      );

      // Send request to OpenWebUI
      const response = await this.client.sendChatCompletion(payload);

      // Extract and validate response
      const aiResponse = response.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("Invalid response format from OpenWebUI");
      }

      console.log(
        `✅ OpenWebUI response received (${aiResponse.length} characters)`
      );

      // Transform response for business use
      return this._transformQueryResponse(
        prompt,
        aiResponse,
        response,
        payload.model
      );
    } catch (error) {
      console.error("❌ OpenWebUI query processing failed:", error.message);
      throw error;
    }
  }

  /**
   * Get available AI models
   * @returns {Promise<Object>} Available models
   */
  async getAvailableModels() {
    try {
      console.log("📋 Fetching available OpenWebUI models");

      const response = await this.client.getModels();
      const models = response.data || [];

      console.log(`📋 Found ${models.length} available models`);

      return {
        success: true,
        models: models.map((model) => ({
          id: model.id,
          name: model.id,
          object: model.object,
          created: model.created,
        })),
        totalCount: models.length,
        defaultModel: "gemma3:1b",
      };
    } catch (error) {
      console.error("❌ Failed to fetch models:", error.message);
      throw error;
    }
  }

  /**
   * Check OpenWebUI service health
   * @returns {Promise<Object>} Health status
   */
  async checkServiceHealth() {
    try {
      console.log("🏥 Checking OpenWebUI service health");

      const healthData = await this.client.checkHealth();

      return {
        success: true,
        status: "healthy",
        service: "OpenWebUI",
        version: healthData.version || "unknown",
        uptime: healthData.uptime || null,
        apiUrl: this.client.apiUrl,
        defaultModel: this.client.defaultModel,
      };
    } catch (error) {
      console.error("❌ OpenWebUI health check failed:", error.message);

      return {
        success: false,
        status: "unhealthy",
        service: "OpenWebUI",
        error: error.message,
        apiUrl: this.client.apiUrl,
      };
    }
  }

  /**
   * Validate user prompt
   * @private
   */
  _validatePrompt(prompt) {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt is required and must be a string");
    }

    if (prompt.trim().length === 0) {
      throw new Error("Prompt must be a non-empty string");
    }

    if (prompt.length > 10000) {
      throw new Error("Prompt is too long (maximum 10,000 characters)");
    }
  }

  /**
   * Build query payload for OpenWebUI
   * @private
   */
  _buildQueryPayload(prompt, options) {
    const {
      model = this.client.defaultModel,
      max_tokens = 500,
      temperature = 0.7,
      stream = false,
    } = options;

    // Validate options
    if (max_tokens < 1 || max_tokens > 2000) {
      throw new Error("max_tokens must be between 1 and 2000");
    }

    if (temperature < 0 || temperature > 1) {
      throw new Error("temperature must be between 0 and 1");
    }

    return {
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens,
      temperature,
      stream,
    };
  }

  /**
   * Transform response for business consumption
   * @private
   */
  _transformQueryResponse(prompt, aiResponse, rawResponse, model) {
    return {
      success: true,
      prompt,
      response: aiResponse,
      model,
      usage: rawResponse.usage || {},
      metadata: {
        promptTokens: rawResponse.usage?.prompt_tokens || null,
        completionTokens: rawResponse.usage?.completion_tokens || null,
        totalTokens: rawResponse.usage?.total_tokens || null,
        processingTime: rawResponse.headers?.["x-processing-time"] || null,
        requestId: this._generateRequestId(),
        processingTimestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Generate unique request ID
   * @private
   */
  _generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = OpenWebUIService;
