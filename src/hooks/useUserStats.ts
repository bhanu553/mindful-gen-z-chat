
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  messagesUsedToday: number;
  remainingMessages: number;
  totalSessions: number;
  isPremium: boolean;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        console.error('❌ No auth token available for stats');
        setLoading(false);
        return;
      }

      const response = await fetch('/supabase/functions/v1/therapy-api?action=getUserStats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      // Set default stats on error
      setStats({
        messagesUsedToday: 0,
        remainingMessages: 50,
        totalSessions: 0,
        isPremium: false
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refresh: fetchStats
  };
};
