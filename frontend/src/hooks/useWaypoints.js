import { useState, useCallback, useRef, useEffect } from 'react';
import { itinerary as itineraryApi } from '../services/api';

export default function useWaypoints(tripId, token) {
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const updateTimer = useRef(null);
  const abortRef = useRef(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await itineraryApi.listWaypoints(tripId, token);
      setWaypoints(data.waypoints);
    } catch (err) {
      console.error('Failed to load waypoints:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId, token]);

  const add = useCallback(async (placeId, stopDuration) => {
    try {
      await itineraryApi.addWaypoint(tripId, { place_id: placeId, stop_duration_minutes: stopDuration }, token);
    } catch (err) {
      console.error('Failed to add waypoint:', err);
    }
    await fetch();
  }, [tripId, token, fetch]);

  const remove = useCallback(async (waypointId) => {
    await itineraryApi.deleteWaypoint(tripId, waypointId, token);
    await fetch();
  }, [tripId, token, fetch]);

  const updateDuration = useCallback((waypointId, minutes) => {
    setWaypoints((prev) =>
      prev.map((wp) =>
        wp.waypoint_id === waypointId ? { ...wp, stop_duration_minutes: minutes } : wp
      )
    );

    if (updateTimer.current) clearTimeout(updateTimer.current);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    updateTimer.current = setTimeout(async () => {
      try {
        await itineraryApi.updateWaypoint(tripId, waypointId, { stop_duration_minutes: minutes }, token, controller.signal);
        await fetch();
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to update duration:', err);
      }
    }, 500);
  }, [tripId, token, fetch]);

  const reorder = useCallback(async (orderArray) => {
    const orderCopy = [...orderArray];
    setWaypoints((prev) => {
      const reordered = orderCopy
        .map((o) => {
          const wp = prev.find((wp) => wp.waypoint_id === o.waypoint_id);
          return wp ? { ...wp, order: o.order } : null;
        })
        .filter(Boolean);
      const missing = prev.filter(
        (wp) => !orderCopy.some((o) => o.waypoint_id === wp.waypoint_id)
      );
      const merged = [
        ...reordered,
        ...missing.map((wp, i) => ({ ...wp, order: orderCopy.length + i + 1 })),
      ];
      return merged.length === prev.length ? merged : prev;
    });
    try {
      await itineraryApi.reorderWaypoints(tripId, { order: orderCopy }, token);
    } catch (err) {
      console.error('Failed to reorder waypoints:', err);
    }
    await fetch();
  }, [tripId, token, fetch]);

  useEffect(() => {
    fetch();
    return () => {
      if (updateTimer.current) clearTimeout(updateTimer.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetch]);

  return { waypoints, loading, fetch, add, remove, updateDuration, reorder };
}
