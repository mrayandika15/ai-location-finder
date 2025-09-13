import React, { useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useAppContext } from "../context/AppContext";

// Placeholder for Google Maps integration
// This will be implemented once Google Maps API is properly configured
const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { mapViewport, searchResults, selectedLocation } = useAppContext();

  useEffect(() => {
    // Initialize Google Maps when API is available
    // For now, we'll show a placeholder
    console.log("Map viewport updated:", mapViewport);
    console.log("Search results:", searchResults);
    console.log("Selected location:", selectedLocation);
  }, [mapViewport, searchResults, selectedLocation]);

  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        minHeight: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Map Container */}
      <Box
        ref={mapRef}
        sx={{
          width: "100%",
          height: "100%",
          minHeight: 400,
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Placeholder Content */}
        <Typography variant="h6" color="text.secondary">
          🗺️ Interactive Map
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Google Maps integration will be displayed here.
          <br />
          Configure VITE_GOOGLE_MAPS_API_KEY in .env to enable maps.
        </Typography>

        {/* Debug Info */}
        {mapViewport && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" display="block">
              Center: {mapViewport.center.lat.toFixed(4)},{" "}
              {mapViewport.center.lng.toFixed(4)}
            </Typography>
            <Typography variant="caption" display="block">
              Zoom: {mapViewport.zoom}
            </Typography>
            <Typography variant="caption" display="block">
              Results: {searchResults.length} locations
            </Typography>
            {selectedLocation && (
              <Typography variant="caption" display="block">
                Selected: {selectedLocation.name}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Future Google Maps implementation will replace the placeholder above */}
      {/*
      Example implementation:

      useEffect(() => {
        if (!mapRef.current || !window.google) return;

        const map = new window.google.maps.Map(mapRef.current, {
          center: mapViewport.center,
          zoom: mapViewport.zoom,
          styles: [...], // Custom map styles
        });

        // Add markers for search results
        searchResults.forEach(location => {
          const marker = new window.google.maps.Marker({
            position: location.location,
            map: map,
            title: location.name,
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div>
                <h3>${location.name}</h3>
                <p>${location.address}</p>
                ${location.rating ? `<p>Rating: ${location.rating}/5</p>` : ''}
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            setSelectedLocation(location);
          });
        });

        // Highlight selected location
        if (selectedLocation) {
          // Add special styling or animation for selected location
        }
      }, [mapViewport, searchResults, selectedLocation]);
      */}
    </Paper>
  );
};

export default MapComponent;
