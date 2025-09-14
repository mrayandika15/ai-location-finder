import { useEffect, useRef, useState, useCallback } from "react";
import {
  WebhookService,
  type WebhookConfig,
  type WebhookEventCallback,
} from "../services/webhook.service";

export interface UseWebhookOptions {
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
}

export interface UseWebhookReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  emit: (event: string, data?: any) => boolean;
  onEvent: (event: string, callback: WebhookEventCallback) => () => void;
  onAnyEvent: (callback: WebhookEventCallback) => () => void;
  socketId: string | undefined;
}

export const useWebhook = (
  options: UseWebhookOptions = {}
): UseWebhookReturn => {
  const { autoConnect = true, reconnectOnMount = true } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | undefined>();

  const webhookServiceRef = useRef<WebhookService | null>(null);
  const eventUnsubscribersRef = useRef<(() => void)[]>([]);

  const initializeService = useCallback(() => {
    if (webhookServiceRef.current) {
      webhookServiceRef.current.disconnect();
    }

    webhookServiceRef.current = new WebhookService();
  }, []);

  const connect = useCallback(async () => {
    if (!webhookServiceRef.current) {
      initializeService();
    }

    if (webhookServiceRef.current?.isConnected()) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const socket = await webhookServiceRef.current!.connect();
      setIsConnected(true);
      setSocketId(socket.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [initializeService]);

  const disconnect = useCallback(() => {
    if (webhookServiceRef.current) {
      webhookServiceRef.current.disconnect();
      setIsConnected(false);
      setSocketId(undefined);

      // Clean up all event subscriptions
      eventUnsubscribersRef.current.forEach((unsubscribe) => unsubscribe());
      eventUnsubscribersRef.current = [];
    }
  }, []);

  const emit = useCallback((event: string, data?: any): boolean => {
    return webhookServiceRef.current?.emit(event, data) || false;
  }, []);

  const onEvent = useCallback(
    (event: string, callback: WebhookEventCallback): (() => void) => {
      if (!webhookServiceRef.current) {
        initializeService();
      }

      const unsubscriber = webhookServiceRef.current!.onEvent(event, callback);
      eventUnsubscribersRef.current.push(unsubscriber);

      return () => {
        const index = eventUnsubscribersRef.current.indexOf(unsubscriber);
        if (index > -1) {
          eventUnsubscribersRef.current.splice(index, 1);
        }
        unsubscriber();
      };
    },
    [initializeService]
  );

  const onAnyEvent = useCallback(
    (callback: WebhookEventCallback): (() => void) => {
      if (!webhookServiceRef.current) {
        initializeService();
      }

      const unsubscriber = webhookServiceRef.current!.onAnyEvent(callback);
      eventUnsubscribersRef.current.push(unsubscriber);

      return () => {
        const index = eventUnsubscribersRef.current.indexOf(unsubscriber);
        if (index > -1) {
          eventUnsubscribersRef.current.splice(index, 1);
        }
        unsubscriber();
      };
    },
    [initializeService]
  );

  // Initialize service on mount
  useEffect(() => {
    initializeService();

    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect, initializeService]);

  // Update connection status based on service state
  useEffect(() => {
    const checkConnectionStatus = () => {
      if (webhookServiceRef.current) {
        const connected = webhookServiceRef.current.isConnected();
        setIsConnected(connected);

        if (connected) {
          setSocketId(webhookServiceRef.current.getSocketId());
        }
      }
    };

    const interval = setInterval(checkConnectionStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    onEvent,
    onAnyEvent,
    socketId,
  };
};

// Alias for backward compatibility
export const useDefaultWebhook = (
  options: UseWebhookOptions = {}
): UseWebhookReturn => {
  return useWebhook(options);
};
