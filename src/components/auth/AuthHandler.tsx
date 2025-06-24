
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = location.hash;
      
      if (hash.includes('access_token')) {
        try {
          const params = new URLSearchParams(hash.substring(1));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });

            if (error) {
              console.error('Error setting session:', error);
            } else {
              // Redirect to home page after successful login
              navigate('/', { replace: true });
            }
          }
        } catch (error) {
          console.error('Error handling auth callback:', error);
        }
      }
    };

    handleAuthCallback();
  }, [location, navigate]);

  return null;
};

export default AuthHandler;
