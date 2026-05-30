const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/requireAuth');
const { seedTripCache, getRecommendations, reseedTripCache, seedGuestCache } = require('../services/placesService');

const router = express.Router();

const guestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

async function handleRecommendations(req, res, tripId) {
  try {
    const { category, rating_min, sort_by, sort_order, cursor, limit } = req.query;
    const result = await getRecommendations(tripId, { category, rating_min, sort_by, sort_order, cursor, limit }, req.pool || req.app.locals.pool);
    res.json(result);
  } catch (err) {
    console.error('Get recommendations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

router.post('/guest/recommendations', guestLimiter, async (req, res) => {
  try {
    const { route_polyline, travel_style } = req.body;
    if (!route_polyline) {
      return res.status(400).json({ error: 'route_polyline is required' });
    }
    if (travel_style && !['chill', 'foodie', 'photographer', 'adventure', 'budget'].includes(travel_style)) {
      return res.status(400).json({ error: 'Invalid travel_style' });
    }

    const pool = req.app.locals.pool || require('../config/database');
    const result = await seedGuestCache(route_polyline, travel_style || 'chill', pool);
    res.json(result);
  } catch (err) {
    if (err.code === 'API_KEY_MISSING') {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    if (err.code === 'API_DENIED') {
      return res.status(502).json({ error: 'Google Places API access denied. Please enable Places API in Google Cloud Console.' });
    }
    if (err.code === 'QUOTA_EXCEEDED') {
      return res.status(429).json({ error: 'Places API quota exceeded. Try again later.' });
    }
    if (err.code === 'API_ERROR') {
      return res.status(502).json({ error: 'Error fetching from Google Places API' });
    }
    console.error('Guest recommendations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/guest/recommendations', guestLimiter, async (req, res) => {
  await handleRecommendations(req, res, 'guest_' + (req.query.hash || ''));
});

router.get('/:tripId/recommendations', requireAuth, async (req, res) => {
  const { tripId } = req.params;
  const pool = req.app.locals.pool || require('../config/database');

  try {
    const tripCheck = await pool.query(
      'SELECT user_id FROM trips WHERE trip_id = $1',
      [tripId]
    );
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (tripCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
  } catch (err) {
    console.error('Trip check error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  await handleRecommendations(req, res, tripId);
});

router.post('/:tripId/recommendations/seed', requireAuth, async (req, res) => {
  const { tripId } = req.params;
  const pool = req.app.locals.pool || require('../config/database');

  try {
    const tripCheck = await pool.query(
      'SELECT user_id, route_polyline, travel_style FROM trips WHERE trip_id = $1',
      [tripId]
    );
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (tripCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { route_polyline, travel_style } = tripCheck.rows[0];
    if (!route_polyline) {
      return res.status(400).json({ error: 'Trip has no route. Create trip with valid origin/destination first.' });
    }

    const result = await seedTripCache(tripId, route_polyline, travel_style, pool);
    res.json({ message: `Seeded ${result.count} places`, count: result.count });
  } catch (err) {
    if (err.code === 'API_KEY_MISSING') {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    if (err.code === 'API_DENIED') {
      return res.status(502).json({ error: 'Google Places API access denied. Please enable Places API in Google Cloud Console.' });
    }
    if (err.code === 'QUOTA_EXCEEDED') {
      return res.status(429).json({ error: 'Places API quota exceeded. Try again later.' });
    }
    console.error('Seed recommendations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:tripId/recommendations/reseed', requireAuth, async (req, res) => {
  const { tripId } = req.params;
  const pool = req.app.locals.pool || require('../config/database');

  try {
    const tripCheck = await pool.query(
      'SELECT user_id, route_polyline, travel_style FROM trips WHERE trip_id = $1',
      [tripId]
    );
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (tripCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { reseedTripCache } = require('../services/placesService');
    const result = await reseedTripCache(tripId, pool);
    res.json({ message: `Reseeded ${result.count} places`, count: result.count });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (err.code === 'NO_ROUTE') {
      return res.status(400).json({ error: 'Trip has no route' });
    }
    console.error('Reseed error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
