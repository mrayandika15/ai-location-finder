import React from "react";
import { Grid, Box } from "@mui/material";
import ChatInterface from "./ChatInterface";
import Map from "./Map";

const LocationFinder: React.FC = () => {
  return (
    <Box sx={{ height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <Grid container sx={{ height: "100%" }}>
        {/* Left Panel - Chat Interface */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ height: "100%" }}>
          <Box sx={{ p: 2, height: "100%" }}>
            <ChatInterface />
          </Box>
        </Grid>

        {/* Right Panel - Map */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ height: "100%" }}>
          <Box sx={{ p: 2, height: "100%" }}>
            <Map />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocationFinder;
