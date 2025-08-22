import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

type TherapyMode = 'reflect' | 'recover' | 'rebuild' | 'evolve';

interface MobileModeSelectorProps {
  selectedMode: TherapyMode;
  onModeSelect: (mode: TherapyMode) => void;
}

const MobileModeSelector: React.FC<MobileModeSelectorProps> = ({ 
  selectedMode, 
  onModeSelect 
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const modes = [
    {
      id: 'reflect' as TherapyMode,
      name: 'Reflect',
      icon: '🟣',
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-500/20',
    },
    {
      id: 'recover' as TherapyMode,
      name: 'Recover',
      icon: '🔵',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      id: 'rebuild' as TherapyMode,
      name: 'Rebuild',
      icon: '🟢',
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-500/20',
    },
    {
      id: 'evolve' as TherapyMode,
      name: 'Evolve',
      icon: '🟡',
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-500',
      bgColor: 'bg-yellow-500/20',
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-white/20 backdrop-blur-xl bg-black/20 p-4">
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            className={`p-3 rounded-lg border transition-all duration-300 backdrop-blur-sm hover:scale-105 active:scale-95 ${
              selectedMode === mode.id
                ? `${mode.borderColor} ${mode.bgColor} shadow-lg border-opacity-90`
                : 'border-white/30 hover:border-white/50 glass-effect'
            }`}
          >
            <div className="text-lg mb-1">{mode.icon}</div>
            <div className="font-medium text-white text-xs">{mode.name}</div>
          </button>
        ))}
      </div>
      
      {/* Mode indicator chip */}
      <div className="flex justify-center mt-2">
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white border transition-all duration-300 ${
          modes.find(m => m.id === selectedMode)?.borderColor || 'border-white/30'
        } ${modes.find(m => m.id === selectedMode)?.bgColor || 'bg-white/10'}`}>
          {modes.find(m => m.id === selectedMode)?.name} Mode
        </div>
      </div>
    </div>
  );
};

export default MobileModeSelector;