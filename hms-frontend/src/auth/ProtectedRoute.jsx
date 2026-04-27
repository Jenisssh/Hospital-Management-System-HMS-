import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">Access denied</h2>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Your role ({user.role}) cannot view this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
