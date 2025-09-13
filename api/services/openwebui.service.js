const OpenWebUIClient = require("../lib/openwebui-client");
const { openwebui } = require("../utils");

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
    // Validate input using utils
    openwebui.validateQueryParams(prompt, options);

    // Prepare request payload using utils
    const payload = openwebui.createQueryPayload(
      prompt,
      options,
      this.client.defaultModel
    );

    try {
      // Send request to OpenWebUI
      const response = await this.client.sendChatCompletion(payload);

      // Transform response using utils
      return openwebui.transformOpenWebUIResponse(
        prompt,
        response,
        payload.model
      );
    } catch (error) {
      // Extract error details using utils
      const errorDetails = openwebui.extractErrorDetails(error);
      throw new Error(errorDetails.message);
    }
  }

  /**
   * Get available AI models
   * @returns {Promise<Object>} Available models
   */
  async getAvailableModels() {
    try {
      const response = await this.client.getModels();
      const models = response.data || [];

      // Transform response using utils
      return {
        success: true,
        ...openwebui.transformModelsResponse(models, this.client.defaultModel),
      };
    } catch (error) {
      // Extract error details using utils
      const errorDetails = openwebui.extractErrorDetails(error);
      throw new Error(errorDetails.message);
    }
  }

  /**
   * Check OpenWebUI service health
   * @returns {Promise<Object>} Health status
   */
  async checkServiceHealth() {
    try {
      const healthData = await this.client.checkHealth();

      // Transform response using utils
      return {
        success: true,
        ...openwebui.transformHealthResponse(
          healthData,
          this.client.apiUrl,
          this.client.defaultModel
        ),
      };
    } catch (error) {
      // Extract error details using utils
      const errorDetails = openwebui.extractErrorDetails(error);

      return {
        success: false,
        status: "unhealthy",
        service: "OpenWebUI",
        error: errorDetails.message,
        apiUrl: this.client.apiUrl,
      };
    }
  }
}

module.exports = OpenWebUIService;
