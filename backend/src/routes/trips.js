const express = require('express');
const { validate, required, minLength, maxLength, isIn } = require('../middleware/validate');
const { requireAuth } = require('../middleware/requireAuth');
const { createTrip } = require('../services/tripService');

const router = express.Router();

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

module.exports = router;
