import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ isLoggedIn, userName, onLogout }) {
  const { theme, toggle } = useTheme();
  return (
    <nav className="h-[60px] bg-input border-b border-line sticky top-0 z-50">
      <div className="flex items-center h-full px-4 md:px-6 max-w-[1280px] mx-auto">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-lg leading-none">
            🏔
          </div>
          <div>
            <div className="text-base font-bold text-heading leading-tight">Via-Trip</div>
            <div className="text-[11px] text-muted leading-tight">Journey your way.</div>
          </div>
        </Link>

          <div className="flex gap-2 md:gap-6 ml-4 md:ml-12">
            {!isLoggedIn ? (
              <>
                <Link to="/" className="text-body text-sm font-medium no-underline focus-visible:ring-2 ring-brand">Explore</Link>
                <Link to="/" className="text-body text-sm font-medium no-underline focus-visible:ring-2 ring-brand">How It Works</Link>
                <Link to="/" className="text-body text-sm font-medium no-underline focus-visible:ring-2 ring-brand">About Us</Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-body text-sm font-medium no-underline focus-visible:ring-2 ring-brand">Home</Link>
                <Link to="/" className="text-body text-sm font-medium no-underline focus-visible:ring-2 ring-brand">Explore</Link>
                <Link to="/trips" className="text-body text-sm font-medium no-underline focus-visible:ring-2 ring-brand">My Trips</Link>
                <Link to="/" className="text-body text-sm font-medium no-underline focus-visible:ring-2 ring-brand">How It Works</Link>
              </>
            )}
          </div>

        <button
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="ml-auto mr-3 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-heading hover:bg-line transition-colors focus-visible:ring-2 ring-brand"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="border border-brand text-brand-text rounded-lg px-5 py-2 text-sm font-medium bg-transparent no-underline cursor-pointer focus-visible:ring-2 ring-brand"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-brand text-brand-light rounded-lg px-5 py-2 text-sm font-medium border-none no-underline cursor-pointer focus-visible:ring-2 ring-brand"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-body text-sm">Hello, {userName}! 👋</span>
              <div className="w-9 h-9 rounded-full bg-line flex items-center justify-center text-brand-text font-semibold text-sm">
                {userName?.charAt(0).toUpperCase()}
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  aria-label="Log out"
                  className="border border-line text-body rounded-lg px-4 py-2 text-[13px] font-medium bg-transparent cursor-pointer ml-1 focus-visible:ring-2 ring-brand"
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
