const { decodePolyline, haversine, closestPointOnSegment } = require('./polylineService');

async function assessFeasibility(tripId, pool) {
  const tripResult = await pool.query(
    `SELECT number_of_days, daily_hours, estimated_stop_duration, route_polyline, max_detour_km
     FROM trips WHERE trip_id = $1`,
    [tripId]
  );
  if (tripResult.rows.length === 0) {
    throw Object.assign(new Error('Trip not found'), { code: 'NOT_FOUND' });
  }
  const trip = tripResult.rows[0];
  const maxDetourM = (parseFloat(trip.max_detour_km) || 3) * 1000;
  if (!trip.route_polyline) {
    return { status: 'feasible', details: { message: 'No route defined yet', note: 'feasibility_needs_route' } };
  }

  const waypointsResult = await pool.query(
    `SELECT w.waypoint_id, w.place_id, w.stop_duration_minutes, w."order",
            c.name, c.coordinates, c.distance_from_route, c.category
     FROM trip_waypoints w
     JOIN trip_places_cache c ON w.trip_id = c.trip_id AND w.place_id = c.place_id
     WHERE w.trip_id = $1
     ORDER BY w."order" ASC`,
    [tripId]
  );
  const waypoints = waypointsResult.rows;

  if (waypoints.length === 0) {
    return { status: 'feasible', details: { message: 'No waypoints yet' } };
  }

  const nearRoute = waypoints.filter(w => w.distance_from_route < maxDetourM);
  const detours = waypoints.filter(w => w.distance_from_route >= maxDetourM);

  const totalDetourMeters = detours.reduce((sum, w) => sum + w.distance_from_route * 2, 0);
  const totalStopMinutes = waypoints.reduce((sum, w) => sum + (w.stop_duration_minutes || 30), 0);
  const availableMinutes = trip.number_of_days * trip.daily_hours * 60;
  const detourTimeMinutes = totalDetourMeters / 1000;
  const totalRequiredMinutes = totalStopMinutes + detourTimeMinutes;

  const utilization = availableMinutes > 0 ? totalRequiredMinutes / availableMinutes : 1;

  let status;
  if (utilization <= 0.85) {
    status = 'feasible';
  } else if (utilization <= 1.0) {
    status = 'tight';
  } else {
    status = 'at_risk';
  }

  return {
    status,
    details: {
      total_waypoints: waypoints.length,
      near_route: nearRoute.length,
      detours: detours.length,
      total_detour_distance_m: Math.round(totalDetourMeters),
      total_stop_minutes: totalStopMinutes,
      detour_time_minutes: Math.round(detourTimeMinutes),
      available_minutes: availableMinutes,
      required_minutes: Math.round(totalRequiredMinutes),
      utilization_pct: Math.round(utilization * 100),
    },
  };
}

function assessWaypointFeasibility(place, maxDetourKm = 3) {
  if (!place) return null;
  const dist = place.distance_from_route || 99999;
  const maxDetourM = maxDetourKm * 1000;
  const isDetour = dist >= maxDetourM;
  return {
    distance_from_route: Math.round(dist),
    category: place.category,
    name: place.name,
    is_detour: isDetour,
    estimated_detour_time_minutes: isDetour ? Math.round((2 * dist) / 1000) : 0,
  };
}

module.exports = { assessFeasibility, assessWaypointFeasibility };
