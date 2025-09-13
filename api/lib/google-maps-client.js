const axios = require("axios");

/**
 * Google Maps Client Library
 * External service integration for Google Maps and Places API
 *
 * Purpose: Handle all direct communication with Google Maps external services
 */
class GoogleMapsClient {
  constructor(config = {}) {
    this.mapsApiKey = config.mapsApiKey || process.env.GOOGLE_MAPS_API_KEY;
    this.placesApiKey =
      config.placesApiKey || process.env.GOOGLE_PLACES_API_KEY;
    this.timeout = config.timeout || 10000; // 10 seconds
    this.baseUrl = "https://maps.googleapis.com/maps/api";
  }

  /**
   * Test connection to Google Places API
   * @returns {Promise<Object>} Test result
   */
  async testPlacesConnection() {
    try {
      if (!this.mapsApiKey || this.mapsApiKey === "your_google_maps_api_key") {
        return { status: "not_configured", message: "API key not configured" };
      }

      const testUrl = `${this.baseUrl}/place/findplacefromtext/json?input=test&inputtype=textquery&key=${this.mapsApiKey}`;

      const response = await axios.get(testUrl, { timeout: this.timeout });

      if (response.status === 200) {
        return {
          status: "connected",
          message: "Google Maps API is accessible",
        };
      } else {
        return {
          status: "error",
          message: `Unexpected status: ${response.status}`,
        };
      }
    } catch (error) {
      console.error("Google Maps API test failed:", error.message);
      return {
        status: "error",
        message: error.response?.data?.error_message || error.message,
      };
    }
  }

  /**
   * Search for places using text query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Places search results
   */
  async searchPlaces(query, options = {}) {
    try {
      if (!this.mapsApiKey) {
        throw new Error("Google Maps API key is not configured");
      }

      const params = new URLSearchParams({
        input: query,
        inputtype: "textquery",
        key: this.mapsApiKey,
        ...options,
      });

      const response = await axios.get(
        `${this.baseUrl}/place/findplacefromtext/json?${params}`,
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      console.error("Google Places search failed:", error.message);
      throw new Error(`Google Places API error: ${error.message}`);
    }
  }

  /**
   * Get place details by place ID
   * @param {string} placeId - Google Places ID
   * @param {Array} fields - Fields to retrieve
   * @returns {Promise<Object>} Place details
   */
  async getPlaceDetails(placeId, fields = []) {
    try {
      if (!this.mapsApiKey) {
        throw new Error("Google Maps API key is not configured");
      }

      const params = new URLSearchParams({
        place_id: placeId,
        key: this.mapsApiKey,
      });

      if (fields.length > 0) {
        params.append("fields", fields.join(","));
      }

      const response = await axios.get(
        `${this.baseUrl}/place/details/json?${params}`,
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      console.error("Google Place details failed:", error.message);
      throw new Error(`Google Places API error: ${error.message}`);
    }
  }

  /**
   * Search for nearby places
   * @param {Object} location - { lat, lng }
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Nearby places results
   */
  async searchNearby(location, options = {}) {
    try {
      if (!this.mapsApiKey) {
        throw new Error("Google Maps API key is not configured");
      }

      const params = new URLSearchParams({
        location: `${location.lat},${location.lng}`,
        radius: options.radius || 1000,
        key: this.mapsApiKey,
        ...options,
      });

      const response = await axios.get(
        `${this.baseUrl}/place/nearbysearch/json?${params}`,
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      console.error("Google nearby search failed:", error.message);
      throw new Error(`Google Places API error: ${error.message}`);
    }
  }
}

module.exports = GoogleMapsClient;
