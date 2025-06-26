
import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open && paymentMethod === 'paypal') {
      // Load PayPal SDK with live client ID
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AafUMDFk_bynZe0U8CCVhPer8HcNyxPIXQtRxIrT6riwNEn9qUR0MyYAfY94LTjRR-yZcIs6IQHT8T36&vault=true&intent=subscription&currency=USD';
      script.async = true;
      script.onload = () => {
        if (window.paypal && document.getElementById('paypal-button-container')) {
          window.paypal.Buttons({
            style: {
              shape: 'pill',
              color: 'gold',
              layout: 'vertical',
              label: 'subscribe'
            },
            createSubscription: function(data: any, actions: any) {
              return actions.subscription.create({
                'plan_id': 'P-19' // This would be your actual PayPal plan ID for $19/month
              });
            },
            onApprove: async function(data: any, actions: any) {
              setIsProcessing(true);
              try {
                // Update user's premium status in Supabase
                if (user) {
                  const { error } = await supabase
                    .from('profiles')
                    .update({ is_premium: true })
                    .eq('id', user.id);

                  if (error) {
                    console.error('Error updating premium status:', error);
                  }
                }

                toast({
                  title: "You're now a Premium user! 🎉",
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
            }
          }).render('#paypal-button-container');
        }
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [open, paymentMethod, user, toast, onOpenChange]);

  const handleCardPayment = async () => {
    setIsProcessing(true);
    
    // Simulate card payment processing
    setTimeout(async () => {
      try {
        // Update user's premium status in Supabase
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);

          if (error) {
            console.error('Error updating premium status:', error);
          }
        }

        toast({
          title: "You're now a Premium user! 🎉",
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
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Upgrade to Premium
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Unlock enhanced insights and premium features for $19/month
          </p>
          <div className="text-center text-sm text-muted-foreground mt-2">
            <div>Premium: 300 messages/day • 25 uploads/day</div>
            <div>Free: 50 messages/day • 5 uploads/day</div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Payment Method Selector */}
          <div className="flex space-x-4">
            <button
              onClick={() => setPaymentMethod('paypal')}
              disabled={isProcessing}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                paymentMethod === 'paypal'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <div className="text-blue-600 font-semibold">PayPal</div>
                <div className="text-sm text-muted-foreground">Quick & Secure</div>
              </div>
            </button>
            
            <button
              onClick={() => setPaymentMethod('card')}
              disabled={isProcessing}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <CreditCard className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                <div className="text-sm text-muted-foreground">Credit/Debit Card</div>
              </div>
            </button>
          </div>

          {/* PayPal Payment */}
          {paymentMethod === 'paypal' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-blue-800 font-semibold mb-2">PayPal Checkout</div>
                  <div className="text-sm text-blue-600 mb-4">
                    Secure subscription payment via PayPal
                  </div>
                  <div id="paypal-button-container"></div>
                  {isProcessing && (
                    <div className="mt-2 text-sm text-blue-600">Processing your subscription...</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Card Payment Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="text-center text-sm text-gray-600 mb-4">
                    {/* Comment: Stripe/Razorpay integration will go here */}
                    Demo Mode - Card payment simulation
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="12/25"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCardPayment}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Subscribe for $19/month'}
                  </button>
                </div>
              </div>
            </div>
          )}

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
