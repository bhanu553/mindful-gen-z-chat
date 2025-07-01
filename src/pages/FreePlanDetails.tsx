
import { ArrowRight, Check, Heart, MessageSquare, Zap, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';

const FreePlanDetails = () => {
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-6">
              <Heart className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Free Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Perfect for those taking their first steps toward emotional wellness and discovering the power of AI-guided support.
            </p>
          </div>

          {/* What's Included */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">50 Messages Daily</h3>
                  <p className="text-muted-foreground text-sm">Plenty of conversations to explore your emotions and get guidance throughout the day.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">5 Uploads Daily</h3>
                  <p className="text-muted-foreground text-sm">Share images, documents, or voice notes to enhance your therapy sessions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Basic AI Support</h3>
                  <p className="text-muted-foreground text-sm">Access to our core emotional AI that understands and responds with empathy.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Dynamic Mode Switching</h3>
                  <p className="text-muted-foreground text-sm">Experience Reflect, Recover, Rebuild, and Evolve modes for comprehensive support.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Who It's For */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Who This Plan Is For</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MessageSquare className="w-5 h-5 text-blue-400 mt-1" />
                <p className="text-muted-foreground">Individuals curious about AI therapy and wanting to explore emotional support tools</p>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-yellow-400 mt-1" />
                <p className="text-muted-foreground">People dealing with everyday stress who need occasional guidance and reflection</p>
              </div>
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 text-purple-400 mt-1" />
                <p className="text-muted-foreground">Those who want to understand their emotional patterns before committing to premium features</p>
              </div>
            </div>
          </div>

          {/* Real Use Cases */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Real Emotional Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="font-semibold text-foreground mb-2">Daily Check-ins</h3>
                <p className="text-muted-foreground text-sm">Start or end your day with a brief emotional check-in to understand your mood and get supportive guidance.</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="font-semibold text-foreground mb-2">Stress Management</h3>
                <p className="text-muted-foreground text-sm">Work through immediate stress or anxiety with our AI's calming techniques and perspective shifts.</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h3 className="font-semibold text-foreground mb-2">Relationship Insights</h3>
                <p className="text-muted-foreground text-sm">Get guidance on communication challenges and emotional responses in your relationships.</p>
              </div>
              <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                <h3 className="font-semibold text-foreground mb-2">Self-Discovery</h3>
                <p className="text-muted-foreground text-sm">Explore your thoughts and feelings in a safe space to better understand yourself.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link 
              to="/therapy" 
              className="inline-flex items-center bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group"
            >
              Start Your Free Journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-muted-foreground mt-4">No credit card required • Start immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreePlanDetails;
