import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Rating,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import type { LocationResult } from "../types";
import { useAppContext } from "../context/AppContext";

interface LocationCardProps {
  location: LocationResult;
  onClick?: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onClick }) => {
  const { setSelectedLocation, setMapViewport } = useAppContext();

  const handleViewOnMap = () => {
    setSelectedLocation(location);
    setMapViewport({
      center: location.location,
      zoom: 16,
    });
    if (onClick) onClick();
  };

  const handlePhoneCall = () => {
    if (location.phone_number) {
      window.open(`tel:${location.phone_number}`, "_self");
    }
  };

  const handleWebsiteOpen = () => {
    if (location.website) {
      window.open(location.website, "_blank", "noopener,noreferrer");
    }
  };

  const formatTypes = (types: string[]) => {
    return types
      .filter(
        (type) =>
          !type.includes("establishment") && !type.includes("point_of_interest")
      )
      .slice(0, 3)
      .map((type) => type.replace(/_/g, " ").toLowerCase());
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
      onClick={handleViewOnMap}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: "bold", flex: 1 }}
          >
            {location.name}
          </Typography>
          {location.rating && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Rating
                value={location.rating}
                precision={0.1}
                size="small"
                readOnly
              />
              <Typography variant="body2" color="text.secondary">
                ({location.rating})
              </Typography>
            </Box>
          )}
        </Box>

        {/* Address */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 0.5 }}>
          <LocationIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {location.address}
          </Typography>
        </Box>

        {/* Opening Hours */}
        {location.opening_hours && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 0.5 }}>
            <TimeIcon fontSize="small" color="action" />
            <Chip
              label={location.opening_hours.open_now ? "Open Now" : "Closed"}
              color={location.opening_hours.open_now ? "success" : "error"}
              size="small"
              variant="outlined"
            />
          </Box>
        )}

        {/* Types */}
        {location.types && location.types.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
            {formatTypes(location.types).map((type, index) => (
              <Chip
                key={index}
                label={type}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Button
          size="small"
          startIcon={<LocationIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewOnMap();
          }}
          variant="contained"
        >
          View on Map
        </Button>

        <Box>
          {location.phone_number && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handlePhoneCall();
              }}
              title="Call"
            >
              <PhoneIcon />
            </IconButton>
          )}
          {location.website && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleWebsiteOpen();
              }}
              title="Visit Website"
            >
              <WebsiteIcon />
            </IconButton>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default LocationCard;
