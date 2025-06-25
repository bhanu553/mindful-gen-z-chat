
import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentModal = ({ open, onOpenChange }: PaymentModalProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');

  const handlePayPalPayment = () => {
    // Simulate PayPal payment success
    setTimeout(() => {
      toast({
        title: "Welcome to EchoMind Premium 🎉",
        description: "Your premium features have been activated!",
      });
      onOpenChange(false);
    }, 1500);
  };

  const handleCardPayment = () => {
    // Simulate card payment success
    setTimeout(() => {
      toast({
        title: "Welcome to EchoMind Premium 🎉",
        description: "Your premium features have been activated!",
      });
      onOpenChange(false);
    }, 1500);
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
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Payment Method Selector */}
          <div className="flex space-x-4">
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                paymentMethod === 'paypal'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-blue-600 font-semibold">PayPal</div>
                <div className="text-sm text-muted-foreground">Quick & Secure</div>
              </div>
            </button>
            
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
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
                    You'll be redirected to PayPal to complete your subscription
                  </div>
                  <button
                    onClick={handlePayPalPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Continue with PayPal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Card Payment Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCardPayment}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Subscribe for $19/month
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
