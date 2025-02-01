import React, { createContext, useContext } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector(state => state.auth);
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 