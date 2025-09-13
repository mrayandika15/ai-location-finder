import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AppContextType, LocationResult, MapViewport } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

// Default viewport - can be updated to user's location or a default city
const defaultViewport: MapViewport = {
  center: {
    lat: -6.9175, // Bandung, Indonesia
    lng: 107.6191,
  },
  zoom: 13,
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mapViewport, setMapViewport] = useState<MapViewport>(defaultViewport);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);

  const value: AppContextType = {
    searchResults,
    setSearchResults,
    isLoading,
    setIsLoading,
    mapViewport,
    setMapViewport,
    selectedLocation,
    setSelectedLocation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
