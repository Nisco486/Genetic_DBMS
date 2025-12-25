import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, AuthState } from '@/types/auth';
import { authenticateUser, clearSession, createUser, loadSession, persistSession } from '@/lib/authStorage';

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<AuthResult>;
  signUp: (params: { email: string; password: string; role: UserRole; username?: string }) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore session on load so refresh keeps the user logged in
  useEffect(() => {
    const sessionUser = loadSession();
    if (sessionUser) {
      setAuthState({
        user: sessionUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    await new Promise(resolve => setTimeout(resolve, 400));

    const result = authenticateUser(email, password, role);
    if (result.user) {
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
      persistSession(result.user);
      return { success: true };
    }

    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, message: result.error ?? 'Invalid credentials.' };
  }, []);

  const signUp = useCallback(async ({ email, password, role, username }: { email: string; password: string; role: UserRole; username?: string; }): Promise<AuthResult> => {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required.' };
    }

    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    if (role === 'admin') {
      const trimmedUsername = username?.trim() ?? '';
      if (!trimmedUsername) {
        return { success: false, message: 'Admin accounts require a username.' };
      }
      if (!trimmedUsername.startsWith('AD-') || trimmedUsername.slice(3).length < 5) {
        return { success: false, message: 'Admin username must start with "AD-" and include at least 5 characters after it.' };
      }
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));

    await new Promise(resolve => setTimeout(resolve, 400));

    const newUser: User = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      email,
      name: role === 'admin' ? username || 'Admin User' : username || 'Researcher',
      role,
    };

    const result = createUser(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      password
    );
    if (result.user) {
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
      persistSession(result.user);
      return { success: true };
    }

    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, message: result.error ?? 'Could not create account.' };
  }, []);

  const logout = useCallback(() => {
    clearSession();
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
