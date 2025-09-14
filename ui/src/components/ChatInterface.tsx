import { SmartToy as AIIcon, Send as SendIcon } from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import useCreateNewAIMessage from "../hooks/useCreateNewAIMessage";
import type { LocationResult, MapViewport, OpenWebUIMessage } from "../types";
import AIMessageLoading from "./AIMessageLoading";
import AvatarMessage from "./AvatarMessage";
import useStreamingCompletion from "../hooks/useStreamingCompletion";

interface ChatInterfaceProps {
  searchResults: LocationResult[];
  setSearchResults: (results: LocationResult[]) => void;
  selectedLocation: LocationResult | null;
  setSelectedLocation: (location: LocationResult | null) => void;
  mapViewport: MapViewport;
  setMapViewport: (viewport: MapViewport) => void;
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
        setMessage([...message, ...data.chat.messages]);
        streamingCompletion(data);
      },
      onError: (error) => {
        console.error(error);
      },
    });

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
          <AvatarMessage message={message} />
        ))}

        {/* AI Message Loading */}
        {isStreamingLoading ||
          (isCreateNewAIMessageLoading && <AIMessageLoading />)}
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
            disabled={prompt.length === 0}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatInterface;
