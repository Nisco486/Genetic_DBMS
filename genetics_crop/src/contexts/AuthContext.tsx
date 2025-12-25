import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, AuthState } from '@/types/auth';

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<AuthResult>;
  signUp: (params: {
    email: string;
    password: string;
    role: UserRole;
    username: string;
    full_name: string;
  }) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    await new Promise(resolve => setTimeout(resolve, 400));

    // Simple demo authentication
    const demoAccounts = {
      'nishan@rvce.edu.in': { password: 'admin123', role: 'admin', name: 'Nishan Admin', username: 'AD-101' },
      'manya@rvce.edu.in': { password: 'admin123', role: 'admin', name: 'Manya Admin', username: 'AD-102' },
      'res01@rvce.edu.in': { password: 'user123', role: 'user', name: 'Research User', username: 'researcher01' },
    };

    const account = demoAccounts[email as keyof typeof demoAccounts];

    if (account && account.password === password && account.role === role) {
      const user: User = {
        id: Date.now().toString(),
        email,
        name: account.name,
        role,
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true };
    }

    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, message: 'Invalid credentials.' };
  }, []);

  const signUp = useCallback(async (params: {
    email: string;
    password: string;
    role: UserRole;
    username: string;
    full_name: string;
  }): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    await new Promise(resolve => setTimeout(resolve, 400));

    // Validate username format for admin
    if (params.role === 'admin' && !/^AD-\d{3}$/.test(params.username)) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: 'Admin username must be in format AD-### (e.g., AD-101)' };
    }

    if (params.role !== 'admin' && params.username.length < 6) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: 'Username must be at least 6 characters' };
    }

    if (params.password.length < 8) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: 'Password must be at least 8 characters' };
    }

    const user: User = {
      id: Date.now().toString(),
      email: params.email,
      name: params.full_name,
      role: params.role,
    };

    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    localStorage.setItem('user', JSON.stringify(user));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
