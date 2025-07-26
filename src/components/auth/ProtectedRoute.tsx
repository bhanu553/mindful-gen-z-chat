
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireOnboarding = true 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useOnboardingStatus();

  // Check if we're on the onboarding page
  const isOnboardingPage = location.pathname === '/onboarding';

  console.log('🔍 ProtectedRoute Debug:', {
    pathname: location.pathname,
    isOnboardingPage,
    requireAuth,
    requireOnboarding,
    user: user ? 'authenticated' : 'not authenticated',
    loading,
    onboardingLoading,
    isOnboardingComplete
  });

  useEffect(() => {
    // If still loading auth, wait
    if (loading) {
      console.log('⏳ Still loading auth, waiting...');
      return;
    }

    // Handle authentication requirement
    if (requireAuth && !user) {
      console.log('🔒 Protected route: redirecting unauthenticated user to login');
      navigate('/login', { replace: true });
      return;
    }

    // Handle onboarding requirement (but not on the onboarding page itself)
    if (requireOnboarding && !isOnboardingPage && user && !onboardingLoading) {
      // If onboarding is not complete, redirect to onboarding
      if (isOnboardingComplete === false) {
        console.log('📝 Protected route: redirecting user to onboarding');
        navigate('/onboarding', { replace: true });
        return;
      }
    }

    console.log('✅ ProtectedRoute: All checks passed, rendering children');
  }, [user, loading, navigate, requireAuth, requireOnboarding, isOnboardingComplete, onboardingLoading, isOnboardingPage]);

  // Show loading spinner only if we're still loading auth or onboarding status
  // But don't show loading on the onboarding page itself to avoid confusion
  if ((loading || (onboardingLoading && !isOnboardingPage)) && !isOnboardingPage) {
    console.log('⏳ Showing loading spinner...');
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For onboarding page: only require authentication, not completed onboarding
  if (isOnboardingPage) {
    if (requireAuth && !user) {
      console.log('🔒 Onboarding page: user not authenticated, returning null');
      return null; // Will redirect to login
    }
    // If user is authenticated and onboarding is complete, redirect to therapy
    if (user && isOnboardingComplete === true) {
      console.log('✅ Onboarding complete, redirecting to therapy from onboarding page');
      navigate('/therapy', { replace: true });
      return null;
    }
    // If user is authenticated, show onboarding regardless of completion status
    console.log('📝 Onboarding page: user authenticated, showing form');
    return <>{children}</>;
  }

  // For other protected routes: require both auth and completed onboarding
  if (requireAuth && (!user || (requireOnboarding && isOnboardingComplete === false))) {
    console.log('🚫 Protected route: requirements not met, returning null');
    return null;
  }

  console.log('✅ ProtectedRoute: Rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
