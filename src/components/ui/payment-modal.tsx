
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
      // Load PayPal SDK with the provided live client ID
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AafUMDFk_bynZe0U8CCVhPer8HcNyxPIXQtRxIrT6riwNEn9qUR0MyYAfY94LTjRR-yZcIs6IQHT8T36&vault=true&intent=capture&currency=USD';
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
                    description: `EchoMind Therapy Session - $5.99 per session - user:${user?.id}`,
                    custom_id: user?.id || ''
                  }]
                });
              },
              onApprove: async function(data: any, actions: any) {
                setIsProcessing(true);
                try {
                  const details = await actions.order.capture();
                  console.log('PayPal payment completed:', details);

                  toast({
                    title: "Payment successful! 🎉",
                    description: "Your session credit has been created. You can start your next session when the cooldown ends.",
                  });
                  onOpenChange(false);
                  // Close modal and let the cooldown component handle the next steps
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
            Start Next Session
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Pay $5.99 per session to continue your therapy
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
