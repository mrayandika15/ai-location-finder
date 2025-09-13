import React from "react";
import { Grid, Box } from "@mui/material";
import ChatInterface from "./ChatInterface";
import Map from "./Map";
import {
  useSearchResults,
  useSelectedLocation,
  useMapViewport,
} from "../hooks/useAppState";

const LocationFinder: React.FC = () => {
  // Shared state
  const [searchResults, setSearchResults] = useSearchResults();
  const [selectedLocation, setSelectedLocation] = useSelectedLocation();
  const [mapViewport, setMapViewport] = useMapViewport();

  return (
    <Box sx={{ height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <Grid container sx={{ height: "100%" }}>
        {/* Left Panel - Chat Interface */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ height: "100%" }}>
          <Box sx={{ p: 2, height: "100%" }}>
            <ChatInterface
              searchResults={searchResults}
              setSearchResults={setSearchResults}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              mapViewport={mapViewport}
              setMapViewport={setMapViewport}
            />
          </Box>
        </Grid>

        {/* Right Panel - Map */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ height: "100%" }}>
          <Box sx={{ p: 2, height: "100%" }}>
            <Map
              mapViewport={mapViewport}
              searchResults={searchResults}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocationFinder;
