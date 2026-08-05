import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.js';
import { loginApi } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved session
    const savedToken = localStorage.getItem('campuspulse_token');
    const savedUserJson = localStorage.getItem('campuspulse_user');

    if (savedToken && savedUserJson) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUserJson));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    } else {
      // Default to student login for immediate preview
      login('student@campuspulse.ai', 'password123');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { token: newToken, user: newUser } = await loginApi(email, password);
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('campuspulse_token', newToken);
      localStorage.setItem('campuspulse_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('campuspulse_token');
    localStorage.removeItem('campuspulse_user');
  };

  const switchRole = async (role: UserRole) => {
    const targetEmail = role === 'admin' ? 'admin@campuspulse.ai' : 'student@campuspulse.ai';
    await login(targetEmail, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
