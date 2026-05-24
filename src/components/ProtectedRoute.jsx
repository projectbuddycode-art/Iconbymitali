import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const UnauthorizedElement = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
      <a href="/login" className="text-black font-semibold hover:underline">
        Go to Login
      </a>
    </div>
  </div>
);

export default function ProtectedRoute({ 
  fallback = <DefaultFallback />, 
  unauthenticatedElement = <Navigate to="/login" />,
  requireAdmin = false 
}) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <UnauthorizedElement />;
  }

  return <Outlet />;
}
