import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as AIIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { locationApi } from "../services/api";
import type { LocationSearchRequest, ChatMessage } from "../types";
import { useIsLoading, useMessages, useIsTyping } from "../hooks/useAppState";
import type { LocationResult, MapViewport } from "../types";

interface ChatInterfaceProps {
  searchResults: LocationResult[];
  setSearchResults: (results: LocationResult[]) => void;
  selectedLocation: LocationResult | null;
  setSelectedLocation: (location: LocationResult | null) => void;
  mapViewport: MapViewport;
  setMapViewport: (viewport: MapViewport) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  searchResults,
  setSearchResults,
  selectedLocation,
  setSelectedLocation,
  mapViewport,
  setMapViewport,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simple React state hooks
  const [isLoading, setIsLoading] = useIsLoading();
  const [messages, setMessages] = useMessages();
  const [isTyping, setIsTyping] = useIsTyping();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const searchRequest: LocationSearchRequest = {
        query: userMessage.content,
        location: mapViewport.center,
        radius: 5000,
      };

      const response = await locationApi.searchLocations(searchRequest);

      let aiResponse: ChatMessage;

      if (response.success && response.locations.length > 0) {
        setSearchResults(response.locations);

        // Update map viewport to show first result
        const firstResult = response.locations[0];
        setMapViewport({
          center: firstResult.location,
          zoom: 14,
        });

        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `I found ${response.locations.length} location${
            response.locations.length !== 1 ? "s" : ""
          } for you! Here are the results:`,
          timestamp: new Date(),
          locations: response.locations,
        };
      } else {
        setSearchResults([]);
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content:
            "I couldn't find any locations matching your request. Try rephrasing your query or being more specific about the area you're interested in.",
          timestamp: new Date(),
        };
      }

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    } catch (error) {
      console.error("Search failed:", error);
      setIsTyping(false);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Sorry, I encountered an error while searching. Please try again or check if the backend service is running.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLocationClick = (location: LocationResult) => {
    setSelectedLocation(location);
    setMapViewport({
      center: location.location,
      zoom: 16,
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
        }}
      >
        {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: message.type === "user" ? "row-reverse" : "row",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor:
                    message.type === "user" ? "secondary.main" : "primary.main",
                }}
              >
                {message.type === "user" ? <PersonIcon /> : <AIIcon />}
              </Avatar>

              <Box
                sx={{
                  maxWidth: "80%",
                  backgroundColor:
                    message.type === "user" ? "secondary.light" : "white",
                  borderRadius: 2,
                  p: 1.5,
                  boxShadow: 1,
                }}
              >
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  {message.content}
                </Typography>

                {/* Display locations if available */}
                {message.locations && message.locations.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {message.locations.slice(0, 3).map((location, index) => (
                      <Chip
                        key={index}
                        icon={<LocationIcon />}
                        label={location.name}
                        variant="outlined"
                        size="small"
                        clickable
                        onClick={() => handleLocationClick(location)}
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {message.locations.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{message.locations.length - 3} more locations (showing{" "}
                        {searchResults.length} total)
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Show selected location indicator */}
                {selectedLocation && message.type === "ai" && (
                  <Typography
                    variant="caption"
                    sx={{ fontStyle: "italic", opacity: 0.7 }}
                  >
                    {selectedLocation.name} is highlighted on the map
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary">
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Avatar
              sx={{ width: 32, height: 32, backgroundColor: "primary.main" }}
            >
              <AIIcon />
            </Avatar>
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                p: 1.5,
                boxShadow: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  AI is thinking...
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            multiline
            maxRows={3}
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
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
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatInterface;
