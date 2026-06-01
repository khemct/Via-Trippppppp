import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const perks = [
  'Mountains & Viewpoints',
  'Waterfalls & Nature',
  'Local Cafés & Food',
  'Good Vibes ♡',
];

const roles = [
  { value: 'traveler', label: 'Traveler', desc: 'I want to plan trips' },
  { value: 'place_owner', label: 'Place Owner', desc: 'I manage a location' },
];

export default function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [role, setRole] = useState('traveler');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/trips', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!email.trim()) { setError('Email address is required.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (!role) { setError('Please select a role.'); return; }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      navigate('/trips', { replace: true });
    } catch (err) {
      setError(err.data?.error || err.data?.details?.[0] || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={false} />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left */}
        <div className="w-full lg:w-[45%] bg-gradient-to-br from-card to-deep px-6 md:px-12 py-8 md:py-12 flex flex-col justify-center">
          <h2 className="text-[32px] font-bold text-heading mb-4">
            Join the Adventure! ✦
          </h2>
          <p className="text-[15px] text-body leading-relaxed mb-8">
            Create your account and start planning your perfect road trip.
          </p>
          <div className="flex flex-col gap-3.5">
            {perks.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
                <span className="text-[15px] text-heading font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 bg-card px-6 md:px-12 py-8 md:py-12 flex flex-col justify-center w-full lg:max-w-[480px]">
          <h3 className="text-2xl font-bold text-heading mb-1">Create Account</h3>
          <p className="text-sm text-muted mb-7">Start your journey today!</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-body block mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand disabled:bg-muted text-brand-light border-none rounded-lg text-[15px] font-semibold disabled:cursor-not-allowed cursor-pointer mt-1 active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-brand-light border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-body">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-text font-semibold no-underline">
              Log in →
            </Link>
          </p>
        </div>
      </div>

      {/* Footer copyright only */}
      <div className="border-t border-line bg-deep py-4 px-6 text-center text-[13px] text-muted">
        &copy; 2026 Via-Trip. All rights reserved.
      </div>
    </div>
  );
}
