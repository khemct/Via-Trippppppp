CREATE TABLE IF NOT EXISTS place_category_config (
  category_id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name                 VARCHAR(50) NOT NULL UNIQUE,
  default_stop_duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_place_category_config_updated_at
  BEFORE UPDATE ON place_category_config
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
