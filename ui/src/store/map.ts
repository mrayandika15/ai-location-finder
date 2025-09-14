import { create } from "zustand";
import type { MapViewport } from "../types";
import type { SearchPlace } from "../types/search.types";

// Default viewport - Bandung, Indonesia
const defaultViewport: MapViewport = {
  center: {
    lat: -6.9175,
    lng: 107.6191,
  },
  zoom: 13,
};

interface MapState {
  // Search results
  searchResults: SearchPlace[];
  setSearchResults: (results: SearchPlace[]) => void;

  // Selected location
  selectedLocation: SearchPlace | null;
  setSelectedLocation: (location: SearchPlace | null) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Map viewport
  mapViewport: MapViewport;
  setMapViewport: (viewport: MapViewport) => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  searchResults: [],
  selectedLocation: null,
  isLoading: false,
  mapViewport: defaultViewport,

  // Actions
  setSearchResults: (results) => set({ searchResults: results }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setMapViewport: (viewport) => set({ mapViewport: viewport }),
}));
