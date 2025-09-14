// Search API Types for Google Maps Integration

export interface SearchRequest {
  action: "search";
  query: string;
  location: string;
  category?: string;
  radius?: number;
  language?: "id" | "en";
  filters?: {
    price_level?: number;
    rating?: number;
    open_now?: boolean;
    time?: string;
    other?: string;
  };
}

export interface SearchPlace {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number | null;
  price_level: number | null;
  categories: string[];
  is_open: boolean | null;
  photos: Array<{
    photo_reference?: string;
    reference?: string; // Keep for backward compatibility
    url?: string;
    width?: number;
    height?: number;
  }>;
  status: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    places: SearchPlace[];
    total: number;
    search_info: SearchRequest;
    next_page_token?: string;
  };
  message?: string;
}

export interface PlaceDetailsResponse {
  success: boolean;
  data: {
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    opening_hours?: {
      open_now: boolean;
      weekday_text: string[];
    };
    rating?: number;
    price_level?: number;
    photos?: Array<{
      photo_reference: string;
      width: number;
      height: number;
    }>;
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
    }>;
    website?: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  };
  message?: string;
}

export interface GeocodeResponse {
  success: boolean;
  data: {
    lat: number;
    lng: number;
    formatted_address: string;
  };
  message?: string;
}

export interface ApiError {
  success: false;
  timestamp: string;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Hook options interfaces
export interface UseSearchPlacesOptions {
  onSuccess?: (data: SearchResponse) => void;
  onError?: (error: Error) => void;
}
