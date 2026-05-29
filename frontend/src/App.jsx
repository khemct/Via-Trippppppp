import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

function Header() {
  const { isAuthenticated, user, logout, isGuest } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-lg font-bold text-blue-600">
        Via-Trip
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {isGuest && (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-600">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <span className="text-gray-500">
              {user.name}{' '}
              <span className="text-xs text-gray-400">({user.role})</span>
            </span>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-red-600"
            >
              Log Out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

function HomePage() {
  const { isAuthenticated, isGuest } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Via-Trip</h1>
      <p className="text-gray-600 mb-8">Plan your perfect road trip.</p>
      <div className="flex gap-4">
        {isGuest && (
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
          >
            Get Started
          </Link>
        )}
        {isAuthenticated && (
          <Link
            to="/trips"
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
          >
            My Trips
          </Link>
        )}
      </div>
    </div>
  );
}

function TripsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Trips</h1>
      <p className="text-gray-500 text-sm">No trips yet. Plan your first road trip!</p>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-500 text-sm">Admin controls will appear here.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <TripsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard roles={['admin']}>
                <AdminPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
