
import { useState } from 'react';
import { Calendar, TrendingUp, Lightbulb, Heart, Lock, StickyNote } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import PaymentModal from '@/components/ui/payment-modal';
import CalendarWithNotes from '@/components/ui/calendar-with-notes';
import { useAuth } from '@/contexts/AuthContext';

const Summary = () => {
  const { isPremium } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [userNote, setUserNote] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const premiumSummaryData = {
    weekHighlights: [
      "You've made significant progress in processing your recent challenges",
      "Your resilience has grown stronger through consistent reflection",
      "You're beginning to see patterns in your emotional responses",
      "Your self-awareness has deepened in meaningful ways"
    ],
    emotionalTrends: [
      { emotion: 'Hope', change: '+15%', positive: true },
      { emotion: 'Anxiety', change: '-8%', positive: true },
      { emotion: 'Clarity', change: '+22%', positive: true },
      { emotion: 'Sadness', change: '-12%', positive: true }
    ],
    nextSteps: [
      "Continue exploring your emotional patterns in the Reflect mode",
      "Practice the mindfulness techniques we discussed",
      "Consider journaling about your daily experiences",
      "Set healthy boundaries with challenging relationships",
      "Focus on self-compassion during difficult moments"
    ],
    therapistNotes: "You're showing remarkable growth in emotional awareness. Your willingness to be vulnerable and honest about your feelings is accelerating your healing process. Focus on maintaining the daily reflection practice we established."
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="gradient-card p-12 rounded-lg border border-border/50 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5" />
              <div className="relative">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-primary to-purple-600 rounded-full shadow-lg">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-foreground mb-4">Premium Feature</h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  The Summary tab provides personalized weekly recaps of your therapy sessions, 
                  emotional insights, and actionable advice for your healing journey.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
                  <div className="bg-secondary/50 p-6 rounded-lg border border-border/30 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-3">Weekly Highlights</h3>
                    <p className="text-muted-foreground text-sm">
                      Get a curated summary of your most important breakthroughs and insights from the week.
                    </p>
                  </div>
                  
                  <div className="bg-secondary/50 p-6 rounded-lg border border-border/30 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-3">Emotional Trends</h3>
                    <p className="text-muted-foreground text-sm">
                      Track how your emotions have shifted and evolved over time with detailed analytics.
                    </p>
                  </div>
                  
                  <div className="bg-secondary/50 p-6 rounded-lg border border-border/30 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-3">Next Steps</h3>
                    <p className="text-muted-foreground text-sm">
                      Receive personalized recommendations for continuing your healing journey.
                    </p>
                  </div>
                  
                  <div className="bg-secondary/50 p-6 rounded-lg border border-border/30 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-3">AI Therapist Notes</h3>
                    <p className="text-muted-foreground text-sm">
                      Get professional insights about your progress and areas of focus.
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  Upgrade to Premium - $19/month
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal 
          open={showPaymentModal} 
          onOpenChange={setShowPaymentModal} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Premium Background - Same as Dashboard */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(/lovable-uploads/9498b951-ab8b-489a-a382-bf1622a84998.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="fixed inset-0 bg-black/50 z-0" />
      
      <div className="relative z-10">
        <Navigation />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="backdrop-blur-md bg-white/70 p-6 rounded-2xl border border-white/20 shadow-lg">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Therapy Summary</h1>
              <div className="flex items-center space-x-2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm px-3 py-1 rounded-full font-semibold">
                  PRO
                </span>
                <span className="text-gray-700">Premium insights</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Summary Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Summary - Notepad Style */}
              <div className="backdrop-blur-md bg-amber-50/90 border border-amber-200/50 rounded-2xl shadow-2xl relative">
                {/* Notepad Lines */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  {Array.from({ length: 15 }, (_, i) => (
                    <div key={i} className="h-8 border-b border-blue-200/30" style={{ marginTop: i === 0 ? '2rem' : '0' }} />
                  ))}
                </div>
                
                {/* Red Margin Line */}
                <div className="absolute left-12 top-0 bottom-0 w-px bg-red-300/50" />
                
                <div className="relative p-8 pt-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 handwriting">This Week's Highlights</h2>
                  </div>
                  
                  <div className="space-y-4 font-mono text-gray-700 leading-relaxed">
                    {premiumSummaryData.weekHighlights.map((highlight, index) => (
                      <div key={index} className="flex items-start space-x-3 pl-8">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0" />
                        <p className="handwriting text-lg">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Note Section - Sticky Note Style */}
              <div className="relative max-w-lg mx-auto">
                <div className="backdrop-blur-md bg-yellow-100/90 border border-yellow-200/50 rounded-2xl shadow-lg transform rotate-1 hover:rotate-0 transition-transform">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <StickyNote className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-yellow-800">Your Personal Note</h3>
                    </div>
                    <textarea
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      placeholder="Add your own thoughts and reflections here..."
                      className="w-full h-24 bg-transparent border-none resize-none focus:outline-none text-yellow-800 placeholder-yellow-600/70 handwriting text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Emotional Trends */}
              <div className="backdrop-blur-md bg-white/70 p-6 rounded-2xl border border-white/20 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Emotional Trends</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {premiumSummaryData.emotionalTrends.map((trend, index) => (
                    <div key={index} className="bg-white/50 p-4 rounded-lg border border-white/30">
                      <h3 className="font-medium text-gray-800 mb-1">{trend.emotion}</h3>
                      <p className={`text-sm font-semibold ${
                        trend.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trend.change}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="backdrop-blur-md bg-white/70 p-6 rounded-2xl border border-white/20 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Recommended Next Steps</h2>
                </div>
                <div className="space-y-3">
                  {premiumSummaryData.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-yellow-600 text-sm font-semibold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Therapist Notes */}
              <div className="backdrop-blur-md bg-white/70 p-6 rounded-2xl border border-white/20 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">AI Therapist Notes</h2>
                </div>
                <div className="bg-white/30 p-4 rounded-lg border border-white/20">
                  <p className="text-gray-700 italic leading-relaxed handwriting text-lg">
                    "{premiumSummaryData.therapistNotes}"
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Calendar - Same styling as Dashboard */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl p-4 shadow-lg">
                <CalendarWithNotes
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
