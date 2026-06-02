const express = require('express');
const router = express.Router();

router.get('/places/autocomplete', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q.trim())}&components=country:th&language=th&key=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      return res.status(502).json({ error: 'Places API error' });
    }
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      return res.status(502).json({ error: `Places API denied: ${data.error_message}` });
    }
    if (data.status === 'OVER_QUERY_LIMIT') {
      return res.status(429).json({ error: 'Query limit exceeded' });
    }
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return res.status(502).json({ error: `Places API error: ${data.status}` });
    }

    const predictions = (data.predictions || []).map((p) => ({
      place_id: p.place_id,
      description: p.description,
      main_text: p.structured_formatting?.main_text || p.description,
      secondary_text: p.structured_formatting?.secondary_text || '',
    }));

    res.json({ predictions });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Places API timeout' });
    }
    console.error('Autocomplete error:', err.message);
    res.status(502).json({ error: 'Failed to fetch suggestions' });
  }
});

module.exports = router;
