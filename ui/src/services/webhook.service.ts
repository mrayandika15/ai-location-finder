import { io, Socket } from "socket.io-client";

export interface WebhookConfig {
  baseUrl?: string;
  token?: string;
  path?: string;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  randomizationFactor?: number;
  timeout?: number;
}

const getDefaultConfig = (): WebhookConfig => ({
  baseUrl: import.meta.env.VITE_OPENWEBUI_URL || "http://localhost:8080",
  token: import.meta.env.VITE_OPENWEBUI_API_KEY || "",
  path: "/ws/socket.io",
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 10000,
});

export interface WebhookEventData {
  event: string;
  timestamp: string;
  data: any;
}

export type WebhookEventCallback = (eventData: WebhookEventData) => void;

export class WebhookService {
  private socket: Socket | null = null;
  private config: Required<WebhookConfig>;
  private eventCallbacks: Map<string, WebhookEventCallback[]> = new Map();
  private globalCallback: WebhookEventCallback | null = null;

  constructor() {
    this.config = getDefaultConfig() as Required<WebhookConfig>;
  }

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      console.log("🔌 Connecting to Webhook Socket.IO...");
      console.log("Base URL:", this.config.baseUrl);
      console.log("Path:", this.config.path);

      this.socket = io(this.config.baseUrl, {
        reconnection: this.config.reconnection,
        reconnectionDelay: this.config.reconnectionDelay,
        reconnectionDelayMax: this.config.reconnectionDelayMax,
        randomizationFactor: this.config.randomizationFactor,
        path: this.config.path,
        transports: ["websocket"],
        auth: { token: this.config.token },
        timeout: this.config.timeout,
        forceNew: true,
      });

      this.socket.on("connect", () => {
        console.log("✅ Connected to Webhook Socket.IO!");
        console.log("Socket ID:", this.socket?.id);
        console.log("Transport:", this.socket?.io.engine.transport.name);
        resolve(this.socket!);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error.message);
        reject(error);
      });

      this.socket.onAny((event, ...args) => {
        const timestamp = new Date().toISOString();
        const eventData: WebhookEventData = {
          event,
          timestamp,
          data: args.length === 1 ? args[0] : args,
        };

        console.log(`📡 [${timestamp}] Event: "${event}"`);

        if (args.length > 0) {
          args.forEach((arg, index) => {
            console.log(`   Data ${index + 1}:`, JSON.stringify(arg, null, 2));
          });
        } else {
          console.log("   No data");
        }

        // Call global callback if set
        if (this.globalCallback) {
          this.globalCallback(eventData);
        }

        // Call specific event callbacks
        const callbacks = this.eventCallbacks.get(event);
        if (callbacks) {
          callbacks.forEach(callback => callback(eventData));
        }
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log("🔄 Closing webhook connection...");
      this.socket.close();
      this.socket = null;
    }
  }

  onEvent(event: string, callback: WebhookEventCallback): () => void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }

    this.eventCallbacks.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventCallbacks.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.eventCallbacks.delete(event);
        }
      }
    };
  }

  onAnyEvent(callback: WebhookEventCallback): () => void {
    this.globalCallback = callback;

    // Return unsubscribe function
    return () => {
      this.globalCallback = null;
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  emit(event: string, data?: any): boolean {
    if (!this.socket?.connected) {
      console.warn("Cannot emit event: Socket not connected");
      return false;
    }

    this.socket.emit(event, data);
    return true;
  }
}

// Default webhook service instance
let defaultWebhookService: WebhookService | null = null;

export const createWebhookService = (): WebhookService => {
  return new WebhookService();
};

export const getDefaultWebhookService = (): WebhookService | null => {
  return defaultWebhookService;
};

export const initializeDefaultWebhookService = (): WebhookService => {
  if (defaultWebhookService) {
    defaultWebhookService.disconnect();
  }

  defaultWebhookService = new WebhookService();
  return defaultWebhookService;
};

export default WebhookService;