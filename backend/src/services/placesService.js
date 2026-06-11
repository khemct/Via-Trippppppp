const crypto = require('crypto');
const { haversine, decodePolyline } = require('./polylineService');

const CATEGORY_MAP = {
  restaurant: 'restaurant', food: 'restaurant', meal_takeaway: 'restaurant', meal_delivery: 'restaurant',
  cafe: 'cafe', bakery: 'cafe',
  tourist_attraction: 'attraction', point_of_interest: 'attraction',
  park: 'park', campground: 'park', natural_feature: 'park',
  museum: 'museum', art_gallery: 'museum', library: 'museum',
  shopping_mall: 'shopping', store: 'shopping', supermarket: 'shopping', clothing_store: 'shopping', department_store: 'shopping',
  lodging: 'accommodation', hotel: 'accommodation', motel: 'accommodation', campground: 'accommodation',
  gas_station: 'gas_station', car_repair: 'gas_station',
  bar: 'restaurant', night_club: 'restaurant',
  spa: 'attraction', gym: 'attraction', beauty_salon: 'attraction',
  bus_station: 'gas_station', train_station: 'gas_station', airport: 'gas_station',
  locality: 'attraction', neighborhood: 'attraction', administrative_area_level_3: 'attraction',
};

const CATEGORY_WEIGHTS = {
  rating: 0.25, popularity: 0.20, proximity: 0.25, category: 0.30,
};

const STYLE_SCORES = {
  chill: { restaurant: 80, cafe: 90, park: 85, museum: 60, shopping: 70, attraction: 75, accommodation: 50, gas_station: 20, cafe: 90 },
  foodie: { restaurant: 100, cafe: 85, park: 40, museum: 30, shopping: 50, attraction: 60, accommodation: 30, gas_station: 10, cafe: 85 },
  photographer: { restaurant: 50, cafe: 60, park: 90, museum: 70, shopping: 40, attraction: 100, accommodation: 40, gas_station: 10, cafe: 60 },
  adventure: { restaurant: 50, cafe: 40, park: 70, museum: 30, shopping: 30, attraction: 90, accommodation: 40, gas_station: 30, cafe: 40 },
  budget: { restaurant: 70, cafe: 60, park: 80, museum: 50, shopping: 40, attraction: 70, accommodation: 60, gas_station: 40, cafe: 60 },
};

const STYLE_RADIUS = {
  chill: 5000, foodie: 3000, photographer: 8000, adventure: 10000, budget: 5000,
};

function getSearchRadius(travelStyle) {
  return STYLE_RADIUS[travelStyle] || 5000;
}

function mapGoogleCategory(googleTypes) {
  if (!googleTypes || !googleTypes.length) return 'attraction';
  for (const t of googleTypes) {
    if (CATEGORY_MAP[t]) return CATEGORY_MAP[t];
  }
  return 'attraction';
}

function computeScore(place, travelStyle, maxDetourKm = 3) {
  const { rating = 0, user_ratings_total = 0, distance_from_route = 99999, category = 'attraction' } = place;

  const maxDetourM = maxDetourKm * 1000;
  const normRating = Math.min(rating / 5, 1);
  const popularity = Math.min(Math.log10(user_ratings_total + 1) / 4, 1);
  const proximity = distance_from_route < maxDetourM ? 1 : Math.max(0, 1 - (distance_from_route - maxDetourM) / maxDetourM);
  const styleAffinity = (STYLE_SCORES[travelStyle] && STYLE_SCORES[travelStyle][category]) || 50;

  const raw =
    CATEGORY_WEIGHTS.rating * normRating +
    CATEGORY_WEIGHTS.popularity * popularity +
    CATEGORY_WEIGHTS.proximity * proximity +
    CATEGORY_WEIGHTS.category * (styleAffinity / 100);

  return Math.round(raw * 100);
}

function computeFilterHash(category, ratingMin, sortBy, sortOrder) {
  const raw = `${category || ''}|${ratingMin || 0}|${sortBy || 'score'}|${sortOrder || 'desc'}`;
  return crypto.createHash('md5').update(raw).digest('hex');
}

async function fetchNearbyPlaces(lat, lng, radiusM, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusM}&key=${apiKey}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    throw Object.assign(new Error(`Places API error: ${response.statusText}`), { code: 'API_ERROR', status: response.status });
  }
  const data = await response.json();
  if (data.status === 'REQUEST_DENIED') {
    throw Object.assign(new Error(`Places API denied: ${data.error_message}`), { code: 'API_DENIED' });
  }
  if (data.status === 'OVER_QUERY_LIMIT') {
    throw Object.assign(new Error('Places API query limit exceeded'), { code: 'QUOTA_EXCEEDED' });
  }
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw Object.assign(new Error(`Places API error: ${data.status} ${data.error_message || ''}`), { code: 'API_ERROR' });
  }
  return data.results || [];
}

