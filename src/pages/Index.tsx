
import { useState, useEffect } from 'react';
import { ArrowRight, Brain, Heart, MessageSquare, TrendingUp, Shield, Sparkles, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import PaymentModal from '@/components/ui/payment-modal';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnboardingComplete, isLoading } = useOnboardingStatus();

  const handleStartJourney = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (isOnboardingComplete) {
      navigate('/therapy');
    } else {
      navigate('/onboarding');
    }
  };
  
  const heroImages = [
    '/lovable-uploads/7b219328-62cd-48c3-ba2a-f138629bc9db.png',
    '/lovable-uploads/a3872cd3-caf3-42ac-99bb-15e21499e310.png',
    '/lovable-uploads/4e0d3477-805c-4e57-b52c-82fe4a8d1c4f.png',
    '/lovable-uploads/07533b71-b782-4088-844e-83d3b08837e7.png',
    '/lovable-uploads/63bfd61c-32c7-4ddb-aa9a-6c5a6d885cc6.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section with Rotating Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ))}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your AI Companion for
            <span className="text-gradient block">Emotional Wellness</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Navigate life's challenges with personalized AI therapy. Get instant support, 
            track your emotional journey, and discover insights that help you thrive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartJourney}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Start Your Journey'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link 
              to="/dashboard" 
              className="glass-effect text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose EchoMind?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of emotional wellness with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">24/7 AI Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get instant emotional support whenever you need it. Our AI is always here to listen and guide you through difficult moments.
              </p>
            </div>

            <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-3 bg-green-500/20 rounded-lg w-fit mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Mood Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Understand your emotional patterns with advanced analytics and personalized insights into your mental wellness journey.
              </p>
            </div>

            <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
                <Heart className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Personalized Care</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive tailored therapeutic approaches based on your unique needs, preferences, and emotional responses.
              </p>
            </div>

            <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-3 bg-yellow-500/20 rounded-lg w-fit mb-4">
                <Shield className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Privacy First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your conversations are encrypted and secure. We prioritize your privacy and maintain strict confidentiality standards.
              </p>
            </div>

            <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-3 bg-pink-500/20 rounded-lg w-fit mb-4">
                <Sparkles className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Evidence-Based</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI uses proven therapeutic techniques including CBT, mindfulness, and positive psychology approaches.
              </p>
            </div>

            <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-3 bg-indigo-500/20 rounded-lg w-fit mb-4">
                <Brain className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Continuous Learning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI continuously improves and adapts to provide increasingly personalized and effective support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 gradient-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your emotional wellness journey with our flexible pricing options
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
                <div className="text-4xl font-bold text-foreground mb-4">
                  $0<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">Perfect for getting started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">50 messages/day</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">5 uploads/day</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">Basic emotional AI support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">Dynamic Mode Switching (Reflect, Recover, Rebuild, Evolve)</span>
                </li>
              </ul>

              <Link 
                to="/free-plan-details" 
                className="w-full bg-secondary text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors block text-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="gradient-card p-8 rounded-lg border-2 border-primary/50 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
                <div className="text-4xl font-bold text-foreground mb-4">
                  $9.99<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">Complete emotional wellness experience</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">300 messages/day</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">25 uploads/day</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">Dynamic Mode Switching (Reflect, Recover, Rebuild, Evolve)</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">Full memory storage for therapy sessions</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">Past conversation recall</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">Early access to future features</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-foreground">Dedicated growth insights</span>
                </li>
              </ul>
              
              <Link
                to="/premium-plan-details"
                className="w-full bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 block text-center"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Emotional Wellness?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already started their journey to better mental health with EchoMind's AI-powered support.
          </p>
          <button
            onClick={handleStartJourney}
            disabled={isLoading}
            className="inline-flex items-center bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Start Your Free Trial Today'}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} />
    </div>
  );
};

export default Index;
