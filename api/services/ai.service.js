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

  async createChatCompletion({ title = "AI Chat", userMessage, models }) {
    try {
      const initialMessagePayload = openwebui.createChatPayload({
        title,
        models,
        userMessage,
      });

      const newChat = await this.client.createChat(initialMessagePayload);

      const newChatId = newChat?.id;
      const newChatSessionId = newChat?.chat?.session_id;

      const assistedMessagePayload = openwebui.createAssistantPayload({
        chatId: newChatId,
        title,
        models,
        userMessage,
      });

      const addAssistedMessage = await this.client.editChat(
        newChatId,
        assistedMessagePayload
      );

      const assistantMessageId = addAssistedMessage?.chat?.messages?.[1]?.id;

      const completionMessagePayload = openwebui.createCompletionPayload({
        chatId: newChatId,
        assistantMessageId,
        model: Array.isArray(models) ? models[0] : models,
        stream: true,
        sessionId: newChatSessionId,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      const triggerStreamingCompletion =
        await this.client.triggerStreamingCompletion(completionMessagePayload);

      const processStreamingResponse =
        await this.client.processStreamingResponse(
          triggerStreamingCompletion,
          assistantMessageId
        );

      const completeChatResponse = await this.client.completeChat(
        newChatId,
        assistantMessageId,
        newChatSessionId,
        Array.isArray(models) ? models[0] : models,
        [addAssistedMessage]
      );

      return {
        ...completeChatResponse,
      };
    } catch (error) {
      const errorDetails = openwebui.extractErrorDetails(error);
      throw new Error(errorDetails.message);
    }
  }
}

module.exports = AIService;
