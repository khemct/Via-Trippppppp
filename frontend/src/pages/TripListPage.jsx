import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { trips as tripsApi } from '../services/api';
import { MapPin, Flag, CalendarDays, Mountain, Route, Compass, Plus, Map, ArrowLeft, ArrowRight, Car, Clock, CheckCircle, AlertTriangle, XCircle, Navigation, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const statusConfig = {
  saved: { cls: 'bg-brand-light/60 text-brand-text', label: 'Saved' },
  draft: { cls: 'bg-input text-muted', label: 'Draft' },
  planning: { cls: 'bg-amber-50 text-amber-700', label: 'Planning' },
};

const feasibilityConfig = {
  feasible: { icon: CheckCircle, cls: 'text-emerald-600', label: 'Feasible' },
  tight: { icon: AlertTriangle, cls: 'text-amber-600', label: 'Tight' },
  at_risk: { icon: XCircle, cls: 'text-red-600', label: 'At Risk' },
};

export default function TripListPage() {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    setError('');
    tripsApi
      .list({ page, limit }, token)
      .then((data) => {
        setTrips(data.trips);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message || 'Failed to load trips'))
      .finally(() => setLoading(false));
  }, [page, token]);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.trip_id);
    try {
      await tripsApi.delete(deleteTarget.trip_id, token);
      setTrips((prev) => prev.filter((t) => t.trip_id !== deleteTarget.trip_id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || 'Failed to delete trip');
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto mt-4 px-4 md:px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-heading">My Trips</h1>
          {total > 0 && <p className="text-sm text-muted mt-0.5">{total} trip{total !== 1 ? 's' : ''} planned</p>}
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center gap-1.5 bg-brand text-brand-light px-4 py-2 rounded-xl text-sm font-medium border border-brand-hover hover:bg-brand-hover active:scale-95 transition-all shadow-soft"
        >
          <Plus size={16} />
          New Trip
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-line/40 rounded-2xl p-5 animate-pulse">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="h-5 bg-line rounded w-1/2" />
                  <div className="h-5 bg-line rounded w-14" />
                </div>
                <div className="h-4 bg-line rounded w-3/4" />
                <div className="flex gap-3">
                  <div className="h-3 bg-line rounded w-1/4" />
                  <div className="h-3 bg-line rounded w-1/4" />
                  <div className="h-3 bg-line rounded w-1/4" />
                </div>
                <div className="flex gap-3">
                  <div className="h-3 bg-line rounded w-1/5" />
                  <div className="h-3 bg-line rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && trips.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-brand-light/40 flex items-center justify-center mx-auto mb-4">
            <Map size={28} className="text-brand" />
          </div>
          <p className="text-muted font-medium mb-1">No trips yet</p>
          <p className="text-sm text-muted/70 mb-5">Plan your first road trip and start exploring!</p>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-1.5 bg-brand text-brand-light px-5 py-2 rounded-xl text-sm font-medium border border-brand-hover hover:bg-brand-hover active:scale-95 transition-all shadow-soft"
          >
            <Compass size={16} />
            Plan a Trip
          </Link>
        </div>
      )}

      {/* Trip grid */}
      {trips.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map((trip) => {
              const sc = statusConfig[trip.status] || statusConfig.draft;
              const fc = feasibilityConfig[trip.feasibility_status];
              const FeasibilityIcon = fc?.icon;
              return (
                <div
                  key={trip.trip_id}
                  className="relative bg-card border border-line/40 rounded-2xl p-5 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <Link
                    to={`/trips/${trip.trip_id}/itinerary`}
                    className="block before:absolute before:inset-0 before:z-0"
                  >
                    {/* Top row: name + status */}
                    <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                      <h2 className="font-semibold text-heading truncate text-base pointer-events-none">{trip.name}</h2>
                      <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-1.5 text-sm text-body mb-2.5 relative z-10">
                      <MapPin size={14} className="shrink-0 text-muted" />
                      <span className="truncate">{trip.origin}</span>
                      <ArrowRight size={12} className="shrink-0 text-muted" />
                      <Flag size={14} className="shrink-0 text-muted" />
                      <span className="truncate">{trip.destination}</span>
                    </div>

                    {/* Meta row 1: date · days · style */}
                    <div className="flex items-center gap-3 text-sm text-muted mb-2 flex-wrap relative z-10">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={13} />
                        {trip.travel_date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Car size={13} />
                        {trip.number_of_days} day{trip.number_of_days > 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Mountain size={13} />
                        {trip.travel_style}
                      </span>
                    </div>

                    {/* Meta row 2: distance · duration · waypoints · feasibility */}
                    <div className="flex items-center gap-3 text-sm text-muted flex-wrap relative z-10">
                      <span className="inline-flex items-center gap-1">
                        <Route size={13} />
                        {trip.total_distance_km} km
                      </span>
                      {trip.total_duration_minutes && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} />
                          {Math.round(trip.total_duration_minutes / 60)}h {trip.total_duration_minutes % 60}m
                        </span>
                      )}
                      {trip.waypoint_count != null && (
                        <span className="inline-flex items-center gap-1">
                          <Navigation size={13} />
                          {trip.waypoint_count} stop{trip.waypoint_count !== 1 ? 's' : ''}
                        </span>
                      )}
                      {FeasibilityIcon && (
                        <span className={`inline-flex items-center gap-1 ${fc.cls}`}>
                          <FeasibilityIcon size={13} />
                          {fc.label}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDeleteTarget(trip);
                    }}
                    disabled={deleting === trip.trip_id}
                    className="absolute bottom-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-muted hover:text-red-500 disabled:opacity-30 transition-all"
                    title="Delete trip"
                  >
                    {deleting === trip.trip_id ? (
                      <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-line-strong rounded-xl bg-card text-body hover:bg-input disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft size={14} />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                  return start + i;
                }).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-brand text-brand-light'
                        : 'text-body border border-line-strong hover:bg-input'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-line-strong rounded-xl bg-card text-body hover:bg-input disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete trip"
        message={`Are you sure you want to delete "${deleteTarget?.name || 'this trip'}"? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        danger={true}
      />
    </div>
  );
}