async function seedTripCache(tripId, polylineEncoded, travelStyle, maxDetourKm, pool) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw Object.assign(new Error('GOOGLE_MAPS_API_KEY not configured'), { code: 'API_KEY_MISSING' });

  const points = decodePolyline(polylineEncoded);
  if (points.length < 2) throw Object.assign(new Error('Invalid polyline'), { code: 'INVALID_POLYLINE' });

  const { samplePoints, computeCumulativeDistances } = require('./polylineService');
  const BATCH_SIZE = 3;

  const styleRadius = getSearchRadius(travelStyle);
  const radius = Math.max(1000, Math.min(styleRadius, maxDetourKm * 1000));
  const cumDists = computeCumulativeDistances(points);
  const totalRouteKm = cumDists[cumDists.length - 1] / 1000;
  const idealIntervalKm = Math.max(1, (radius * 2) / 1000);
  const idealCount = Math.ceil(totalRouteKm / idealIntervalKm);
  const clampedCount = Math.max(6, Math.min(25, idealCount));
  const actualIntervalKm = Math.max(1, totalRouteKm / clampedCount);
  const samples = samplePoints(points, actualIntervalKm);
  const allPlaces = new Map();

  for (let i = 0; i < samples.length; i += BATCH_SIZE) {
    const batch = samples.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(s => fetchNearbyPlaces(s.lat, s.lng, radius, apiKey))
    );
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const place of result.value) {
          if (!allPlaces.has(place.place_id)) {
            const coords = place.geometry?.location || {};
            const googlePhotos = place.photos || [];
            const photoRefs = googlePhotos.map(p => p.photo_reference).filter(Boolean);
            allPlaces.set(place.place_id, {
              place_id: place.place_id,
              name: place.name,
              lat: coords.lat,
              lng: coords.lng,
              category: mapGoogleCategory(place.types),
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
              vicinity: place.vicinity || '',
              photo_reference: photoRefs.length > 0 ? photoRefs[0] : null,
              photos: photoRefs,
              opening_hours: place.opening_hours || null,
              types: place.types ? place.types.join(',') : '',
            });
          }
        }
      }
    }
  }

  const placesArray = [...allPlaces.values()];

  for (const place of placesArray) {
    place.distance_from_route = computeMinDistance(
      { lat: place.lat, lng: place.lng },
      points
    );
  }

  const filtered = placesArray.filter(p => p.distance_from_route <= maxDetourKm * 1000 * 2);

  for (const place of filtered) {
    place.score = computeScore(place, travelStyle, maxDetourKm);
  }

    const BATCH_INSERT_SIZE = 50;
    for (let i = 0; i < filtered.length; i += BATCH_INSERT_SIZE) {
      const batch = filtered.slice(i, i + BATCH_INSERT_SIZE);
      const values = batch.map((p, idx) => {
        const offset = idx * 15;
        return `($${offset + 1},$${offset + 2},$${offset + 3},ST_SetSRID(ST_MakePoint($${offset + 4},$${offset + 5}),4326),$${offset + 6},$${offset + 7},$${offset + 8}::jsonb,$${offset + 9},$${offset + 10}::jsonb,$${offset + 11},$${offset + 12},$${offset + 13},$${offset + 14},$${offset + 15}::jsonb)`;
      }).join(',');

      const params = [];
      for (const p of batch) {
        params.push(
          tripId, p.place_id, p.name,
          p.lng, p.lat,
          p.category,
          p.rating,
          JSON.stringify([]),
          p.photo_reference || null,
          JSON.stringify(p.opening_hours || {}),
          Math.round(p.distance_from_route),
          p.score,
          (p.vicinity || '').substring(0, 500),
          p.user_ratings_total || 0,
          JSON.stringify(p.photos || [])
        );
      }

      await pool.query(
        `INSERT INTO trip_places_cache (trip_id, place_id, name, coordinates, category, rating, reviews, photo_reference, opening_hours, distance_from_route, score, vicinity, review_count, photos)
         VALUES ${values}
         ON CONFLICT (trip_id, place_id) DO UPDATE SET
           score = EXCLUDED.score,
           distance_from_route = EXCLUDED.distance_from_route,
           photo_reference = EXCLUDED.photo_reference,
           photos = EXCLUDED.photos,
           name = EXCLUDED.name,
           rating = EXCLUDED.rating,
           category = EXCLUDED.category,
           vicinity = EXCLUDED.vicinity,
           opening_hours = EXCLUDED.opening_hours,
           review_count = EXCLUDED.review_count`,
        params
      );
    }

  return { count: filtered.length };
}

