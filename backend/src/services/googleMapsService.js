const https = require('https');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';

async function getDirections(origin, destination) {
  if (!API_KEY || API_KEY === 'your_key_here') {
    throw Object.assign(new Error('Google Maps API key not configured'), { code: 'API_KEY_MISSING' });
  }

  const url = `${DIRECTIONS_URL}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${API_KEY}`;

  const body = await fetchJson(url);

  if (body.status !== 'OK') {
    if (body.status === 'ZERO_RESULTS') {
      throw Object.assign(new Error('Could not find a route between these locations'), { code: 'ZERO_RESULTS' });
    }
    throw Object.assign(new Error(`Directions API error: ${body.status}`), { code: 'API_ERROR', status: body.status });
  }

  const route = body.routes[0];
  const leg = route.legs[0];

  return {
    distance_km: Math.round((leg.distance.value / 1000) * 100) / 100,
    duration_minutes: Math.round(leg.duration.value / 60),
    polyline: route.overview_polyline.points,
    origin_lat: leg.start_location.lat,
    origin_lng: leg.start_location.lng,
    dest_lat: leg.end_location.lat,
    dest_lng: leg.end_location.lng,
  };
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    https.get(url, { signal: controller.signal }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response from Directions API'));
        }
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        reject(Object.assign(new Error('Directions API timed out'), { code: 'TIMEOUT' }));
      } else {
        reject(Object.assign(new Error(`Directions API request failed: ${err.message}`), { code: 'NETWORK_ERROR' }));
      }
    });
  });
}

module.exports = { getDirections };
