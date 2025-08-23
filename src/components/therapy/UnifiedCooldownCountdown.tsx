import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface UnifiedCooldownCountdownProps {
  cooldownRemaining: {
    minutes: number;
    seconds: number;
  };
  hasCredit: boolean;
  onComplete?: () => void;
}

export const UnifiedCooldownCountdown = ({
  cooldownRemaining,
  hasCredit,
  onComplete
}: UnifiedCooldownCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState(cooldownRemaining);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const targetTime = new Date(Date.now() + (timeRemaining.minutes * 60 * 1000) + (timeRemaining.seconds * 1000)).getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeRemaining({ minutes: 0, seconds: 0 });
        if (hasCredit) {
          // Auto-start session when cooldown ends and user has credit
          startNewSession();
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
  }, [timeRemaining, hasCredit]);

  const startNewSession = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      console.log('🕐 Cooldown complete - starting new session...');
      
      const response = await fetch('/api/session-gate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok && data.canStart) {
        console.log('✅ New session started:', data);
        if (onComplete) {
          onComplete();
        }
      } else {
        console.error('❌ Failed to start session:', data);
      }
    } catch (error) {
      console.error('❌ Error starting new session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePayNow = () => {
    // Open payment modal or redirect to payment page
    // This will be handled by the parent component
    if (onComplete) {
      onComplete();
    }
  };

  if (timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
    if (hasCredit) {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-green-600">🎉 Cooldown Complete!</CardTitle>
            <CardDescription className="text-center">
              Starting your next session...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isProcessing ? (
              <div className="text-sm text-muted-foreground">Starting session...</div>
            ) : (
              <Button onClick={startNewSession} className="w-full">
                Start Session Now
              </Button>
            )}
          </CardContent>
        </Card>
      );
    } else {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-blue-600">⏰ Cooldown Finished</CardTitle>
            <CardDescription className="text-center">
              Pay $5.99 to start your next session
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handlePayNow} className="w-full">
              Pay $5.99
            </Button>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-orange-600">⏰ Session Cooldown</CardTitle>
        <CardDescription className="text-center">
          {hasCredit 
            ? "Payment received. Waiting for cooldown to end."
            : "Next session unlocks for $5.99 per session after your 10-minute cooldown."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-3xl font-mono font-bold text-center">
          {formatTime(timeRemaining.minutes, timeRemaining.seconds)}
        </div>
        
        {!hasCredit && (
          <div className="text-sm text-muted-foreground">
            You can pay now; your session will start automatically when the cooldown ends.
          </div>
        )}
        
        {!hasCredit && (
          <Button onClick={handlePayNow} className="w-full">
            Pay $5.99 Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
