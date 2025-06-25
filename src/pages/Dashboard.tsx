
import { useState } from 'react';
import { TrendingUp, Heart, MessageSquare, Users, FileText, Calendar } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import CalendarWithNotes from '@/components/ui/calendar-with-notes';
import Footer from '@/components/ui/footer';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { isPremium } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const emotionalStats = {
    positivePercent: 68,
    negativePercent: 32,
    totalMessages: 156,
    sessionsCompleted: 12
  };

  const emotionWords = [
    { word: 'hopeful', size: 'text-2xl', color: 'text-green-400' },
    { word: 'anxious', size: 'text-xl', color: 'text-yellow-400' },
    { word: 'grateful', size: 'text-lg', color: 'text-blue-400' },
    { word: 'overwhelmed', size: 'text-xl', color: 'text-orange-400' },
    { word: 'peaceful', size: 'text-lg', color: 'text-purple-400' },
    { word: 'confused', size: 'text-md', color: 'text-red-400' },
    { word: 'excited', size: 'text-lg', color: 'text-pink-400' },
    { word: 'tired', size: 'text-md', color: 'text-gray-400' }
  ];

  const moodTrendData = [
    { day: 'Mon', mood: 6 },
    { day: 'Tue', mood: 4 },
    { day: 'Wed', mood: 7 },
    { day: 'Thu', mood: 5 },
    { day: 'Fri', mood: 8 },
    { day: 'Sat', mood: 7 },
    { day: 'Sun', mood: 6 }
  ];

  const premiumBackgroundStyle = isPremium ? {
    backgroundImage: `url('/lovable-uploads/50a41e76-1707-4184-8dae-3ab546498bbc.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  const cardClasses = isPremium 
    ? "premium-glass-card p-6 rounded-lg shadow-lg border border-white/20"
    : "gradient-card p-6 rounded-lg border border-border/50 shadow-sm";

  return (
    <div className="min-h-screen relative" style={premiumBackgroundStyle}>
      {/* Premium overlay */}
      {isPremium && <div className="absolute inset-0 bg-black/50 z-0" />}
      
      {/* Non-premium gradient background */}
      {!isPremium && <div className="absolute inset-0 gradient-bg z-0" />}
      
      <div className="relative z-10">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isPremium ? 'text-white' : 'text-foreground'}`}>
                Your Emotional Journey
              </h1>
              {isPremium && (
                <div className="flex items-center space-x-2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm px-3 py-1 rounded-full font-semibold">
                    PRO
                  </span>
                  <span className="text-white/80">Premium insights active</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats and Insights */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={cardClasses}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-foreground'}`}>
                        {emotionalStats.positivePercent}%
                      </p>
                      <p className={`text-sm ${isPremium ? 'text-white/70' : 'text-muted-foreground'}`}>
                        Positive Sentiment
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cardClasses}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-foreground'}`}>
                        {emotionalStats.totalMessages}
                      </p>
                      <p className={`text-sm ${isPremium ? 'text-white/70' : 'text-muted-foreground'}`}>
                        Total Messages
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cardClasses}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Heart className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-foreground'}`}>
                        {emotionalStats.sessionsCompleted}
                      </p>
                      <p className={`text-sm ${isPremium ? 'text-white/70' : 'text-muted-foreground'}`}>
                        Sessions Completed
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cardClasses}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Calendar className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-foreground'}`}>7</p>
                      <p className={`text-sm ${isPremium ? 'text-white/70' : 'text-muted-foreground'}`}>
                        Days Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emotion Word Cloud */}
              <div className={cardClasses}>
                <h2 className={`text-xl font-semibold mb-4 ${isPremium ? 'text-white' : 'text-foreground'}`}>
                  Your Emotional Vocabulary
                </h2>
                <div className="flex flex-wrap justify-center items-center space-x-2 space-y-2 py-8">
                  {emotionWords.map((emotion, index) => (
                    <span
                      key={index}
                      className={`${emotion.size} ${emotion.color} font-medium hover:scale-110 transition-transform cursor-default`}
                    >
                      {emotion.word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mood Trend */}
              <div className={cardClasses}>
                <h2 className={`text-xl font-semibold mb-4 ${isPremium ? 'text-white' : 'text-foreground'}`}>
                  Daily Mood Trend
                </h2>
                <div className="space-y-3">
                  {moodTrendData.map((day, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className={`text-sm w-8 ${isPremium ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {day.day}
                      </span>
                      <div className={`flex-1 h-2 rounded-full ${isPremium ? 'bg-white/20' : 'bg-secondary'}`}>
                        <div
                          className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.mood / 10) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm w-8 ${isPremium ? 'text-white' : 'text-foreground'}`}>
                        {day.mood}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Calendar */}
            <div className="lg:col-span-1">
              <div className={cardClasses}>
                <CalendarWithNotes
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </div>
            </div>
          </div>

          {/* Premium Features Preview for Free Users */}
          {!isPremium && (
            <div className="mt-8 gradient-card p-8 rounded-lg border-2 border-primary/50 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5" />
              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-primary to-purple-600 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Unlock Premium Insights</h2>
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                    PRO
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">People Analysis</span>
                    </div>
                    <p className="text-muted-foreground text-sm ml-7">
                      Discover how different people in your life affect your emotional state and well-being.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">Full Calendar Access</span>
                    </div>
                    <p className="text-muted-foreground text-sm ml-7">
                      Access your complete emotional history and add notes to any date.
                    </p>
                  </div>
                </div>
                
                <button className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
                  Upgrade to Premium - $19/month
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
