import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Vercel will use relative paths
  : import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Define types to match our MongoDB implementation
interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  created_at: Date;
}

interface Session {
  access_token: string;
  user: User;
  expires_at: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem('auth_session');
    if (storedSession) {
      try {
        const stored = JSON.parse(storedSession);
        setSession(stored);
        setUser(stored.user);
      } catch {
        localStorage.removeItem('auth_session');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: userData?.full_name || email.split('@')[0],
          phone: userData?.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: { message: data.error || 'Signup failed' } };
      }

      // We don't auto-login on signup; UI just shows toast
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Signup failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: { message: data.error || 'Sign in failed' } };
      }

      const newSession: Session = {
        access_token: data.token,
        user: data.user,
        expires_at: Date.now() + 1000 * 60 * 60, // 1 hour
      };

      setUser(data.user);
      setSession(newSession);
      localStorage.setItem('auth_session', JSON.stringify(newSession));

      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Sign in failed' } };
    }
  };

  const signInWithGoogle = async () => {
    return { error: { message: 'Google sign-in not implemented with MongoDB auth' } };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('auth_session');
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    return { error: { message: 'Password reset not implemented with MongoDB auth' } };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}