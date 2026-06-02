import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Mountain, Sun, Moon, Palette } from 'lucide-react';

export default function Navbar({ isLoggedIn, userName, onLogout }) {
  const { theme, toggle, colorTheme, cycleColorTheme } = useTheme();
  return (
    <nav className="h-[60px] bg-card/70 backdrop-blur-xl border-b border-line/20 sticky top-0 z-50 shadow-glass">
      <div className="flex items-center h-full px-4 md:px-6 max-w-[1280px] mx-auto">
        <Link to="/" className="flex items-center gap-1.0 no-underline">
          <img src="/Via_trip_logo.png" alt="Via-Trip" className="w-[72px] h-[72px]" />
          <div>
            <div className="text-base font-bold text-heading leading-tight">Via-Trip</div>
            <div className="text-xs text-muted leading-tight">Journey your way.</div>
          </div>
        </Link>

          {isLoggedIn && (
            <div className="flex gap-2 md:gap-4 ml-4 md:ml-6">
              <Link to="/" className="text-heading text-sm font-medium no-underline border border-line-strong rounded-lg px-3 py-1.5 focus-visible:ring-2 ring-brand hover:bg-line transition-colors">Home</Link>
              <Link to="/trips/new" className="text-heading text-sm font-medium no-underline border border-line-strong rounded-lg px-3 py-1.5 focus-visible:ring-2 ring-brand hover:bg-line transition-colors">New Trip</Link>
              <Link to="/trips" className="text-heading text-sm font-medium no-underline border border-line-strong rounded-lg px-3 py-1.5 focus-visible:ring-2 ring-brand hover:bg-line transition-colors">My Trips</Link>
            </div>
          )}

        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={cycleColorTheme}
            aria-label={`Color theme: ${colorTheme}. Click to cycle.`}
            title={`Theme: ${colorTheme}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-heading hover:bg-line/80 transition-colors focus-visible:ring-2 ring-brand"
          >
            <Palette size={18} />
          </button>
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-heading hover:bg-line/80 transition-colors focus-visible:ring-2 ring-brand"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="bg-secondary text-heading rounded-lg px-5 py-2 text-sm font-medium border border-secondary-hover no-underline cursor-pointer focus-visible:ring-2 ring-secondary hover:bg-secondary-hover transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-brand text-brand-light rounded-lg px-5 py-2 text-sm font-medium border border-brand-hover no-underline cursor-pointer focus-visible:ring-2 ring-brand hover:brightness-110 transition-all"
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
