import axios from "axios";
import type {
  LocationSearchRequest,
  LocationSearchResponse,
  LocationResult,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const locationApi = {
  // Main location search endpoint
  searchLocations: async (
    searchRequest: LocationSearchRequest
  ): Promise<LocationSearchResponse> => {
    try {
      const response = await apiClient.post<LocationSearchResponse>(
        "/api/search",
        searchRequest
      );
      return response.data;
    } catch (error) {
      console.error("Error searching locations:", error);
      throw error;
    }
  },

  // Get detailed location information
  getLocationDetails: async (placeId: string): Promise<LocationResult> => {
    try {
      const response = await apiClient.get<LocationResult>(
        `/api/locations/${placeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching location details:", error);
      throw error;
    }
  },

  // Find nearby places
  getNearbyPlaces: async (
    lat: number,
    lng: number,
    radius: number = 1000,
    type?: string
  ): Promise<LocationResult[]> => {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        ...(type && { type }),
      });

      const response = await apiClient.get<LocationResult[]>(
        `/api/nearby?${params}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      throw error;
    }
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await apiClient.get("/api/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },
};

export default apiClient;
