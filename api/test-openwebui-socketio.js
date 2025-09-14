const { io } = require("socket.io-client");

function connectToOpenWebUISocketIO() {
  const baseUrl = "http://localhost:8080";
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVmYzc2YTg4LTMxNTEtNGQyMy1iY2EzLTFjNDIyMDU5ODI0MSJ9.9YAaGsU0prQVzOYGvZjqSvmEgZnGxpxjyawuZJk6IYY";

  console.log("🔌 Connecting to OpenWebUI Socket.IO...");
  console.log("Base URL:", baseUrl);
  console.log("Path:", "/ws/socket.io");

  const socket = io(baseUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    path: "/ws/socket.io",
    transports: ["websocket"], // Use only WebSocket since it works
    auth: { token: token },
    timeout: 10000,
    forceNew: true,
  });

  // Connection status
  socket.on("connect", () => {
    console.log("✅ Connected to OpenWebUI Socket.IO!");
    console.log("Socket ID:", socket.id);
    console.log("Transport:", socket.io.engine.transport.name);
    console.log("=".repeat(50));
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Connection error:", error.message);
  });

  // Listen for ALL events from OpenWebUI
  socket.onAny((event, ...args) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📡 [${timestamp}] Event: "${event}"`);

    if (args.length > 0) {
      args.forEach((arg, index) => {
        console.log(`   Data ${index + 1}:`, JSON.stringify(arg, null, 2));
      });
    } else {
      console.log("   No data");
    }
    console.log("-".repeat(30));
  });

  return socket;
}

// Start the connection
console.log("=== OpenWebUI Socket.IO Event Listener ===");
const socket = connectToOpenWebUISocketIO();

// Keep running to receive events
console.log("\n🎧 Listening for events... (Press Ctrl+C to stop)");
console.log("🔄 Try interacting with OpenWebUI in your browser to see events!");

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🔄 Closing connection...");
  socket.close();
  process.exit(0);
});

// Keep the script running indefinitely
setInterval(() => {
  // Just keep alive
}, 1000);
