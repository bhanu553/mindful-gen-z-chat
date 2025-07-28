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

  // Assume session is always complete for free users (1 per month logic)
  // If you have a session completion flag, check it here
  const sessionDate = new Date(lastSession.created_at);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 30) {
    return { canAccessTherapy: true, nextEligibleDate: null };
  } else {
    const nextEligibleDate = new Date(sessionDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return { canAccessTherapy: false, nextEligibleDate };
  }
}; 