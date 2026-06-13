-- Fix waypoint orders corrupted by incomplete reorder requests.
-- The PUT /reorder endpoint bumped ALL waypoints by +1000000, then only updated
-- those in the order array. Waypoints not included kept the bumped order.
--
-- This script renumbers all waypoints per trip sequentially.

-- Step 1: move all waypoints out of the way (avoid unique violation)
UPDATE trip_waypoints SET "order" = -("order") WHERE "order" >= 1000000;

-- Step 2: get max valid order per trip
WITH trip_max AS (
  SELECT trip_id, COALESCE(MAX("order"), 0) AS max_order
  FROM trip_waypoints
  WHERE "order" < 1000000 AND "order" > 0
  GROUP BY trip_id
),
to_fix AS (
  SELECT
    w.waypoint_id,
    w.trip_id,
    tm.max_order + ROW_NUMBER() OVER (
      PARTITION BY w.trip_id
      ORDER BY w."order" ASC
    ) AS new_order
  FROM trip_waypoints w
  JOIN trip_max tm ON w.trip_id = tm.trip_id
  WHERE w."order" < 0
)
UPDATE trip_waypoints w
SET "order" = tf.new_order
FROM to_fix tf
WHERE w.waypoint_id = tf.waypoint_id;

-- Step 3: handle trips where ALL waypoints were corrupted (no valid max_order)
WITH all_corrupted AS (
  SELECT trip_id
  FROM trip_waypoints
  GROUP BY trip_id
  HAVING COUNT(*) = SUM(CASE WHEN "order" < 0 THEN 1 ELSE 0 END)
),
numbered AS (
  SELECT
    w.waypoint_id,
    ROW_NUMBER() OVER (
      PARTITION BY w.trip_id
      ORDER BY w."order" ASC
    ) AS new_order
  FROM trip_waypoints w
  JOIN all_corrupted ac ON w.trip_id = ac.trip_id
  WHERE w."order" < 0
)
UPDATE trip_waypoints w
SET "order" = n.new_order
FROM numbered n
WHERE w.waypoint_id = n.waypoint_id;

