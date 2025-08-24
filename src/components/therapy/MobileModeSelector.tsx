import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

type TherapyPhase = 'reflect' | 'recover' | 'rebuild' | 'evolve';

interface MobileModeSelectorProps {
  selectedPhase: TherapyPhase;
  onPhaseSelect: (phase: TherapyPhase) => void;
}

const MobileModeSelector: React.FC<MobileModeSelectorProps> = ({ 
  selectedPhase, 
  onPhaseSelect 
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const phases = [
    {
      id: 'reflect' as TherapyPhase,
      name: 'Reflect',
      icon: '🟣',
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-500/20',
    },
    {
      id: 'recover' as TherapyPhase,
      name: 'Recover',
      icon: '🔵',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      id: 'rebuild' as TherapyPhase,
      name: 'Rebuild',
      icon: '🟢',
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-500/20',
    },
    {
      id: 'evolve' as TherapyPhase,
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
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => onPhaseSelect(phase.id)}
            className={`p-3 rounded-lg border transition-all duration-300 backdrop-blur-sm hover:scale-105 active:scale-95 ${
              selectedPhase === phase.id
                ? `${phase.borderColor} ${phase.bgColor} shadow-lg border-opacity-90`
                : 'border-white/30 hover:border-white/50 glass-effect'
            }`}
          >
            <div className="text-lg mb-1">{phase.icon}</div>
            <div className="font-medium text-white text-xs">{phase.name}</div>
          </button>
        ))}
      </div>
      
      {/* Phase indicator chip */}
      <div className="flex justify-center mt-2">
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white border transition-all duration-300 ${
          phases.find(p => p.id === selectedPhase)?.borderColor || 'border-white/30'
        } ${phases.find(p => p.id === selectedPhase)?.bgColor || 'bg-white/10'}`}>
          {phases.find(p => p.id === selectedPhase)?.name} Phase
        </div>
      </div>
    </div>
  );
};

export default MobileModeSelector;