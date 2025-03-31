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
    const { lat, lng, radius = 5000, type = 'restaurant' } = req.query;
    const googlePlacesURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;

    console.log("Requesting:", googlePlacesURL); // Debugging line

    const response = await axios.get(googlePlacesURL);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching places:', error.message);
    res.status(500).json({ error: 'Error fetching places' });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Proxy server running at http://localhost:${PORT}`));
