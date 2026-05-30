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
        <h1 className="text-2xl font-bold text-[#c8c4a0]">My Trips</h1>
        <Link
          to="/trips/new"
          className="bg-[#4a6741] text-[#c8dbb8] px-4 py-2 rounded text-sm hover:bg-[#3d5a35]"
        >
          + New Trip
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && <p className="text-[#8a8468] text-sm">Loading...</p>}

      {!loading && !error && trips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#8a8468] mb-4">No trips yet. Plan your first road trip!</p>
          <Link
            to="/trips/new"
            className="bg-[#4a6741] text-[#c8dbb8] px-6 py-2 rounded text-sm hover:bg-[#3d5a35]"
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
                className="block bg-[#2a2820] border border-[#4a4738] rounded p-4 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-[#c8c4a0]">{trip.name}</h2>
                    <p className="text-sm text-[#8a8468] mt-1">
                      {trip.origin} &rarr; {trip.destination}
                    </p>
                    <p className="text-xs text-[#8a8468] mt-1">
                      {trip.travel_date} &middot; {trip.number_of_days} day
                      {trip.number_of_days > 1 ? 's' : ''} &middot; {trip.travel_style} &middot;{' '}
                      {trip.total_distance_km} km
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      trip.status === 'saved'
                        ? 'bg-[#3e3b2a] text-[#8aab7a]'
                        : 'bg-[#252318] text-[#8a8468]'
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
              <span className="text-sm text-[#8a8468]">
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
