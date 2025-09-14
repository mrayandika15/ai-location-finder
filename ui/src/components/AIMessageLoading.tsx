import React from "react";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import { SmartToy as AIIcon } from "@mui/icons-material";

const AIMessageLoading: React.FC = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Avatar sx={{ width: 32, height: 32, backgroundColor: "primary.main" }}>
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
  );
};

export default AIMessageLoading;




