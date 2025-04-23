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

// Start the server
app.listen(PORT, () => console.log(`Proxy server running at http://localhost:${PORT}`));
