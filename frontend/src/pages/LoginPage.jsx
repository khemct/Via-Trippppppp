import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const perks = [
  'Mountains & Viewpoints',
  'Waterfalls & Nature',
  'Local Cafés & Food',
  'Good Vibes ♡',
];

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/trips', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      const redirect = searchParams.get('redirect') || '/trips';
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.data?.error || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={false} />

      <div className="flex flex-1">
        {/* Left */}
        <div className="flex-[0_0_45%] bg-gradient-to-br from-[#2a2820] to-[#1e1c14] px-12 py-12 flex flex-col justify-center">
          <h2 className="text-[32px] font-bold text-heading mb-4">
            Welcome Back Explorer! ✦
          </h2>
          <p className="text-[15px] text-body leading-relaxed mb-8">
            Log in to continue your journey. Access your saved trips, discover new routes, and pick up right where you left off.
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
        <div className="flex-1 bg-card px-12 py-12 flex flex-col justify-center max-w-[480px]">
          <h3 className="text-2xl font-bold text-heading mb-1">Log In</h3>
          <p className="text-sm text-muted mb-7">Welcome back, explorer!</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-line-strong rounded-lg bg-input px-3.5 py-2.5 text-sm text-heading outline-none box-border pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-base text-muted p-0"
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-body cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-brand" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-[13px] text-brand-text font-medium no-underline">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="bg-[#fde8e8] border border-[#f5c6c6] rounded-lg px-3.5 py-2.5 text-[13px] text-[#c0392b]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand disabled:bg-muted text-brand-light border-none rounded-lg text-[15px] font-semibold disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-line" />
            <span className="text-[13px] text-muted whitespace-nowrap">or continue with</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <div className="flex gap-3">
            {['Google', 'Facebook', 'Apple'].map((provider) => (
              <button
                key={provider}
                type="button"
                title="Coming soon"
                className="flex-1 h-11 border border-line rounded-lg bg-input text-[13px] font-medium text-muted cursor-not-allowed opacity-60"
              >
                {provider}
              </button>
            ))}
          </div>

          <p className="text-center mt-6 text-sm text-body">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-text font-semibold no-underline">
              Register now →
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
