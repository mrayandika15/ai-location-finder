import {
  Launch as LaunchIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Rating,
  Skeleton,
  Typography,
} from "@mui/material";
import React from "react";
import type { SearchPlace } from "../types/search.types";

interface PlaceCardProps {
  place: SearchPlace;
  onSelect?: (place: SearchPlace) => void;
  onViewOnMap?: (place: SearchPlace) => void;
  selected?: boolean;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelect,
  onViewOnMap,
  selected = false,
}) => {
  // Get price level display
  const getPriceLevelDisplay = () => {
    if (!place.price_level) return null;
    return "💰".repeat(place.price_level);
  };

  // Get business status color
  const getStatusColor = () => {
    switch (place.status) {
      case "OPERATIONAL":
        return "success";
      case "CLOSED_TEMPORARILY":
        return "warning";
      case "CLOSED_PERMANENTLY":
        return "error";
      default:
        return "default";
    }
  };

  const handleCardClick = () => {
    onSelect?.(place);
  };

  const handleViewOnMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewOnMap?.(place);
  };

  // Get the best available photo URL
  const getPhotoUrl = () => {
    if (!place?.photos || place.photos.length === 0) {
      return null;
    }

    const photo = place.photos[0];

    // If we have a direct URL, use it
    if (photo.url) {
      return photo.url;
    }

    // If we have a photo_reference, construct the Google Places Photo URL
    const photoRef = photo.photo_reference || photo.reference;
    if (photoRef && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      return `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoRef}&maxwidth=580&key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }`;
    }

    return null;
  };

  const photoUrl = getPhotoUrl();

  // Debug logging
  console.log(`Place: ${place.name}`, {
    hasPhotos: !!place?.photos?.length,
    photoData: place?.photos?.[0],
    photoUrl,
    apiKey: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  return (
    <Card
      sx={{
        cursor: onSelect ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: onSelect ? "translateY(-2px)" : "none",
          boxShadow: onSelect ? 4 : 1,
        },
        border: selected ? 2 : 0,
        borderColor: selected ? "primary.main" : "transparent",
        position: "relative",
      }}
      onClick={handleCardClick}
    >
      {/* Image */}
      <Box sx={{ position: "relative", height: 180 }}>
        <CardMedia
          height="180"
          component="img"
          image={photoUrl || ""}
          alt={place.name}
          sx={{
            objectFit: "cover",
          }}
          onLoad={() => {}}
          onError={() => {}}
        />
        {!photoUrl && (
          <Skeleton
            variant="rectangular"
            height={180}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}

        {/* View on Map button */}
        {onViewOnMap && (
          <IconButton
            onClick={handleViewOnMapClick}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 1)",
              },
            }}
            size="small"
          >
            <LaunchIcon fontSize="small" />
          </IconButton>
        )}

        {/* Status badge */}
        {place.status && place.status !== "OPERATIONAL" && (
          <Chip
            label={place.status.replace("_", " ")}
            size="small"
            color={getStatusColor() as any}
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              fontWeight: "bold",
              fontSize: "0.7rem",
            }}
          />
        )}

        {/* Open/Closed indicator */}
        {place.is_open !== null && (
          <Chip
            label={place.is_open ? "Open Now" : "Closed"}
            size="small"
            color={place.is_open ? "success" : "error"}
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              fontWeight: "bold",
              fontSize: "0.7rem",
            }}
          />
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ pb: 2 }}>
        {/* Name */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: "bold",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.3,
          }}
        >
          {place.name}
        </Typography>

        {/* Rating and Price */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          {place.rating && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Rating
                value={place.rating}
                precision={0.1}
                size="small"
                readOnly
              />
              <Typography variant="body2" color="text.secondary">
                ({place.rating})
              </Typography>
            </Box>
          )}

          {place.price_level && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PriceIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {getPriceLevelDisplay()}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Address */}
        <Box
          sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 1 }}
        >
          <LocationIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.4,
            }}
          >
            {place.address}
          </Typography>
        </Box>

        {/* Categories */}
        {place.categories && place.categories.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
            {place.categories.slice(0, 3).map((category, index) => (
              <Chip
                key={index}
                label={category.replace(/_/g, " ")}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.7rem",
                  height: 22,
                  textTransform: "capitalize",
                }}
              />
            ))}
            {place.categories.length > 3 && (
              <Chip
                label={`+${place.categories.length - 3}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.7rem",
                  height: 22,
                }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaceCard;
