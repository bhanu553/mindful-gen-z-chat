
import { useState } from 'react';
import { TrendingUp, Heart, MessageSquare, Users, FileText, Calendar } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import CalendarWithNotes from '@/components/ui/calendar-with-notes';
import PaymentModal from '@/components/ui/payment-modal';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { isPremium } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
    <div className="min-h-screen relative">
      {/* Premium Background for All Users */}
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div className="backdrop-blur-md bg-white/70 p-6 rounded-2xl border border-white/20 shadow-lg">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Emotional Journey</h1>
              {isPremium && (
                <div className="flex items-center space-x-2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm px-3 py-1 rounded-full font-semibold">
                    PRO
                  </span>
                  <span className="text-gray-700">Premium insights active</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats and Insights */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="backdrop-blur-md bg-white/70 border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {emotionalStats.positivePercent}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Positive Sentiment
                      </p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-md bg-white/70 border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {emotionalStats.totalMessages}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Messages
                      </p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-md bg-white/70 border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Heart className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {emotionalStats.sessionsCompleted}
                      </p>
                      <p className="text-sm text-gray-600">
                        Sessions Completed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-md bg-white/70 border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Calendar className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">7</p>
                      <p className="text-sm text-gray-600">
                        Days Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emotion Word Cloud */}
              <div className="backdrop-blur-md bg-white/70 border border-white/20 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
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
              <div className="backdrop-blur-md bg-white/70 border border-white/20 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Daily Mood Trend
                </h2>
                <div className="space-y-3">
                  {moodTrendData.map((day, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-sm w-8 text-gray-600">
                        {day.day}
                      </span>
                      <div className="flex-1 bg-secondary/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.mood / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm w-8 text-gray-800">
                        {day.mood}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Calendar */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl p-4 shadow-lg">
                <CalendarWithNotes
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </div>
            </div>
          </div>

          {/* Premium Features Preview for Free Users */}
          {!isPremium && (
            <div className="mt-8 backdrop-blur-md bg-white/70 border border-white/20 p-8 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-primary to-purple-600 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Unlock Premium Insights</h2>
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                    PRO
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-gray-800 font-medium">Advanced Analytics</span>
                    </div>
                    <p className="text-gray-600 text-sm ml-7">
                      Get detailed insights into your emotional patterns and therapy progress.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-gray-800 font-medium">Full Calendar Access</span>
                    </div>
                    <p className="text-gray-600 text-sm ml-7">
                      Access your complete emotional history and add notes to any date.
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50/80 p-4 rounded-lg mb-6">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-gray-800 mb-2">🆓 Free Plan</div>
                      <ul className="text-gray-600 space-y-1">
                        <li>• 50 chat messages/day</li>
                        <li>• 5 media uploads/day</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 mb-2">💎 Premium Plan</div>
                      <ul className="text-gray-600 space-y-1">
                        <li>• 300 chat messages/day</li>
                        <li>• 25 media uploads/day</li>
                        <li>• Full therapy analytics & summaries</li>
                        <li>• Advanced therapy form questions</li>
                        <li>• Dashboard insights with glassmorphism</li>
                        <li>• Priority support</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  Upgrade to Premium - $9.99/month
                </button>
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
