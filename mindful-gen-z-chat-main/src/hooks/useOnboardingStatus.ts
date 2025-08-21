import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    console.log('🔍 Checking onboarding status for user:', user?.id || 'no user');
    
    if (!user) {
      console.log('❌ No user, setting loading to false');
      setIsLoading(false);
      return;
    }

    // Add a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Onboarding status check timed out, defaulting to incomplete');
      setIsOnboardingComplete(false);
      setIsLoading(false);
    }, 5000); // 5 second timeout

    try {
      console.log('📡 Querying Supabase for onboarding status...');
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('completed')
        .eq('user_id', user.id)
        .maybeSingle();

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking onboarding status:', error);
      }

      if (!data) {
        console.log('📝 No onboarding data found, user needs to complete onboarding');
        setIsOnboardingComplete(false);
        setIsLoading(false);
        return;
      }

      console.log('✅ Onboarding data found:', data);
      setIsOnboardingComplete(data.completed === true);
    } catch (error) {
      // Clear the timeout since we got an error
      clearTimeout(timeoutId);
      console.error('❌ Error checking onboarding status:', error);
      setIsOnboardingComplete(false);
    } finally {
      console.log('🏁 Setting loading to false, onboarding complete:', isOnboardingComplete);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  console.log('🔄 useOnboardingStatus state:', { isOnboardingComplete, isLoading, userId: user?.id });

  return { isOnboardingComplete, isLoading, refresh: checkOnboardingStatus };
};