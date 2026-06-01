import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { auth as authApi } from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Missing reset token. Use the link from your email.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.resetPassword({ token, password });
      setMessage(data.message);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="w-full max-w-md bg-card p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-4 text-heading">Invalid Link</h1>
          <p className="text-sm text-red-600 mb-4">
            Missing reset token. Use the link from your password reset email.
          </p>
          <Link to="/forgot-password" className="text-brand-text hover:underline text-sm">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="w-full max-w-md bg-card p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-heading">Set New Password</h1>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-body">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line-strong rounded px-3 py-2 text-sm bg-input text-heading"
              placeholder="At least 8 characters"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-body">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-line-strong rounded px-3 py-2 text-sm bg-input text-heading"
              placeholder="Repeat your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-brand-light py-2 rounded text-sm font-medium hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          <Link to="/login" className="text-brand-text hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
