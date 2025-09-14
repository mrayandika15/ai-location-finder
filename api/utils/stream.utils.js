const readline = require("readline");

/**
 * Stream Processing Utilities
 * Generic stream processing functions for any AI service
 */

function processStream(stream, options = {}) {
  const {
    timeout = 30000,
    onLine = null,
    onComplete = null,
    onError = null,
  } = options;

  return new Promise((resolve, reject) => {
    let hasReceivedData = false;

    // Create readline interface for better stream processing
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity, // Handle Windows line endings
    });

    rl.on("line", (line) => {
      if (!line.trim()) return;

      hasReceivedData = true;

      // Call custom line processor if provided
      if (onLine) {
        const result = onLine(line);
        if (result === "close") {
          rl.close();
          return;
        }
      }
    });

    rl.on("close", () => {
      console.log("✅ Stream ended");

      if (hasReceivedData) {
        console.log("✅ Streaming completion finished successfully");
        if (onComplete) {
          resolve(onComplete());
        } else {
          resolve({ success: true });
        }
      } else {
        reject(new Error("Stream ended without receiving any data"));
      }
    });

    stream.on("error", (error) => {
      console.error("❌ Stream error:", error.message);
      rl.close();
      if (onError) {
        onError(error);
      }
      reject(error);
    });

    // Timeout fallback
    setTimeout(() => {
      if (!hasReceivedData) {
        rl.close();
        reject(new Error("Stream timeout - no data received"));
      } else {
        console.log("⚠️ Stream timeout but data received, resolving");
        rl.close();
        if (onComplete) {
          resolve(onComplete());
        } else {
          resolve({ success: true });
        }
      }
    }, timeout);
  });
}

module.exports = {
  processStream,
};
