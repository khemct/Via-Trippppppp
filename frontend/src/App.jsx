import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TripListPage from './pages/TripListPage';
import TripSetupPage from './pages/TripSetupPage';
import TripDetailPage from './pages/TripDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

function Layout({ children, noGlobalNav }) {
  return (
    <div style={{ minHeight: '100vh', background: '#312f24', display: 'flex', flexDirection: 'column' }}>
      {!noGlobalNav && <GlobalNavBar />}
      {children}
    </div>
  );
}

function GlobalNavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  return <Navbar isLoggedIn={isAuthenticated} userName={user?.name} onLogout={logout} />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/forgot-password"
        element={
          <Layout>
            <ForgotPasswordPage />
          </Layout>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Layout>
            <ResetPasswordPage />
          </Layout>
        }
      />
      <Route
        path="/trips"
        element={
          <Layout>
            <ProtectedRoute>
              <TripListPage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/trips/new"
        element={
          <ProtectedRoute>
            <TripSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:tripId"
        element={
          <Layout>
            <ProtectedRoute>
              <TripDetailPage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <ProtectedRoute>
              <RoleGuard roles={['admin']}>
                <AdminPage />
              </RoleGuard>
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AdminPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#c8c4a0', marginBottom: 12 }}>Admin Dashboard</h1>
      <p style={{ fontSize: 14, color: '#8a8468' }}>Admin controls will appear here.</p>
    </div>
  );
}
