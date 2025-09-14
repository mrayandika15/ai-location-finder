const GoogleMapsClient = require("../lib/google-maps-client");

class MapsService {
  constructor() {
    this.client = new GoogleMapsClient();
  }

  async searchPlaces(searchRequest) {
    try {
      const {
        action,
        query,
        location,
        category,
        radius = 2000,
        language = "id",
        filters = {}
      } = searchRequest;

      // Validate required fields
      if (!query && !location && !category) {
        throw new Error("At least one of query, location, or category is required");
      }

      // Build search parameters
      const searchParams = {
        language,
        radius,
        filters
      };

      // Determine search method based on available data
      let result;

      if (query || (location && category)) {
        // Use text search for complex queries
        const searchQuery = this.buildSearchQuery(query, location, category);

        result = await this.client.searchPlaces({
          ...searchParams,
          query: searchQuery,
          location: location,
          type: this.mapCategoryToType(category)
        });
      } else if (location) {
        // Use nearby search for location-based searches
        result = await this.client.searchNearby({
          ...searchParams,
          location: location,
          type: this.mapCategoryToType(category)
        });
      } else {
        throw new Error("Invalid search parameters");
      }

      // Apply additional filtering if needed
      if (result.success && filters.rating) {
        result.data.places = result.data.places.filter(place =>
          place.rating && place.rating >= filters.rating
        );
        result.data.total_results = result.data.places.length;
      }

      return {
        success: true,
        data: {
          ...result.data,
          search_params: {
            original_query: query,
            location,
            category,
            radius,
            language,
            filters
          }
        }
      };
    } catch (error) {
      throw new Error(`Maps service error: ${error.message}`);
    }
  }

  async getPlaceDetails(placeId, language = "id") {
    try {
      const result = await this.client.getPlaceDetails(placeId, language);
      return result;
    } catch (error) {
      throw new Error(`Failed to get place details: ${error.message}`);
    }
  }

  async geocodeLocation(location) {
    try {
      const result = await this.client.geocodeLocation(location);

      if (!result) {
        throw new Error(`Could not find coordinates for location: ${location}`);
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new Error(`Geocoding error: ${error.message}`);
    }
  }

  buildSearchQuery(query, location, category) {
    let searchQuery = "";

    if (query) {
      searchQuery = query;
    } else if (category) {
      searchQuery = category;
    }

    // If we have a location and it's not already in the query, add it
    if (location && !searchQuery.toLowerCase().includes(location.toLowerCase())) {
      searchQuery += ` in ${location}`;
    }

    return searchQuery.trim();
  }

  mapCategoryToType(category) {
    if (!category) return null;

    const categoryMap = {
      // Food & Drink
      "restaurant": "restaurant",
      "restoran": "restaurant",
      "cafe": "cafe",
      "kafe": "cafe",
      "bar": "bar",
      "food": "restaurant",
      "makanan": "restaurant",
      "minuman": "cafe",

      // Shopping
      "store": "store",
      "toko": "store",
      "shopping": "shopping_mall",
      "mall": "shopping_mall",
      "supermarket": "supermarket",
      "grocery": "grocery_or_supermarket",

      // Services
      "atm": "atm",
      "bank": "bank",
      "hospital": "hospital",
      "pharmacy": "pharmacy",
      "gas_station": "gas_station",
      "pom_bensin": "gas_station",

      // Entertainment
      "movie": "movie_theater",
      "cinema": "movie_theater",
      "gym": "gym",
      "spa": "spa",

      // Technology
      "toko komputer": "electronics_store",
      "computer": "electronics_store",
      "electronics": "electronics_store",

      // Transportation
      "parking": "parking",
      "airport": "airport",
      "train": "train_station",
      "bus": "bus_station",

      // Lodging
      "hotel": "lodging",
      "motel": "lodging",
      "penginapan": "lodging"
    };

    return categoryMap[category.toLowerCase()] || null;
  }

  validateSearchRequest(request) {
    const errors = [];

    if (!request) {
      errors.push("Search request is required");
      return errors;
    }

    const { action, query, location, category, radius, language } = request;

    if (action && action !== "search") {
      errors.push("Action must be 'search'");
    }

    if (!query && !location && !category) {
      errors.push("At least one of query, location, or category is required");
    }

    if (radius && (typeof radius !== "number" || radius < 0 || radius > 50000)) {
      errors.push("Radius must be a number between 0 and 50000 meters");
    }

    if (language && !["id", "en"].includes(language)) {
      errors.push("Language must be 'id' or 'en'");
    }

    return errors;
  }

  formatResponseForFrontend(result) {
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        places: result.data.places.map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.address,
          coordinates: place.location,
          rating: place.rating,
          price_level: place.price_level,
          categories: place.types,
          is_open: place.opening_hours?.open_now || null,
          photos: place.photos.map(photo => ({
            reference: photo.photo_reference,
            width: photo.width,
            height: photo.height,
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${photo.width}&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
          })),
          status: place.business_status
        })),
        total: result.data.total_results,
        search_info: result.data.search_params,
        next_page_token: result.data.next_page_token
      }
    };
  }
}

module.exports = MapsService;