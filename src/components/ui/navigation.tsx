
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Brain, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isPremium, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Therapy', path: '/therapy', requireAuth: true },
    { name: 'Dashboard', path: '/dashboard', requireAuth: true },
    { name: 'Summary', path: '/summary', premium: true, requireAuth: true },
    { name: 'Pricing', path: '#pricing', scroll: true },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) return false;
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavClick = (item: any) => {
    if (item.scroll) {
      // Handle smooth scrolling to pricing section
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById('pricing');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById('pricing');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }
    
    if (item.requireAuth && !user) {
      navigate('/login');
      return;
    }
    if (item.premium && !isPremium) {
      // Could show premium modal here
      return;
    }
    navigate(item.path);
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Error signing in with Google:', error.message);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  return (
    <nav className="bg-card/50 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl text-foreground">EchoMind</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.premium && !isPremium) {
                return (
                  <div key={item.name} className="relative">
                    <span className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground cursor-not-allowed">
                      {item.name}
                    </span>
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-1 rounded-full">
                      PRO
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user.user_metadata?.avatar_url && (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-foreground">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  {isPremium && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                      PRO
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent/50 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                Sign in with Google
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border/50">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavClick(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  disabled={item.premium && !isPremium}
                >
                  {item.name}
                  {item.premium && !isPremium && (
                    <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full">
                      PRO
                    </span>
                  )}
                </button>
              ))}
              
              {user ? (
                <div className="border-t border-border/50 pt-3 mt-3">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    {user.user_metadata?.avatar_url && (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-foreground">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    {isPremium && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full">
                        PRO
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-md flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 rounded-lg font-medium mx-3 my-2"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
