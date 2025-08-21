
import { useState } from 'react';
import { Music } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SpotifyIntegrationProps {
  mode: string;
}

const SpotifyIntegration = ({ mode }: SpotifyIntegrationProps) => {
  const { isPremium } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isPremium || mode !== 'evolve') return null;

  const handleMusicClick = () => {
    setShowTooltip(true);
    setTimeout(() => {
      setShowTooltip(false);
    }, 7000);
  };

  const openSpotify = () => {
    window.open('https://open.spotify.com', '_blank');
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleMusicClick}
        className="p-2 rounded-full bg-teal-500/20 hover:bg-teal-500/30 transition-all duration-300 backdrop-blur-sm border border-teal-400/30 hover:shadow-lg hover:shadow-teal-500/20"
        title="Music for Evolution"
      >
        <Music className="w-5 h-5 text-teal-400" />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 w-72 backdrop-blur-md bg-white/20 border border-white/30 rounded-lg p-4 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
          <p className="text-white text-sm leading-relaxed mb-3">
            "Music helps you evolve through emotions. Take a moment to feel through sound."
          </p>
          <button
            onClick={openSpotify}
            className="w-full bg-green-600/80 hover:bg-green-700/80 text-white py-2 px-4 rounded-lg font-medium transition-colors backdrop-blur-sm"
          >
            Open Spotify
          </button>
        </div>
      )}
    </div>
  );
};

export default SpotifyIntegration;
