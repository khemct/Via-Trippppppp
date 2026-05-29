INSERT INTO place_category_config (category_name, default_stop_duration_minutes) VALUES
  ('restaurant', 45),
  ('cafe', 45),
  ('viewpoint', 20),
  ('photo_spot', 20),
  ('tourist_attraction', 60),
  ('gas_station', 15),
  ('rest_stop', 15),
  ('cultural_site', 30),
  ('park', 30),
  ('museum', 60),
  ('shopping', 45),
  ('lodging', 10),
  ('other', 30)
ON CONFLICT (category_name) DO NOTHING;
