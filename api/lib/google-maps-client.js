const { Client } = require("@googlemaps/google-maps-services-js");

class GoogleMapsClient {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!this.apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY environment variable is required");
    }

    this.client = new Client({});
  }

  async searchPlaces({
    query,
    location,
    radius = 2000,
    type,
    language = "id",
    filters = {},
  }) {
    try {
      // Build search query
      let searchQuery = query;
      if (
        location &&
        (!query || !query.toLowerCase().includes(location.toLowerCase()))
      ) {
        searchQuery = query ? `${query} in ${location}` : location;
      }

      const params = {
        query: searchQuery,
        language: language,
        key: this.apiKey,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "geometry",
          "rating",
          "price_level",
          "types",
          "opening_hours",
          "photos",
          "business_status",
        ],
      };

      // Add location and radius if available
      if (location && radius) {
        const coordinates = await this.geocodeLocation(location);
        if (coordinates) {
          params.location = `${coordinates.lat},${coordinates.lng}`;
          params.radius = radius;
        }
      }

      // Add type if provided
      if (type) {
        params.type = type;
      }

      // Add filters
      if (filters.open_now) {
        params.opennow = true;
      }

      if (filters.price_level) {
        params.minprice = filters.price_level;
        params.maxprice = filters.price_level;
      }

      const response = await this.client.textSearch({
        params: params,
      });

      return this.formatSearchResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchNearby({
    location,
    radius = 2000,
    type,
    language = "id",
    filters = {},
  }) {
    try {
      // First geocode the location to get coordinates
      const coordinates = await this.geocodeLocation(location);
      if (!coordinates) {
        throw new Error(`Could not find coordinates for location: ${location}`);
      }

      const params = {
        key: this.apiKey,
        location: `${coordinates.lat},${coordinates.lng}`,
        radius: radius,
        language: language,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "geometry",
          "rating",
          "price_level",
          "types",
          "opening_hours",
          "photos",
          "business_status",
        ],
      };

      if (type) {
        params.type = type;
      }

      if (filters.open_now) {
        params.opennow = true;
      }

      if (filters.price_level) {
        params.minprice = filters.price_level;
        params.maxprice = filters.price_level;
      }

      const response = await this.client.placesNearby({
        params: params,
      });

      return this.formatSearchResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async geocodeLocation(location) {
    try {
      const params = {
        key: this.apiKey,
        address: location,
      };

      const response = await this.client.geocode({
        params: params,
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address,
        };
      }

      return null;
    } catch (error) {
      // Enhanced error logging for API key issues
      if (error.response && error.response.status === 403) {
        console.error("🔑 API Key Error:", {
          status: error.response.status,
          message:
            error.response.data?.error_message || "API key restriction issue",
          suggestion:
            "Your API key has referer restrictions. Create a server-side API key or remove restrictions.",
        });

        throw new Error(
          `API Key Error: ${
            error.response.data?.error_message ||
            "API key has restrictions that prevent server-side usage"
          }`
        );
      }

      console.error("Geocoding error:", error.message);
      return null;
    }
  }

  async getPlaceDetails(placeId, language = "id") {
    try {
      const params = {
        key: this.apiKey,
        place_id: placeId,
        language: language,
        fields: [
          "name",
          "formatted_address",
          "formatted_phone_number",
          "opening_hours",
          "rating",
          "price_level",
          "photos",
          "reviews",
          "website",
          "geometry",
        ],
      };

      const response = await this.client.placeDetails({
        params: params,
      });

      return {
        success: true,
        data: response.data.result,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  formatSearchResponse(data) {
    if (data.status !== "OK") {
      throw new Error(
        `Google Maps API error: ${data.status} - ${
          data.error_message || "Unknown error"
        }`
      );
    }

    const places = data.results.map((place) => ({
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      rating: place.rating || null,
      price_level: place.price_level || null,
      types: place.types || [],
      opening_hours: place.opening_hours
        ? {
            open_now: place.opening_hours.open_now,
            weekday_text: place.opening_hours.weekday_text || [],
          }
        : null,
      photos: place.photos
        ? place.photos.slice(0, 3).map((photo) => ({
            photo_reference: photo.photo_reference,
            width: photo.width,
            height: photo.height,
          }))
        : [],
      business_status: place.business_status || null,
    }));

    return {
      success: true,
      data: {
        places: places,
        total_results: places.length,
        next_page_token: data.next_page_token || null,
      },
    };
  }

  handleError(error) {
    const errorDetails = {
      type: "unknown",
      message: "",
      originalMessage: error.message,
      code: error.code || null,
      status: error.response?.status || null,
    };

    // Handle Google Maps Services specific errors
    if (error.response && error.response.data) {
      const data = error.response.data;
      errorDetails.type = "api_error";
      errorDetails.message = `Google Maps API error: ${
        data.status || "Unknown"
      } - ${data.error_message || error.message}`;
    } else if (error.code === "ECONNREFUSED") {
      errorDetails.type = "connection";
      errorDetails.message = "Cannot connect to Google Maps API";
    } else if (error.code === "ENOTFOUND") {
      errorDetails.type = "network";
      errorDetails.message =
        "Google Maps API not found. Check internet connection";
    } else {
      errorDetails.type = "generic";
      errorDetails.message = `Google Maps error: ${error.message}`;
    }

    return new Error(errorDetails.message);
  }
}

module.exports = GoogleMapsClient;
