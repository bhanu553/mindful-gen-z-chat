
import { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ReflectiveCheckInProps {
  onClose: () => void;
}

const ReflectiveCheckIn = ({ onClose }: ReflectiveCheckInProps) => {
  const { isPremium } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [responses, setResponses] = useState({
    feeling: '',
    steps: ''
  });

  // Sample thoughtful questions - in a real app, these would be based on chat history
  const reflectiveQuestions = [
    "Last time you spoke about feeling distant — do you still feel the same?",
    "Have you taken any steps since your last session?",
    "How has your emotional state shifted since we last connected?",
    "What patterns have you noticed in your thoughts recently?",
    "Have you been able to practice the coping strategies we discussed?"
  ];

  const currentQuestion = reflectiveQuestions[Math.floor(Math.random() * reflectiveQuestions.length)];

  if (!isPremium) return null;

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleSubmit = () => {
    // In a real app, this would save to the database
    console.log('Reflective check-in responses:', responses);
    setShowModal(false);
    onClose();
  };

  return (
    <>
      {/* Floating Panel */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 max-w-sm">
        <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-purple-300" />
              <h3 className="text-white font-medium">Reflective Check-In</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-white/90 text-sm mb-4 leading-relaxed">
            {currentQuestion}
          </p>
          
          <div className="space-y-2">
            <Button
              onClick={handleOpenModal}
              className="w-full bg-purple-500/80 hover:bg-purple-600/80 text-white backdrop-blur-sm"
            >
              Reflect on This
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for detailed reflection */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Reflective Check-In</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                How are you feeling about this right now?
              </label>
              <textarea
                value={responses.feeling}
                onChange={(e) => setResponses(prev => ({ ...prev, feeling: e.target.value }))}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                rows={3}
                placeholder="Take your time to express what you're experiencing..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What small step could you take today?
              </label>
              <textarea
                value={responses.steps}
                onChange={(e) => setResponses(prev => ({ ...prev, steps: e.target.value }))}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                rows={2}
                placeholder="Even the smallest action matters..."
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Complete Check-In
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReflectiveCheckIn;
