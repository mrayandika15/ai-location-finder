import React, { useCallback, useRef, useState, useEffect } from "react";
import { Box, Paper, Typography, Alert } from "@mui/material";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import type { LocationResult } from "../types";
import { useMapStore } from "../store/map";

// Google Maps container style
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Google Maps options
const mapOptions = {
  disableDefaultUI: false,
  clickableIcons: true,
  scrollwheel: true,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  zoomControl: true,
};

const Map: React.FC = () => {
  // Get state from Zustand store
  const { mapViewport, searchResults, selectedLocation, setSelectedLocation } =
    useMapStore();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Get Google Maps API key from environment
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (location: LocationResult) => {
      setActiveMarker(location.place_id);
      setSelectedLocation(location);
    },
    [setSelectedLocation]
  );

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setActiveMarker(null);
  }, []);

  // Handle map error
  const handleMapError = useCallback(() => {
    setMapError(
      "Failed to load Google Maps. Please check your API key configuration."
    );
  }, []);

  // Effect to update map center when viewport changes
  useEffect(() => {
    if (mapRef.current && mapViewport) {
      mapRef.current.panTo(mapViewport.center);
      mapRef.current.setZoom(mapViewport.zoom);
    }
  }, [mapViewport]);

  // Effect to set active marker when location is selected externally
  useEffect(() => {
    if (selectedLocation) {
      setActiveMarker(selectedLocation.place_id);
    }
  }, [selectedLocation]);

  // Check if API key is missing
  if (!googleMapsApiKey) {
    return (
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Map Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "grey.100",
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            🗺️ Interactive Map
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Location results will appear here
          </Typography>
        </Box>

        {/* Map Container */}
        <Box
          sx={{
            flex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
            p: 3,
          }}
        >
          <Alert severity="warning" sx={{ width: "100%", maxWidth: 500 }}>
            <Typography variant="body2">
              Google Maps API key is not configured.
              <br />
              Please add <strong>VITE_GOOGLE_MAPS_API_KEY</strong> to your .env
              file.
            </Typography>
          </Alert>

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
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Map Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "grey.100",
        }}
      >
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          🗺️ Interactive Map
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {searchResults.length > 0
            ? `Showing ${searchResults.length} location${
                searchResults.length === 1 ? "" : "s"
              }`
            : "Location results will appear here"}
        </Typography>
      </Box>

      {/* Error Display */}
      {mapError && (
        <Alert severity="error" sx={{ m: 2 }}>
          {mapError}
        </Alert>
      )}

      {/* Map Container */}
      <Box sx={{ flex: 1, width: "100%" }}>
        <LoadScript
          googleMapsApiKey={googleMapsApiKey}
          onError={handleMapError}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapViewport.center}
            zoom={mapViewport.zoom}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {/* Render markers for search results */}
            {searchResults.map((location) => (
              <Marker
                key={location.place_id}
                position={location.location}
                onClick={() => handleMarkerClick(location)}
                icon={{
                  url:
                    selectedLocation?.place_id === location.place_id
                      ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                      : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            ))}

            {/* Info Window for active marker */}
            {activeMarker && (
              <InfoWindow
                position={
                  searchResults.find((loc) => loc.place_id === activeMarker)
                    ?.location
                }
                onCloseClick={handleInfoWindowClose}
              >
                <div>
                  {(() => {
                    const location = searchResults.find(
                      (loc) => loc.place_id === activeMarker
                    );
                    if (!location) return null;

                    return (
                      <Box sx={{ maxWidth: 250, p: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {location.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {location.address}
                        </Typography>
                        {location.rating && (
                          <Typography variant="body2" gutterBottom>
                            ⭐ {location.rating}/5
                          </Typography>
                        )}
                        {location.opening_hours && (
                          <Typography variant="body2" gutterBottom>
                            {location.opening_hours.open_now
                              ? "🟢 Open"
                              : "🔴 Closed"}
                          </Typography>
                        )}
                        {location.types && location.types.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {location.types.slice(0, 3).join(", ")}
                          </Typography>
                        )}
                      </Box>
                    );
                  })()}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </Box>
    </Paper>
  );
};

export default Map;
