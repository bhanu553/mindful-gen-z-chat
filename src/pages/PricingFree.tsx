
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, Heart, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/ui/navigation';

const PricingFree = () => {
  const freeFeatures = [
    "50 AI-powered therapy messages per day",
    "5 file uploads daily (images, documents)",
    "Basic emotional support conversations",
    "Simple mood tracking",
    "Access to core therapy modes",
    "Mobile-friendly interface",
    "Community support forum",
    "Basic privacy protection"
  ];

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
            <div className="inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <Heart className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-400 font-medium">Free Forever</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Start Your Journey
              <br />
              <span className="text-green-400">Completely Free</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Perfect for those taking their first steps toward emotional wellness. 
              Experience the power of AI-guided therapy without any commitment.
            </p>
          </div>

          {/* Target Audience */}
          <div className="glass-effect rounded-2xl p-8 mb-12 border border-border/50">
            <h2 className="text-2xl font-semibold mb-4 text-center">Who This Plan Is For</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-medium mb-2">First-Time Users</h3>
                <p className="text-sm text-muted-foreground">Exploring therapy for the first time</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Casual Support</h3>
                <p className="text-sm text-muted-foreground">Occasional emotional check-ins</p>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Budget-Conscious</h3>
                <p className="text-sm text-muted-foreground">Quality support without cost</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Usage Limits */}
            <div className="glass-effect rounded-2xl p-8 border border-border/50">
              <h3 className="text-2xl font-semibold mb-6">Daily Limits</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span>AI Messages</span>
                  <span className="font-bold text-green-400">50 per day</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span>File Uploads</span>
                  <span className="font-bold text-blue-400">5 per day</span>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="glass-effect rounded-2xl p-8 border border-border/50">
              <h3 className="text-2xl font-semibold mb-6">What's Included</h3>
              <div className="space-y-3">
                {freeFeatures.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Features List */}
          <div className="glass-effect rounded-2xl p-8 mb-12 border border-border/50">
            <h3 className="text-2xl font-semibold mb-6 text-center">Complete Feature List</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="glass-effect rounded-2xl p-8 border border-border/50">
              <h3 className="text-2xl font-semibold mb-4">Ready to Begin?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start your emotional wellness journey today. No credit card required, 
                no strings attached.
              </p>
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                >
                  Start Free Session
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Join thousands who trust EchoMind for their emotional wellbeing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingFree;
