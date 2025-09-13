import { useState } from "react";
import type { LocationResult, MapViewport, ChatMessage } from "../types";

// Default viewport - Bandung, Indonesia
const defaultViewport: MapViewport = {
  center: {
    lat: -6.9175,
    lng: 107.6191,
  },
  zoom: 13,
};

// Initial welcome message
const initialMessage: ChatMessage = {
  id: "welcome",
  type: "ai",
  content:
    "Hello! I'm your AI location assistant. Ask me anything like 'Find coffee shops near ITB' or 'Where can I get good ramen in Bandung?'",
  timestamp: new Date(),
};

// Simple state management hooks
export const useSearchResults = () => {
  return useState<LocationResult[]>([]);
};

export const useSelectedLocation = () => {
  return useState<LocationResult | null>(null);
};

export const useIsLoading = () => {
  return useState<boolean>(false);
};

export const useMapViewport = () => {
  return useState<MapViewport>(defaultViewport);
};

export const useMessages = () => {
  return useState<ChatMessage[]>([initialMessage]);
};

export const useIsTyping = () => {
  return useState<boolean>(false);
};
