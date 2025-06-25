
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Heart, Shield, Sparkles, Check, Star } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/therapy');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-screen background image */}
      <div 
        className="absolute inset-0 w-full h-full z-[-10]"
        style={{
          backgroundImage: `url('/lovable-uploads/7b219328-62cd-48c3-ba2a-f138629bc9db.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 z-[-5]" />
      
      <Navigation />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex justify-center mb-8">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Your AI Therapy
                <span className="block text-gradient">Companion</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Process emotions, heal trauma, and grow stronger with personalized AI guidance. 
                Available 24/7, completely private, and tailored to your journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 backdrop-blur-sm"
                >
                  Start Your Journey
                </button>
                <a
                  href="#pricing"
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-black/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Four Paths to Healing
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Choose your therapy mode based on what you need most right now
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: '🟣',
                  title: 'Reflect',
                  description: 'Process thoughts and emotions with gentle guidance',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  icon: '🔵',
                  title: 'Recover',
                  description: 'Heal from trauma and difficult experiences',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  icon: '🟢',
                  title: 'Rebuild',
                  description: 'Reconstruct your sense of self and relationships',
                  color: 'from-green-500 to-green-600'
                },
                {
                  icon: '🟡',
                  title: 'Evolve',
                  description: 'Grow beyond your current limitations',
                  color: 'from-yellow-500 to-orange-500'
                }
              ].map((mode, index) => (
                <div key={index} className="glass-effect p-6 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="text-4xl mb-4">{mode.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{mode.title}</h3>
                  <p className="text-white/80">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {[
                {
                  icon: Heart,
                  title: 'Always Available',
                  description: 'Get support whenever you need it, day or night. No appointments, no waiting lists.'
                },
                {
                  icon: Shield,
                  title: 'Completely Private',
                  description: 'Your conversations are encrypted and secure. Share freely in a judgment-free space.'
                },
                {
                  icon: Sparkles,
                  title: 'Personalized Growth',
                  description: 'AI that learns your patterns and provides insights tailored to your unique journey.'
                }
              ].map((benefit, index) => (
                <div key={index} className="text-center glass-effect p-8 rounded-lg border border-white/20">
                  <div className="flex justify-center mb-6">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <benefit.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">{benefit.title}</h3>
                  <p className="text-white/80 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-black/60 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-white/80">
                Start free, upgrade when you're ready for unlimited access
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="glass-effect p-8 rounded-lg border border-white/20 relative">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-6">
                  $0<span className="text-lg text-white/60">/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    '50 messages per month',
                    '5 image uploads per day',
                    'Basic emotional tracking',
                    'Current week calendar access'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-white/20 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                >
                  Get Started Free
                </button>
              </div>

              {/* Premium Plan */}
              <div className="glass-effect p-8 rounded-lg border-2 border-yellow-400/50 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                <div className="text-4xl font-bold text-white mb-6">
                  $19<span className="text-lg text-white/60">/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    'Unlimited messages',
                    'Unlimited image uploads',
                    'Advanced emotional analytics',
                    'Full calendar access with notes',
                    'Weekly AI therapy summaries',
                    'Premium background themes',
                    'Priority support'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* PayPal Integration */}
                <div id="paypal-button-container" className="mt-4"></div>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 mt-4"
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-black/40 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Trusted by Thousands
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah M.',
                  text: 'EchoMind helped me process my anxiety in ways I never thought possible. The AI really understands.',
                  rating: 5
                },
                {
                  name: 'Michael R.',
                  text: 'Having 24/7 support changed everything. I can work through difficult emotions whenever they arise.',
                  rating: 5
                },
                {
                  name: 'Emma L.',
                  text: 'The different therapy modes let me choose exactly what I need. Sometimes I reflect, sometimes I rebuild.',
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="glass-effect p-6 rounded-lg border border-white/20">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-white/80 mb-4 italic">"{testimonial.text}"</p>
                  <p className="text-white font-semibold">— {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Healing Journey?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands who've found peace, clarity, and growth with EchoMind
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              Begin Your Journey Today
            </button>
          </div>
        </section>
      </div>
      
      <Footer />
      
      {/* PayPal Script */}
      <script src="https://www.paypal.com/sdk/js?client-id=sb&vault=true&intent=subscription"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('load', function() {
            if (window.paypal) {
              paypal.Buttons({
                style: {
                  shape: 'pill',
                  color: 'gold',
                  layout: 'vertical',
                  label: 'subscribe'
                },
                createSubscription: function(data, actions) {
                  return actions.subscription.create({
                    'plan_id': 'P-7VR18749FA1234512LXUYT5Q'
                  });
                },
                onApprove: function(data, actions) {
                  alert('Test subscription completed! ID: ' + data.subscriptionID);
                }
              }).render('#paypal-button-container');
            }
          });
        `
      }} />
    </div>
  );
};

export default Index;
