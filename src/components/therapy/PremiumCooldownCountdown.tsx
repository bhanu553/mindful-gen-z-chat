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
      console.log('🕐 Cooldown complete - creating new session...');
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('❌ No user session found');
        return;
      }
      
      // Call the new session creation endpoint
      const response = await fetch('/api/create-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          userId: session.user.id, 
          mode: 'Reflect', 
          title: 'New Therapy Session' 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error creating new session:', errorData.error);
        return;
      }

      const data = await response.json();
      console.log('✅ New session created after cooldown:', data);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('❌ Error in createNewSessionAfterCooldown:', error);
    }
  };

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const targetTime = new Date(nextEligibleDate).getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeRemaining({ minutes: 0, seconds: 0 });
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