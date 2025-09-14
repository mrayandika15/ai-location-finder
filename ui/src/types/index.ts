// API Types
export interface LocationSearchRequest {
  query: string;
  location?: {
    lat: number;
    lng: number;
  };
  radius?: number;
}

export interface LocationSearchResponse {
  locations: LocationResult[];
  success: boolean;
  message?: string;
}

export interface LocationResult {
  place_id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  photos?: string[];
  types: string[];
  opening_hours?: OpeningHours;
  website?: string;
  phone_number?: string;
}

export interface OpeningHours {
  open_now: boolean;
  periods?: OpeningPeriod[];
  weekday_text?: string[];
}

export interface OpeningPeriod {
  close?: DayTime;
  open: DayTime;
}

export interface DayTime {
  day: number;
  time: string;
}

// UI Types
export interface MapViewport {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

export interface SearchFilters {
  type?: string;
  rating?: number;
  openNow?: boolean;
  radius?: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  locations?: LocationResult[];
}

// Store Types (Zustand store interface is defined in store/useAppStore.ts)

// Re-export AI types
export * from "./ai.types";
