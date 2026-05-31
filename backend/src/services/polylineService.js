const polyline = require('@mapbox/polyline');

function decodePolyline(encoded) {
  if (!encoded) return [];
  return polyline.decode(encoded);
}

function samplePoints(points, intervalKm = 25) {
  if (!points || points.length === 0) return [];
  if (points.length === 1) return [{ lat: points[0][0], lng: points[0][1] }];

  const sampled = [{ lat: points[0][0], lng: points[0][1] }];
  let accumulated = 0;
  const intervalM = intervalKm * 1000;

  for (let i = 1; i < points.length; i++) {
    const dist = haversine(
      { lat: points[i - 1][0], lng: points[i - 1][1] },
      { lat: points[i][0], lng: points[i][1] }
    );
    accumulated += dist;
    if (accumulated >= intervalM) {
      sampled.push({ lat: points[i][0], lng: points[i][1] });
      accumulated = 0;
    }
  }

  const last = points[points.length - 1];
  sampled.push({ lat: last[0], lng: last[1] });

  return sampled;
}

function haversine(p1, p2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) *
      Math.cos(toRad(p2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function computeCumulativeDistances(points) {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const dist = haversine(
      { lat: points[i - 1][0], lng: points[i - 1][1] },
      { lat: points[i][0], lng: points[i][1] }
    );
    cum.push(cum[i - 1] + dist);
  }
  return cum;
}

function snapToPolyline(waypointCoord, points, cumDists) {
  let minDist = Infinity;
  let snapped = { lat: points[0][0], lng: points[0][1] };
  let cumulativeDist = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const a = { lat: points[i][0], lng: points[i][1] };
    const b = { lat: points[i + 1][0], lng: points[i + 1][1] };
    const closest = closestPointOnSegment(waypointCoord, a, b);
    const dist = haversine(waypointCoord, closest);
    if (dist < minDist) {
      minDist = dist;
      snapped = closest;
      const segLen = haversine(a, b);
      const frac = segLen > 0 ? haversine(a, closest) / segLen : 0;
      cumulativeDist = cumDists[i] + frac * (cumDists[i + 1] - cumDists[i]);
    }
  }

  return { snappedPoint: snapped, cumulativeDist };
}

function closestPointOnSegment(p, a, b) {
  const abx = b.lng - a.lng;
  const aby = b.lat - a.lat;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return a;
  let t = ((p.lng - a.lng) * abx + (p.lat - a.lat) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  return { lat: a.lat + t * aby, lng: a.lng + t * abx };
}

function distanceFromRoute(coord, points) {
  let minDist = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const a = { lat: points[i][0], lng: points[i][1] };
    const b = { lat: points[i + 1][0], lng: points[i + 1][1] };
    const closest = closestPointOnSegment(coord, a, b);
    const dist = haversine(coord, closest);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

module.exports = {
  decodePolyline,
  samplePoints,
  haversine,
  computeCumulativeDistances,
  snapToPolyline,
  closestPointOnSegment,
  distanceFromRoute,
};
