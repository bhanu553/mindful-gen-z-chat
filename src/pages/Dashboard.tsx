
import { useState, useEffect } from 'react';
import { ArrowRight, Clock, BookOpen, Sparkles, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import PaymentModal from '@/components/ui/payment-modal';
import { useAuth } from '@/contexts/AuthContext';
import { useTherapySessions } from '@/hooks/useTherapySessions';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, isPremium } = useAuth();
  const { sessions, loading } = useTherapySessions();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const userName = profile?.full_name?.split(' ')[0] || 'Friend';
  const recentSessions = sessions.slice(0, 3);
  
  const therapyInsights = [
    "You've shown remarkable growth in emotional awareness",
    "Your recent sessions indicate increasing self-compassion",
    "Focus on mindfulness techniques has yielded positive results"
  ];

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatSessionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startNewSession = () => {
    navigate('/therapy');
  };

  // Check if there's an active (incomplete) session that should be continued
  const hasActiveSession = sessions.find(session => {
    // A session is active if it's recent and doesn't have 'is_complete' true
    // (using the session data structure we have)
    const sessionDate = new Date(session.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Consider sessions from the last 7 days as potentially active
    return daysDiff <= 7;
  });

  return (
    <div className="min-h-screen relative">
      {/* Therapeutic Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(/lovable-uploads/35a62b57-2cb9-4669-988d-d33156872a1d.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 z-0" />
      
      <div className="relative z-10">
        <Navigation />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Welcome Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className="premium-glass rounded-3xl p-6 md:p-8 lg:p-12 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <User className="w-6 h-6 md:w-8 md:h-8 text-white/70 mr-2 md:mr-3" />
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-light text-white">
                  {getTimeBasedGreeting()}, {userName}
                </h1>
              </div>
              <p className="text-lg md:text-xl lg:text-2xl text-white/80 font-light mb-2">
                Your space is safe here.
              </p>
              <p className="text-base md:text-lg text-white/60">
                Your Innerflow therapy session awaits when you're ready.
              </p>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
            
            {/* Start New Session */}
            <div className="premium-glass rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-serif text-white mb-3 md:mb-4">
                  {hasActiveSession ? 'Continue Your Session' : 'Begin Today\'s Therapy'}
                </h3>
                <p className="text-white/70 mb-6 md:mb-8 text-sm md:text-base">
                  {hasActiveSession 
                    ? 'Your therapy session is waiting to continue your healing journey.'
                    : 'Let\'s reflect and heal deeply — one conversation at a time.'
                  }
                </p>
                <Button 
                  onClick={startNewSession}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 md:px-8 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 min-h-[44px] w-full md:w-auto"
                >
                  {hasActiveSession ? 'Continue Session' : 'Start Session'}
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Next Session Schedule */}
            <div className="premium-glass rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-serif text-white mb-3 md:mb-4">Next Session</h3>
                <p className="text-white/70 mb-3 md:mb-4 text-sm md:text-base">
                  Your next session is scheduled for this evening.
                </p>
                <p className="text-white/50 text-xs md:text-sm mb-4 md:mb-6">
                  Spacing between sessions allows your thoughts to settle.
                </p>
                <Button 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-4 md:px-6 py-2 rounded-xl min-h-[44px] w-full md:w-auto"
                >
                  Set Reminder
                </Button>
              </div>
            </div>
          </div>

          {/* Previous Sessions & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Previous Sessions Archive */}
            <div className="lg:col-span-2 premium-glass rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-serif text-white">Previous Sessions</h3>
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white/70" />
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-white/10 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-all cursor-pointer"
                      onClick={() => navigate(`/session/${session.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium text-lg">{session.title}</h4>
                          <p className="text-white/60 text-sm">{formatSessionDate(session.created_at)}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/40" />
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full text-white/70 hover:text-white hover:bg-white/10 mt-4"
                  >
                    View All Sessions
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60">No previous sessions yet.</p>
                  <p className="text-white/40 text-sm mt-2">Your therapy journey begins with your first session.</p>
                </div>
              )}
            </div>

            {/* Therapy Insights Panel */}
            <div className="premium-glass rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-serif text-white mb-6">Reflection Points</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Recent Insights</h4>
                  <div className="space-y-3">
                    {therapyInsights.map((insight, index) => (
                      <p key={index} className="text-white/70 text-sm leading-relaxed">
                        • {insight}
                      </p>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Emotional Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Growth', 'Self-compassion', 'Mindfulness'].map((theme) => (
                      <span key={theme} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Upgrade Section for Free Users */}
          {!isPremium && (
            <div className="mt-12 premium-glass rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center">
                <h3 className="text-2xl font-serif text-white mb-4">Unlock Deeper Insights</h3>
                <p className="text-white/70 mb-8">
                  Premium therapy experience with advanced emotional analytics and personalized guidance.
                </p>
                <Button 
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-white text-black hover:bg-white/90 px-8 py-3 rounded-2xl font-medium transition-all duration-300"
                >
                  Pay Per Session - $5.99 each (max 8/month)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal} 
      />
    </div>
  );
};

export default Dashboard;
