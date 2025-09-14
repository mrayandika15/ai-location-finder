const express = require("express");
const router = express.Router();
const MapsService = require("../services/maps.service");
const { http, logs } = require("../utils");

const mapsService = new MapsService();

router.post("/search", async (req, res) => {
  try {
    const searchRequest = req.body;

    logs.logOperation("Search", "Processing place search request", {
      query: searchRequest.query,
      location: searchRequest.location,
      category: searchRequest.category,
      radius: searchRequest.radius,
    });

    // Validate the request
    const validationErrors = mapsService.validateSearchRequest(searchRequest);
    if (validationErrors.length > 0) {
      return http.sendError(
        res,
        new Error(`Validation failed: ${validationErrors.join(", ")}`),
        {
          statusCode: 400,
          includeStack: false,
        }
      );
    }

    // Perform the search
    const searchResult = await mapsService.searchPlaces(searchRequest);

    // Format response for frontend
    const formattedResult = mapsService.formatResponseForFrontend(searchResult);

    logs.logOperation("Search", "Place search completed successfully", {
      totalResults: formattedResult.data.total,
      hasResults: formattedResult.data.total > 0,
    });

    http.sendSuccess(res, formattedResult.data, "Places found successfully");
  } catch (error) {
    logs.logOperation("Search", "Failed to search places", {
      error: true,
      message: error.message,
    });

    http.sendError(res, error, { includeStack: true });
  }
});

// Get place details endpoint
router.get("/place/:placeId", async (req, res) => {
  try {
    const { placeId } = req.params;
    const { language = "id" } = req.query;

    logs.logOperation("PlaceDetails", "Fetching place details", {
      placeId,
      language,
    });

    const result = await mapsService.getPlaceDetails(placeId, language);

    logs.logOperation("PlaceDetails", "Place details retrieved successfully", {
      placeName: result.data.name,
    });

    http.sendSuccess(res, result.data, "Place details retrieved successfully");
  } catch (error) {
    logs.logOperation("PlaceDetails", "Failed to get place details", {
      error: true,
      message: error.message,
    });

    http.sendError(res, error, { includeStack: true });
  }
});

// Geocode location endpoint
router.post("/geocode", async (req, res) => {
  try {
    const { location } = req.body;

    if (!location) {
      return http.sendError(res, new Error("Location is required"), {
        statusCode: 400,
        includeStack: false,
      });
    }

    logs.logOperation("Geocode", "Geocoding location", { location });

    const result = await mapsService.geocodeLocation(location);

    logs.logOperation("Geocode", "Location geocoded successfully", {
      coordinates: result.data,
    });

    http.sendSuccess(res, result.data, "Location geocoded successfully");
  } catch (error) {
    logs.logOperation("Geocode", "Failed to geocode location", {
      error: true,
      message: error.message,
    });

    http.sendError(res, error, { includeStack: true });
  }
});

module.exports = router;
