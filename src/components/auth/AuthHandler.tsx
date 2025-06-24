
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Handle both hash and search params for OAuth callback
      const hash = location.hash;
      const search = location.search;
      
      console.log('AuthHandler - Current location:', { hash, search, pathname: location.pathname });
      
      if (hash.includes('access_token') || search.includes('code')) {
        try {
          // Let Supabase handle the OAuth callback automatically
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session after OAuth:', error);
            navigate('/', { replace: true });
            return;
          }

          if (data.session) {
            console.log('OAuth login successful, redirecting to home');
            // Clear the URL and redirect to home
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Error handling auth callback:', error);
          navigate('/', { replace: true });
        }
      }
    };

    handleAuthCallback();
  }, [location, navigate]);

  return null;
};

export default AuthHandler;
