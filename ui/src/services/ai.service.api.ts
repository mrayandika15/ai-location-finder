import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type {
  AIServiceResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
  CompleteMessageRequest,
  CompleteMessageResponse,
  CreateChatRequest,
  CreateChatResponse,
  EditChatRequest,
  EditChatResponse,
  GetChatRequest,
  GetChatResponse,
  GetModelsResponse,
  OpenWebUIChat,
  OpenWebUIConfig,
  OpenWebUIError,
  OpenWebUIHistory,
  OpenWebUIMessage,
} from "../types/ai.types";

class OpenWebUIService {
  private client: AxiosInstance;
  private config: OpenWebUIConfig = {
    baseURL: import.meta.env.VITE_OPENWEBUI_API_URL || "http://localhost:8080",
    apiKey: import.meta.env.VITE_OPENWEBUI_API_KEY || "",
    timeout: 30000,
  };

  constructor() {
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `OpenWebUI Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error(
          "OpenWebUI Error:",
          error.response?.data || error.message
        );
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Utility methods
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createUserMessage(
    content: string,
    models: string[]
  ): OpenWebUIMessage {
    return {
      id: this.generateMessageId(),
      role: "user",
      content,
      timestamp: Date.now(),
      models,
    };
  }

  private createAssistantMessage(
    parentId: string,
    modelName: string,
    modelIdx: number = 0,
    content: string = ""
  ): OpenWebUIMessage {
    return {
      id: this.generateMessageId(),
      role: "assistant",
      content,
      parentId,
      modelName,
      modelIdx,
      timestamp: Date.now(),
    };
  }

  private createChatHistory(messages: OpenWebUIMessage[]): OpenWebUIHistory {
    const historyMessages: Record<string, OpenWebUIMessage> = {};
    messages.forEach((message) => {
      historyMessages[message.id] = message;
    });

    return {
      current_id: messages[messages.length - 1]?.id || "",
      messages: historyMessages,
    };
  }

  private handleError(error: any): OpenWebUIError {
    const details: OpenWebUIError = {
      type: "unknown",
      originalMessage: error.message,
      code: error.code || null,
      status: error.response?.status || null,
      message: "",
    };

    if (error.code === "ECONNREFUSED") {
      details.type = "connection";
      details.message =
        "Cannot connect to OpenWebUI service. Please ensure it's running on the configured URL.";
    } else if (error.response?.status === 401) {
      details.type = "authentication";
      details.message =
        "Authentication failed. Please check your OpenWebUI API key.";
    } else if (error.response?.status === 404) {
      details.type = "not_found";
      details.message =
        "OpenWebUI endpoint not found. Please check the API URL configuration.";
    } else if (error.code === "ENOTFOUND") {
      details.type = "network";
      details.message =
        "OpenWebUI service not found. Please check the API URL configuration.";
    } else if (error.code === "ECONNABORTED") {
      details.type = "timeout";
      details.message =
        "OpenWebUI request timeout. The service may be overloaded.";
    } else {
      details.type = "generic";
      details.message = `OpenWebUI service error: ${error.message}`;
    }

    return details;
  }

  // 1. Create New Chat
  async createChat(
    request: CreateChatRequest
  ): Promise<AIServiceResponse<CreateChatResponse>> {
    try {
      const { title = "New Chat", userMessage, models, sessionId } = request;

      // Create user message
      const userMsg = this.createUserMessage(userMessage, models);

      // Create chat structure
      const chat: OpenWebUIChat = {
        title,
        models,
        messages: [userMsg],
        history: this.createChatHistory([userMsg]),
        session_id: sessionId || this.generateSessionId(),
      };

      const response: AxiosResponse<CreateChatResponse> =
        await this.client.post("/api/v1/chats/new", { chat });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as OpenWebUIError,
      };
    }
  }

  // 2. Edit Chat (Add Assistant Message)
  async editChat(
    request: EditChatRequest
  ): Promise<AIServiceResponse<EditChatResponse>> {
    try {
      const { chatId, chat } = request;

      const response: AxiosResponse<EditChatResponse> = await this.client.post(
        `/api/v1/chats/${chatId}`,
        { chat }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as OpenWebUIError,
      };
    }
  }

  // 3. Trigger Completion
  async triggerCompletion(
    request: ChatCompletionRequest
  ): Promise<AIServiceResponse<ChatCompletionResponse>> {
    try {
      const response: AxiosResponse<ChatCompletionResponse> =
        await this.client.post("/api/v1/chat/completions", request);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as OpenWebUIError,
      };
    }
  }

  // 4. Complete Message
  async completeMessage(
    request: CompleteMessageRequest
  ): Promise<AIServiceResponse<CompleteMessageResponse>> {
    try {
      const { chatId, assistantMessageId, sessionId, model, messages } =
        request;

      // Create completion request
      const completionRequest: ChatCompletionRequest = {
        chat_id: chatId,
        id: assistantMessageId,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        model: model[0],
        session_id: sessionId,
        stream: false,
        background_tasks: {
          title_generation: true,
          tags_generation: false,
          follow_up_generation: false,
        },
      };

      const response: AxiosResponse<CompleteMessageResponse> =
        await this.client.post("/api/v1/chat/completions", completionRequest);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as OpenWebUIError,
      };
    }
  }

  // 5. Get Chat
  async getChat(
    request: GetChatRequest
  ): Promise<AIServiceResponse<GetChatResponse>> {
    try {
      const { chatId } = request;

      const response: AxiosResponse<GetChatResponse> = await this.client.get(
        `/api/v1/chats/${chatId}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as OpenWebUIError,
      };
    }
  }

  // Additional utility methods

  // Get available models
  async getModels(): Promise<AIServiceResponse<GetModelsResponse>> {
    try {
      const response: AxiosResponse<{ data: any[] }> = await this.client.get(
        "/api/v1/models"
      );

      const models = response.data.data || [];
      const transformedModels = models.map((model: any) => ({
        id: model.id,
        name: model.id,
        object: model.object,
        created: model.created,
      }));

      return {
        success: true,
        data: {
          models: transformedModels,
          totalCount: models.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as OpenWebUIError,
      };
    }
  }

  // Create chat with assistant message (combined step 1 & 2)
  async createChatWithAssistant(
    request: CreateChatRequest
  ): Promise<AIServiceResponse<CreateChatResponse>> {
    try {
      const { title = "New Chat", userMessage, models, sessionId } = request;

      // Create user message
      const userMsg = this.createUserMessage(userMessage, models);

      // Create assistant message
      const assistantMsg = this.createAssistantMessage(
        userMsg.id,
        models[0],
        0,
        ""
      );

      // Create chat structure with both messages
      const chat: OpenWebUIChat = {
        title,
        models,
        messages: [userMsg, assistantMsg],
        history: this.createChatHistory([userMsg, assistantMsg]),
        session_id: sessionId || this.generateSessionId(),
      };

      const response: AxiosResponse<CreateChatResponse> =
        await this.client.post("/api/v1/chats/new", { chat });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as OpenWebUIError,
      };
    }
  }
}

// Streaming completion with WebSocket support

// Create WebSocket stream for task-based streaming

// Factory function to create service instance
export const createOpenWebUIService = (): OpenWebUIService => {
  return new OpenWebUIService();
};

// Default export
export default OpenWebUIService;
