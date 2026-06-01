import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleMap, LoadScriptNext, Marker, Polyline } from '@react-google-maps/api';
import { useAuth } from '../hooks/useAuth';
import { trips as tripsApi } from '../services/api';
import { decodePolyline } from '../utils/polyline';
import Navbar from '../components/Navbar';

const travelStyles = [
  { id: 'chill', emoji: '😌', label: 'Chill' },
  { id: 'foodie', emoji: '🍜', label: 'Foodie' },
  { id: 'photographer', emoji: '📷', label: 'Photographer' },
  { id: 'adventure', emoji: '🏔', label: 'Adventure' },
  { id: 'budget', emoji: '💰', label: 'Budget' },
];

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
  const [errorType, setErrorType] = useState(''); // 'validation' | 'distance' | 'server'

  const [trip, setTrip] = useState(null); // populated on success

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
        setTimeout(() => {
          navigate(`/trips/${data.trip.trip_id}`);
        }, 1500);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={isAuthenticated} userName={user?.name} onLogout={logout} />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left column — Form */}
        <div
          style={{
            width: 420,
            flexShrink: 0,
            background: '#2a2820',
            padding: 32,
            borderRight: '1px solid #3e3b2a',
            overflowY: 'auto',
          }}
        >
          <a
            href="/trips"
            style={{ fontSize: 13, color: '#8aab7a', fontWeight: 500, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}
          >
            &larr; My Trips
          </a>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#c8c4a0', marginBottom: 4 }}>Plan Your Trip</h2>
          <p style={{ fontSize: 14, color: '#8a8468', marginBottom: 24 }}>
            Fill in the details below to start your road trip.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Trip Name */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#a8a080', display: 'block', marginBottom: 6 }}>Trip Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chiang Mai to Pai"
                style={{
                  width: '100%', border: '1.5px solid #4a4738', borderRadius: 8, background: '#252318',
                  padding: '10px 14px', fontSize: 14, color: '#c8c4a0', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Origin */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#a8a080', display: 'block', marginBottom: 6 }}>Origin</label>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Where are you starting?"
                style={{
                  width: '100%', border: '1.5px solid #4a4738', borderRadius: 8, background: '#252318',
                  padding: '10px 14px', fontSize: 14, color: '#c8c4a0', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Destination */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#a8a080', display: 'block', marginBottom: 6 }}>Destination</label>
              <input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                placeholder="Where are you going?"
                style={{
                  width: '100%', border: '1.5px solid #4a4738', borderRadius: 8, background: '#252318',
                  padding: '10px 14px', fontSize: 14, color: '#c8c4a0', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Travel Date */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#a8a080', display: 'block', marginBottom: 6 }}>Travel Date</label>
              <input
                type="date"
                value={travelDate}
                min={todayStr()}
                onChange={(e) => setTravelDate(e.target.value)}
                style={{
                  width: '100%', border: '1.5px solid #4a4738', borderRadius: 8, background: '#252318',
                  padding: '10px 14px', fontSize: 14, color: '#c8c4a0', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Number of Days */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#a8a080', display: 'block', marginBottom: 6 }}>Number of Days</label>
              <input
                type="number"
                min={1}
                max={30}
                value={numDays}
                onChange={(e) => setNumDays(e.target.value)}
                style={{
                  width: '100%', border: '1.5px solid #4a4738', borderRadius: 8, background: '#252318',
                  padding: '10px 14px', fontSize: 14, color: '#c8c4a0', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Daily Hours */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#a8a080', display: 'block', marginBottom: 6 }}>
                Daily Hours ({dailyHours} hours/day)
              </label>
              <input
                type="range"
                min={4}
                max={16}
                value={dailyHours}
                onChange={(e) => setDailyHours(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#4a6741' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a8468' }}>
                <span>4 hrs</span>
                <span>16 hrs</span>
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#a8a080', display: 'block', marginBottom: 8 }}>Travel Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {travelStyles.map((s) => {
                  const selected = travelStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTravelStyle(s.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        padding: '10px 4px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: selected ? '2px solid #4a6741' : '1px solid #3e3b2a',
                        background: selected ? '#2a2820' : '#3e3b2a',
                        fontSize: 11,
                        fontWeight: selected ? 600 : 400,
                        color: selected ? '#8aab7a' : '#a8a080',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stop Duration */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#a8a080', display: 'block', marginBottom: 6 }}>
                Minutes per stop
              </label>
              <input
                type="number"
                min={15}
                max={120}
                value={stopDuration}
                onChange={(e) => setStopDuration(e.target.value)}
                style={{
                  width: '100%', border: '1.5px solid #4a4738', borderRadius: 8, background: '#252318',
                  padding: '10px 14px', fontSize: 14, color: '#c8c4a0', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error banner */}
            {error && (
              <div
                style={{
                  background: errorType === 'distance' ? '#fde8e8' : '#fde8e8',
                  border: '1px solid #f5c6c6',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 13,
                  color: '#c0392b',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 48,
                background: loading ? '#8a8468' : '#4a6741',
                color: '#c8dbb8',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {loading ? 'Calculating...' : '🗺️ Calculate Route'}
            </button>
          </form>
        </div>

        {/* Right column — Map */}
        <div
          style={{
            flex: 1,
            background: '#2a2820',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Route summary bar — only when trip exists */}
          {trip && (
            <div
              style={{
                background: '#252318',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: 13,
                color: '#a8a080',
                borderBottom: '1px solid #3e3b2a',
              }}
            >
<span style={{ fontWeight: 600, color: '#c8c4a0' }}>{trip.origin}</span>
              <span style={{ color: '#8a8468' }}>&rarr;</span>
              <span style={{ fontWeight: 600, color: '#c8c4a0' }}>{trip.destination}</span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                <span>Total: <strong>{trip.total_distance_km}</strong> km</span>
                <span>Drive: <strong>{trip.total_duration_minutes}</strong> min</span>
              </span>
            </div>
          )}

          {/* Map — always visible */}
          <div style={{ flex: 1, position: 'relative' }}>
            <LoadScriptNext
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            >
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={
                  trip?.origin_coordinates
                    ? { lat: trip.origin_coordinates.latitude, lng: trip.origin_coordinates.longitude }
                    : { lat: 13.736717, lng: 100.523186 }
                }
                zoom={trip ? 8 : 6}
                options={{
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                  zoomControl: true,
                  gestureHandling: 'greedy',
                }}
              >
                {trip?.origin_coordinates && (
                  <Marker
                    position={{ lat: trip.origin_coordinates.latitude, lng: trip.origin_coordinates.longitude }}
                    label="O"
                  />
                )}
                {trip?.dest_coordinates && (
                  <Marker
                    position={{ lat: trip.dest_coordinates.latitude, lng: trip.dest_coordinates.longitude }}
                    label="D"
                  />
                )}
                {trip?.route_polyline && (
                  <Polyline
                    key={trip.route_polyline}
                    path={decodedPath}
                    options={{
                      strokeColor: '#2563eb',
                      strokeOpacity: 0.8,
                      strokeWeight: 4,
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScriptNext>

            {/* Success overlay — only when trip exists */}
            {trip && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#4a6741',
                  color: '#c8dbb8',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  whiteSpace: 'nowrap',
                }}
              >
                Route calculated! {trip.total_distance_km} km &mdash; let&apos;s explore.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div
        style={{
          borderTop: '1px solid #3e3b2a',
          background: '#1e1c14',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: 13,
          color: '#8a8468',
        }}
      >
        &copy; 2026 Via-Trip. All rights reserved.
      </div>
    </div>
  );
}
