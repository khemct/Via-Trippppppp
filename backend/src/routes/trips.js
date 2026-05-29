const express = require('express');
const { validate, required, minLength, maxLength, isIn } = require('../middleware/validate');
const { requireAuth } = require('../middleware/requireAuth');
const { createTrip, listTrips, getTrip, updateTrip, deleteTrip } = require('../services/tripService');

const router = express.Router();

const BLOCKED_FIELDS = ['origin', 'destination', 'origin_coordinates', 'dest_coordinates', 'route_polyline'];

// POST /api/trips — create a new trip with Directions API
router.post(
  '/',
  requireAuth,
  validate({
    name: [required, minLength(1), maxLength(200)],
    origin: [required, minLength(1), maxLength(500)],
    destination: [required, minLength(1), maxLength(500)],
    travel_date: [required],
    number_of_days: [required],
    travel_style: [isIn(['chill', 'foodie', 'photographer', 'adventure', 'budget'])],
  }),
  async (req, res) => {
    try {
      const { name, origin, destination, travel_date, number_of_days, daily_hours, travel_style, estimated_stop_duration } = req.body;

      const trip = await createTrip(req.user.id, {
        name,
        origin,
        destination,
        travel_date,
        number_of_days: parseInt(number_of_days, 10),
        daily_hours: daily_hours !== undefined ? parseInt(daily_hours, 10) : 10,
        travel_style: travel_style || 'chill',
        estimated_stop_duration: estimated_stop_duration !== undefined ? parseInt(estimated_stop_duration, 10) : 30,
      });

      res.status(201).json({ trip });
    } catch (err) {
      if (err.code === 'TOO_FAR') {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === 'ZERO_RESULTS' || err.code === 'API_ERROR') {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === 'API_KEY_MISSING') {
        console.error('GOOGLE_MAPS_API_KEY not configured');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      console.error('Create trip error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/trips — list user's trips
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const status = ['draft', 'saved'].includes(req.query.status) ? req.query.status : undefined;

    const result = await listTrips(req.user.id, page, limit, status);
    res.json(result);
  } catch (err) {
    console.error('List trips error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/trips/:tripId — get single trip
router.get('/:tripId', requireAuth, async (req, res) => {
  try {
    const trip = await getTrip(req.params.tripId, req.user.id);
    res.json({ trip });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (err.code === 'FORBIDDEN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    console.error('Get trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/trips/:tripId — update trip metadata
router.patch('/:tripId', requireAuth, async (req, res) => {
  try {
    const blocked = BLOCKED_FIELDS.filter(f => req.body[f] !== undefined);
    if (blocked.length > 0) {
      return res.status(400).json({
        error: 'Cannot modify route on existing trip. Create a new trip instead.',
        hint: 'POST /api/trips',
        blocked_fields: blocked,
      });
    }

    if (req.body.travel_style !== undefined) {
      const valid = ['chill', 'foodie', 'photographer', 'adventure', 'budget'];
      if (!valid.includes(req.body.travel_style)) {
        return res.status(400).json({
          error: 'Validation failed',
          details: [`travel_style must be one of: ${valid.join(', ')}`],
        });
      }
    }

    if (req.body.number_of_days !== undefined) {
      req.body.number_of_days = parseInt(req.body.number_of_days, 10);
    }
    if (req.body.daily_hours !== undefined) {
      req.body.daily_hours = parseInt(req.body.daily_hours, 10);
    }
    if (req.body.estimated_stop_duration !== undefined) {
      req.body.estimated_stop_duration = parseInt(req.body.estimated_stop_duration, 10);
    }

    const trip = await updateTrip(req.params.tripId, req.user.id, req.body);
    res.json({ trip });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (err.code === 'FORBIDDEN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (err.code === 'NO_UPDATES') {
      return res.status(400).json({ error: 'No fields to update' });
    }
    console.error('Update trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/trips/:tripId — delete trip
router.delete('/:tripId', requireAuth, async (req, res) => {
  try {
    await deleteTrip(req.params.tripId, req.user.id);
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (err.code === 'FORBIDDEN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    console.error('Delete trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
