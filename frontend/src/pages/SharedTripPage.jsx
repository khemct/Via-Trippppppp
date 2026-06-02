import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Route, CalendarDays, Car, Mountain, Navigation, ArrowRight, Flag, Compass, Map, Share2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { shared } from '../services/api';

const feasibilityConfig = {
  feasible: { icon: CheckCircle, cls: 'text-emerald-600', label: 'Feasible' },
  tight: { icon: AlertTriangle, cls: 'text-amber-600', label: 'Tight' },
  at_risk: { icon: XCircle, cls: 'text-red-600', label: 'At Risk' },
};

export default function SharedTripPage() {
  const { shareToken } = useParams();
  const [trip, setTrip] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await shared.get(shareToken);
        setTrip(data.trip);
        setWaypoints(data.waypoints || []);
      } catch (err) {
        if (err.status === 404) {
          setError('This shared trip could not be found. The link may be invalid or has been revoked.');
        } else {
          setError('Failed to load shared trip. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Map size={28} className="text-red-400" />
          </div>
          <p className="text-heading font-semibold mb-1">Trip not found</p>
          <p className="text-sm text-muted mb-5">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-brand text-brand-light px-4 py-2 rounded-xl text-sm font-medium border border-brand-hover hover:bg-brand-hover transition-all"
          >
            <Compass size={16} />
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const fc = feasibilityConfig[trip.feasibility_status];
  const FeasibilityIcon = fc?.icon;

  return (
    <div className="min-h-screen bg-base">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-light/40 via-card to-base border-b border-line">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-brand-light/60 text-brand-text rounded-full px-3 py-1 text-[11px] font-medium mb-2">
                <Share2 size={12} />
                Shared trip
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-heading mb-1">{trip.name}</h1>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-2 text-sm text-body mb-4">
            <MapPin size={15} className="shrink-0 text-muted" />
            <span>{trip.origin}</span>
            <ArrowRight size={13} className="shrink-0 text-muted" />
            <Flag size={15} className="shrink-0 text-muted" />
            <span>{trip.destination}</span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />
              {trip.travel_date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Car size={14} />
              {trip.number_of_days} day{trip.number_of_days > 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mountain size={14} />
              {trip.travel_style}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Route size={14} />
              {trip.total_distance_km} km
            </span>
            {trip.total_duration_minutes && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                {Math.round(trip.total_duration_minutes / 60)}h {trip.total_duration_minutes % 60}m
              </span>
            )}
            {FeasibilityIcon && (
              <span className={`inline-flex items-center gap-1.5 ${fc.cls}`}>
                <FeasibilityIcon size={14} />
                {fc.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {/* Waypoints */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-heading mb-3 flex items-center gap-2">
            <Navigation size={16} />
            Itinerary ({waypoints.length} stop{waypoints.length !== 1 ? 's' : ''})
          </h2>

          {waypoints.length === 0 ? (
            <div className="bg-card border border-dashed border-line rounded-xl p-6 text-center">
              <p className="text-sm text-muted">No stops added yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {waypoints.map((wp, i) => (
                <div
                  key={wp.waypoint_id}
                  className="bg-card border border-line/40 rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <span className="w-7 h-7 rounded-full bg-brand-light/40 text-brand-text text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">{wp.name}</p>
                    {wp.stop_duration_minutes && (
                      <p className="text-[11px] text-muted">{wp.stop_duration_minutes} min stop</p>
                    )}
                  </div>
                  {wp.category && (
                    <span className="shrink-0 text-[11px] bg-input text-muted px-2 py-0.5 rounded-full capitalize">
                      {wp.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-line">
          <p className="text-xs text-muted">
            Planned with{' '}
            <Link to="/" className="text-brand-text font-medium hover:underline">
              Via-Trip
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
