import { Link } from 'react-router-dom';

export default function Navbar({ isLoggedIn, userName, onLogout }) {
  return (
    <nav
      style={{
        height: 60,
        background: '#fff',
        borderBottom: '1px solid #e0ddd6',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          padding: '0 24px',
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#4a6741',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            🏔
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2d4a24', lineHeight: 1.2 }}>
              Via-Trip
            </div>
            <div style={{ fontSize: 11, color: '#8a9e7c', lineHeight: 1.2 }}>
              Journey your way.
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: 28, marginLeft: 48 }}>
          {!isLoggedIn ? (
            <>
              <Link to="/" style={{ color: '#5a6b4e', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                Explore
              </Link>
              <Link to="/" style={{ color: '#5a6b4e', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                How It Works
              </Link>
              <Link to="/" style={{ color: '#5a6b4e', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                About Us
              </Link>
            </>
          ) : (
            <>
              <Link to="/" style={{ color: '#5a6b4e', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                Home
              </Link>
              <Link to="/" style={{ color: '#5a6b4e', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                Explore
              </Link>
              <Link to="/trips" style={{ color: '#5a6b4e', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                My Trips
              </Link>
              <Link to="/" style={{ color: '#5a6b4e', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                How It Works
              </Link>
            </>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                style={{
                  border: '1.5px solid #4a6741',
                  color: '#4a6741',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  background: 'transparent',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                style={{
                  background: '#4a6741',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  border: 'none',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span style={{ color: '#5a6b4e', fontSize: 14 }}>Hello, {userName}! 👋</span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#eef4e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4a6741',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {userName?.charAt(0).toUpperCase()}
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  style={{
                    border: '1.5px solid #e0ddd6',
                    color: '#5a6b4e',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    background: 'transparent',
                    cursor: 'pointer',
                    marginLeft: 4,
                  }}
                >
                  Log Out
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
