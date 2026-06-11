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

router.get('/places/details/:placeId', async (req, res) => {
  const { placeId } = req.params;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=place_id,name,photos,rating,user_ratings_total,reviews,vicinity,opening_hours,website,formatted_phone_number,price_level,url&language=th&key=${apiKey}`;
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
    if (data.status !== 'OK') {
      return res.status(502).json({ error: `Places API error: ${data.status}` });
    }

    const result = data.result;
    const photos = (result.photos || []).map(p => p.photo_reference);

    res.json({
      place_id: result.place_id,
      name: result.name,
      photos,
      photo_reference: photos[0] || null,
      rating: result.rating,
      user_ratings_total: result.user_ratings_total,
      reviews: result.reviews || [],
      vicinity: result.vicinity,
      opening_hours: result.opening_hours,
      website: result.website || null,
      formatted_phone_number: result.formatted_phone_number || null,
      price_level: result.price_level || null,
      google_maps_url: result.url || null,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Places API timeout' });
    }
    console.error('Place details error:', err.message);
    res.status(502).json({ error: 'Failed to fetch place details' });
  }
});

router.get('/places/photo/:photoReference', async (req, res) => {
  const { photoReference } = req.params;
  const maxwidth = Math.min(parseInt(req.query.maxwidth) || 400, 1600);
  const maxheight = Math.min(parseInt(req.query.maxheight) || 400, 1600);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&maxheight=${maxheight}&photoreference=${encodeURIComponent(photoReference)}&key=${apiKey}`;
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch photo' });
    }

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.set('Content-Type', contentType);
    }
    res.set('Cache-Control', 'public, max-age=86400');

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error('Photo fetch error:', err.message);
    res.status(502).json({ error: 'Failed to fetch photo' });
  }
});

module.exports = router;
