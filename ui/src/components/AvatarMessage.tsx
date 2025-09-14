import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { Person as PersonIcon, SmartToy as AIIcon } from "@mui/icons-material";
import type { OpenWebUIMessage } from "../types";

interface AvatarMessageProps {
  message: OpenWebUIMessage;
}

const AvatarMessage: React.FC<AvatarMessageProps> = ({ message }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: message.role === "user" ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 1,
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          backgroundColor:
            message.role === "user" ? "secondary.main" : "primary.main",
        }}
      >
        {message.role === "user" ? <PersonIcon /> : <AIIcon />}
      </Avatar>

      <Box
        sx={{
          maxWidth: "80%",
          backgroundColor:
            message.role === "user" ? "secondary.light" : "white",

          borderRadius: 2,
          p: 1.5,
          boxShadow: 1,
        }}
      >
        <Typography variant="body1" sx={{ mb: 0.5 }}>
          {message.content}
        </Typography>

        {/* Show selected location indicator */}
        <Typography
          variant="caption"
          sx={{ fontStyle: "italic", opacity: 0.7 }}
        >
          {message.role === "assistant" && "AI response"}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Box>
    </Box>
  );
};

export default AvatarMessage;
