
import { useState, useEffect } from 'react';
import { Plus, MessageCircle, Calendar, X, Menu, Pen, Trash2, Check, XIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useAITitleGeneration } from '@/hooks/useAITitleGeneration';

type TherapyMode = 'Reflect' | 'Recover' | 'Rebuild' | 'Evolve';

interface TherapySession {
  id: string;
  title: string;
  mode: TherapyMode;
  created_at: string;
  updated_at: string;
}

interface EnhancedTherapySidebarProps {
  onSessionSelect: (session: TherapySession) => void;
  onNewSession: (title: string, mode: TherapyMode) => void;
  currentSessionId?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const EnhancedTherapySidebar = ({ 
  onSessionSelect, 
  onNewSession, 
  currentSessionId, 
  isOpen, 
  onToggle 
}: EnhancedTherapySidebarProps) => {
  const { user, isPremium } = useAuth();
  const { generateTitle, isGenerating } = useAITitleGeneration();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [selectedMode, setSelectedMode] = useState<TherapyMode>('Reflect');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const modeConfig = {
    Reflect: { icon: '🧠', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    Recover: { icon: '🛠', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    Rebuild: { icon: '🌱', color: 'text-green-500', bg: 'bg-green-500/10' },
    Evolve: { icon: '⚡', color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    if (!user) return;
    
    if (!isPremium && sessions.length >= 20) {
      alert('Free users can only store up to 20 sessions. Upgrade to Premium for unlimited sessions.');
      return;
    }

    if (!newSessionTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert({
          user_id: user.id,
          title: newSessionTitle.trim(),
          mode: selectedMode
        })
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => [data, ...prev]);
      onNewSession(newSessionTitle.trim(), selectedMode);
      setShowNewSessionModal(false);
      setNewSessionTitle('');
      onToggle(); // Close sidebar on mobile
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleGenerateTitle = async () => {
    const title = await generateTitle([], selectedMode);
    setNewSessionTitle(title);
  };

  const handleEditStart = (session: TherapySession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleEditSave = async (sessionId: string) => {
    if (!editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ title: editTitle.trim(), updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: editTitle.trim() }
          : session
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleCollapse = () => {
    setIsCollapsed(true);
  };

  const handleExpand = () => {
    setIsCollapsed(false);
  };

  // Floating toggle button when sidebar is collapsed
  if (isCollapsed) {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <Button
          onClick={handleExpand}
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </Button>
      </div>
    );
  }

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header with collapse button */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Therapy Sessions</h2>
          <div className="flex items-center space-x-2">
            {/* Collapse button for desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCollapse}
              className="hidden md:flex text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="md:hidden text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* New Session Button */}
        <Button
          onClick={() => setShowNewSessionModal(true)}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start New Session
        </Button>

        {/* Session Count */}
        <div className="mt-3 text-sm text-white/70">
          {sessions.length} / {isPremium ? '∞' : '20'} sessions
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-white/70 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70 mx-auto"></div>
            <p className="mt-2">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-white/70 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No therapy sessions yet.</p>
            <p className="text-sm mt-1">Create your first session to get started!</p>
          </div>
        ) : (
          sessions.map((session) => {
            const modeData = modeConfig[session.mode];
            const isActive = currentSessionId === session.id;
            const isEditing = editingId === session.id;
            const isDeleting = deleteConfirm === session.id;
            
            return (
              <div
                key={session.id}
                className={`p-4 rounded-lg border transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/20 border-white/40 shadow-lg'
                    : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
                }`}
              >
                {/* Session Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className={`p-1.5 rounded-full ${modeData.bg}`}>
                      <span className="text-sm">{modeData.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-white/20 border-white/30 text-white text-sm h-8"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave(session.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-green-400 hover:bg-green-400/20"
                            onClick={() => handleEditSave(session.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-400 hover:bg-red-400/20"
                            onClick={() => setEditingId(null)}
                          >
                            <XIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer"
                          onClick={() => {
                            onSessionSelect(session);
                            onToggle(); // Close sidebar on mobile
                          }}
                        >
                          <h3 className="font-medium text-white truncate">{session.title}</h3>
                          <div className="flex items-center space-x-2 text-xs text-white/70 mt-1">
                            <span className={modeData.color}>{session.mode}</span>
                            <span>•</span>
                            <span>{formatDate(session.created_at)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-white/60 hover:text-white hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(session);
                        }}
                      >
                        <Pen className="w-3 h-3" />
                      </Button>
                      {isDeleting ? (
                        <div className="flex items-center space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-400 hover:bg-red-400/20"
                            onClick={() => handleDelete(session.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-white/60 hover:bg-white/10"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            <XIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-white/60 hover:text-red-400 hover:bg-red-400/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(session.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Last Updated */}
                {!isEditing && (
                  <div className="flex items-center text-xs text-white/60">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Updated {format(new Date(session.updated_at), 'h:mm a')}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 h-full w-80 bg-black/30 backdrop-blur-md border-r border-white/20
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {sidebarContent}
      </div>

      {/* New Session Modal */}
      <Dialog open={showNewSessionModal} onOpenChange={setShowNewSessionModal}>
        <DialogContent className="bg-black/90 backdrop-blur-md border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Start New Therapy Session</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">Choose Therapy Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(modeConfig).map(([mode, config]) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode as TherapyMode)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedMode === mode
                        ? 'border-primary bg-primary/20 text-white'
                        : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="font-medium">{mode}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white/80">Session Title</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateTitle}
                  disabled={isGenerating}
                  className="text-primary hover:bg-primary/20"
                >
                  {isGenerating ? 'Generating...' : '✨ Auto Generate'}
                </Button>
              </div>
              <Input
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                placeholder="Enter a meaningful title for your session"
                className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowNewSessionModal(false)}
                className="text-white/80 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNewSession}
                disabled={!newSessionTitle.trim()}
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                Start Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedTherapySidebar;
