CREATE TABLE IF NOT EXISTS trip_places_cache (
  cache_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id            UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  place_id           VARCHAR(255) NOT NULL,
  name               VARCHAR(255) NOT NULL,
  coordinates        GEOGRAPHY(Point, 4326) NOT NULL,
  category           VARCHAR(50) NOT NULL,
  rating             DECIMAL(2, 1) DEFAULT 0,
  review_count       INTEGER DEFAULT 0,
  reviews            JSONB DEFAULT '[]'::jsonb,
  vicinity           VARCHAR(500),
  photo_reference    VARCHAR(500),
  opening_hours      JSONB,
  distance_from_route DECIMAL(10, 2) NOT NULL DEFAULT 0,
  score              DECIMAL(5, 2) NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trip_id, place_id)
);

CREATE INDEX idx_trip_places_cache_trip_id
  ON trip_places_cache (trip_id);

CREATE INDEX idx_trip_places_cache_trip_category
  ON trip_places_cache (trip_id, category);

CREATE INDEX idx_trip_places_cache_trip_score_place
  ON trip_places_cache (trip_id, score DESC, place_id);

CREATE INDEX idx_trip_places_cache_coordinates
  ON trip_places_cache USING GIST (coordinates);
