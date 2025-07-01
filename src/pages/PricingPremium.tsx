
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, Crown, Star, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/ui/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PricingPremium = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const premiumFeatures = [
    "300 AI-powered therapy messages per day",
    "25 file uploads daily (images, documents, audio)",
    "Advanced emotional analysis & insights",
    "Detailed mood tracking with analytics",
    "Full access to all therapy modes",
    "Priority customer support",
    "Advanced privacy & encryption",
    "Export your conversation history",
    "Personalized therapy recommendations",
    "Integration with wellness apps",
    "Weekly progress reports",
    "24/7 crisis support access"
  ];

  const markUserAsPremium = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Welcome to Premium! 🎉",
        description: "Your premium features have been activated successfully!",
      });
      
      // Refresh the page to update premium status
      window.location.reload();
    } catch (error) {
      console.error('Error updating premium status:', error);
      toast({
        title: "Payment Error",
        description: "There was an issue activating your premium account. Please contact support.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Load PayPal SDK
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
                    value: '19.00'
                  },
                  description: 'EchoMind Premium Subscription - $19/month'
                }]
              });
            },
            onApprove: async function(data: any, actions: any) {
              setIsProcessing(true);
              try {
                const details = await actions.order.capture();
                console.log('PayPal payment completed:', details);
                await markUserAsPremium();
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
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [user, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          to="/#pricing" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Plans
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-4 py-2 mb-6">
              <Crown className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-medium">Premium Experience</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Unlock Advanced
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Emotional Intelligence</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Designed for serious emotional growth. Get advanced analytics, unlimited support, 
              and personalized insights to accelerate your mental wellness journey.
            </p>
          </div>

          {/* Target Audience */}
          <div className="glass-effect rounded-2xl p-8 mb-12 border border-border/50">
            <h2 className="text-2xl font-semibold mb-4 text-center">Who This Plan Is For</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Serious Growth</h3>
                <p className="text-sm text-muted-foreground">Committed to deep emotional development</p>
              </div>
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Data-Driven</h3>
                <p className="text-sm text-muted-foreground">Want detailed insights and analytics</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Power Users</h3>
                <p className="text-sm text-muted-foreground">Need unlimited access and support</p>
              </div>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="text-center mb-12">
            <div className="glass-effect rounded-2xl p-8 border border-yellow-400/30 bg-gradient-to-br from-yellow-400/5 to-orange-500/5">
              <div className="text-6xl font-bold mb-2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">$19</span>
              </div>
              <p className="text-muted-foreground text-lg">per month</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Usage Limits */}
            <div className="glass-effect rounded-2xl p-8 border border-border/50">
              <h3 className="text-2xl font-semibold mb-6">Expanded Limits</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20">
                  <span>AI Messages</span>
                  <span className="font-bold text-yellow-400">300 per day</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span>File Uploads</span>
                  <span className="font-bold text-blue-400">25 per day</span>
                </div>
              </div>
            </div>

            {/* Key Premium Features */}
            <div className="glass-effect rounded-2xl p-8 border border-border/50">
              <h3 className="text-2xl font-semibold mb-6">Premium Exclusives</h3>
              <div className="space-y-3">
                {premiumFeatures.slice(2, 6).map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Features List */}
          <div className="glass-effect rounded-2xl p-8 mb-12 border border-border/50">
            <h3 className="text-2xl font-semibold mb-6 text-center">Complete Premium Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div className="text-center">
            <div className="glass-effect rounded-2xl p-8 border border-yellow-400/30 bg-gradient-to-br from-yellow-400/5 to-orange-500/5">
              <h3 className="text-2xl font-semibold mb-4">Upgrade to Premium</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Transform your emotional wellness journey with advanced features 
                and unlimited support.
              </p>
              
              {user ? (
                <div className="max-w-md mx-auto">
                  <div id="paypal-button-container" className="mb-4"></div>
                  {isProcessing && (
                    <p className="text-sm text-yellow-400 mb-2">Processing your payment...</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    🔒 Secured by PayPal • Cancel anytime
                  </p>
                </div>
              ) : (
                <div>
                  <Link to="/login">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 mb-4"
                    >
                      Sign In to Upgrade
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Sign in to access premium features
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPremium;
