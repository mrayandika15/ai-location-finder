const { StatusCodes, ReasonPhrases } = require("http-status-codes");

/**
 * HTTP Utilities for standardized response handling
 * Simplified for OpenWebUI use cases
 */

/**
 * Standard API response structure
 * @param {boolean} success - Success status
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @param {Object} error - Error object (optional)
 * @returns {Object} Standardized response
 */
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

/**
 * Create success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Success response
 */
function createSuccessResponse(data, message = "Request successful") {
  return createResponse(true, data, message);
}

/**
 * Create error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} details - Error details
 * @returns {Object} Error response
 */
function createErrorResponse(code, message, details = {}) {
  return createResponse(false, null, "", {
    code,
    message,
    details,
  });
}

/**
 * Map error types to HTTP status codes
 * Specifically for OpenWebUI use cases
 * @param {Error} error - Error object
 * @returns {Object} { statusCode, errorCode }
 */
function mapErrorToHttpStatus(error) {
  const errorMessage = error.message.toLowerCase();

  // Validation errors
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

  // Service connectivity errors
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

  // Authentication errors
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

  // Not found errors
  if (
    errorMessage.includes("not found") ||
    errorMessage.includes("endpoint not found")
  ) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      errorCode: "SERVICE_NOT_FOUND",
    };
  }

  // Rate limiting errors
  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("too many requests")
  ) {
    return {
      statusCode: StatusCodes.TOO_MANY_REQUESTS,
      errorCode: "RATE_LIMIT_EXCEEDED",
    };
  }

  // Default to internal server error
  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    errorCode: "INTERNAL_ERROR",
  };
}

/**
 * Send standardized HTTP response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @param {Object} error - Error object
 */
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

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function sendSuccess(
  res,
  data,
  message = "Request successful",
  statusCode = StatusCodes.OK
) {
  sendResponse(res, statusCode, true, data, message);
}

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {Object} options - Additional options
 */
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
