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
            Join the Adventure! ✦
          </h2>
          <p style={{ fontSize: 15, color: '#9a9478', lineHeight: 1.7, marginBottom: 32 }}>
            Create your account and start planning your perfect road trip.
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
            Create Account
          </h3>
          <p style={{ fontSize: 14, color: '#7a7558', marginBottom: 28 }}>
            Start your journey today!
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500,                   color: '#9a9478', display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
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
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter your password"
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
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
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
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} — {r.desc}
                  </option>
                ))}
              </select>
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
                marginTop: 4,
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#9a9478' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#8aab7a', fontWeight: 600, textDecoration: 'none' }}>
              Log in →
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
