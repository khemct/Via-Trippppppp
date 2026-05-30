CREATE TABLE IF NOT EXISTS trip_waypoints (
  waypoint_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id               UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  place_id              VARCHAR(255) NOT NULL,
  "order"               INTEGER NOT NULL,
  stop_duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trip_id, "order"),
  UNIQUE(trip_id, place_id)
);

CREATE INDEX idx_trip_waypoints_trip_id
  ON trip_waypoints (trip_id);

CREATE INDEX idx_trip_waypoints_order
  ON trip_waypoints (trip_id, "order");
