import { useAuth } from '../hooks/useAuth';

export default function RoleGuard({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">403 Forbidden</h1>
          <p className="text-sm text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
