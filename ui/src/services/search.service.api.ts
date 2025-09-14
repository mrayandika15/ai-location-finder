import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type {
  SearchRequest,
  SearchPlace,
  SearchResponse,
  PlaceDetailsResponse,
  GeocodeResponse,
  ApiError,
} from "../types/search.types";

class SearchService {
  private client: AxiosInstance;
  private config = {
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    timeout: 30000,
  };

  constructor() {
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `🔍 Search API Request: ${config.method?.toUpperCase()} ${config.url}`,
          config.data
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log("✅ Search API Response:", response.data);
        return response;
      },
      (error) => {
        console.error("❌ Search API Error:", error.response?.data || error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Parse JSON from AI response and search places
  async searchFromAIResponse(aiResponseContent: string): Promise<SearchResponse> {
    try {
      // Extract JSON from AI response (handle markdown code blocks)
      const jsonMatch = aiResponseContent.match(/```json\s*([\s\S]*?)\s*```/);
      let jsonContent = jsonMatch ? jsonMatch[1] : aiResponseContent;

      // Try to parse the JSON
      const searchRequest: SearchRequest = JSON.parse(jsonContent.trim());

      // Validate the parsed request
      if (!this.isValidSearchRequest(searchRequest)) {
        throw new Error("Invalid search request format from AI response");
      }

      // Perform the search
      return await this.searchPlaces(searchRequest);
    } catch (error) {
      console.error("Failed to parse AI response or search:", error);
      throw new Error(`Failed to process AI response: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Main search places method
  async searchPlaces(searchRequest: SearchRequest): Promise<SearchResponse> {
    try {
      const response: AxiosResponse<SearchResponse> = await this.client.post(
        "/api/v1/search",
        searchRequest
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get place details by ID
  async getPlaceDetails(
    placeId: string,
    language: "id" | "en" = "id"
  ): Promise<PlaceDetailsResponse> {
    try {
      const response: AxiosResponse<PlaceDetailsResponse> = await this.client.get(
        `/api/v1/place/${placeId}`,
        { params: { language } }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Geocode location
  async geocodeLocation(location: string): Promise<GeocodeResponse> {
    try {
      const response: AxiosResponse<GeocodeResponse> = await this.client.post(
        "/api/v1/geocode",
        { location }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Validate search request structure
  private isValidSearchRequest(request: any): request is SearchRequest {
    return (
      request &&
      typeof request === "object" &&
      request.action === "search" &&
      (typeof request.query === "string" || typeof request.location === "string")
    );
  }

  // Enhanced error handling
  private handleError(error: any): Error {
    if (error.response) {
      const apiError: ApiError = error.response.data;
      return new Error(
        apiError.error?.message ||
        `API Error: ${error.response.status} - ${error.response.statusText}`
      );
    } else if (error.request) {
      return new Error("Network error: Unable to reach the search API");
    } else {
      return new Error(`Search service error: ${error.message}`);
    }
  }
}

// Create singleton instance
const searchService = new SearchService();

// Export service instance
export default searchService;
export { SearchService };