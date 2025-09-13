/**
 * OpenWebUI Utilities
 * Specialized utilities for handling OpenWebUI responses and operations
 */

/**
 * Validate OpenWebUI query parameters
 * @param {string} prompt - User prompt
 * @param {Object} options - Query options
 * @throws {Error} Validation error
 */
function validateQueryParams(prompt, options = {}) {
  // Validate prompt
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt is required and must be a string");
  }

  if (prompt.trim().length === 0) {
    throw new Error("Prompt must be a non-empty string");
  }

  if (prompt.length > 10000) {
    throw new Error("Prompt is too long (maximum 10,000 characters)");
  }

  // Validate max_tokens
  if (options.max_tokens !== undefined) {
    const maxTokens = parseInt(options.max_tokens);
    if (isNaN(maxTokens) || maxTokens < 1 || maxTokens > 2000) {
      throw new Error("max_tokens must be between 1 and 2000");
    }
  }

  // Validate temperature
  if (options.temperature !== undefined) {
    const temperature = parseFloat(options.temperature);
    if (isNaN(temperature) || temperature < 0 || temperature > 1) {
      throw new Error("temperature must be between 0 and 1");
    }
  }

  return true;
}

/**
 * Transform OpenWebUI raw response to standardized format
 * @param {string} prompt - Original prompt
 * @param {Object} rawResponse - Raw OpenWebUI response
 * @param {string} model - Model used
 * @returns {Object} Transformed response
 */
function transformOpenWebUIResponse(prompt, rawResponse, model) {
  // Extract AI response content
  const aiResponse = rawResponse.choices?.[0]?.message?.content;

  if (!aiResponse) {
    throw new Error("Invalid response format from OpenWebUI");
  }

  return {
    prompt,
    response: aiResponse,
    model,
    usage: rawResponse.usage || {},
    metadata: {
      promptTokens: rawResponse.usage?.prompt_tokens || null,
      completionTokens: rawResponse.usage?.completion_tokens || null,
      totalTokens: rawResponse.usage?.total_tokens || null,
      processingTime: rawResponse.headers?.["x-processing-time"] || null,
      requestId: generateRequestId(),
      processingTimestamp: new Date().toISOString(),
    },
  };
}

/**
 * Transform models response to standardized format
 * @param {Array} models - Raw models array
 * @returns {Object} Transformed models response
 */
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

/**
 * Transform health response to standardized format
 * @param {Object} healthData - Raw health data
 * @param {string} apiUrl - API URL
 * @returns {Object} Transformed health response
 */
function transformHealthResponse(healthData, apiUrl) {
  return {
    service: "OpenWebUI",
    status: "healthy",
    version: healthData.version || "unknown",
    uptime: healthData.uptime || null,
    apiUrl,
  };
}

/**
 * Create OpenWebUI query payload
 * @param {string} prompt - User prompt
 * @param {Object} options - Query options
 * @returns {Object} Query payload
 */
function createQueryPayload(prompt, options = {}) {
  const {
    model = "gemma3:1b",
    max_tokens = 500,
    temperature = 0.7,
    stream = false,
  } = options;

  return {
    model,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: parseInt(max_tokens),
    temperature: parseFloat(temperature),
    stream,
  };
}

/**
 * Generate unique request ID
 * @returns {string} Unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract error details from OpenWebUI error response
 * @param {Error} error - Error object
 * @returns {Object} Error details
 */
function extractErrorDetails(error) {
  const details = {
    type: "unknown",
    originalMessage: error.message,
    code: error.code || null,
    status: error.response?.status || null,
  };

  // Connection errors
  if (error.code === "ECONNREFUSED") {
    details.type = "connection";
    details.message =
      "Cannot connect to OpenWebUI service. Please ensure it's running on the configured URL.";
  }
  // Authentication errors
  else if (error.response?.status === 401) {
    details.type = "authentication";
    details.message =
      "Authentication failed. Please check your OpenWebUI API key.";
  }
  // Not found errors
  else if (error.response?.status === 404) {
    details.type = "not_found";
    details.message =
      "OpenWebUI endpoint not found. Please check the API URL configuration.";
  }
  // Network errors
  else if (error.code === "ENOTFOUND") {
    details.type = "network";
    details.message =
      "OpenWebUI service not found. Please check the API URL configuration.";
  }
  // Timeout errors
  else if (error.code === "ECONNABORTED") {
    details.type = "timeout";
    details.message =
      "OpenWebUI request timeout. The service may be overloaded.";
  }
  // Generic errors
  else {
    details.type = "generic";
    details.message = `OpenWebUI service error: ${error.message}`;
  }

  return details;
}

/**
 * Log OpenWebUI operation
 * @param {string} operation - Operation type
 * @param {string} message - Log message
 * @param {Object} details - Additional details
 */
function logOperation(operation, message, details = {}) {
  const timestamp = new Date().toISOString();
  const logLevel = details.error ? "❌" : "✅";

  console.log(`${logLevel} [${timestamp}] OpenWebUI ${operation}: ${message}`);

  if (details.prompt) {
    console.log(
      `📝 Prompt: ${details.prompt.substring(0, 100)}${
        details.prompt.length > 100 ? "..." : ""
      }`
    );
  }

  if (details.model) {
    console.log(`🤖 Model: ${details.model}`);
  }

  if (details.responseLength) {
    console.log(`📄 Response Length: ${details.responseLength} characters`);
  }
}

module.exports = {
  validateQueryParams,
  transformOpenWebUIResponse,
  transformModelsResponse,
  transformHealthResponse,
  createQueryPayload,
  generateRequestId,
  extractErrorDetails,
  logOperation,
};
