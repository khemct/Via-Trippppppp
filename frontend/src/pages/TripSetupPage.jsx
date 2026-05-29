import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { trips as tripsApi } from '../services/api';

const STYLES = ['chill', 'foodie', 'photographer', 'adventure', 'budget'];

export default function TripSetupPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    origin: '',
    destination: '',
    travel_date: '',
    number_of_days: 1,
    daily_hours: 10,
    travel_style: 'chill',
    estimated_stop_duration: 30,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.origin || !form.destination || !form.travel_date) {
      setError('Name, origin, destination, and travel date are required');
      return;
    }

    setLoading(true);
    try {
      const data = await tripsApi.create(
        {
          ...form,
          number_of_days: parseInt(form.number_of_days, 10),
          daily_hours: parseInt(form.daily_hours, 10),
          estimated_stop_duration: parseInt(form.estimated_stop_duration, 10),
        },
        token
      );
      navigate(`/trips/${data.trip.trip_id}`, { replace: true });
    } catch (err) {
      setError(err.data?.error || err.data?.details?.[0] || err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Plan a New Trip</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Trip Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="e.g. Pacific Coast Highway"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Origin</label>
          <input
            name="origin"
            value={form.origin}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="e.g. Los Angeles, CA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Destination</label>
          <input
            name="destination"
            value={form.destination}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="e.g. San Francisco, CA"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Travel Date</label>
            <input
              type="date"
              name="travel_date"
              value={form.travel_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Days</label>
            <input
              type="number"
              name="number_of_days"
              min="1"
              value={form.number_of_days}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Daily Hours ({form.daily_hours}h)
            </label>
            <input
              type="range"
              name="daily_hours"
              min="4"
              max="16"
              value={form.daily_hours}
              onChange={handleChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>4h</span>
              <span>16h</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Travel Style</label>
            <select
              name="travel_style"
              value={form.travel_style}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Stop Duration ({form.estimated_stop_duration} min)
          </label>
          <input
            type="range"
            name="estimated_stop_duration"
            min="5"
            max="180"
            step="5"
            value={form.estimated_stop_duration}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>5 min</span>
            <span>180 min</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Planning...' : 'Plan Route'}
          </button>
          <Link
            to="/trips"
            className="text-gray-600 px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
