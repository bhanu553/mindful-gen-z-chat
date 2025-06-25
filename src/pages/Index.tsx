
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Star, MessageCircle, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartTherapy = async () => {
    console.log('Start therapy clicked, user:', user ? 'Logged in' : 'Not logged in');
    
    if (user) {
      navigate('/therapy');
    } else {
      try {
        console.log('Redirecting to Google OAuth...');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/therapy`
          }
        });

        if (error) {
          console.error('Error signing in:', error);
          // Fallback to login page if OAuth fails
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        navigate('/login');
      }
    }
  };

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Emotional AI Guidance",
      description: "Advanced AI trained specifically for emotional support and therapy"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Mood Insights Dashboard", 
      description: "Track your emotional patterns and see your growth over time"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Free to Start",
      description: "Begin your healing journey today, cancel anytime"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      text: "EchoMind helped me process my emotions in ways I never thought possible. The AI really understands.",
      rating: 5
    },
    {
      name: "Alex K.", 
      text: "Finally, therapy that doesn't feel intimidating. The different modes help me tackle different emotions.",
      rating: 5
    },
    {
      name: "Jordan T.",
      text: "The insights dashboard showed me patterns I never noticed. It's like having a therapist available 24/7.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full z-[-10]"
        style={{
          backgroundImage: `url('/lovable-uploads/7b219328-62cd-48c3-ba2a-f138629bc9db.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-[-5]" />
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your private AI{' '}
              <span className="text-gradient bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                therapist
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Chat, upload, reflect, evolve. EchoMind provides personalized emotional support 
              for dealing with heartbreak, trauma, and life's overwhelming moments.
            </p>
            <button
              onClick={handleStartTherapy}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group"
            >
              {user ? 'Continue Therapy' : 'Start Free Therapy'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Emotional healing, reimagined
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-effect p-6 rounded-xl border border-white/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Choose your healing journey
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="glass-effect p-8 rounded-xl border border-white/20 hover:border-primary/30 transition-all duration-300 shadow-sm">
              <h3 className="text-2xl font-bold text-white mb-2">Free Tier</h3>
              <p className="text-white/80 mb-6">Perfect for getting started</p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">5 media uploads/day</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">50 AI messages/day</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">4 AI Therapy Modes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Basic emotional dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Current week calendar</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-4">$0<span className="text-lg text-white/70">/month</span></div>
              <button
                onClick={handleStartTherapy}
                className="w-full bg-white/20 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                {user ? 'Continue Free' : 'Get Started'}
              </button>
            </div>

            {/* Premium Tier */}
            <div className="glass-effect p-8 rounded-xl border-2 border-primary/50 hover:border-primary transition-all duration-300 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium Tier</h3>
              <p className="text-white/80 mb-6">Unlock your full potential</p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Unlimited uploads & messages</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Advanced AI therapist</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Deep emotional analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">People Analysis insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Weekly recap & advice</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Full calendar access</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-4">$19<span className="text-lg text-white/70">/month</span></div>
              <button className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Stories of healing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="glass-effect p-6 rounded-xl border border-white/20 hover:border-primary/30 transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-4 italic">"{testimonial.text}"</p>
                <p className="text-white/70 font-semibold">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-semibold text-xl text-white">EchoMind</span>
            </div>
            <div className="flex space-x-6 text-white/70">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/70">
            <p>&copy; 2024 EchoMind. Your safe space for emotional healing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
