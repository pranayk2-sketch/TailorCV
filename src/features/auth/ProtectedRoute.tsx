import { Navigate, Outlet } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from './AuthProvider';

/** Wraps protected routes. Redirects to /login when unauthenticated. */
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#ffd93d] border-t-transparent rounded-full"
        />
        <p className="text-white text-base uppercase" style={{ fontWeight: 900 }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
