ALTER TABLE trip_places_cache
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
