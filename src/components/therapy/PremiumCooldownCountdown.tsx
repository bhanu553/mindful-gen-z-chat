import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const targetTime = new Date(nextEligibleDate).getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeRemaining({ minutes: 0, seconds: 0 });
        if (onComplete) {
          onComplete();
        }
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