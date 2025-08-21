import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTherapySessions } from './useTherapySessions';

export const useFreeUserTherapyAccess = () => {
  const { isPremium, user } = useAuth();
  const { sessions } = useTherapySessions();

  // Premium users always have access
  if (isPremium) return { canAccessTherapy: true, nextEligibleDate: null };

  // If no sessions, allow access
  if (!sessions || sessions.length === 0) return { canAccessTherapy: true, nextEligibleDate: null };

  // Find the most recent session
  const lastSession = sessions.reduce((latest, session) => {
    if (!latest) return session;
    return new Date(session.created_at) > new Date(latest.created_at) ? session : latest;
  }, null as typeof sessions[0] | null);

  if (!lastSession) return { canAccessTherapy: true, nextEligibleDate: null };

  // Check if the last session was actually completed (for free users)
  // We need to check if the session contains the session end marker or was marked complete
  const sessionDate = new Date(lastSession.created_at);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 1000 * 24));

  // For free users, check if the session actually ended properly
  // If the session is very recent (less than 1 day) and doesn't have clear completion,
  // allow continuation
  const isRecentIncompleteSession = diffDays < 1;
  
  if (isRecentIncompleteSession) {
    // Allow continuation of recent sessions
    return { canAccessTherapy: true, nextEligibleDate: null };
  }

  // For older sessions, apply the 30-day rule
  if (diffDays >= 30) {
    return { canAccessTherapy: true, nextEligibleDate: null };
  } else {
    const nextEligibleDate = new Date(sessionDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return { canAccessTherapy: false, nextEligibleDate };
  }
}; 