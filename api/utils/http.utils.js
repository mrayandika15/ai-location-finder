const { StatusCodes, ReasonPhrases } = require("http-status-codes");

function createResponse(success, data = null, message = "", error = null) {
  const response = {
    success,
    timestamp: new Date().toISOString(),
  };

  if (success) {
    response.data = data;
    response.message = message || "Request successful";
  } else {
    response.error = error || {
      code: "UNKNOWN_ERROR",
      message: message || "An error occurred",
      details: {},
    };
  }

  return response;
}

function createSuccessResponse(data, message = "Request successful") {
  return createResponse(true, data, message);
}

function createErrorResponse(code, message, details = {}) {
  return createResponse(false, null, "", {
    code,
    message,
    details,
  });
}

function mapErrorToHttpStatus(error) {
  const errorMessage = error.message.toLowerCase();

  if (
    errorMessage.includes("required") ||
    errorMessage.includes("must be") ||
    errorMessage.includes("too long") ||
    errorMessage.includes("invalid")
  ) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      errorCode: "INVALID_REQUEST",
    };
  }

  if (
    errorMessage.includes("cannot connect") ||
    errorMessage.includes("connection refused") ||
    errorMessage.includes("timeout")
  ) {
    return {
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      errorCode: "SERVICE_UNAVAILABLE",
    };
  }

  if (
    errorMessage.includes("authentication failed") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("api key")
  ) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      errorCode: "AUTHENTICATION_FAILED",
    };
  }

  if (
    errorMessage.includes("not found") ||
    errorMessage.includes("endpoint not found")
  ) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      errorCode: "SERVICE_NOT_FOUND",
    };
  }

  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("too many requests")
  ) {
    return {
      statusCode: StatusCodes.TOO_MANY_REQUESTS,
      errorCode: "RATE_LIMIT_EXCEEDED",
    };
  }

  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    errorCode: "INTERNAL_ERROR",
  };
}

function sendResponse(
  res,
  statusCode,
  success,
  data = null,
  message = "",
  error = null
) {
  const response = createResponse(success, data, message, error);
  res.status(statusCode).json(response);
}

function sendSuccess(
  res,
  data,
  message = "Request successful",
  statusCode = StatusCodes.OK
) {
  sendResponse(res, statusCode, true, data, message);
}

function sendError(res, error, options = {}) {
  const { statusCode, errorCode } = mapErrorToHttpStatus(error);
  const isDevelopment = process.env.NODE_ENV === "development";

  const errorResponse = {
    code: errorCode,
    message: error.message,
    details: isDevelopment
      ? options.includeStack
        ? { stack: error.stack }
        : {}
      : {},
  };

  sendResponse(res, statusCode, false, null, "", errorResponse);
}

module.exports = {
  StatusCodes,
  ReasonPhrases,
  createResponse,
  createSuccessResponse,
  createErrorResponse,
  mapErrorToHttpStatus,
  sendResponse,
  sendSuccess,
  sendError,
};
