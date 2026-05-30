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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={false} />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left */}
        <div
          style={{
            flex: '0 0 45%',
            background: 'linear-gradient(135deg, #2a2820, #1e1c14)',
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#c8c4a0',
              marginBottom: 16,
            }}
          >
            Welcome Back Explorer! ✦
          </h2>
          <p style={{ fontSize: 15, color: '#9a9478', lineHeight: 1.7, marginBottom: 32 }}>
            Log in to continue your journey. Access your saved trips, discover new routes, and pick up right where you left off.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {perks.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#4a6741',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 15, color: '#c8c4a0', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div
          style={{
            flex: 1,
            background: '#3e3b2a',
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: 480,
          }}
        >
          <h3 style={{ fontSize: 24, fontWeight: 700, color: '#c8c4a0', marginBottom: 4 }}>
            Log In
          </h3>
          <p style={{ fontSize: 14, color: '#7a7558', marginBottom: 28 }}>
            Welcome back, explorer!
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500,                   color: '#9a9478', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  border: '1.5px solid #4a4738',
                  borderRadius: 8,
                  background: '#252318',
                  padding: '10px 14px',
                  fontSize: 14,
                  color: '#c8c4a0',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500,                   color: '#9a9478', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    border: '1.5px solid #4a4738',
                    borderRadius: 8,
                    background: '#252318',
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#c8c4a0',
                    outline: 'none',
                    boxSizing: 'border-box',
                    paddingRight: 44,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                    color: '#7a7558',
                    padding: 0,
                  }}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9a9478', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#4a6741' }} />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                style={{ fontSize: 13, color: '#8aab7a', fontWeight: 500, textDecoration: 'none' }}
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div
                style={{
                  background: '#fde8e8',
                  border: '1px solid #f5c6c6',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#c0392b',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 48,
                background: loading ? '#7a7558' : '#4a6741',
                color: '#c8dbb8',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </form>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '24px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#3e3b2a' }} />
            <span style={{ fontSize: 13, color: '#7a7558', whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: '#3e3b2a' }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {['Google', 'Facebook', 'Apple'].map((provider) => (
              <button
                key={provider}
                type="button"
                title="Coming soon"
                style={{
                  flex: 1,
                  height: 44,
                  border: '1.5px solid #3e3b2a',
                  borderRadius: 8,
                  background: '#252318',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#7a7558',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                }}
              >
                {provider}
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#9a9478' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: '#8aab7a', fontWeight: 600, textDecoration: 'none' }}>
              Register now →
            </Link>
          </p>
        </div>
      </div>

      {/* Footer copyright only */}
      <div
        style={{
          borderTop: '1px solid #3e3b2a',
          background: '#1e1c14',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: 13,
          color: '#7a7558',
        }}
      >
        &copy; 2026 Via-Trip. All rights reserved.
      </div>
    </div>
  );
}
