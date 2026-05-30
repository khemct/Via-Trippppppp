import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth as authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.forgotPassword({ email });
      setMessage(data.message);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#312f24]">
      <div className="w-full max-w-md bg-[#3e3b2a] p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-2 text-center text-[#c8c4a0]">Reset Password</h1>
        <p className="text-sm text-[#9a9478] mb-6 text-center">
          Enter your email and we&apos;ll send you a reset link.
        </p>

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
            <label className="block text-sm font-medium mb-1 text-[#9a9478]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#4a4738] rounded px-3 py-2 text-sm bg-[#252318] text-[#c8c4a0]"
              placeholder="you@example.com"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a6741] text-[#c8dbb8] py-2 rounded text-sm font-medium hover:bg-[#3d5a35] disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          <Link to="/login" className="text-[#8aab7a] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
