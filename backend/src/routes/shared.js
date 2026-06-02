const express = require('express');
const { getSharedTrip } = require('../services/tripService');
const router = express.Router();

// GET /api/shared/:shareToken — public trip view (no auth)
router.get('/shared/:shareToken', async (req, res) => {
  try {
    const trip = await getSharedTrip(req.params.shareToken);

    const pool = req.app.locals.pool;
    const waypoints = await pool.query(
      `SELECT w.waypoint_id, w.place_id, w.stop_duration_minutes, w."order",
              c.name, ST_X(c.coordinates::geometry) AS lng, ST_Y(c.coordinates::geometry) AS lat,
              c.category, c.rating, c.photo_reference, c.distance_from_route, c.score
       FROM trip_waypoints w
       JOIN trip_places_cache c ON w.trip_id = c.trip_id AND w.place_id = c.place_id
       WHERE w.trip_id = $1
       ORDER BY w."order" ASC`,
      [trip.trip_id]
    );

    res.json({ trip, waypoints: waypoints.rows });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Shared trip not found' });
    }
    console.error('Get shared trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
