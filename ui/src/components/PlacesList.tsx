import {
  Box,
  Typography,
  Grid,
  Collapse,
  Button,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import React, { useState } from "react";
import PlaceCard from "./PlaceCard";
import type { SearchPlace, SearchRequest } from "../types/search.types";

interface PlacesListProps {
  places: SearchPlace[];
  searchInfo?: SearchRequest;
  onPlaceSelect?: (place: SearchPlace) => void;
  onViewOnMap?: (place: SearchPlace) => void;
  selectedPlaceId?: string;
  loading?: boolean;
  error?: string;
  maxInitialItems?: number;
}

const PlacesList: React.FC<PlacesListProps> = ({
  places,
  searchInfo,
  onPlaceSelect,
  onViewOnMap,
  selectedPlaceId,
  loading = false,
  error,
  maxInitialItems = 6,
}) => {
  const [showAll, setShowAll] = useState(false);

  // Show initial items or all items based on showAll state
  const displayedPlaces = showAll ? places : places.slice(0, maxInitialItems);
  const hasMoreItems = places.length > maxInitialItems;

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <LocationIcon />
          Searching for places...
        </Typography>
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box>
                <Skeleton
                  variant="rectangular"
                  height={180}
                  sx={{ mb: 1, borderRadius: 1 }}
                />
                <Skeleton variant="text" height={28} width="80%" />
                <Skeleton variant="text" height={20} width="60%" />
                <Skeleton variant="text" height={20} width="100%" />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (places.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <LocationIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No places found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search criteria or location
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with search info */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
        >
          <LocationIcon color="primary" />
          Search Results ({places.length} places found)
        </Typography>

        {searchInfo && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {searchInfo.query}
            {searchInfo.location && ` in ${searchInfo.location}`}
            {searchInfo.category && ` • ${searchInfo.category}`}
            {searchInfo.radius && ` • ${searchInfo.radius}m radius`}
          </Typography>
        )}

        {searchInfo?.filters && Object.keys(searchInfo.filters).length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {searchInfo.filters.rating && (
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.5,
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                  borderRadius: 1,
                  fontSize: "0.7rem",
                }}
              >
                Rating ≥ {searchInfo.filters.rating}⭐
              </Typography>
            )}
            {searchInfo.filters.price_level && (
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.5,
                  backgroundColor: "secondary.light",
                  color: "secondary.contrastText",
                  borderRadius: 1,
                  fontSize: "0.7rem",
                }}
              >
                {"💰".repeat(searchInfo.filters.price_level)}
              </Typography>
            )}
            {searchInfo.filters.open_now && (
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.5,
                  backgroundColor: "success.light",
                  color: "success.contrastText",
                  borderRadius: 1,
                  fontSize: "0.7rem",
                }}
              >
                Open Now
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Places Grid */}
      <Grid container spacing={2}>
        {displayedPlaces.map((place) => (
          <Grid item xs={12} sm={6} md={4} key={place.id}>
            <PlaceCard
              place={place}
              onSelect={onPlaceSelect}
              onViewOnMap={onViewOnMap}
              selected={selectedPlaceId === place.id}
            />
          </Grid>
        ))}
      </Grid>

      {/* Show More/Less Button */}
      {hasMoreItems && (
        <Collapse in={!showAll}>
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowAll(true)}
              startIcon={<ExpandIcon />}
              size="large"
            >
              Show {places.length - maxInitialItems} More Places
            </Button>
          </Box>
        </Collapse>
      )}

      {showAll && hasMoreItems && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setShowAll(false)}
            startIcon={<CollapseIcon />}
            size="large"
          >
            Show Less
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PlacesList;
