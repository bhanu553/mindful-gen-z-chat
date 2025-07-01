
import { useEffect, useRef } from 'react';
import { ArrowRight, Check, Crown, Sparkles, Brain, TrendingUp, Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { useAuth } from '@/contexts/AuthContext';

const PremiumPlanDetails = () => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const { user, isPremium } = useAuth();

  const markUserAsPremium = async () => {
    // This function would connect to Supabase to mark user as premium
    console.log('User marked as premium subscriber');
    // Add your Supabase logic here
  };

  useEffect(() => {
    // Only load PayPal if user is not premium and is logged in
    if (!isPremium && user) {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AafUMDFk_bynZe0U8CCVhPer8HcNyxPIXQtRxIrT6riwNEn9qUR0MyYAfY94LTjRR-yZcIs6IQHT8T36&vault=true&intent=capture&currency=USD';
      script.addEventListener('load', () => {
        if (window.paypal && document.getElementById('paypal-button-container')) {
          window.paypal.Buttons({
            style: {
              shape: 'rect',
              color: 'gold',
              layout: 'vertical',
              label: 'pay'
            },
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: '19.00'
                  },
                  description: 'EchoMind Premium Plan - $19 one-time payment'
                }]
              });
            },
            onApprove: async (data, actions) => {
              console.log('Payment approved:', data);
              const details = await actions.order.capture();
              console.log('Payment captured:', details);
              await markUserAsPremium();
              alert('Welcome to Premium! Your upgrade is now active.');
              window.location.reload(); // Refresh to update premium status
            },
            onError: (err) => {
              console.error('PayPal error:', err);
              alert('There was an error processing your payment. Please try again.');
            },
            onCancel: (data) => {
              console.log('Payment cancelled:', data);
            }
          }).render('#paypal-button-container');
        }
      });
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isPremium, user]);

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link 
            to="/#pricing" 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-8"
          >
            ← Back to All Plans
          </Link>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full mb-6">
              <Crown className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Premium Plan
            </h1>
            <div className="text-3xl font-bold text-foreground mb-4">
              $19<span className="text-lg font-normal text-muted-foreground"> one-time</span>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The complete emotional wellness experience for those serious about their mental health journey and personal growth.
            </p>
          </div>

          {/* What's Included */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Complete Premium Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">300 Messages Daily</h3>
                  <p className="text-muted-foreground text-sm">Unlimited conversations for deep therapeutic exploration and continuous support.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">25 Uploads Daily</h3>
                  <p className="text-muted-foreground text-sm">Enhanced multimedia support for richer therapy sessions with voice, images, and documents.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Dynamic Mode Switching</h3>
                  <p className="text-muted-foreground text-sm">Full access to Reflect, Recover, Rebuild, and Evolve modes with premium customization.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Full Memory Storage</h3>
                  <p className="text-muted-foreground text-sm">Complete session history with advanced search and organization capabilities.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Past Conversation Recall</h3>
                  <p className="text-muted-foreground text-sm">AI remembers your entire journey, providing contextual and personalized support.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Early Access Features</h3>
                  <p className="text-muted-foreground text-sm">Be the first to experience new therapeutic tools and AI capabilities.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Dedicated Growth Insights</h3>
                  <p className="text-muted-foreground text-sm">Advanced analytics and personalized reports on your emotional progress.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Who It's For */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Who This Plan Is For</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-primary mt-1" />
                <p className="text-muted-foreground">Individuals committed to deep emotional work and personal transformation</p>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-green-400 mt-1" />
                <p className="text-muted-foreground">People who want comprehensive tracking of their mental health journey</p>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 mt-1" />
                <p className="text-muted-foreground">Those who value continuity and want their AI therapist to remember their entire story</p>
              </div>
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 text-purple-400 mt-1" />
                <p className="text-muted-foreground">Users seeking advanced insights and personalized growth recommendations</p>
              </div>
            </div>
          </div>

          {/* Real Use Cases */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Advanced Emotional Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">Trauma Processing</h3>
                <p className="text-muted-foreground text-sm">Work through complex emotional experiences with continuous support and memory of your healing journey.</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="font-semibold text-foreground mb-2">Long-term Therapy</h3>
                <p className="text-muted-foreground text-sm">Build lasting therapeutic relationships with AI that remembers your progress, setbacks, and breakthroughs.</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="font-semibold text-foreground mb-2">Crisis Support</h3>
                <p className="text-muted-foreground text-sm">Access unlimited support during difficult periods with personalized coping strategies.</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h3 className="font-semibold text-foreground mb-2">Personal Growth</h3>
                <p className="text-muted-foreground text-sm">Receive detailed insights and recommendations for continuous emotional and mental development.</p>
              </div>
            </div>
          </div>

          {/* Premium Status or Payment Section */}
          {isPremium ? (
            <div className="gradient-card p-8 rounded-lg border-2 border-green-500/50 shadow-lg mb-8 text-center">
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">You're Already Premium!</h2>
              <p className="text-muted-foreground">You have access to all premium features. Start your therapy session now.</p>
              <Link 
                to="/therapy" 
                className="inline-flex items-center bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group mt-4"
              >
                Start Therapy Session
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : user ? (
            <div className="gradient-card p-8 rounded-lg border-2 border-primary/50 shadow-lg mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Upgrade to Premium</h2>
                <p className="text-muted-foreground">Unlock the full potential of AI-powered emotional wellness</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div id="paypal-button-container" className="mb-4"></div>
                <p className="text-center text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Secured by PayPal • One-time payment
                </p>
              </div>
            </div>
          ) : (
            <div className="gradient-card p-8 rounded-lg border-2 border-primary/50 shadow-lg mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-6">Sign in to upgrade to Premium or start with our Free plan</p>
              <div className="space-y-4">
                <Link 
                  to="/login" 
                  className="inline-flex items-center bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group"
                >
                  Sign In to Upgrade
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="text-muted-foreground">or</div>
                <Link 
                  to="/therapy" 
                  className="inline-flex items-center bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Try Free Plan
                  <Heart className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Alternative CTA */}
          {!isPremium && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Want to try it first?</p>
              <Link 
                to="/therapy" 
                className="inline-flex items-center bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
              >
                Start with Free Plan
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumPlanDetails;
