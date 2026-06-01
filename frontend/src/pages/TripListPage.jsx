import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { trips as tripsApi } from '../services/api';

export default function TripListPage() {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-3xl mx-auto mt-4 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-heading">My Trips</h1>
        <Link
          to="/trips/new"
          className="bg-brand text-brand-light px-4 py-2 rounded text-sm border border-brand-hover hover:bg-brand-hover active:scale-95 transition-transform"
        >
          + New Trip
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-line-strong rounded p-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-line rounded w-3/4" />
                  <div className="h-4 bg-line rounded w-1/2" />
                  <div className="h-3 bg-line rounded w-2/3" />
                </div>
                <div className="h-5 bg-line rounded w-14" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted mb-4">No trips yet. Plan your first road trip!</p>
          <Link
            to="/trips/new"
            className="bg-brand text-brand-light px-6 py-2 rounded text-sm border border-brand-hover hover:bg-brand-hover active:scale-95 transition-transform"
          >
            Plan a Trip
          </Link>
        </div>
      )}

      {trips.length > 0 && (
        <>
          <div className="space-y-3">
            {trips.map((trip) => (
              <Link
                key={trip.trip_id}
                to={`/trips/${trip.trip_id}`}
                className="block bg-card border border-line-strong rounded p-4 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-heading">{trip.name}</h2>
                    <p className="text-sm text-muted mt-1">
                      {trip.origin} &rarr; {trip.destination}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {trip.travel_date} &middot; {trip.number_of_days} day
                      {trip.number_of_days > 1 ? 's' : ''} &middot; {trip.travel_style} &middot;{' '}
                      {trip.total_distance_km} km
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      trip.status === 'saved'
                        ? 'bg-line text-brand-text'
                        : 'bg-input text-muted'
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
