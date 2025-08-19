
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
              Free Trial Experience
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Perfect for discovering if real AI therapy can transform your mental health
            </p>
          </div>

          {/* What's Included */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">What's Included ✨</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Complete Therapeutic Assessment</h3>
                  <p className="text-muted-foreground text-sm">Your full psychological intake analyzed by our advanced AI system to identify core emotional themes, trauma patterns, and optimal healing pathways.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Specialized Therapist Assignment</h3>
                  <p className="text-muted-foreground text-sm">Get matched with your personal AI therapist (Dr. Solace for trauma, Kai for existential issues, Rhea for inner conflict, etc.) based on your unique psychological profile.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">One Full 6-Phase Therapy Session</h3>
                  <p className="text-muted-foreground text-sm">Experience our complete therapeutic protocol:
                  <br/>Phase 1: Personalized intake analysis & warm therapeutic welcome
                  <br/>Phase 2: AI therapist matching based on your specific needs
                  <br/>Phase 3: Deep therapeutic work with your assigned specialist
                  <br/>Phase 4: Structured session with grounding, core work, and integration
                  <br/>Phase 5: Progress tracking and healing arc development
                  <br/>Phase 6: Between-session support and personalized homework
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">48-Hour Integration Period</h3>
                  <p className="text-muted-foreground text-sm">Like real therapy, you'll receive personalized reflection prompts and micro-practices to process your session - proving this isn't just chat, it's structured healing.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Crisis Detection & Support</h3>
                  <p className="text-muted-foreground text-sm">Our advanced AI monitors for mental health emergencies and provides immediate safety protocols (same system used in our premium tier).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Who It's For */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Who This Trial Is For 🎪</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MessageSquare className="w-5 h-5 text-blue-400 mt-1" />
                <p className="text-muted-foreground">🔍 Therapy Skeptics - Experience how AI therapy follows actual clinical protocols, not generic chatbot responses</p>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-yellow-400 mt-1" />
                <p className="text-muted-foreground">💰 Budget-Conscious Healers - Discover premium therapy techniques that normally cost $300-500 per session</p>
              </div>
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 text-purple-400 mt-1" />
                <p className="text-muted-foreground">🕐 Busy Professionals - Get therapeutic support without scheduling conflicts or waiting lists</p>
              </div>
             <div className="flex items-start space-x-3">
                <Heart className="w-5 h-5 text-pink-400 mt-1" />
                <p className="text-muted-foreground">🎓 Students & Young Adults - Access mental health care that won't drain your bank account</p>
             </div>
             <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-400 mt-1" />
                <p className="text-muted-foreground">🔒 Privacy-Conscious Individuals - Heal without insurance records or therapist shopping</p>
             </div>
            </div>
          </div>

          {/* Real Use Cases */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Real Therapeutic Outcomes You'll Experience 📊</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="font-semibold text-foreground mb-2">Immediate Insights (Session 1)</h3>
                <p className="text-muted-foreground text-sm">Discover your core emotional patterns and receive personalized therapeutic homework that addresses your specific psychological needs.</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="font-semibold text-foreground mb-2">Trauma-Informed Care (First 24 hours)</h3>
                <p className="text-muted-foreground text-sm">Experience how our AI detects and responds to trauma with the same sensitivity as $500/hour specialists.</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h3 className="font-semibold text-foreground mb-2">Crisis Preparedness (Always Active)</h3>
                <p className="text-muted-foreground text-sm">See how our system provides 3AM mental health support that human therapists simply cannot offer.</p>
              </div>
              <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                <h3 className="font-semibold text-foreground mb-2">Progress Tracking (Between Sessions)</h3>
                <p className="text-muted-foreground text-sm">Get personalized daily check-ins and micro-interventions designed specifically for your healing journey.</p>
              </div>
            </div>
          </div>

          {/* What Happens After Your Free Session */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">What Happens After Your Free Session 🚀</h2>
            <ul className="space-y-4 mb-8">
              <li>"This gave me breakthrough insights that 2 years of human therapy couldn't"</li>
              <li>"I finally found therapy that fits my schedule and budget"</li>
              <li>"The AI therapist understood my trauma better than any human"</li>
              <li>"I'm getting $300+ therapy quality for $5.99 per session"</li>
            </ul>
            <p className="text-muted-foreground">The Choice Becomes Clear:</p>
            <ul className="space-y-2 mt-2">
              <li>Pay per session - $5.99 each (max 8/month)</li>
              <li>Return to $300+ human therapy sessions</li>
              <li>Go without mental health support</li>
            </ul>
          </div>

          {/* Limited Trial Terms */}
          <div className="gradient-card p-8 rounded-lg border border-border/50 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Limited Trial Terms ⚠️</h2>
            <ul className="space-y-2">
              <li>One Session Only<br/>This isn't unlimited chat - you get one complete therapeutic experience to prove our system's value.</li>
              <li>48-Hour Processing Window<br/>Like real therapy, you'll need time to integrate insights before accessing additional sessions.</li>
              <li>Premium Upgrade Anytime<br/>Your therapeutic progress carries forward - no starting over if you upgrade.</li>
            </ul>
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
