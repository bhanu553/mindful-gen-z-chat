import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PremiumCooldownCountdownProps {
  nextEligibleDate: string;
  onComplete?: () => void;
}

export const PremiumCooldownCountdown: React.FC<PremiumCooldownCountdownProps> = ({
  nextEligibleDate,
  onComplete
}) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
  }>({ minutes: 0, seconds: 0 });

  const createNewSessionAfterCooldown = async () => {
    try {
      console.log('🚀 Creating new session after cooldown completion...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('❌ No auth session available');
        return;
      }

      const response = await supabase.functions.invoke('session-cooldown', {
        body: { action: 'createNewSession' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error('❌ Error creating new session:', response.error);
        return;
      }

      console.log('✅ New session created successfully after cooldown');
      
      // Call the completion callback to refresh the UI
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('❌ Failed to create new session after cooldown:', error);
    }
  };

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const targetTime = new Date(nextEligibleDate).getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeRemaining({ minutes: 0, seconds: 0 });
        // Trigger new session creation when cooldown completes
        createNewSessionAfterCooldown();
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ minutes, seconds });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [nextEligibleDate, onComplete]);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="text-2xl font-bold text-white">
        {formatTime(timeRemaining.minutes, timeRemaining.seconds)}
      </div>
      <div className="text-sm text-gray-300">
        remaining
      </div>
    </div>
  );
}; 