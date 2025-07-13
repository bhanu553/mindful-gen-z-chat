
import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: null;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isPremium: false
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simple mock auth context - no user, not premium
  const value = {
    user: null,
    isPremium: false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
