const axios = require("axios");

/**
 * OpenWebUI Client Library
 * External service integration for OpenWebUI API communication
 *
 * Purpose: Handle all direct communication with OpenWebUI external service
 * Model: gemma3:1b running on localhost:8080
 */
class OpenWebUIClient {
  constructor(config = {}) {
    this.apiUrl =
      config.apiUrl || process.env.OPENWEBUI_API_URL || "http://localhost:8080";
    this.apiKey = config.apiKey || process.env.OPENWEBUI_API_KEY;
    this.timeout = config.timeout || 30000; // 30 seconds
    this.defaultModel = config.defaultModel || "gemma3:1b";
  }

  /**
   * Send a chat completion request to OpenWebUI
   * @param {Object} payload - The request payload
   * @returns {Promise<Object>} Raw response from OpenWebUI
   */
  async sendChatCompletion(payload) {
    try {
      console.log(`🔗 Sending request to OpenWebUI: ${this.apiUrl}`);

      const response = await axios.post(
        `${this.apiUrl}/v1/chat/completions`,
        payload,
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
        }
      );

      console.log(`✅ OpenWebUI response received: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error("❌ OpenWebUI request failed:", error.message);
      this._handleApiError(error);
    }
  }

  /**
   * Get available models from OpenWebUI
   * @returns {Promise<Object>} Models response
   */
  async getModels() {
    try {
      console.log("🔍 Fetching models from OpenWebUI");

      const response = await axios.get(`${this.apiUrl}/api/v1/models`, {
        timeout: 10000,
        headers: {
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
      });

      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch models:", error.message);
      this._handleApiError(error);
    }
  }

  /**
   * Check OpenWebUI service health
   * @returns {Promise<Object>} Health response
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.apiUrl}/health`, {
        timeout: 5000,
        headers: {
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
      });

      return response.data;
    } catch (error) {
      console.error("❌ OpenWebUI health check failed:", error.message);
      throw error;
    }
  }

  /**
   * Handle API errors and throw appropriate exceptions
   * @private
   */
  _handleApiError(error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Cannot connect to OpenWebUI service. Please ensure it's running on the configured URL."
      );
    }

    if (error.response?.status === 401) {
      throw new Error(
        "Authentication failed. Please check your OpenWebUI API key."
      );
    }

    if (error.response?.status === 404) {
      throw new Error(
        "OpenWebUI endpoint not found. Please check the API URL configuration."
      );
    }

    if (error.code === "ENOTFOUND") {
      throw new Error(
        "OpenWebUI service not found. Please check the API URL configuration."
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error(
        "OpenWebUI request timeout. The service may be overloaded."
      );
    }

    // Generic error handling
    throw new Error(`OpenWebUI service error: ${error.message}`);
  }

  /**
   * Test connection to OpenWebUI service
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = OpenWebUIClient;
