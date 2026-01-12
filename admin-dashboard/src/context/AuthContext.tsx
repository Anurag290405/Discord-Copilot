"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/auth";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage for auth
        const authData = localStorage.getItem("admin_auth");
        if (authData) {
          const { email } = JSON.parse(authData);
          setUser({
            id: "admin",
            email,
          });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("admin_auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simple authentication check
      // In production, use Supabase properly or your own backend
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Store auth in localStorage
      localStorage.setItem("admin_auth", JSON.stringify({ email, authenticated: true }));
      
      setUser({
        id: "admin",
        email,
      });
    } catch (err: any) {
      localStorage.removeItem("admin_auth");
      throw new Error(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Store auth in localStorage
      localStorage.setItem("admin_auth", JSON.stringify({ email, authenticated: true }));
      
      setUser({
        id: "admin",
        email,
      });
    } catch (err: any) {
      localStorage.removeItem("admin_auth");
      throw new Error(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem("admin_auth");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
