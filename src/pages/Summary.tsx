
import { useState } from 'react';
import { Calendar, TrendingUp, Lightbulb, Heart, ChevronDown, Lock } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Summary = () => {
  const { isPremium } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState('current');

  const weekOptions = [
    { id: 'current', label: 'This Week' },
    { id: 'last', label: 'Last Week' },
    { id: '2weeks', label: '2 Weeks Ago' },
    { id: '3weeks', label: '3 Weeks Ago' }
  ];

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
                
                <button className="bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
                  Upgrade to Premium - $19/month
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Therapy Summary</h1>
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm px-3 py-1 rounded-full font-semibold">
                PRO
              </span>
              <span className="text-muted-foreground">Premium insights</span>
            </div>
          </div>
          
          {/* Week Selector */}
          <div className="relative mt-4 sm:mt-0">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-secondary border border-border/50 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none pr-8"
            >
              {weekOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Week Highlights */}
        <div className="gradient-card p-6 rounded-lg border border-border/50 mb-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Heart className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">This Week's Highlights</h2>
          </div>
          <div className="space-y-3">
            {premiumSummaryData.weekHighlights.map((highlight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-foreground">{highlight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emotional Trends */}
        <div className="gradient-card p-6 rounded-lg border border-border/50 mb-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Emotional Trends</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {premiumSummaryData.emotionalTrends.map((trend, index) => (
              <div key={index} className="bg-secondary/50 p-4 rounded-lg border border-border/30">
                <h3 className="font-medium text-foreground mb-1">{trend.emotion}</h3>
                <p className={`text-sm font-semibold ${
                  trend.positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trend.change}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="gradient-card p-6 rounded-lg border border-border/50 mb-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Recommended Next Steps</h2>
          </div>
          <div className="space-y-3">
            {premiumSummaryData.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-semibold">{index + 1}</span>
                </div>
                <p className="text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Therapist Notes */}
        <div className="gradient-card p-6 rounded-lg border border-border/50 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">AI Therapist Notes</h2>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg border border-border/20">
            <p className="text-foreground italic leading-relaxed">
              "{premiumSummaryData.therapistNotes}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
