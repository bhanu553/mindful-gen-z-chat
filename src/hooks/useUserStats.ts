
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  messagesUsedToday: number;
  remainingMessages: number;
  totalSessions: number;
  isPremium: boolean;
}

export const useUserStats = () => {
  const { user, isPremium } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    messagesUsedToday: 0,
    remainingMessages: isPremium ? 300 : 50,
    totalSessions: 0,
    isPremium: isPremium || false
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) {
      console.log('❌ No user found for fetching stats');
      setLoading(false);
      return;
    }

    try {
      console.log('📊 Fetching user stats for:', user.id);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        console.error('❌ No auth token available');
        setLoading(false);
        return;
      }

      console.log('🔐 Auth token obtained, calling getUserStats API...');

      const response = await fetch('/supabase/functions/v1/therapy-api?action=getUserStats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 getUserStats response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ getUserStats error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 getUserStats response data:', data);

      setStats({
        messagesUsedToday: data.messagesUsedToday || 0,
        remainingMessages: data.remainingMessages || (isPremium ? 300 : 50),
        totalSessions: data.totalSessions || 0,
        isPremium: data.isPremium || isPremium || false
      });

      console.log('✅ User stats updated successfully');
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      // Set default values on error
      setStats({
        messagesUsedToday: 0,
        remainingMessages: isPremium ? 300 : 50,
        totalSessions: 0,
        isPremium: isPremium || false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, isPremium]);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
};
