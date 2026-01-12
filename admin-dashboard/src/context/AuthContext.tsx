"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
} from "@/lib/supabaseClient";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || "",
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen to auth state changes
    const subscription = onAuthStateChange((authUser) => {
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || "",
        });
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const { user: authUser } = await supabaseSignIn(email, password);
      
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || "",
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Sign in failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const { user: authUser } = await supabaseSignUp(email, password);
      
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || "",
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Sign up failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await supabaseSignOut();
      setUser(null);
    } catch (err: any) {
      const errorMessage = err.message || "Sign out failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
