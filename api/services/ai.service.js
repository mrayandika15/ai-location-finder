const OpenWebUIClient = require("../lib/openwebui-client");
const { openwebui } = require("../utils");

/**
 * AI Service Layer
 * Business logic for AI operations and processing
 *
 * Purpose: Handle all AI-related business logic, validation, and data transformation
 * This service acts as the main business layer for AI interactions
 */
class AIService {
  constructor() {
    this.client = new OpenWebUIClient();
  }

  /**
   * Process a user query with AI model
   * Core business method for AI text generation
   * @param {string} prompt - User prompt
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Processed response
   */
  async processQuery(prompt, options = {}) {
    // Validate input using utils
    openwebui.validateQueryParams(prompt, options);

    // Prepare request payload using utils
    const payload = openwebui.createQueryPayload(prompt, options);

    try {
      // Send request to AI service
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
   * Business method for model discovery
   * @returns {Promise<Object>} Available models
   */
  async getAvailableModels() {
    try {
      const response = await this.client.getModels();
      const models = response.data || [];

      // Transform response using utils
      return {
        success: true,
        ...openwebui.transformModelsResponse(models),
      };
    } catch (error) {
      // Extract error details using utils
      const errorDetails = openwebui.extractErrorDetails(error);
      throw new Error(errorDetails.message);
    }
  }

  /**
   * Check AI service health
   * Business method for service monitoring
   * @returns {Promise<Object>} Health status
   */
  async checkServiceHealth() {
    try {
      const healthData = await this.client.checkHealth();

      // Transform response using utils
      return {
        success: true,
        ...openwebui.transformHealthResponse(healthData, this.client.apiUrl),
      };
    } catch (error) {
      // Extract error details using utils
      const errorDetails = openwebui.extractErrorDetails(error);

      return {
        success: false,
        status: "unhealthy",
        service: "AI Service",
        error: errorDetails.message,
        apiUrl: this.client.apiUrl,
      };
    }
  }

  /**
   * Generate text completion
   * Business method for general text generation
   * @param {string} text - Input text
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated text
   */
  async generateText(text, options = {}) {
    // Delegate to processQuery for now, can be extended
    return this.processQuery(text, options);
  }

  /**
   * Analyze text sentiment (placeholder for future implementation)
   * Business method for text analysis
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Sentiment analysis
   */
  async analyzeText(text) {
    // Placeholder for future AI analysis features
    return this.processQuery(`Analyze the sentiment of this text: "${text}"`, {
      max_tokens: 100,
      temperature: 0.3,
    });
  }

  /**
   * Get AI service configuration
   * Business method for service information
   * @returns {Object} Service configuration
   */
  getServiceConfig() {
    return {
      service: "AI Service",
      provider: "OpenWebUI",
      apiUrl: this.client.apiUrl,
      defaultModel: this.client.defaultModel,
      version: "1.0.0",
    };
  }
}

module.exports = AIService;
