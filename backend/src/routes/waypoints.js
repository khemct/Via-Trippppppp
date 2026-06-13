const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { assessFeasibility, assessWaypointFeasibility } = require('../services/feasibilityService');

async function refreshFeasibilityStatus(tripId, pool) {
  try {
    const result = await assessFeasibility(tripId, pool);
    await pool.query(
      'UPDATE trips SET feasibility_status = $1 WHERE trip_id = $2',
      [result.status, tripId]
    );
  } catch (err) {
    console.error('Failed to refresh feasibility:', err.message);
  }
}

const router = express.Router();

function getPool(req) {
  return req.app.locals.pool;
}

async function verifyTripOwnership(req, res, tripId) {
  try {
    const pool = getPool(req);
    const result = await pool.query(
      'SELECT user_id FROM trips WHERE trip_id = $1',
      [tripId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Trip not found' });
      return null;
    }
    if (result.rows[0].user_id !== req.user.id) {
      res.status(403).json({ error: 'Not authorized' });
      return null;
    }
    return true;
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
    return null;
  }
}

router.get('/:tripId/waypoints', requireAuth, async (req, res) => {
  const { tripId } = req.params;
  const pool = getPool(req);

  const ok = await verifyTripOwnership(req, res, tripId);
  if (!ok) return;

  try {
    const result = await pool.query(
      `SELECT w.waypoint_id, w.place_id, w.stop_duration_minutes, w."order",
              c.name, ST_X(c.coordinates::geometry) AS lng, ST_Y(c.coordinates::geometry) AS lat,
              c.category, c.rating, c.review_count, c.photo_reference, c.photos, c.distance_from_route, c.score
       FROM trip_waypoints w
       JOIN trip_places_cache c ON w.trip_id = c.trip_id AND w.place_id = c.place_id
       WHERE w.trip_id = $1
       ORDER BY w."order" ASC`,
      [tripId]
    );
    res.json({ waypoints: result.rows });
  } catch (err) {
    console.error('List waypoints error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:tripId/waypoints', requireAuth, async (req, res) => {
  const { tripId } = req.params;
  const { place_id, stop_duration_minutes } = req.body;
  const pool = getPool(req);

  const ok = await verifyTripOwnership(req, res, tripId);
  if (!ok) return;

  if (!place_id) {
    return res.status(400).json({ error: 'place_id is required' });
  }

  try {
    const placeResult = await pool.query(
      `SELECT place_id, name, distance_from_route, category
       FROM trip_places_cache WHERE trip_id = $1 AND place_id = $2`,
      [tripId, place_id]
    );
    if (placeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Place not found in cache. Seed recommendations first.' });
    }

    const existing = await pool.query(
      `SELECT waypoint_id FROM trip_waypoints WHERE trip_id = $1 AND place_id = $2`,
      [tripId, place_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Place already in itinerary' });
    }

    const maxOrder = await pool.query(
      `SELECT COALESCE(MAX("order"), 0) AS max_order FROM trip_waypoints WHERE trip_id = $1`,
      [tripId]
    );
    const nextOrder = maxOrder.rows[0].max_order + 1;
    const stopDur = stop_duration_minutes != null ? Math.max(5, Math.min(180, parseInt(stop_duration_minutes, 10) || 30)) : 30;

    const result = await pool.query(
      `INSERT INTO trip_waypoints (trip_id, place_id, "order", stop_duration_minutes)
       VALUES ($1, $2, $3, $4)
       RETURNING waypoint_id, place_id, "order", stop_duration_minutes`,
      [tripId, place_id, nextOrder, stopDur]
    );

    const place = placeResult.rows[0];
    const detourRow = await pool.query(
      'SELECT max_detour_km FROM trips WHERE trip_id = $1',
      [tripId]
    );
    const maxDetourKm = parseFloat(detourRow.rows[0]?.max_detour_km) || 3;
    const wpFeasibility = assessWaypointFeasibility(place, maxDetourKm);

    res.status(201).json({
      waypoint: { ...result.rows[0], ...place },
      feasibility: wpFeasibility,
    });
    refreshFeasibilityStatus(tripId, pool);
  } catch (err) {
    console.error('Add waypoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:tripId/waypoints/:waypointId', requireAuth, async (req, res) => {
  const { tripId, waypointId } = req.params;
  const pool = getPool(req);

  const ok = await verifyTripOwnership(req, res, tripId);
  if (!ok) return;

  try {
    const allowedFields = {};
    if (req.body.stop_duration_minutes !== undefined) {
      const v = parseInt(req.body.stop_duration_minutes, 10);
      if (isNaN(v) || v < 5 || v > 180) {
        return res.status(400).json({ error: 'stop_duration_minutes must be between 5 and 180' });
      }
      allowedFields.stop_duration_minutes = v;
    }
    if (req.body.order !== undefined) {
      const v = parseInt(req.body.order, 10);
      if (isNaN(v) || v < 1) {
        return res.status(400).json({ error: 'order must be a positive integer' });
      }
      allowedFields["order"] = v;
    }

    if (Object.keys(allowedFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const setClauses = [];
    const params = [];
    let idx = 1;
    for (const [key, value] of Object.entries(allowedFields)) {
      setClauses.push(`"${key}" = $${idx}`);
      params.push(value);
      idx++;
    }
    params.push(waypointId);
    params.push(tripId);

    const result = await pool.query(
      `UPDATE trip_waypoints SET ${setClauses.join(', ')}
       WHERE waypoint_id = $${idx} AND trip_id = $${idx + 1}
       RETURNING waypoint_id, place_id, "order", stop_duration_minutes`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' });
    }

    res.json({ waypoint: result.rows[0] });
    refreshFeasibilityStatus(tripId, pool);
  } catch (err) {
    console.error('Update waypoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:tripId/waypoints/:waypointId', requireAuth, async (req, res) => {
  const { tripId, waypointId } = req.params;
  const pool = getPool(req);

  const ok = await verifyTripOwnership(req, res, tripId);
  if (!ok) return;

  try {
    const result = await pool.query(
      `DELETE FROM trip_waypoints WHERE waypoint_id = $1 AND trip_id = $2
       RETURNING "order"`,
      [waypointId, tripId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' });
    }

    const deletedOrder = result.rows[0].order;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE trip_waypoints SET "order" = "order" + 1000000
         WHERE trip_id = $1 AND "order" > $2`,
        [tripId, deletedOrder]
      );

      await client.query(
        `UPDATE trip_waypoints SET "order" = "order" - 1000001
         WHERE trip_id = $1 AND "order" > $2`,
        [tripId, deletedOrder + 1000000]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ message: 'Waypoint removed' });
    refreshFeasibilityStatus(tripId, pool);
  } catch (err) {
    console.error('Delete waypoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:tripId/waypoints/reorder', requireAuth, async (req, res) => {
  const { tripId } = req.params;
  const { order } = req.body;
  const pool = getPool(req);

  const ok = await verifyTripOwnership(req, res, tripId);
  if (!ok) return;

  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ error: 'order array is required' });
  }

  for (const item of order) {
    if (!item.waypoint_id || typeof item.order !== 'number' || item.order < 1) {
      return res.status(400).json({ error: 'Each item must have waypoint_id and positive integer order' });
    }
  }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query(
          `UPDATE trip_waypoints SET "order" = "order" + 1000000 WHERE trip_id = $1`,
          [tripId]
        );

        for (const item of order) {
          await client.query(
            `UPDATE trip_waypoints SET "order" = $1 WHERE waypoint_id = $2 AND trip_id = $3`,
            [item.order, item.waypoint_id, tripId]
          );
        }

        const waypointIds = order.map((o) => o.waypoint_id);
        const maxOrder = order.reduce((max, o) => Math.max(max, o.order), 0);
        const missingResult = await client.query(
          `SELECT waypoint_id FROM trip_waypoints
           WHERE trip_id = $1 AND waypoint_id <> ALL($2)
           ORDER BY "order" ASC`,
          [tripId, waypointIds]
        );

        let nextOrder = maxOrder;
        for (const row of missingResult.rows) {
          nextOrder++;
          await client.query(
            `UPDATE trip_waypoints SET "order" = $1 WHERE waypoint_id = $2 AND trip_id = $3`,
            [nextOrder, row.waypoint_id, tripId]
          );
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

    const result = await pool.query(
      `SELECT w.waypoint_id, w.place_id, w."order", w.stop_duration_minutes,
              c.name, c.category, c.rating, c.review_count, c.distance_from_route, c.score, c.photo_reference, c.photos
       FROM trip_waypoints w
       JOIN trip_places_cache c ON w.trip_id = c.trip_id AND w.place_id = c.place_id
       WHERE w.trip_id = $1
       ORDER BY w."order" ASC`,
      [tripId]
    );

    res.json({ waypoints: result.rows });
    refreshFeasibilityStatus(tripId, pool);
  } catch (err) {
    console.error('Reorder waypoints error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:tripId/waypoints/:waypointId/feasibility', requireAuth, async (req, res) => {
  const { tripId, waypointId } = req.params;
  const pool = getPool(req);

  const ok = await verifyTripOwnership(req, res, tripId);
  if (!ok) return;

  try {
    const result = await pool.query(
      `SELECT c.place_id, c.name, c.distance_from_route, c.category
       FROM trip_waypoints w
       JOIN trip_places_cache c ON w.trip_id = c.trip_id AND w.place_id = c.place_id
       WHERE w.waypoint_id = $1 AND w.trip_id = $2`,
      [waypointId, tripId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' });
    }

    const detourRow = await pool.query(
      'SELECT max_detour_km FROM trips WHERE trip_id = $1',
      [tripId]
    );
    const maxDetourKm = parseFloat(detourRow.rows[0]?.max_detour_km) || 3;
    const feasibility = assessWaypointFeasibility(result.rows[0], maxDetourKm);
    res.json({ feasibility });
  } catch (err) {
    console.error('Waypoint feasibility error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:tripId/feasibility', requireAuth, async (req, res) => {
  const { tripId } = req.params;
  const pool = getPool(req);

  const ok = await verifyTripOwnership(req, res, tripId);
  if (!ok) return;

  try {
    const result = await assessFeasibility(tripId, pool);
    res.json(result);
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Trip not found' });
    }
    console.error('Feasibility assessment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
