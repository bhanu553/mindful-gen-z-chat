import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CreditCard, Lock, CheckCircle, AlertCircle, Play, Sparkles } from 'lucide-react';

interface EnhancedCooldownCountdownProps {
  cooldownEndTime: string; // ISO string from backend
  onSessionUnlock: (sessionData: any) => void;
  onError: (error: string) => void;
}

export const EnhancedCooldownCountdown = ({
  cooldownEndTime,
  onSessionUnlock,
  onError
}: EnhancedCooldownCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 10, seconds: 0 });
  const [isCooldownActive, setIsCooldownActive] = useState(true);
  const [showPayPal, setShowPayPal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  // Calculate remaining time from backend cooldown end time
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(cooldownEndTime).getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeRemaining({ minutes: 0, seconds: 0 });
        setIsCooldownActive(false);
        setShowPayPal(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeRemaining({ minutes, seconds });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    intervalRef.current = setInterval(calculateTimeRemaining, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cooldownEndTime]);

  // Initialize PayPal when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.paypal && paypalButtonRef.current && showPayPal) {
      window.paypal.Buttons({
        style: {
          shape: 'pill',
          color: 'blue',
          layout: 'vertical',
          label: 'pay'
        },
        createOrder: async (data: any, actions: any) => {
          try {
            const response = await fetch('/api/create-paypal-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user?.id,
                amount: 5.99
              })
            });
            
            if (!response.ok) {
              throw new Error('Failed to create PayPal order');
            }
            
            const orderData = await response.json();
            return orderData.orderID;
          } catch (error) {
            console.error('Error creating PayPal order:', error);
            onError('Failed to create payment order. Please try again.');
            throw error;
          }
        },
        onApprove: async (data: any, actions: any) => {
          setPaymentStatus('processing');
          try {
            const response = await fetch('/api/capture-paypal-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderID: data.orderID,
                userId: user?.id
              })
            });
            
            if (!response.ok) {
              throw new Error('Failed to capture PayPal payment');
            }
            
            setPaymentStatus('completed');
            
            // Wait a moment then unlock session
            setTimeout(() => {
              unlockSession();
            }, 1500);
            
          } catch (error) {
            console.error('Error capturing PayPal payment:', error);
            setPaymentStatus('failed');
            onError('Payment failed. Please try again.');
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          setPaymentStatus('failed');
          onError('Payment error occurred. Please try again.');
        },
        onCancel: () => {
          setPaymentStatus('pending');
        }
      }).render(paypalButtonRef.current);
    }
  }, [user?.id, showPayPal, onError]);

  // CRITICAL FIX: Enhanced session unlock with proper error handling
  const unlockSession = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      console.log('🔓 Unlocking session after payment...');
      
      const response = await fetch('/api/session-gate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok && data.canStart && data.status === 'ready') {
        console.log('✅ Session unlocked successfully:', data);
        onSessionUnlock(data);
      } else {
        console.error('❌ Failed to unlock session:', data);
        
        // Handle different response statuses
        if (data.status === 'cooldown') {
          onError('Cooldown is still active. Please wait for it to complete.');
        } else if (data.status === 'payment_required') {
          onError('Payment is still required. Please complete your payment.');
        } else {
          onError(data.message || 'Failed to unlock session. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Error unlocking session:', error);
      onError('Failed to unlock session. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show PayPal payment prompt after cooldown ends
  if (showPayPal) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-blue-400 text-xl">💎 Secure Your Next Session</CardTitle>
          <CardDescription className="text-blue-300/80">
            Complete your investment to continue your healing journey
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {paymentStatus === 'pending' && (
            <div className="space-y-4">
              <div className="text-2xl font-bold text-white">$5.99</div>
              <div className="text-sm text-blue-300/70">
                One-time investment for your next therapy session
              </div>
              <div ref={paypalButtonRef} className="mt-4" />
            </div>
          )}
          
          {paymentStatus === 'processing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-400">Processing payment...</span>
              </div>
            </div>
          )}
          
          {paymentStatus === 'completed' && (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-green-400 font-semibold">Investment Complete!</div>
              <div className="text-sm text-green-300/70">Unlocking your next therapy session...</div>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-red-400 font-semibold">Payment Failed</div>
              <div className="text-sm text-red-300/70">Please try again</div>
              <Button 
                onClick={() => setPaymentStatus('pending')}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show cooldown countdown
  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-3 relative">
          <Clock className="w-6 h-6 text-orange-400" />
          {/* Pulsing animation */}
          <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-ping" />
        </div>
        <CardTitle className="text-orange-400 text-lg">🌟 Therapeutic Integration Period</CardTitle>
        <CardDescription className="text-orange-300/80 text-sm">
          ⏰ Your next session will unlock in:
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {/* Live Countdown Timer - More Compact */}
        <div className="relative">
          <div className="text-4xl font-mono font-bold text-center text-white mb-3">
            {formatTime(timeRemaining.minutes, timeRemaining.seconds)}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-orange-500/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${((timeRemaining.minutes * 60 + timeRemaining.seconds) / (10 * 60)) * 100}%`
              }}
            />
          </div>
        </div>
        
        <div className="text-sm text-orange-300/70 leading-relaxed">
          This intentional pause allows your insights to settle and your nervous system to process what we've explored, ensuring optimal therapeutic effectiveness.
        </div>
        
        <div className="space-y-3">
          <div className="text-xs text-orange-300/50">
            ✨ Ready to continue your healing journey? Secure your next session now - it will begin automatically when the integration period ends.
          </div>
          <Button 
            onClick={() => setShowPayPal(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay $5.99 Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
