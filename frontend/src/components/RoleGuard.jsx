import { useAuth } from '../hooks/useAuth';

export default function RoleGuard({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-heading mb-2">403 Forbidden</h1>
          <p className="text-sm text-body">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}
