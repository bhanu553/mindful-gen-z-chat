
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TherapyMode } from '@/hooks/useTherapySessions';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: TherapyMode, title: string) => void;
}

const ModeSelectionModal = ({ isOpen, onClose, onSelect }: ModeSelectionModalProps) => {
  const [selectedMode, setSelectedMode] = useState<TherapyMode>('Reflect');
  const [title, setTitle] = useState('');

  const modes = [
    {
      id: 'Reflect' as TherapyMode,
      name: 'Reflect',
      icon: '🟣',
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Process your thoughts and emotions with gentle guidance'
    },
    {
      id: 'Recover' as TherapyMode,
      name: 'Recover',
      icon: '🔵',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Heal from trauma and difficult experiences'
    },
    {
      id: 'Rebuild' as TherapyMode,
      name: 'Rebuild',
      icon: '🟢',
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-500/10',
      description: 'Reconstruct your sense of self and relationships'
    },
    {
      id: 'Evolve' as TherapyMode,
      name: 'Evolve',
      icon: '🟡',
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Grow beyond your current limitations'
    }
  ];

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a session title');
      return;
    }
    onSelect(selectedMode, title.trim());
    setTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Start New Therapy Session</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Session Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dealing with anxiety, Work stress, etc."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Choose Therapy Mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                    selectedMode === mode.id
                      ? `${mode.borderColor} ${mode.bgColor} shadow-lg border-opacity-80`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">{mode.icon}</div>
                  <div className="font-semibold text-gray-800 mb-1">{mode.name}</div>
                  <div className="text-sm text-gray-600">{mode.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Start Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionModal;
