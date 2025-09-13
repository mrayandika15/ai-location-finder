import React, { useState } from "react";
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useAppContext } from "../context/AppContext";
import { locationApi } from "../services/api";
import type { LocationSearchRequest } from "../types";

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Find locations... (e.g., 'coffee shops near university')",
}) => {
  const [query, setQuery] = useState("");
  const {
    setSearchResults,
    isLoading,
    setIsLoading,
    mapViewport,
    setMapViewport,
  } = useAppContext();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const searchRequest: LocationSearchRequest = {
        query: query.trim(),
        location: mapViewport.center,
        radius: 5000, // 5km default radius
      };

      const response = await locationApi.searchLocations(searchRequest);

      if (response.success && response.locations.length > 0) {
        setSearchResults(response.locations);

        // Update map viewport to show first result
        const firstResult = response.locations[0];
        setMapViewport({
          center: firstResult.location,
          zoom: 14,
        });
      } else {
        setSearchResults([]);
        console.warn("No locations found for query:", query);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
      // You could add a snackbar notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mb: 2 }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: "100%",
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          inputProps={{ "aria-label": "search locations" }}
        />
        <IconButton
          type="submit"
          sx={{ p: "10px" }}
          aria-label="search"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? <CircularProgress size={24} /> : <SearchIcon />}
        </IconButton>
      </Paper>
    </Box>
  );
};

export default SearchBar;
