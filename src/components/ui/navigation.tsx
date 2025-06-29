
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, CreditCard, BarChart3 } from 'lucide-react';
import PaymentModal from '@/components/ui/payment-modal';

const Navigation = () => {
  const { user, signOut, isPremium } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleUpgrade = () => {
    setShowPaymentModal(true);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  MindfulAI
                </span>
              </div>
              {user && (
                <div className="hidden md:flex space-x-8">
                  <Button
                    variant={isActive('/therapy') ? 'secondary' : 'ghost'}
                    onClick={() => navigate('/therapy')}
                    className="text-white hover:text-white"
                  >
                    Therapy
                  </Button>
                  <Button
                    variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                    onClick={() => navigate('/dashboard')}
                    className="text-white hover:text-white"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={isActive('/summary') ? 'secondary' : 'ghost'}
                    onClick={() => navigate('/summary')}
                    className="text-white hover:text-white"
                  >
                    Summary
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {!user ? (
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Sign In
                </Button>
              ) : (
                <>
                  {!isPremium && (
                    <Button
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-semibold"
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-md border border-white/20" align="end">
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-white hover:bg-white/10">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/summary')} className="text-white hover:bg-white/10">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </DropdownMenuItem>
                      {!isPremium && (
                        <DropdownMenuItem onClick={handleUpgrade} className="text-white hover:bg-white/10">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Upgrade
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-white/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal} 
          onClose={() => setShowPaymentModal(false)} 
        />
      )}
    </>
  );
};

export default Navigation;
