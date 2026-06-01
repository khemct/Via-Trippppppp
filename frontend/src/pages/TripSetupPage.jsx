import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Smile, UtensilsCrossed, Camera, Mountain, Coins, Map } from 'lucide-react';
import { GoogleMap, LoadScriptNext, Marker, Polyline } from '@react-google-maps/api';
import { useAuth } from '../hooks/useAuth';
import { trips as tripsApi } from '../services/api';
import { decodePolyline } from '../utils/polyline';
import Navbar from '../components/Navbar';

const TRAVEL_STYLE_ICONS = {
  chill: Smile, foodie: UtensilsCrossed, photographer: Camera, adventure: Mountain, budget: Coins,
};

const travelStyles = [
  { id: 'chill', label: 'Chill' },
  { id: 'foodie', label: 'Foodie' },
  { id: 'photographer', label: 'Photographer' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'budget', label: 'Budget' },
];

const polylineOptions = {
  strokeColor: '#2563eb',
  strokeOpacity: 0.8,
  strokeWeight: 4,
};

const googleMapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: true,
  gestureHandling: 'greedy',
};

function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function TripSetupPage() {
  const { isAuthenticated, user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [dest, setDest] = useState(searchParams.get('destination') || '');
  const [travelDate, setTravelDate] = useState('');
  const [numDays, setNumDays] = useState(1);
  const [dailyHours, setDailyHours] = useState(10);
  const [travelStyle, setTravelStyle] = useState('chill');
  const [stopDuration, setStopDuration] = useState(30);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');

  const [trip, setTrip] = useState(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setErrorType('');
      setTrip(null);

      if (!origin.trim()) { setError('Origin is required.'); setErrorType('validation'); return; }
      if (!dest.trim()) { setError('Destination is required.'); setErrorType('validation'); return; }
      if (!travelDate) { setError('Travel date is required.'); setErrorType('validation'); return; }
      if (travelDate < todayStr()) { setError('Travel date must be today or later.'); setErrorType('validation'); return; }
      if (!numDays || numDays < 1) { setError('Number of days must be at least 1.'); setErrorType('validation'); return; }

      setLoading(true);
      try {
        const data = await tripsApi.create(
          {
            name: name.trim() || `Trip to ${dest.trim()}`,
            origin: origin.trim(),
            destination: dest.trim(),
            travel_date: travelDate,
            number_of_days: parseInt(numDays, 10),
            daily_hours: parseInt(dailyHours, 10),
            travel_style: travelStyle,
            estimated_stop_duration: parseInt(stopDuration, 10),
          },
          token
        );
        setTrip(data.trip);
        navigate(`/trips/${data.trip.trip_id}/itinerary`);
      } catch (err) {
        if (err.status === 400) {
          setError(err.data?.error || 'Route exceeds 300 km. Please choose closer destinations.');
          setErrorType('distance');
        } else if (err.status === 502) {
          setError('Could not calculate route. Please try again.');
          setErrorType('server');
        } else {
          setError(err.data?.error || err.message || 'Failed to create trip.');
          setErrorType('server');
        }
      } finally {
        setLoading(false);
      }
    },
    [name, origin, dest, travelDate, numDays, dailyHours, travelStyle, stopDuration, token, navigate]
  );

  const decodedPath = useMemo(
    () => trip?.route_polyline ? decodePolyline(trip.route_polyline) : [],
    [trip?.route_polyline]
  );

  const center = useMemo(() => {
    if (trip?.origin_coordinates) return { lat: trip.origin_coordinates.latitude, lng: trip.origin_coordinates.longitude };
    return { lat: 13.736717, lng: 100.523186 };
  }, [trip?.origin_coordinates?.latitude, trip?.origin_coordinates?.longitude]);

  const originPos = useMemo(() => {
    if (!trip?.origin_coordinates) return null;
    return { lat: trip.origin_coordinates.latitude, lng: trip.origin_coordinates.longitude };
  }, [trip?.origin_coordinates?.latitude, trip?.origin_coordinates?.longitude]);

  const destPos = useMemo(() => {
    if (!trip?.dest_coordinates) return null;
    return { lat: trip.dest_coordinates.latitude, lng: trip.dest_coordinates.longitude };
  }, [trip?.dest_coordinates?.latitude, trip?.dest_coordinates?.longitude]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={isAuthenticated} userName={user?.name} onLogout={logout} />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left column — Form */}
        <div className="w-full lg:w-[420px] shrink-0 bg-card px-4 md:px-8 py-6 md:py-8 border-r border-line overflow-y-auto">
          <a
            href="/trips"
            className="text-[13px] text-brand-text font-medium no-underline inline-block mb-3"
          >
            &larr; My Trips
          </a>

          <h2 className="text-xl font-bold text-heading mb-1">Plan Your Trip</h2>
          <p className="text-sm text-muted mb-4">
            Fill in the details below to start your road trip.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Trip Name */}
            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Trip Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chiang Mai to Pai"
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            {/* Origin */}
            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Origin</label>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Where are you starting?"
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Destination</label>
              <input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                placeholder="Where are you going?"
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            {/* Travel Date */}
            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Travel Date</label>
              <input
                type="date"
                value={travelDate}
                min={todayStr()}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            {/* Number of Days */}
            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Number of Days</label>
              <input
                type="number"
                min={1}
                max={30}
                value={numDays}
                onChange={(e) => setNumDays(e.target.value)}
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            {/* Daily Hours */}
            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">
                Daily Hours ({dailyHours} hours/day)
              </label>
              <input
                type="range"
                min={4}
                max={16}
                value={dailyHours}
                onChange={(e) => setDailyHours(parseInt(e.target.value, 10))}
                className="w-full accent-brand"
              />
              <div className="flex justify-between text-[11px] text-muted">
                <span>4 hrs</span>
                <span>16 hrs</span>
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label className="text-[13px] font-medium text-body block mb-2">Travel Style</label>
              <div className="grid grid-cols-5 gap-2">
                {travelStyles.map((s) => {
                  const selected = travelStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTravelStyle(s.id)}
                      className={`flex flex-col items-center gap-1 px-2.5 py-2.5 rounded-lg cursor-pointer text-[11px] ${
                        selected
                          ? 'border-2 border-brand bg-card text-brand-text font-semibold'
                          : 'border border-line bg-line text-body'
                      }`}
                    >
                      <span className="text-xl">{(() => { const Icon = TRAVEL_STYLE_ICONS[s.id]; return Icon ? <Icon size={22} /> : null; })()}</span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stop Duration */}
            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">
                Minutes per stop
              </label>
              <input
                type="number"
                min={15}
                max={120}
                value={stopDuration}
                onChange={(e) => setStopDuration(e.target.value)}
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-3 text-[13px] text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand disabled:bg-muted text-brand-light border border-brand-hover rounded-lg text-[15px] font-semibold disabled:cursor-not-allowed cursor-pointer mt-1 active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-brand-light border-t-transparent rounded-full animate-spin" />
                  Calculating...
                </span>
              ) : <span className="inline-flex items-center gap-1.5">{(() => { const Icon = Map; return <Icon size={16} />; })()} Calculate Route</span>}
            </button>
          </form>
        </div>

        {/* Right column — Map */}
        <div className="flex-1 bg-card flex flex-col relative">
          {/* Route summary bar */}
          {trip && (
            <div className="bg-input px-5 py-3 flex items-center gap-4 text-[13px] text-body border-b border-line">
              <span className="font-semibold text-heading">{trip.origin}</span>
              <span className="text-muted">&rarr;</span>
              <span className="font-semibold text-heading">{trip.destination}</span>
              <span className="ml-auto flex gap-4">
                <span>Total: <strong>{trip.total_distance_km}</strong> km</span>
                <span>Drive: <strong>{trip.total_duration_minutes}</strong> min</span>
              </span>
            </div>
          )}

          {/* Map */}
          <div className="flex-1 relative">
            <LoadScriptNext
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            >
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={center}
                zoom={trip ? 8 : 6}
                options={googleMapOptions}
              >
                {originPos && <Marker position={originPos} label="O" />}
                {destPos && <Marker position={destPos} label="D" />}
                {decodedPath.length > 0 && (
                  <Polyline
                    key="route"
                    path={decodedPath}
                    options={polylineOptions}
                  />
                )}
              </GoogleMap>
            </LoadScriptNext>

            {/* Success overlay */}
            {trip && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-brand text-brand-light px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
                Route calculated! {trip.total_distance_km} km &mdash; let&apos;s explore.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="border-t border-line bg-deep py-4 px-6 text-center text-[13px] text-muted">
        &copy; 2026 Via-Trip. All rights reserved.
      </div>
    </div>
  );
}
