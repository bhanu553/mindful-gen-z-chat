
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentModal = ({ open, onOpenChange }: PaymentModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      // Load PayPal SDK with environment variable
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&vault=true&intent=capture&currency=USD`;
      script.async = true;
      script.onload = () => {
        if (window.paypal && document.getElementById('paypal-button-container')) {
          try {
            window.paypal.Buttons({
              style: {
                shape: 'pill',
                color: 'gold',
                layout: 'vertical',
                label: 'pay'
              },
              createOrder: async function(data: any, actions: any) {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '5.99'
                    },
                    description: 'EchoMind Therapy Session - $5.99 per session'
                  }]
                });
              },
              onApprove: async function(data: any, actions: any) {
                setIsProcessing(true);
                try {
                  const details = await actions.order.capture();
                  console.log('PayPal payment completed:', details);

                  // Update user's premium status and assign credits in Supabase
                  if (user) {
                    // First, update payment status
                    const { error: profileError } = await supabase
                      .from('profiles')
                      .update({ 
                        is_premium: true,
                        payment_status: 'paid'
                      })
                      .eq('id', user.id);

                    if (profileError) {
                      console.error('Error updating premium status:', profileError);
                      throw profileError;
                    }

                          // Then, assign paid credits - 1 session per payment
      const { error: creditError } = await supabase
        .from('session_credit')
        .insert({
          user_id: user.id,
          status: 'unredeemed'
        });

                    if (creditError) {
                      console.error('Error assigning credits:', creditError);
                      throw creditError;
                    }
                  }

                  toast({
                    title: "You've been upgraded to Premium! 🎉",
                    description: "Your premium features have been activated!",
                  });
                  onOpenChange(false);
                  // Refresh the page to update premium status
                  window.location.reload();
                } catch (error) {
                  console.error('Payment processing error:', error);
                  toast({
                    title: "Payment Error",
                    description: "There was an issue processing your payment. Please try again.",
                    variant: "destructive"
                  });
                } finally {
                  setIsProcessing(false);
                }
              },
              onError: function(err: any) {
                console.error('PayPal error:', err);
                toast({
                  title: "Payment Error",
                  description: "There was an issue with PayPal. Please try again.",
                  variant: "destructive"
                });
                setIsProcessing(false);
              }
            }).render('#paypal-button-container');
          } catch (err: any) {
            console.error('PayPal render error:', err);
            toast({
              title: "Payment Error",
              description: "There was an issue loading PayPal. Please try again.",
              variant: "destructive"
            });
          }
        }
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        toast({
          title: "Payment Error",
          description: "Failed to load PayPal. Please check your internet connection.",
          variant: "destructive"
        });
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
      }, [open, user, toast, onOpenChange]);



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Upgrade to Premium
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Pay $5.99 per session, maximum 8 sessions per month
          </p>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* PayPal Payment */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="text-blue-800 font-semibold mb-2">PayPal Checkout</div>
                <div id="paypal-button-container"></div>
                {isProcessing && (
                  <div className="mt-2 text-sm text-blue-600">Processing your payment...</div>
                )}
              </div>
            </div>
          </div>



          {/* Security Note */}
          <div className="text-center text-xs text-muted-foreground">
            🔒 Your payment information is secure and encrypted
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
