const axios = require("axios");
const { processStream } = require("../utils/stream.utils");

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

      const response = await axios.post(
        `${this.apiUrl}/api/v1/chats/new`,
        chatData,
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
        }
      );

      console.log("✅ Chat message created successfully");

      return {
        ...response.data,
      };
    } catch (error) {
      console.error("❌ Failed to create chat with assistant:", error.message);
      throw error;
    }
  }

  async triggerStreamingCompletion(payload) {
    try {
      console.log("🤖 Triggering streaming completion for assistant message");

      const response = await axios.post(
        `${this.apiUrl}/api/v1/chat/completions`,
        payload,
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
          responseType: "stream",
        }
      );

      console.log("✅ Streaming completion started successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to trigger streaming completion:");
      console.error("Status:", error.response?.status);
      console.error("Status Text:", error.response?.statusText);
      console.error("Response Data:", error.response?.data);
      console.error("Request Payload:", JSON.stringify(payload, null, 2));
      throw error;
    }
  }

  async processStreamingResponse(stream, assistantMessageId) {
    let fullContent = "";

    return processStream(stream, {
      timeout: this.timeout,
      onLine: (line) => {
        // Handle SSE format
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return "close";
          }

          try {
            const parsed = JSON.parse(data);
            const content = this.extractContent(parsed);
            if (content) {
              fullContent += content;
            }
          } catch (error) {
            console.warn("⚠️ Failed to parse SSE data:", error.message);
          }
        }
        // Handle direct JSON format
        else if (line.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(line.trim());
            const content = this.extractContent(parsed);
            if (content) {
              fullContent += content;
            }
          } catch (error) {
            console.warn("⚠️ Failed to parse JSON line:", error.message);
          }
        }
      },
      onComplete: () => {
        return {
          content: fullContent,
          assistantMessageId: assistantMessageId,
          isComplete: true,
        };
      },
    });
  }

  async completeChat(
    chatId,
    assistantMessageId,
    sessionId,
    model,
    messages,
    historyMessages = null
  ) {
    try {
      console.log("✅ Completing assistant message");

      const payload = {
        model: model,
        messages: messages,
        chat_id: chatId,
        session_id: sessionId,
        id: assistantMessageId,
      };

      // Include history if provided
      if (historyMessages) {
        payload.history = {
          current_id: assistantMessageId,
          messages: historyMessages,
        };
      }

      const response = await axios.post(
        `${this.apiUrl}/api/chat/completed`,
        payload,
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
        }
      );

      console.log("✅ Chat completion marked successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to complete chat:");
      console.error("Status:", error.response?.status);
      console.error("Status Text:", error.response?.statusText);
      console.error("Response Data:", error.response?.data);
      console.error("Request Payload:", JSON.stringify(payload, null, 2));
      throw error;
    }
  }

  async editChat(chatId, chatData) {
    try {
      console.log("✏️ Editing chat with completion response");

      const response = await axios.post(
        `${this.apiUrl}/api/v1/chats/${chatId}`,
        chatData,
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      console.log("✅ Chat edited successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to edit chat:", error.message);
      throw error;
    }
  }

  extractContent(parsed) {
    // OpenAI format
    if (parsed.choices?.[0]?.delta?.content) {
      return parsed.choices[0].delta.content;
    }

    // Direct content format
    if (parsed.content) {
      return parsed.content;
    }

    // OpenWebUI message format
    if (parsed.message?.content) {
      return parsed.message.content;
    }

    // OpenWebUI response format
    if (parsed.response) {
      return parsed.response;
    }

    // Complete message format
    if (parsed.choices?.[0]?.message?.content) {
      return parsed.choices[0].message.content;
    }

    return null;
  }
}

module.exports = OpenWebUIClient;
