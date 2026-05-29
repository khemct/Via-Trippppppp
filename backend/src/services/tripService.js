const { query } = require('../config/database');
const { getDirections } = require('./googleMapsService');

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
     RETURNING
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
       created_at, updated_at`,
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

  const row = result.rows[0];

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
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

module.exports = { createTrip };
