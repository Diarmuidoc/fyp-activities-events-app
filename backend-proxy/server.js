require('dotenv').config();
console.log("Loaded API Key:", process.env.GOOGLE_PLACES_API_KEY) // Debugging line

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY; // Load API Key from .env

app.use(cors()); // Allow all origins
app.use(express.json()); // Parse JSON request bodies

// Proxy endpoint to fetch Google Places data
app.get('/places', async (req, res) => {
  console.log("Using API Key:", GOOGLE_API_KEY); // Debugging line

  try {
    const { lat, lng, radius = 10000, type = 'tourist_attraction' } = req.query;
    const googlePlacesURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;

    console.log("Requesting:", googlePlacesURL); // Debugging line

    const response = await axios.get(googlePlacesURL);


    if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
      // --- Add Photo URLs ---
      if (response.data.results && Array.isArray(response.data.results)) {
        response.data.results = response.data.results.map(place => {
          let imageUrl = null; // Default to null
          // Check if the place has photos and the array is not empty
          if (place.photos && place.photos.length > 0) {
            const photoReference = place.photos[0].photo_reference; // Get reference of the first photo
            const maxWidth = 400; // Define desired max width for photos

            // Construct the full photo URL using the API key
            imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
            // console.log(`[Proxy] Constructed photo URL for place ${place.place_id}: ${imageUrl.replace(GOOGLE_API_KEY, 'YOUR_API_KEY')}`); // Log without key
          }
          // Return the original place object spread (...) plus the new imageUrl property
          return {
            ...place,
            imageUrl: imageUrl // Add the constructed URL (will be null if no photo)
          };
        });
        console.log('[Proxy] Added imageUrl property to place results.');
      }
      // --- End Add Photo URLs ---

      // Send the potentially modified response data back to Angular
      res.json(response.data);

    } else {
      // Handle Google API errors (e.g., REQUEST_DENIED, INVALID_REQUEST)
      console.error('[Proxy] Google Places API Error:', response.data.status, response.data.error_message);
      res.status(500).json({ // Use 500 or a more specific code if possible
        error: 'Failed to fetch data from Google Places API.',
        details: response.data.status + (response.data.error_message ? `: ${response.data.error_message}` : '')
      });
    }

  } catch (error) {
    // Handle network errors or issues connecting to Google API
    console.error('[Proxy] Error during Axios request to Google:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'Proxy failed to communicate with Google Places API.',
      details: error.response ? error.response.data : error.message
    });
  }
});

app.get('/api/place-details/:placeId', async (req, res) => {
  const placeId = req.params.placeId; // Get placeId from route parameter

  if (!placeId) {
    return res.status(400).json({ error: 'Place ID is required in the URL path.' });
  }

  // Define the fields you want from the Place Details API
  // Requesting specific fields is cheaper and faster!
  const fields = [
    'name',
    'formatted_address',
    'place_id',
    'geometry', // For location coordinates
    'photo',    // Request photos array (contains references)
    'opening_hours',
    'rating',
    'reviews',
    'website',
    'formatted_phone_number',
    'vicinity', // Usually same as formatted_address but can differ
    'url' // Google Maps URL
  ].join(','); // Join fields into comma-separated string

  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

  try {
    console.log(`[Proxy Details] Requesting Place Details from Google for placeId: ${placeId}`);
    const response = await axios.get(detailsUrl);
    console.log(`[Proxy Details] Received response from Google Details API. Status: ${response.data.status}`);

    // Check Google API response status
    if (response.data.status === 'OK') {
      // The main result is usually in response.data.result (singular)
      let placeDetails = response.data.result;

      // --- Add Photo URLs (similar to Nearby Search) ---
      if (placeDetails && placeDetails.photos && placeDetails.photos.length > 0) {
        // You might want URLs for *all* photos here, not just the first
        placeDetails.photos = placeDetails.photos.map(photo => {
          const photoReference = photo.photo_reference;
          const maxWidth = 800; // Maybe allow larger width for details page
          const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
          // Return a new object containing original photo info + the URL
          return {
            ...photo, // Keep original height, width, html_attributions
            imageUrl: imageUrl
          };
        });
        console.log('[Proxy Details] Added imageUrl property to photos array.');
      }
      // --- End Add Photo URLs ---

      // Send the potentially modified place details back to Angular
      // Note: Google Places Details API returns a single 'result' object
      res.json({ result: placeDetails, status: response.data.status }); // Mirror Google's structure or simplify

    } else {
      // Handle Google API errors
      console.error('[Proxy Details] Google Place Details API Error:', response.data.status, response.data.error_message);
      res.status(500).json({
        error: 'Failed to fetch place details from Google Places API.',
        details: response.data.status + (response.data.error_message ? `: ${response.data.error_message}` : '')
      });
    }

  } catch (error) {
    // Handle network errors
    console.error('[Proxy Details] Error during Axios request to Google Details API:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'Proxy failed to communicate with Google Places Details API.',
      details: error.response ? error.response.data : error.message
    });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Proxy server running at http://localhost:${PORT}`));
