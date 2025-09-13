const axios = require("axios");
const {
  createOpenWebUIChatStructure,
  createChatWithAssistantMessage,
} = require("../utils/openwebui.utils");

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

  async createChat(chatData) {
    try {
      console.log("💬 Creating new chat with assistant message in OpenWebUI");

      const { title, userMessage, models } = chatData;

      // Create the chat structure with assistant message using utility function
      const payload = createChatWithAssistantMessage({
        title,
        models,
        userMessage,
      });

      const response = await axios.post(
        `${this.apiUrl}/api/v1/chats/new`,
        payload,
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
        }
      );

      console.log("✅ Chat with assistant message created successfully");

      // Return response with assistant message ID for further operations
      const assistantMessage = response.data.messages?.find(
        (msg) => msg.role === "assistant"
      );

      return {
        ...response.data,
        assistantMessageId: assistantMessage?.id,
      };
    } catch (error) {
      console.error("❌ Failed to create chat with assistant:", error.message);
      throw error;
    }
  }

  async triggerCompletion(completionData) {
    try {
      console.log("🤖 Triggering completion for assistant message");

      const { chatId, assistantMessageId, model, messages, sessionId } =
        completionData;

      const payload = {
        chat_id: chatId,
        id: assistantMessageId,
        messages: messages || [],
        model: model,
        session_id: sessionId || `session_${Date.now()}`,
        stream: false, // Set to false for synchronous response
      };

      const response = await axios.post(
        `${this.apiUrl}/api/v1/chat/completions`,
        payload,
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
        }
      );

      console.log("✅ Completion generated successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to trigger completion:", error.message);
      throw error;
    }
  }
}

module.exports = OpenWebUIClient;
