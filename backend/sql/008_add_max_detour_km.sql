ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS max_detour_km NUMERIC(4,1) NOT NULL DEFAULT 3
  CHECK (max_detour_km >= 0.5 AND max_detour_km <= 50);
