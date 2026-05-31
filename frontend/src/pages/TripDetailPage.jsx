import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { trips as tripsApi } from '../services/api';
import RouteMap from '../components/RouteMap';

const STYLES = ['chill', 'foodie', 'photographer', 'adventure', 'budget'];

const STYLE_LABELS = {
  chill: 'Chill',
  foodie: 'Foodie',
  photographer: 'Photographer',
  adventure: 'Adventure',
  budget: 'Budget',
};

function MapPinIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FlagIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function RulerIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8h20v8H2z" />
      <line x1="6" y1="12" x2="6" y2="12.01" />
      <line x1="10" y1="12" x2="10" y2="12.01" />
      <line x1="14" y1="12" x2="14" y2="12.01" />
      <line x1="18" y1="12" x2="18" y2="12.01" />
    </svg>
  );
}

function ClockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CalendarDaysIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
      <line x1="8" y1="18" x2="8" y2="18.01" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
      <line x1="16" y1="18" x2="16" y2="18.01" />
    </svg>
  );
}

function SparklesIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 8l-4.5 3.5L15 17l-3-4.5L9 17l.5-5.5L5 8l5.5.5z" />
    </svg>
  );
}

function CoffeeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

function PencilIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function RouteIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M18 6l-8 12" />
    </svg>
  );
}

