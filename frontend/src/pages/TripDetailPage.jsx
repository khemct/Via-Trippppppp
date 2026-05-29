import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { trips as tripsApi } from '../services/api';

const STYLES = ['chill', 'foodie', 'photographer', 'adventure', 'budget'];

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
    setSaving(true);
    try {
      const data = await tripsApi.update(
        tripId,
        {
          ...editForm,
          number_of_days: parseInt(editForm.number_of_days, 10),
          daily_hours: parseInt(editForm.daily_hours, 10),
          estimated_stop_duration: parseInt(editForm.estimated_stop_duration, 10),
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-4">
          {error}
        </div>
        <Link to="/trips" className="text-blue-600 hover:underline text-sm">
          &larr; Back to My Trips
        </Link>
      </div>
    );
  }

  if (!trip) return null;

  if (editing) {
    return (
      <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Edit Trip</h1>

        {saveError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {saveError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Travel Date</label>
            <input
              type="date"
              name="travel_date"
              value={editForm.travel_date}
              onChange={handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Number of Days</label>
              <input
                type="number"
                name="number_of_days"
                min="1"
                value={editForm.number_of_days}
                onChange={handleEditChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Daily Hours ({editForm.daily_hours}h)
              </label>
              <input
                type="range"
                name="daily_hours"
                min="4"
                max="16"
                value={editForm.daily_hours}
                onChange={handleEditChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Travel Style</label>
              <select
                name="travel_style"
                value={editForm.travel_style}
                onChange={handleEditChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stop Duration ({editForm.estimated_stop_duration} min)
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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={editForm.status}
              onChange={handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="saved">Saved</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-600 px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <Link to="/trips" className="text-blue-600 hover:underline text-sm">
        &larr; Back to My Trips
      </Link>

      <div className="mt-4 bg-white border border-gray-200 rounded p-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{trip.name}</h1>
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

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Origin</span>
            <p className="font-medium">{trip.origin}</p>
          </div>
          <div>
            <span className="text-gray-500">Destination</span>
            <p className="font-medium">{trip.destination}</p>
          </div>
          <div>
            <span className="text-gray-500">Travel Date</span>
            <p className="font-medium">{trip.travel_date}</p>
          </div>
          <div>
            <span className="text-gray-500">Number of Days</span>
            <p className="font-medium">{trip.number_of_days}</p>
          </div>
          <div>
            <span className="text-gray-500">Daily Hours</span>
            <p className="font-medium">{trip.daily_hours}h</p>
          </div>
          <div>
            <span className="text-gray-500">Travel Style</span>
            <p className="font-medium capitalize">{trip.travel_style}</p>
          </div>
          <div>
            <span className="text-gray-500">Stop Duration</span>
            <p className="font-medium">{trip.estimated_stop_duration} min</p>
          </div>
          <div>
            <span className="text-gray-500">Total Distance</span>
            <p className="font-medium">{trip.total_distance_km} km</p>
          </div>
          <div>
            <span className="text-gray-500">Driving Duration</span>
            <p className="font-medium">{trip.total_duration_minutes} min</p>
          </div>
          <div>
            <span className="text-gray-500">Feasibility</span>
            <p className="font-medium capitalize">{trip.feasibility_status}</p>
          </div>
        </div>

        {trip.origin_coordinates && (
          <div className="mt-4 text-xs text-gray-400">
            Origin: {trip.origin_coordinates.latitude}, {trip.origin_coordinates.longitude}
            &nbsp;&middot;&nbsp;
            Dest: {trip.dest_coordinates.latitude}, {trip.dest_coordinates.longitude}
          </div>
        )}

        {isOwner() && (
          <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setEditing(true)}
              className="text-sm px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-sm px-4 py-2 rounded border border-red-300 text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
