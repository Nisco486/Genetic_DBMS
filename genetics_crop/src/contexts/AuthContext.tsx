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

  const API_URL = 'http://localhost:8000';

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

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      const user: User = {
        id: data.user.id.toString(),
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }, []);

  const signUp = useCallback(async (params: {
    email: string;
    password: string;
    role: UserRole;
    username: string;
    full_name: string;
  }): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          role: params.role,
          username: params.username,
          full_name: params.full_name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Signup failed'
      };
    }
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
