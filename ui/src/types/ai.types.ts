// OpenWebUI API Types
// Based on https://docs.openwebui.com/tutorials/integrations/backend-controlled-ui-compatible-flow/

export interface OpenWebUIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  parentId?: string;
  modelName?: string;
  modelIdx?: number;
  timestamp: number;
  models?: string[];
}

export interface OpenWebUIHistory {
  current_id: string;
  messages: Record<string, OpenWebUIMessage>;
}

export interface OpenWebUIChat {
  id?: string;
  title: string;
  models: string[];
  messages: OpenWebUIMessage[];
  history: OpenWebUIHistory;
  session_id?: string;
  files?: any[];
  tags?: any[];
  params?: Record<string, any>;
}

export interface OpenWebUIChatRequest {
  chat: OpenWebUIChat;
}

export interface OpenWebUIChatResponse {
  id: string;
  chat: OpenWebUIChat;
  currentId: string;
}

// Chat Creation Types
export interface CreateChatRequest {
  title?: string;
  userMessage: string;
  models: string[];
  sessionId?: string;
}

export interface CreateChatResponse extends OpenWebUIChatResponse {}

// Edit Chat Types
export interface EditChatRequest {
  chatId: string;
  chat: OpenWebUIChat;
}

export interface EditChatResponse extends OpenWebUIChatResponse {}

// Completion Types
export interface ChatCompletionMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatCompletionRequest {
  chat_id: string;
  id: string; // assistant message ID
  messages: ChatCompletionMessage[];
  model: string;
  session_id: string;
  stream?: boolean;
  background_tasks?: {
    title_generation?: boolean;
    tags_generation?: boolean;
    follow_up_generation?: boolean;
  };
  features?: Record<string, any>;
  variables?: Record<string, any>;
  filter_ids?: string[];
  files?: any[];
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatCompletionMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Complete Message Types
export interface CompleteMessageRequest {
  chatId: string;
  assistantMessageId: string;
  sessionId: string;
  model: string[];
  messages: OpenWebUIMessage[];
}

export interface CompleteMessageResponse extends OpenWebUIChatResponse {}

// Get Chat Types
export interface GetChatRequest {
  chatId: string;
}

export interface GetChatResponse extends OpenWebUIChatResponse {}

// Model Types
export interface OpenWebUIModel {
  id: string;
  name: string;
  object: string;
  created: number;
  meta?: {
    description?: string;
    capabilities?: string[];
    context_length?: number;
    max_output_tokens?: number;
  };
  params?: {
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

export interface GetModelsResponse {
  models: OpenWebUIModel[];
  totalCount: number;
}

// Knowledge Collection Types
export interface KnowledgeCollection {
  id: string;
  name: string;
  description: string;
  type: string;
  status: "processed" | "processing" | "error";
  files_count?: number;
  total_size?: number;
  created_at: number;
  updated_at: number;
  metadata?: Record<string, any>;
}

export interface GetKnowledgeCollectionResponse extends KnowledgeCollection {}

// Error Types
export interface OpenWebUIError {
  type:
    | "connection"
    | "authentication"
    | "not_found"
    | "network"
    | "timeout"
    | "generic"
    | "unknown";
  message: string;
  originalMessage: string;
  code?: string | null;
  status?: number | null;
}

// Service Configuration
export interface OpenWebUIConfig {
  baseURL: string;
  apiKey: string;
  timeout?: number;
}

// Utility Types
export interface MessageIdGenerator {
  (): string;
}

export interface SessionIdGenerator {
  (): string;
}

// AI Service Response Types
export interface AIServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: OpenWebUIError;
  message?: string;
}

// Streaming Response Types
export interface StreamingResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason?: string;
  }>;
}

// Background Task Types
export interface BackgroundTasks {
  title_generation: boolean;
  tags_generation: boolean;
  follow_up_generation: boolean;
}

// Feature Flags
export interface FeatureFlags {
  [key: string]: boolean | string | number;
}

// Template Variables
export interface TemplateVariables {
  [key: string]: string | number | boolean;
}
