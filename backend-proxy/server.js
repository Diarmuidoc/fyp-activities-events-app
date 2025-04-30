require('dotenv').config();
console.log("Loaded API Key:", process.env.GOOGLE_PLACES_API_KEY)

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

app.use(cors());
app.use(express.json());

// Proxy endpoint to fetch Google Places data
app.get('/places', async (req, res) => {
  console.log("Using API Key:", GOOGLE_API_KEY);

  try {
    const { lat, lng, radius = 10000, type = 'tourist_attraction' } = req.query;
    const googlePlacesURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;

    console.log("Requesting:", googlePlacesURL);

    const response = await axios.get(googlePlacesURL);


    if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
      // --- Add Photo URLs ---
      if (response.data.results && Array.isArray(response.data.results)) {
        response.data.results = response.data.results.map(place => {
          let imageUrl = null; // Default to null

          if (place.photos && place.photos.length > 0) {
            const photoReference = place.photos[0].photo_reference;
            const maxWidth = 400;


            imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;

          }

          return {
            ...place,
            imageUrl: imageUrl
          };
        });
        console.log('[Proxy] Added imageUrl property to place results.');
      }



      res.json(response.data);

    } else {

      console.error('[Proxy] Google Places API Error:', response.data.status, response.data.error_message);
      res.status(500).json({
        error: 'Failed to fetch data from Google Places API.',
        details: response.data.status + (response.data.error_message ? `: ${response.data.error_message}` : '')
      });
    }

  } catch (error) {
    console.error('[Proxy] Error during Axios request to Google:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'Proxy failed to communicate with Google Places API.',
      details: error.response ? error.response.data : error.message
    });
  }
});

app.get('/api/place-details/:placeId', async (req, res) => {
  const placeId = req.params.placeId;

  if (!placeId) {
    return res.status(400).json({ error: 'Place ID is required in the URL path.' });
  }

  const fields = [
    'name',
    'formatted_address',
    'place_id',
    'geometry',
    'photo',
    'opening_hours',
    'rating',
    'reviews',
    'website',
    'formatted_phone_number',
    'vicinity',
    'url'
  ].join(',');

  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

  try {
    console.log(`[Proxy Details] Requesting Place Details from Google for placeId: ${placeId}`);
    const response = await axios.get(detailsUrl);
    console.log(`[Proxy Details] Received response from Google Details API. Status: ${response.data.status}`);


    if (response.data.status === 'OK') {

      let placeDetails = response.data.result;


      if (placeDetails && placeDetails.photos && placeDetails.photos.length > 0) {

        placeDetails.photos = placeDetails.photos.map(photo => {
          const photoReference = photo.photo_reference;
          const maxWidth = 800;
          const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;

          return {
            ...photo,
            imageUrl: imageUrl
          };
        });
        console.log('[Proxy Details] Added imageUrl property to photos array.');
      }

      res.json({ result: placeDetails, status: response.data.status }); // Mirror Google's structure or simplify

    } else {
      console.error('[Proxy Details] Google Place Details API Error:', response.data.status, response.data.error_message);
      res.status(500).json({
        error: 'Failed to fetch place details from Google Places API.',
        details: response.data.status + (response.data.error_message ? `: ${response.data.error_message}` : '')
      });
    }

  } catch (error) {
    console.error('[Proxy Details] Error during Axios request to Google Details API:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'Proxy failed to communicate with Google Places Details API.',
      details: error.response ? error.response.data : error.message
    });
  }
});


app.listen(PORT, () => console.log(`Proxy server running at http://localhost:${PORT}`));
