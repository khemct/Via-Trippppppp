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
    <div className="max-w-3xl mx-auto mt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <Link
          to="/trips/new"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + New Trip
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}

      {!loading && !error && trips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No trips yet. Plan your first road trip!</p>
          <Link
            to="/trips/new"
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
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
                className="block bg-white border border-gray-200 rounded p-4 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-800">{trip.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {trip.origin} &rarr; {trip.destination}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {trip.travel_date} &middot; {trip.number_of_days} day
                      {trip.number_of_days > 1 ? 's' : ''} &middot; {trip.travel_style} &middot;{' '}
                      {trip.total_distance_km} km
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      trip.status === 'saved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
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
