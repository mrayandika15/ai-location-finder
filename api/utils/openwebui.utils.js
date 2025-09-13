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

module.exports = {
  validateQueryParams,
  transformModelsResponse,
  generateRequestId,
  extractErrorDetails,
};
