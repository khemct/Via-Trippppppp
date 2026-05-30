import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { itinerary as itineraryApi, trips as tripsApi } from '../services/api';
import RouteMap from '../components/RouteMap';
import RecommendationPanel from '../components/RecommendationPanel';
import ItinerarySidebar from '../components/ItinerarySidebar';

const CATEGORY_ICONS = {
  restaurant: '🍽', cafe: '☕', attraction: '🎯', park: '🌳',
  museum: '🏛', shopping: '🛍', accommodation: '🏨', gas_station: '⛽',
};

export default function ItineraryPage() {
  const { tripId } = useParams();
  const { token } = useAuth();

  const [trip, setTrip] = useState(null);
  const [tripLoading, setTripLoading] = useState(true);

  const [places, setPlaces] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [recsError, setRecsError] = useState('');
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [filters, setFilters] = useState({ category: '', rating_min: 0, sort_by: 'score', cursor: null });
  const filtersRef = useRef(filters);

  const [waypoints, setWaypoints] = useState([]);
  const [waypointsLoading, setWaypointsLoading] = useState(true);

  const [feasibility, setFeasibility] = useState(null);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    setTripLoading(true);
    tripsApi
      .get(tripId, token)
      .then((data) => setTrip(data.trip))
      .catch(() => {})
      .finally(() => setTripLoading(false));
  }, [tripId, token]);

  const fetchRecommendations = useCallback(
    async (cursor) => {
      setRecsLoading(true);
      setRecsError('');
      try {
        const params = { limit: 20, ...filtersRef.current };
        if (cursor) params.cursor = cursor;
        const data = await itineraryApi.listRecommendations(tripId, params, token);
        if (cursor) {
          setPlaces((prev) => [...prev, ...data.places]);
        } else {
          setPlaces(data.places);
        }
        setHasMore(data.has_more);
        setNextCursor(data.next_cursor);
      } catch (err) {
        if (err.status === 500) {
          setRecsError('No recommendations yet. Seed from route.');
        } else {
          setRecsError(err.message || 'Failed to load recommendations');
        }
      } finally {
        setRecsLoading(false);
      }
    },
    [tripId, token]
  );

  const seedRecommendations = useCallback(async () => {
    setSeeding(true);
    setRecsError('');
    try {
      await itineraryApi.seed(tripId, token);
      await fetchRecommendations(null);
    } catch (err) {
      setRecsError(err.data?.error || err.message || 'Failed to seed recommendations');
    } finally {
      setSeeding(false);
    }
  }, [tripId, token, fetchRecommendations]);

  const fetchWaypoints = useCallback(async () => {
    setWaypointsLoading(true);
    try {
      const data = await itineraryApi.listWaypoints(tripId, token);
      setWaypoints(data.waypoints);
    } catch (err) {
      console.error('Failed to load waypoints:', err);
    } finally {
      setWaypointsLoading(false);
    }
  }, [tripId, token]);

  const fetchFeasibility = useCallback(async () => {
    try {
      const data = await itineraryApi.getFeasibility(tripId, token);
      setFeasibility(data);
    } catch (err) {
      console.error('Failed to load feasibility:', err);
    }
  }, [tripId, token]);

  useEffect(() => {
    if (!trip) return;
    seedRecommendations();
    fetchWaypoints();
    fetchFeasibility();
  }, [trip, seedRecommendations, fetchWaypoints, fetchFeasibility]);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
    setPlaces([]);
    setNextCursor(null);
    setHasMore(false);
    setRecsError('');
    const params = { limit: 20, ...newFilters };
    itineraryApi
      .listRecommendations(tripId, params, token)
      .then((data) => {
        setPlaces(data.places);
        setHasMore(data.has_more);
        setNextCursor(data.next_cursor);
      })
      .catch((err) => setRecsError(err.message || 'Failed to load'))
      .finally(() => setRecsLoading(false));
  }

  async function handleAddWaypoint(place) {
    const stopDur = trip ? trip.estimated_stop_duration : 30;
    await itineraryApi.addWaypoint(tripId, { place_id: place.place_id, stop_duration_minutes: stopDur }, token);
    await fetchWaypoints();
    await fetchFeasibility();
  }

  async function handleRemoveWaypoint(waypointId) {
    await itineraryApi.deleteWaypoint(tripId, waypointId, token);
    await fetchWaypoints();
    await fetchFeasibility();
  }

  async function handleUpdateDuration(waypointId, minutes) {
    await itineraryApi.updateWaypoint(tripId, waypointId, { stop_duration_minutes: minutes }, token);
    await fetchWaypoints();
    await fetchFeasibility();
  }

  async function handleReorder(orderArray) {
    await itineraryApi.reorderWaypoints(tripId, { order: orderArray }, token);
    await fetchWaypoints();
    await fetchFeasibility();
  }

  const routeWaypoints = waypoints.map((wp) => ({
    waypoint_id: wp.waypoint_id,
    place_id: wp.place_id,
    name: wp.name,
    lat: parseFloat(wp.lat),
    lng: parseFloat(wp.lng),
    distance_from_route: wp.distance_from_route,
  }));

  if (tripLoading) {
    return (
      <div className="w-full max-w-full mt-8 px-8" style={{ height: 'calc(100vh - 76px)' }}>
        <div className="h-full flex flex-col">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-32 bg-[#e0ddd6] rounded" />
            <div className="flex gap-6 flex-1">
              <div className="w-80 bg-[#e0ddd6] rounded-lg" />
              <div className="flex-1 bg-[#e0ddd6] rounded-lg" />
              <div className="w-72 bg-[#e0ddd6] rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="w-full max-w-lg mx-auto mt-12 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4">
          <p className="text-sm text-red-700">Trip not found.</p>
        </div>
        <Link to="/trips" className="inline-flex items-center gap-1.5 text-sm text-[#4a6741] font-medium hover:underline mt-4">
          &larr; Back to My Trips
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mt-8 px-8" style={{ height: 'calc(100vh - 76px)' }}>
      <div className="h-full flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <Link
            to={`/trips/${tripId}`}
            className="inline-flex items-center gap-1.5 text-sm text-[#4a6741] font-medium hover:underline"
          >
            &larr; Back to Trip Detail
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#2d4a24]">{trip.name}</span>
            <span className="text-xs text-[#8a9e7c] capitalize">{trip.travel_style}</span>
          </div>
        </div>

        {/* 3-column layout */}
        <div className="flex gap-5 flex-1 min-h-0">
          {/* Left: Recommendations */}
          <div className="w-80 shrink-0 min-h-0">
            <RecommendationPanel
              places={places}
              loading={recsLoading}
              seeding={seeding}
              error={recsError}
              hasMore={hasMore}
              onLoadMore={() => fetchRecommendations(nextCursor)}
              onAddWaypoint={handleAddWaypoint}
              onReseed={seedRecommendations}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Center: Map */}
          <div className="flex-1 min-w-0 bg-white border border-[#e8e4da] rounded-lg overflow-hidden">
            <RouteMap
              origin={
                trip.origin_coordinates
                  ? { lat: trip.origin_coordinates.latitude, lng: trip.origin_coordinates.longitude }
                  : null
              }
              destination={
                trip.dest_coordinates
                  ? { lat: trip.dest_coordinates.latitude, lng: trip.dest_coordinates.longitude }
                  : null
              }
              routePolyline={trip.route_polyline}
              waypoints={routeWaypoints}
              height="100%"
            />
          </div>

          {/* Right: Itinerary Sidebar */}
          <div className="w-72 shrink-0 min-h-0">
            <ItinerarySidebar
              waypoints={waypoints}
              loading={waypointsLoading}
              feasibility={feasibility}
              onRemove={handleRemoveWaypoint}
              onUpdateDuration={handleUpdateDuration}
              onReorder={handleReorder}
              onReset={seedRecommendations}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
