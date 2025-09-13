const OpenWebUIClient = require("../lib/openwebui-client");
const { openwebui } = require("../utils");

class AIService {
  constructor() {
    this.client = new OpenWebUIClient();
  }

  async getAvailableModels() {
    try {
      const response = await this.client.getModels();
      const models = response.data || [];

      return {
        success: true,
        ...openwebui.transformModelsResponse(models),
      };
    } catch (error) {
      const errorDetails = openwebui.extractErrorDetails(error);
      throw new Error(errorDetails.message);
    }
  }
}

module.exports = AIService;
