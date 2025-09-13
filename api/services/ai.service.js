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

  async createChatCompletion(options) {
    try {
      const { title = "AI Chat", userMessage, models } = options;

      const message = await this.client.createChat({
        title,
        userMessage,
        models,
      });
      const modelsArray = typeof models === "string" ? [models] : models;

      const completionData = {
        chatId: message.id,
        assistantMessageId: message.assistantMessageId,
        model: modelsArray[0],
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      };

      const completion = await this.client.triggerCompletion(completionData);

      return {
        completion,
      };
    } catch (error) {
      const errorDetails = openwebui.extractErrorDetails(error);
      throw new Error(errorDetails.message);
    }
  }
}

module.exports = AIService;
