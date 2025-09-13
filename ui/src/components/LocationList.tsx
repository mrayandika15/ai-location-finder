import React from "react";
import { Box, Typography, Paper, List, ListItem, Divider } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useAppContext } from "../context/AppContext";
import LocationCard from "./LocationCard";

const LocationList: React.FC = () => {
  const { searchResults, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Searching for locations...
        </Typography>
      </Paper>
    );
  }

  if (searchResults.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <SearchIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No locations found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try searching for places like "coffee shops near university" or
          "restaurants in Bandung"
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Found {searchResults.length} location
        {searchResults.length !== 1 ? "s" : ""}
      </Typography>

      <List sx={{ p: 0 }}>
        {searchResults.map((location, index) => (
          <React.Fragment key={location.place_id}>
            <ListItem sx={{ p: 0 }}>
              <LocationCard location={location} />
            </ListItem>
            {index < searchResults.length - 1 && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default LocationList;
