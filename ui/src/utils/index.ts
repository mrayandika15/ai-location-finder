// Utility functions for the AI Location Finder

import type { SearchRequest } from "../types/search.types";

/**
 * Format distance in meters to a human-readable string
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Format rating to display with stars
 */
export const formatRating = (rating: number): string => {
  const stars =
    "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  return `${stars} (${rating})`;
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

/**
 * Get user's current location
 */
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

/**
 * Validate if coordinates are valid
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Format business types for display
 */
export const formatBusinessTypes = (types: string[]): string[] => {
  return types
    .filter(
      (type) =>
        !type.includes("establishment") &&
        !type.includes("point_of_interest") &&
        !type.includes("premise")
    )
    .map((type) =>
      type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    )
    .slice(0, 3); // Limit to first 3 relevant types
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length (assuming international format)
  if (cleaned.length >= 10) {
    return phone; // Return original if it seems properly formatted
  }

  return phone;
};

/**
 * Check if a location is currently open
 */
export const isCurrentlyOpen = (openingHours?: any): boolean => {
  if (!openingHours || !openingHours.periods) {
    return false;
  }

  // This is a simplified check - Google Places API provides more detailed opening hours
  return openingHours.open_now || false;
};

export const detectSearchIntent = (content: string): boolean => {
  try {
    // Check for JSON code blocks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) return false;

    // Try to parse the JSON
    const parsed = JSON.parse(jsonMatch[1].trim());

    // Check if it's a valid search request
    return (
      parsed &&
      typeof parsed === "object" &&
      parsed.action === "search" &&
      (typeof parsed.query === "string" || typeof parsed.location === "string")
    );
  } catch {
    return false;
  }
};

export const extractSearchRequest = (content: string): SearchRequest | null => {
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[1].trim());

    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.action === "search" &&
      (typeof parsed.query === "string" || typeof parsed.location === "string")
    ) {
      return parsed as SearchRequest;
    }

    return null;
  } catch {
    return null;
  }
};
