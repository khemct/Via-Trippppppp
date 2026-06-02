const { query } = require('../config/database');
const { getDirections } = require('./googleMapsService');

const TRIP_SELECT = `
  trip_id, user_id, name, origin, destination,
  ST_X(origin_coordinates::geometry) AS origin_lng,
  ST_Y(origin_coordinates::geometry) AS origin_lat,
  ST_X(dest_coordinates::geometry) AS dest_lng,
  ST_Y(dest_coordinates::geometry) AS dest_lat,
  travel_date, number_of_days, daily_hours,
  travel_style, estimated_stop_duration,
  route_polyline, total_distance_km,
  total_duration_minutes, total_duration_estimate,
  status, feasibility_status,
  share_token, shared_at,
  created_at, updated_at
`;

function rowToTrip(row) {
  return {
    trip_id: row.trip_id,
    user_id: row.user_id,
    name: row.name,
    origin: row.origin,
    destination: row.destination,
    origin_coordinates: {
      latitude: parseFloat(row.origin_lat),
      longitude: parseFloat(row.origin_lng),
    },
    dest_coordinates: {
      latitude: parseFloat(row.dest_lat),
      longitude: parseFloat(row.dest_lng),
    },
    travel_date: row.travel_date,
    number_of_days: row.number_of_days,
    daily_hours: row.daily_hours,
    travel_style: row.travel_style,
    estimated_stop_duration: row.estimated_stop_duration,
    route_polyline: row.route_polyline,
    total_distance_km: parseFloat(row.total_distance_km),
    total_duration_minutes: row.total_duration_minutes,
    total_duration_estimate: row.total_duration_estimate,
    status: row.status,
    feasibility_status: row.feasibility_status,
    share_token: row.share_token || null,
    shared_at: row.shared_at || null,
    waypoint_count: parseInt(row.waypoint_count, 10) || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function createTrip(userId, input) {
  const data = await getDirections(input.origin, input.destination);

  if (data.distance_km > 300) {
    throw Object.assign(
      new Error(`Route exceeds maximum distance of 300 km (${data.distance_km} km)`),
      { code: 'TOO_FAR' }
    );
  }

  const result = await query(
    `INSERT INTO trips (
       user_id, name, origin, destination,
       origin_coordinates, dest_coordinates,
       travel_date, number_of_days, daily_hours,
       travel_style, estimated_stop_duration,
       route_polyline, total_distance_km,
       total_duration_minutes, feasibility_status
     ) VALUES (
       $1, $2, $3, $4,
       ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography,
       ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography,
       $9, $10, $11,
       $12, $13,
       $14, $15,
       $16, 'feasible'
     )
     RETURNING ${TRIP_SELECT}`,
    [
      userId, input.name.trim(), input.origin.trim(), input.destination.trim(),
      data.origin_lng, data.origin_lat,
      data.dest_lng, data.dest_lat,
      input.travel_date, input.number_of_days,
      input.daily_hours || 10,
      input.travel_style || 'chill',
      input.estimated_stop_duration || 30,
      data.polyline,
      data.distance_km,
      data.duration_minutes,
    ]
  );

  return rowToTrip(result.rows[0]);
}

async function listTrips(userId, page = 1, limit = 20, status) {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIdx = 2;

  if (status) {
    conditions.push(`status = $${paramIdx}`);
    params.push(status);
    paramIdx++;
  }

  const where = conditions.join(' AND ');

  const countResult = await query(
    `SELECT COUNT(*) FROM trips WHERE ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT ${TRIP_SELECT},
            (SELECT COUNT(*) FROM trip_waypoints WHERE trip_id = t.trip_id) AS waypoint_count
     FROM trips t
     WHERE ${where}
     ORDER BY created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  );

  return {
    trips: result.rows.map(rowToTrip),
    total,
    page,
    limit,
  };
}

async function getTrip(tripId, userId) {
  const result = await query(
    `SELECT ${TRIP_SELECT},
            (SELECT COUNT(*) FROM trip_waypoints WHERE trip_id = $1) AS waypoint_count
     FROM trips WHERE trip_id = $1`,
    [tripId]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Trip not found'), { code: 'NOT_FOUND' });
  }

  const trip = result.rows[0];

  if (trip.user_id !== userId) {
    throw Object.assign(new Error('Not authorized'), { code: 'FORBIDDEN' });
  }

  return rowToTrip(trip);
}

async function updateTrip(tripId, userId, input) {
  const existing = await query('SELECT user_id FROM trips WHERE trip_id = $1', [tripId]);

  if (existing.rows.length === 0) {
    throw Object.assign(new Error('Trip not found'), { code: 'NOT_FOUND' });
  }

  if (existing.rows[0].user_id !== userId) {
    throw Object.assign(new Error('Not authorized'), { code: 'FORBIDDEN' });
  }

  const sets = [];
  const params = [];
  let idx = 1;

  const allowedFields = {
    name: 'name',
    travel_date: 'travel_date',
    number_of_days: 'number_of_days',
    daily_hours: 'daily_hours',
    travel_style: 'travel_style',
    estimated_stop_duration: 'estimated_stop_duration',
    status: 'status',
  };

  for (const [field, col] of Object.entries(allowedFields)) {
    if (input[field] !== undefined) {
      sets.push(`${col} = $${idx}`);
      params.push(input[field]);
      idx++;
    }
  }

  if (sets.length === 0) {
    throw Object.assign(new Error('No fields to update'), { code: 'NO_UPDATES' });
  }

  params.push(tripId);
  const result = await query(
    `UPDATE trips SET ${sets.join(', ')}
     WHERE trip_id = $${idx}
     RETURNING ${TRIP_SELECT}`,
    params
  );

  return rowToTrip(result.rows[0]);
}

async function deleteTrip(tripId, userId) {
  const existing = await query('SELECT user_id FROM trips WHERE trip_id = $1', [tripId]);

  if (existing.rows.length === 0) {
    throw Object.assign(new Error('Trip not found'), { code: 'NOT_FOUND' });
  }

  if (existing.rows[0].user_id !== userId) {
    throw Object.assign(new Error('Not authorized'), { code: 'FORBIDDEN' });
  }

  await query('DELETE FROM trips WHERE trip_id = $1', [tripId]);
}

async function generateShareToken(tripId, userId) {
  const existing = await query('SELECT user_id, share_token FROM trips WHERE trip_id = $1', [tripId]);
  if (existing.rows.length === 0) {
    throw Object.assign(new Error('Trip not found'), { code: 'NOT_FOUND' });
  }
  if (existing.rows[0].user_id !== userId) {
    throw Object.assign(new Error('Not authorized'), { code: 'FORBIDDEN' });
  }

  if (existing.rows[0].share_token) {
    return { share_token: existing.rows[0].share_token };
  }

  const crypto = require('crypto');
  const shareToken = crypto.randomUUID();
  const result = await query(
    `UPDATE trips SET share_token = $1, shared_at = NOW()
     WHERE trip_id = $2
     RETURNING share_token`,
    [shareToken, tripId]
  );

  return { share_token: result.rows[0].share_token };
}

async function revokeShareToken(tripId, userId) {
  const existing = await query('SELECT user_id FROM trips WHERE trip_id = $1', [tripId]);
  if (existing.rows.length === 0) {
    throw Object.assign(new Error('Trip not found'), { code: 'NOT_FOUND' });
  }
  if (existing.rows[0].user_id !== userId) {
    throw Object.assign(new Error('Not authorized'), { code: 'FORBIDDEN' });
  }

  await query(
    `UPDATE trips SET share_token = NULL, shared_at = NULL WHERE trip_id = $1`,
    [tripId]
  );

  return { message: 'Share token revoked' };
}

async function getSharedTrip(shareToken) {
  const result = await query(
    `SELECT ${TRIP_SELECT},
            (SELECT COUNT(*) FROM trip_waypoints WHERE trip_id = t.trip_id) AS waypoint_count
     FROM trips t WHERE share_token = $1`,
    [shareToken]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Shared trip not found'), { code: 'NOT_FOUND' });
  }

  return rowToTrip(result.rows[0]);
}

module.exports = { createTrip, listTrips, getTrip, updateTrip, deleteTrip, generateShareToken, revokeShareToken, getSharedTrip };
