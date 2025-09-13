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
  logOperation,
};
