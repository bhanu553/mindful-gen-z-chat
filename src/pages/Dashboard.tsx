
import { useState } from 'react';
import { TrendingUp, Heart, MessageSquare, Users, FileText, Calendar } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import { DatePicker } from '@/components/ui/date-picker';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPremium] = useState(false); // Free user for now

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

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4 sm:mb-0">Your Emotional Journey</h1>
          
          {/* Date Picker */}
          <div className="w-full sm:w-auto">
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder="Select date to view insights"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="gradient-card p-6 rounded-lg border border-border/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{emotionalStats.positivePercent}%</p>
                <p className="text-sm text-muted-foreground">Positive Sentiment</p>
              </div>
            </div>
          </div>

          <div className="gradient-card p-6 rounded-lg border border-border/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{emotionalStats.totalMessages}</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </div>

          <div className="gradient-card p-6 rounded-lg border border-border/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{emotionalStats.sessionsCompleted}</p>
                <p className="text-sm text-muted-foreground">Sessions Completed</p>
              </div>
            </div>
          </div>

          <div className="gradient-card p-6 rounded-lg border border-border/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-sm text-muted-foreground">Days Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Emotion Word Cloud */}
          <div className="gradient-card p-6 rounded-lg border border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Emotional Vocabulary</h2>
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
          <div className="gradient-card p-6 rounded-lg border border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Daily Mood Trend</h2>
            <div className="space-y-3">
              {moodTrendData.map((day, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground w-8">{day.day}</span>
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(day.mood / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-foreground w-8">{day.mood}/10</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Features Preview */}
        {!isPremium && (
          <div className="gradient-card p-8 rounded-lg border-2 border-primary/50 relative overflow-hidden">
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
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">Weekly Summary</span>
                  </div>
                  <p className="text-muted-foreground text-sm ml-7">
                    Get personalized recap of your progress with actionable advice for growth.
                  </p>
                </div>
              </div>
              
              <button className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
                Upgrade to Premium
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
