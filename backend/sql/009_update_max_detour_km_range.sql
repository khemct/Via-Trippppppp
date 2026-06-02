DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'trips_max_detour_km_check'
    AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER TABLE trips DROP CONSTRAINT trips_max_detour_km_check;
  END IF;
END $$;

ALTER TABLE trips ADD CONSTRAINT trips_max_detour_km_ck
  CHECK (max_detour_km >= 0.5 AND max_detour_km <= 10);
