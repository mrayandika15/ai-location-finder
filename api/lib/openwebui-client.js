const axios = require("axios");

class OpenWebUIClient {
  constructor(config = {}) {
    this.apiUrl =
      config.apiUrl || process.env.OPENWEBUI_API_URL || "http://localhost:8080";
    this.apiKey = config.apiKey || process.env.OPENWEBUI_API_KEY;
    this.timeout = config.timeout || 30000;
  }

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
      throw error;
    }
  }
}

module.exports = OpenWebUIClient;
