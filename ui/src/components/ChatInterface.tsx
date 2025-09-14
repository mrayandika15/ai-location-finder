import { SmartToy as AIIcon, Send as SendIcon } from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import useCreateNewAIMessage from "../hooks/useCreateNewAIMessage";
import type { LocationResult, MapViewport, OpenWebUIMessage } from "../types";
import AIMessageLoading from "./AIMessageLoading";
import AvatarMessage from "./AvatarMessage";
import useStreamingCompletion from "../hooks/useStreamingCompletion";
import { useWebhook } from "../hooks/useWebhook";

interface ChatInterfaceProps {
  searchResults: LocationResult[];
  setSearchResults: (results: LocationResult[]) => void;
  selectedLocation: LocationResult | null;
  setSelectedLocation: (location: LocationResult | null) => void;
  mapViewport: MapViewport;
  setMapViewport: (viewport: MapViewport) => void;
}

interface ChatEvent {
  chat_id: string;
  message_id: string;
  data: {
    type: string;
    data: any;
  };
}

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [message, setMessage] = useState<OpenWebUIMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI location assistant. Ask me anything like 'Find coffee shops near ITB' or 'Where can I get good ramen in Bandung?'",
      timestamp: Date.now(),
    },
  ]);
  const [isWebhookStreaming, setIsWebhookStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] =
    useState<OpenWebUIMessage | null>(null);

  const currentChatId = useRef<string | null>(null);

  const { isConnected, onEvent } = useWebhook();

  const { mutate: streamingCompletion, isPending: isStreamingLoading } =
    useStreamingCompletion({
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error) => {
        console.error(error);
      },
    });

  const { createNewAIMessage, isLoading: isCreateNewAIMessageLoading } =
    useCreateNewAIMessage({
      onSuccess: (data) => {
        setMessage([...message, ...data.chat.messages.slice(0, -1)]);
        currentChatId.current = data.id || "";

        streamingCompletion(data);
      },
      onError: (error) => {
        console.error(error);
      },
    });

  // Process webhook chat-events
  useEffect(() => {
    const unsubscribe = onEvent("chat-events", (eventData) => {
      const chatEvent: ChatEvent = eventData.data;
      console.log("Received chat event:", chatEvent);

      // Only process events for the current chat
      if (
        currentChatId.current &&
        chatEvent.chat_id !== currentChatId.current
      ) {
        return;
      }

      if (chatEvent.data.type === "chat:completion") {
        const { data } = chatEvent.data;

        if (data.content) {
          setIsWebhookStreaming(true);

          // Create/update streaming message with current content
          const streamingMessage: OpenWebUIMessage = {
            id: chatEvent.message_id,
            role: "assistant",
            content: data.content,
            timestamp: Date.now(),
          };

          if (data.done) {
            // Final message - add to message list and stop streaming
            setMessage((prevMessages) => [...prevMessages, streamingMessage]);
            setIsWebhookStreaming(false);
            setCurrentStreamingMessage(null);
          } else {
            // Still streaming - show current content
            setCurrentStreamingMessage(streamingMessage);
          }
        } else if (data.choices && data.choices[0]?.finish_reason === "stop") {
          // Completion finished but no content - just stop streaming
          setIsWebhookStreaming(false);
          setCurrentStreamingMessage(null);
        }
      } else if (chatEvent.data.type === "chat:title") {
        // Handle chat title updates if needed
        console.log("Chat title updated:", chatEvent.data.data);
      }
    });

    return unsubscribe;
  }, [onEvent]);

  const handleSendMessage = () => {
    setPrompt("");
    createNewAIMessage(prompt);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 600,
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "primary.main",
          color: "white",
        }}
      >
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <AIIcon />
          AI Location Assistant
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Ask me about locations in natural language
        </Typography>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 1,
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {message.map((message) => (
          <AvatarMessage key={message.id} message={message} />
        ))}

        {/* Show streaming message */}
        {currentStreamingMessage && (
          <AvatarMessage key="streaming" message={currentStreamingMessage} />
        )}

        {/* AI Message Loading */}
        {(isStreamingLoading ||
          isCreateNewAIMessageLoading ||
          isWebhookStreaming) && <AIMessageLoading />}
      </Box>

      <Divider />

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "white",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about locations... (e.g., 'Find coffee shops near ITB')"
            multiline
            maxRows={3}
            size="small"
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
          />
          <IconButton
            color="primary"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              "&:disabled": {
                backgroundColor: "action.disabled",
              },
            }}
            onClick={handleSendMessage}
            disabled={prompt.length === 0 || !isConnected}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatInterface;