function computeMinDistance(coord, points) {
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

function closestPointOnSegment(p, a, b) {
  const abx = b.lng - a.lng;
  const aby = b.lat - a.lat;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return a;
  let t = ((p.lng - a.lng) * abx + (p.lat - a.lat) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  return { lat: a.lat + t * aby, lng: a.lng + t * abx };
}

async function getRecommendations(tripId, filters = {}, pool) {
  const { category, rating_min = 0, sort_by = 'score', sort_order = 'desc', cursor, limit: reqLimit = 20 } = filters;
  const limit = Math.min(100, Math.max(1, parseInt(reqLimit, 10) || 20));

  let decodedCursor = null;
  let filterHash = null;
  if (cursor) {
    try {
      const buf = Buffer.from(cursor, 'base64').toString('utf8');
      decodedCursor = JSON.parse(buf);
      const expectedHash = computeFilterHash(category, rating_min, sort_by, sort_order);
      if (decodedCursor.filter_hash !== expectedHash) {
        decodedCursor = null;
      }
    } catch {
      decodedCursor = null;
    }
  }

  if (!decodedCursor) {
    filterHash = computeFilterHash(category, rating_min, sort_by, sort_order);
  }

  const params = [tripId, limit + 1];
  let idx = 2;
  const conditions = [];

  if (category) {
    idx++;
    params.push(category);
    conditions.push(`c.category = $${idx}`);
  }
  if (rating_min > 0) {
    idx++;
    params.push(rating_min);
    conditions.push(`c.rating >= $${idx}`);
  }

  if (decodedCursor) {
    idx++;
    params.push(decodedCursor.score);
    if (sort_order === 'desc') {
      idx++;
      params.push(decodedCursor.place_id);
      conditions.push(`(c.score < $${idx - 1} OR (c.score = $${idx - 1} AND c.place_id > $${idx}))`);
    } else {
      idx++;
      params.push(decodedCursor.place_id);
      conditions.push(`(c.score > $${idx - 1} OR (c.score = $${idx - 1} AND c.place_id > $${idx}))`);
    }
  }

  const whereClause = conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : '';

  const orderDir = sort_order === 'asc' ? 'ASC' : 'DESC';
  const orderField = sort_by === 'distance' ? 'c.distance_from_route' : 'c.score';

  const sql = `
    SELECT c.cache_id, c.place_id, c.name,
           ST_X(c.coordinates::geometry) AS lng, ST_Y(c.coordinates::geometry) AS lat,
           c.category, c.rating, c.review_count,
           c.photo_reference, c.photos, c.opening_hours, c.vicinity, c.distance_from_route, c.score,
           c.reviews
    FROM trip_places_cache c
    WHERE c.trip_id = $1 ${whereClause}
    ORDER BY ${orderField} ${orderDir}, c.place_id ASC
    LIMIT $2
  `;

  const result = await pool.query(sql, params);
  const rows = result.rows;
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  let nextCursor = null;
  if (hasMore) {
    const last = rows[rows.length - 1];
    const cursorPayload = {
      score: last.score,
      place_id: last.place_id,
      filter_hash: filterHash || computeFilterHash(category, rating_min, sort_by, sort_order),
    };
    nextCursor = Buffer.from(JSON.stringify(cursorPayload)).toString('base64');
  }

  return { places: rows, has_more: hasMore, next_cursor: nextCursor };
}

async function reseedTripCache(tripId, pool) {
  const tripResult = await pool.query(
    `SELECT route_polyline, travel_style, max_detour_km FROM trips WHERE trip_id = $1`,
    [tripId]
  );
  if (tripResult.rows.length === 0) {
    throw Object.assign(new Error('Trip not found'), { code: 'NOT_FOUND' });
  }
  const { route_polyline, travel_style, max_detour_km } = tripResult.rows[0];
  if (!route_polyline) {
    throw Object.assign(new Error('Trip has no route'), { code: 'NO_ROUTE' });
  }

  await pool.query('DELETE FROM trip_places_cache WHERE trip_id = $1', [tripId]);
  return seedTripCache(tripId, route_polyline, travel_style, parseFloat(max_detour_km) || 3, pool);
}

const guestMemoryCache = new Map();
const GUEST_CACHE_TTL = 30 * 60 * 1000;

async function seedGuestCache(routePolyline, travelStyle, pool) {
  const hash = crypto.createHash('sha256').update(routePolyline + travelStyle).digest('hex');
  const cached = guestMemoryCache.get(hash);
  if (cached && Date.now() - cached.cachedAt < GUEST_CACHE_TTL) {
    return { places: cached.places, from_cache: true };
  }

  const result = await seedTripCache('guest_' + hash, routePolyline, travelStyle, 3, pool);
  const places = await pool.query(
    `SELECT cache_id, place_id, name,
            ST_X(coordinates::geometry) AS lng, ST_Y(coordinates::geometry) AS lat,
            category, rating, review_count, user_ratings_total,
            photo_reference, photos, opening_hours, distance_from_route, score,
            reviews
     FROM trip_places_cache WHERE trip_id = $1
     ORDER BY score DESC, place_id ASC`,
    ['guest_' + hash]
  );

  guestMemoryCache.set(hash, { places: places.rows, cachedAt: Date.now() });
  return { places: places.rows, from_cache: false };
}

module.exports = {
  seedTripCache,
  getRecommendations,
  reseedTripCache,
  seedGuestCache,
  fetchNearbyPlaces,
  mapGoogleCategory,
  computeScore,
  computeFilterHash,
};