function InfoRow({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[#7a7558] shrink-0">
        {Icon && <Icon />}
      </div>
      <div className="min-w-0">
        <span className="text-xs text-[#7a7558]">{label}</span>
        <p className={`text-sm font-medium text-[#c8c4a0] ${capitalize ? 'capitalize' : ''} truncate`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h3 className="text-xs font-semibold text-[#7a7558] uppercase tracking-wider mb-3">
      {children}
    </h3>
  );
}

function FeasibilityBadge({ status }) {
  const styles = {
    feasible: 'bg-[#3e3b2a] text-[#8aab7a]',
    tight: 'bg-[#fef3c7] text-[#92400e]',
    infeasible: 'bg-[#fee2e2] text-[#991b1b]',
  };
  const icons = {
    feasible: '✓',
    tight: '⚠',
    infeasible: '✕',
  };
  const cls = styles[status] || 'bg-[#252318] text-[#7a7558]';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#7a7558]">Feasibility</span>
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${cls}`}>
        <span>{icons[status] || '?'}</span>
        <span className="capitalize">{status}</span>
      </span>
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-[#3e3b2a] rounded ${className}`} />;
}

function LoadingState() {
  return (
    <div className="w-full max-w-full mt-8 px-8">
      <div className="flex gap-6">
        <div className="w-[480px] shrink-0 bg-[#3e3b2a] border border-[#4a4738] rounded p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <div className="pt-4 space-y-3">
            <Skeleton className="h-3 w-1/6" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="pt-4 space-y-3">
            <Skeleton className="h-3 w-1/6" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="pt-4 space-y-3">
            <Skeleton className="h-3 w-1/6" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
        <div className="flex-1">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  );
}

export default function TripDetailPage() {
  const { tripId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    tripsApi
      .get(tripId, token)
      .then((data) => {
        setTrip(data.trip);
        setEditForm({
          name: data.trip.name,
          travel_date: data.trip.travel_date,
          number_of_days: data.trip.number_of_days,
          daily_hours: data.trip.daily_hours,
          travel_style: data.trip.travel_style,
          estimated_stop_duration: data.trip.estimated_stop_duration,
          status: data.trip.status,
        });
      })
      .catch((err) => {
        if (err.status === 404) setError('Trip not found');
        else if (err.status === 403) setError('You do not have access to this trip');
        else setError(err.message || 'Failed to load trip');
      })
      .finally(() => setLoading(false));
  }, [tripId, token]);

  function isOwner() {
    return trip && user && trip.user_id === user.id;
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setSaveError('');

    const nd = parseInt(editForm.number_of_days, 10);
    if (isNaN(nd) || nd < 1 || nd > 30) {
      setSaveError('Number of days must be between 1 and 30');
      return;
    }
    const dh = parseInt(editForm.daily_hours, 10);
    if (isNaN(dh) || dh < 4 || dh > 16) {
      setSaveError('Daily hours must be between 4 and 16');
      return;
    }
    const sd = parseInt(editForm.estimated_stop_duration, 10);
    if (isNaN(sd) || sd < 5 || sd > 180) {
      setSaveError('Stop duration must be between 5 and 180');
      return;
    }

    setSaving(true);
    try {
      const data = await tripsApi.update(
        tripId,
        {
          ...editForm,
          number_of_days: nd,
          daily_hours: dh,
          estimated_stop_duration: sd,
        },
        token
      );
      setTrip(data.trip);
      setEditing(false);
    } catch (err) {
      setSaveError(err.data?.error || err.data?.details?.[0] || err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setSaveError('');
    setEditForm({
      name: trip.name,
      travel_date: trip.travel_date,
      number_of_days: trip.number_of_days,
      daily_hours: trip.daily_hours,
      travel_style: trip.travel_style,
      estimated_stop_duration: trip.estimated_stop_duration,
      status: trip.status,
    });
  }

  async function handleDelete() {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    try {
      await tripsApi.delete(tripId, token);
      navigate('/trips', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete trip');
    }
  }

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="w-full max-w-lg mx-auto mt-12 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-lg">✕</span>
            <div>
              <p className="font-medium text-red-800 text-sm">Error loading trip</p>
              <p className="text-red-600 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        </div>
        <Link
          to="/trips"
          className="inline-flex items-center gap-1.5 text-sm text-[#8aab7a] font-medium hover:underline"
        >
          &larr; Back to My Trips
        </Link>
      </div>
    );
  }

  if (!trip) return null;

  // ---- EDIT MODE ----
  if (editing) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-6">
        <div
          className="bg-[#3e3b2a] rounded-lg shadow-sm border border-[#4a4738] overflow-hidden"
          style={{ borderLeft: '4px solid #4a6741' }}
        >
          <div className="p-8">
            <h1 className="text-xl font-bold text-[#c8c4a0] mb-6">Edit Trip</h1>

            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <SectionHeading>Trip Details</SectionHeading>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9a9478] mb-1.5">Name</label>
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="w-full border border-[#4a4738] rounded-lg px-3 py-2 text-sm text-[#c8c4a0] focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#9a9478] mb-1.5">Travel Date</label>
                      <input
                        type="date"
                        name="travel_date"
                        value={editForm.travel_date}
                        onChange={handleEditChange}
                        className="w-full border border-[#4a4738] rounded-lg px-3 py-2 text-sm text-[#c8c4a0] focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#9a9478] mb-1.5">Status</label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        className="w-full border border-[#4a4738] rounded-lg px-3 py-2 text-sm text-[#c8c4a0] focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="saved">Saved</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#3e3b2a]" />

              <div>
                <SectionHeading>Schedule</SectionHeading>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#9a9478] mb-1.5">Number of Days</label>
                      <input
                        type="number"
                        name="number_of_days"
                        min="1"
                        max="30"
                        value={editForm.number_of_days}
                        onChange={handleEditChange}
                        className="w-full border border-[#4a4738] rounded-lg px-3 py-2 text-sm text-[#c8c4a0] focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#9a9478] mb-1.5">
                        Daily Hours: {editForm.daily_hours}h
                      </label>
                      <input
                        type="range"
                        name="daily_hours"
                        min="4"
                        max="16"
                        value={editForm.daily_hours}
                        onChange={handleEditChange}
                        className="w-full"
                        style={{ accentColor: '#4a6741' }}
                      />
                      <div className="flex justify-between text-xs text-[#7a7558] mt-0.5">
                        <span>4h</span>
                        <span>16h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#3e3b2a]" />

              <div>
                <SectionHeading>Preferences</SectionHeading>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9a9478] mb-2">Travel Style</label>
                    <div className="flex gap-2 flex-wrap">
                      {STYLES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          name="travel_style"
                          onClick={() => setEditForm((prev) => ({ ...prev, travel_style: s }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            editForm.travel_style === s
                              ? 'bg-[#4a6741] text-[#c8dbb8] border-[#4a6741]'
                              : 'bg-[#3e3b2a] text-[#9a9478] border-[#4a4738] hover:border-[#4a6741] hover:text-[#8aab7a]'
                          }`}
                        >
                          {STYLE_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9a9478] mb-1.5">
                      Stop Duration: {editForm.estimated_stop_duration} min
                    </label>
                    <input
                      type="range"
                      name="estimated_stop_duration"
                      min="5"
                      max="180"
                      step="5"
                      value={editForm.estimated_stop_duration}
                      onChange={handleEditChange}
                      className="w-full"
                      style={{ accentColor: '#4a6741' }}
                    />
                    <div className="flex justify-between text-xs text-[#7a7558] mt-0.5">
                      <span>5 min</span>
                      <span>180 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-[#3e3b2a] flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#4a6741] text-[#c8dbb8] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d5a35] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="text-[#9a9478] px-5 py-2.5 rounded-lg text-sm font-medium border border-[#4a4738] hover:bg-[#252318] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

  // ---- VIEW MODE ----
  return (
    <div className="w-full max-w-full mt-8 px-8" style={{ height: 'calc(100vh - 76px)' }}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <Link
            to="/trips"
            className="inline-flex items-center gap-1.5 text-sm text-[#8aab7a] font-medium hover:underline"
          >
            &larr; Back to My Trips
          </Link>
          {isOwner() && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8aab7a] border border-[#4a4738] rounded-lg px-3.5 py-2 hover:bg-[#252318] transition-colors"
            >
              <PencilIcon />
              Edit
            </button>
          )}
        </div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left: Info */}
          <div className="w-[480px] shrink-0 bg-[#3e3b2a] border border-[#4a4738] rounded-lg p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-xl font-bold text-[#c8c4a0] leading-tight">{trip.name}</h1>
            <span
              className={`shrink-0 ml-3 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                trip.status === 'saved'
                  ? 'bg-[#3e3b2a] text-[#8aab7a]'
                  : 'bg-[#252318] text-[#7a7558]'
              }`}
            >
              {trip.status}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <SectionHeading>Route</SectionHeading>
              <div className="space-y-3">
                <InfoRow icon={MapPinIcon} label="Origin" value={trip.origin} />
                <InfoRow icon={FlagIcon} label="Destination" value={trip.destination} />
                <InfoRow icon={RulerIcon} label="Total Distance" value={`${trip.total_distance_km} km`} />
                <InfoRow icon={ClockIcon} label="Driving Duration" value={`${trip.total_duration_minutes} min`} />
              </div>
            </div>

            <div className="border-t border-[#3e3b2a]" />

            <div>
              <SectionHeading>Schedule</SectionHeading>
              <div className="space-y-3">
                <InfoRow icon={CalendarIcon} label="Travel Date" value={trip.travel_date} />
                <InfoRow icon={CalendarDaysIcon} label="Number of Days" value={trip.number_of_days} />
                <InfoRow icon={ClockIcon} label="Daily Hours" value={`${trip.daily_hours}h`} />
              </div>
            </div>

            <div className="border-t border-[#3e3b2a]" />

            <div>
              <SectionHeading>Preferences</SectionHeading>
              <div className="space-y-3">
                <InfoRow icon={SparklesIcon} label="Travel Style" value={trip.travel_style} capitalize />
                <InfoRow icon={CoffeeIcon} label="Stop Duration" value={`${trip.estimated_stop_duration} min`} />
              </div>
            </div>

            <div className="border-t border-[#3e3b2a]" />

            <div>
              <SectionHeading>Status</SectionHeading>
              <FeasibilityBadge status={trip.feasibility_status} />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-[#3e3b2a] space-y-2.5">
            <button
              disabled
              title="Coming in next update"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#4a6741] text-white rounded-lg px-4 py-2.5 text-sm font-medium opacity-60 cursor-not-allowed"
            >
              <RouteIcon />
              Plan Itinerary
            </button>
            {isOwner() && (
              <button
                onClick={handleDelete}
                className="w-full inline-flex items-center justify-center gap-2 border border-red-300 text-red-600 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <TrashIcon />
                Delete Trip
              </button>
            )}
          </div>
        </div>

        {/* Right: Map */}
        {trip.route_polyline && (
          <div className="flex-1 min-w-0 h-full flex flex-col">
            <div className="flex-1 bg-[#3e3b2a] border border-[#4a4738] rounded-lg overflow-hidden">
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
                height="100%"
              />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
