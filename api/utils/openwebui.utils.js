function validateQueryParams(prompt, options = {}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt is required and must be a string");
  }

  if (prompt.trim().length === 0) {
    throw new Error("Prompt must be a non-empty string");
  }

  if (prompt.length > 10000) {
    throw new Error("Prompt is too long (maximum 10,000 characters)");
  }

  if (options.max_tokens !== undefined) {
    const maxTokens = parseInt(options.max_tokens);
    if (isNaN(maxTokens) || maxTokens < 1 || maxTokens > 2000) {
      throw new Error("max_tokens must be between 1 and 2000");
    }
  }

  if (options.temperature !== undefined) {
    const temperature = parseFloat(options.temperature);
    if (isNaN(temperature) || temperature < 0 || temperature > 1) {
      throw new Error("temperature must be between 0 and 1");
    }
  }

  return true;
}

function transformModelsResponse(models) {
  return {
    models: models.map((model) => ({
      id: model.id,
      name: model.id,
      object: model.object,
      created: model.created,
    })),
    totalCount: models.length,
  };
}

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractErrorDetails(error) {
  const details = {
    type: "unknown",
    originalMessage: error.message,
    code: error.code || null,
    status: error.response?.status || null,
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

function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createUserChatMessage({ content, models }) {
  return {
    id: generateMessageId(),
    role: "user",
    content,
    timestamp: Date.now(),
    models,
  };
}

function createAssistantMessage(options = {}) {
  const {
    id = generateMessageId(),
    content = "",
    parentId = null,
    modelName = "",
    modelIdx = 0,
    timestamp = Date.now(),
    models = [],
  } = options;

  if (!parentId) {
    throw new Error("Parent ID is required for assistant messages");
  }

  if (!modelName) {
    throw new Error("Model name is required for assistant messages");
  }

  return {
    id,
    role: "assistant",
    content,
    parentId,
    modelName,
    modelIdx,
    timestamp,
    models,
  };
}

function createOpenWebUIChatStructure(options = {}) {
  const {
    title = "New Chat",
    models = [],
    userMessage = null,
    includeAssistantMessage = false,
  } = options;

  // Convert models string to array if needed
  const modelsArray =
    typeof models === "string" ? [models] : Array.isArray(models) ? models : [];

  let messages = [];
  let userMessageId = null;

  // Create initial user message if provided
  if (userMessage && typeof userMessage === "string") {
    const message = createUserChatMessage({
      role: "user",
      content: userMessage,
      models: modelsArray,
    });

    messages.push(message);
    userMessageId = message.id;

    // Add assistant message if requested (for backend-controlled flow)
    if (includeAssistantMessage && modelsArray.length > 0) {
      const assistantMessage = createAssistantMessage({
        content: "",
        parentId: userMessageId,
        modelName: modelsArray[0],
        modelIdx: 0,
        models: modelsArray,
      });

      messages.push(assistantMessage);
    }
  }

  return {
    chat: {
      title,
      models: modelsArray,
      messages,
    },
  };
}

function createChatPayload({
  title = "New Chat",
  models = [],
  userMessage = null,
}) {
  // Generate session ID
  const sessionId = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Convert models string to array if needed
  const modelsArray =
    typeof models === "string" ? [models] : Array.isArray(models) ? models : [];

  let messages = [];
  let userMessageId = null;
  let historyMessages = {};

  // Create initial user message if provided
  if (userMessage && typeof userMessage === "string") {
    const message = createUserChatMessage({
      role: "user",
      content: userMessage,
      models: modelsArray,
    });

    messages.push(message);
    userMessageId = message.id;
    historyMessages[userMessageId] = message;
  }

  return {
    chat: {
      title,
      models: modelsArray,
      messages,
      history: {
        current_id: userMessageId,
        messages: historyMessages,
      },
      session_id: sessionId,
    },
  };
}

function createAssistantPayload({
  chatId,
  title = "New Chat",
  models = [],
  userMessage = null,
  assistantMessageId = null,
}) {
  // Convert models string to array if needed
  const modelsArray =
    typeof models === "string" ? [models] : Array.isArray(models) ? models : [];

  let messages = [];
  let userMessageId = null;
  let assistantMessageIdFinal = null;
  let historyMessages = {};

  // Create initial user message if provided
  if (userMessage && typeof userMessage === "string") {
    const message = createUserChatMessage({
      role: "user",
      content: userMessage,
      models: modelsArray,
    });

    messages.push(message);
    userMessageId = message.id;
    historyMessages[userMessageId] = message;

    // Add assistant message (for backend-controlled flow)
    if (modelsArray.length > 0) {
      const assistantMessage = createAssistantMessage({
        id: assistantMessageId || generateMessageId(),
        content: "",
        parentId: userMessageId,
        modelName: modelsArray[0],
        modelIdx: 0,
        models: modelsArray,
      });

      messages.push(assistantMessage);
      assistantMessageIdFinal = assistantMessage.id;
      historyMessages[assistantMessageIdFinal] = assistantMessage;
    }
  }

  return {
    chat: {
      id: chatId,
      title,
      models: modelsArray,
      messages,
      history: {
        current_id: assistantMessageIdFinal || userMessageId,
        messages: historyMessages,
      },
    },
  };
}

function createChatWithAssistantPayload({
  title = "New Chat",
  models = [],
  userMessage = null,
}) {
  // Generate chat ID automatically
  const chatId = `chat_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Generate session ID
  const sessionId = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Convert models string to array if needed
  const modelsArray =
    typeof models === "string" ? [models] : Array.isArray(models) ? models : [];

  let messages = [];
  let userMessageId = null;
  let assistantMessageId = null;
  let historyMessages = {};

  // Create initial user message if provided
  if (userMessage && typeof userMessage === "string") {
    const message = createUserChatMessage({
      content: userMessage,
      models: modelsArray,
    });

    messages.push(message);
    userMessageId = message.id;
    historyMessages[userMessageId] = message;

    // Add assistant message (for backend-controlled flow)
    if (modelsArray.length > 0) {
      const assistantMessage = createAssistantMessage({
        id: generateMessageId(), // Auto-generate assistant message ID
        content: "",
        parentId: userMessageId,
        modelName: modelsArray[0],
        modelIdx: 0,
        models: modelsArray,
      });

      messages.push(assistantMessage);
      assistantMessageId = assistantMessage.id;
      historyMessages[assistantMessageId] = assistantMessage;
    }
  }

  return {
    chat: {
      id: chatId,
      title,
      models: modelsArray,
      messages,
      history: {
        current_id: assistantMessageId || userMessageId,
        messages: historyMessages,
      },
      session_id: sessionId,
    },
  };
}

function createCompletionPayload({
  chatId,
  assistantMessageId,
  model,
  messages = [],
  stream = false,
  sessionId = null,
}) {
  return {
    chat_id: chatId,
    id: assistantMessageId,
    messages: messages,
    model: model,
    stream: stream,
    session_id: sessionId,
    background_tasks: {
      title_generation: true,
      tags_generation: false,
      follow_up_generation: false,
    },
  };
}

module.exports = {
  validateQueryParams,
  transformModelsResponse,
  generateRequestId,
  extractErrorDetails,
  generateMessageId,
  createUserChatMessage,
  createAssistantMessage,
  createOpenWebUIChatStructure,
  createChatPayload,
  createAssistantPayload,
  createChatWithAssistantPayload,
  createCompletionPayload,
};
