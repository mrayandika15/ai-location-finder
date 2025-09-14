import { SmartToy as AIIcon, Send as SendIcon } from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import useCreateNewAIMessage from "../hooks/useCreateNewAIMessage";
import useHandleMessage from "../hooks/useHandleMessage";
import useSearchPlaces from "../hooks/useSearchPlaces";
import useStreamingCompletion from "../hooks/useStreamingCompletion";
import { useWebhook } from "../hooks/useWebhook";
import type { ChatEvent } from "../types";
import type { SearchPlace, SearchRequest } from "../types/search.types";
import { extractSearchRequest } from "../utils";
import AIMessageLoading from "./AIMessageLoading";
import AvatarMessage from "./AvatarMessage";
import PlacesList from "./PlacesList";
import { useMapStore } from "../store/map";

const ChatInterface: React.FC = () => {
  const { message, setMessage, prompt, setPrompt } = useHandleMessage();
  const { setSearchResults, setSelectedLocation } = useMapStore();

  const currentChatId = useRef<string | null>(null);

  /// handle streaming completion
  const { mutate: streamingCompletion, isPending: isStreamingLoading } =
    useStreamingCompletion({});

  /// handle create new ai message
  const { createNewAIMessage, isLoading: isCreateNewAIMessageLoading } =
    useCreateNewAIMessage({
      onSuccess: (data) => {
        currentChatId.current = data.id || "";

        streamingCompletion(data);
      },
    });

  /// Handle Webhook Streaming
  const { isConnected, onEvent } = useWebhook();
  const [isWebhookStreaming, setIsWebhookStreaming] = useState(false);

  /// handle search places
  const {
    mutate: searchPlaces,
    data: searchPlacesData,
    isPending: isSearchPlacesLoading,
    isSuccess: isSearchPlacesSuccess,
  } = useSearchPlaces({
    onSuccess: (data) => {
      setSearchResults(data.data.places || []);
      setSelectedLocation(data.data.places[0] || null);
    },
  });

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

          if (data.done) {
            setIsWebhookStreaming(false);

            const searchRequest = extractSearchRequest(data.content);

            searchPlaces(searchRequest as SearchRequest);
          }
        } else if (data.choices && data.choices[0]?.finish_reason === "stop") {
          setIsWebhookStreaming(false);
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
    setMessage([
      ...message,
      {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      },
    ]);
    createNewAIMessage(prompt);
  };

  const onPlaceSelect = (place: SearchPlace) => {
    setSelectedLocation(place);
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

        {/* AI Message Loading */}
        {(isStreamingLoading ||
          isCreateNewAIMessageLoading ||
          isWebhookStreaming) && (
          <AIMessageLoading isPlaceLoading={isSearchPlacesLoading} />
        )}

        {isSearchPlacesSuccess && searchPlacesData?.data.places && (
          <PlacesList
            onPlaceSelect={onPlaceSelect}
            loading={isSearchPlacesLoading}
            places={searchPlacesData?.data.places}
          />
        )}
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
