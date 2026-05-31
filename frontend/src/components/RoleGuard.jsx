import { useAuth } from '../hooks/useAuth';

export default function RoleGuard({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#312f24]">
        <p className="text-[#8a8468] text-sm">Loading...</p>
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#312f24]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#c8c4a0] mb-2">403 Forbidden</h1>
          <p className="text-sm text-[#a8a080]">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
