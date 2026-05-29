CREATE TABLE trips (
  trip_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                    VARCHAR(200) NOT NULL,
  origin                  TEXT NOT NULL,
  destination             TEXT NOT NULL,
  origin_coordinates      GEOGRAPHY(Point, 4326) NOT NULL,
  dest_coordinates        GEOGRAPHY(Point, 4326) NOT NULL,
  travel_date             DATE NOT NULL,
  number_of_days          INTEGER NOT NULL CHECK (number_of_days >= 1),
  daily_hours             INTEGER NOT NULL DEFAULT 10 CHECK (daily_hours >= 4 AND daily_hours <= 16),
  travel_style            VARCHAR(20) NOT NULL DEFAULT 'chill'
                            CHECK (travel_style IN ('chill', 'foodie', 'photographer', 'adventure', 'budget')),
  estimated_stop_duration INTEGER NOT NULL DEFAULT 30 CHECK (estimated_stop_duration >= 5),
  route_polyline          TEXT NOT NULL,
  total_distance_km       NUMERIC(8, 2) NOT NULL CHECK (total_distance_km > 0 AND total_distance_km <= 300),
  total_duration_minutes  INTEGER NOT NULL CHECK (total_duration_minutes > 0),
  total_duration_estimate INTEGER,
  status                  VARCHAR(10) NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'saved')),
  feasibility_status      VARCHAR(10) NOT NULL DEFAULT 'feasible'
                            CHECK (feasibility_status IN ('feasible', 'tight', 'at_risk')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trips_user_id ON trips (user_id);
CREATE INDEX idx_trips_travel_date ON trips (travel_date);
CREATE INDEX idx_trips_status ON trips (status);

CREATE TRIGGER trg_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
