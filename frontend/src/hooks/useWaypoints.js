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
    await itineraryApi.addWaypoint(tripId, { place_id: placeId, stop_duration_minutes: stopDuration }, token);
    await fetch();
  }, [tripId, token, fetch]);

  const remove = useCallback(async (waypointId) => {
    await itineraryApi.deleteWaypoint(tripId, waypointId, token);
    await fetch();
  }, [tripId, token, fetch]);

  const updateDuration = useCallback((waypointId, minutes) => {
    if (updateTimer.current) clearTimeout(updateTimer.current);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    updateTimer.current = setTimeout(async () => {
      try {
        await itineraryApi.updateWaypoint(tripId, waypointId, { stop_duration_minutes: minutes }, token, controller.signal);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to update duration:', err);
      }
    }, 500);
  }, [tripId, token]);

  const reorder = useCallback(async (orderArray) => {
    await itineraryApi.reorderWaypoints(tripId, { order: orderArray }, token);
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
