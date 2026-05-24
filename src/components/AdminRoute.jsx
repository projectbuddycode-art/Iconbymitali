import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const AdminLoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#F9F7F4]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#B9744A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#414A37]">Verifying admin access...</p>
    </div>
  </div>
);

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoadingAuth, authChecked } = useAuth();

  // Still loading
  if (isLoadingAuth || !authChecked) {
    return <AdminLoadingFallback />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#F9F7F4] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-[#414A37] mb-4">Access Denied</h1>
          <p className="text-[#414A37]/60 mb-6">
            You don't have admin privileges to access this page.
          </p>
          <a href="/" className="inline-block px-6 py-2 bg-[#B9744A] text-white rounded-lg hover:bg-[#a5663f] transition-colors">
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  // Is admin and authenticated
  return <Outlet />;
}
