
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useOnboardingStatus();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      console.log('Protected route: redirecting unauthenticated user to login');
      navigate('/login', { replace: true });
    }
    // Enforce onboarding for authenticated users
    if (!loading && requireAuth && user && !onboardingLoading && isOnboardingComplete === false) {
      console.log('Protected route: redirecting user to onboarding');
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, navigate, requireAuth, isOnboardingComplete, onboardingLoading]);

  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && (!user || isOnboardingComplete === false)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
