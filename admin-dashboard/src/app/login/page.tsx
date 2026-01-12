"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Use useEffect to handle redirect after user is authenticated
  useEffect(() => {
    if (user && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/");
    }
  }, [user, router, isRedirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-900">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Discord</h1>
              <p className="text-xs text-orange-500 font-semibold">Copilot Admin</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-white border-slate-200 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl text-slate-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to your admin account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {isLoading ? "Loading..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Section */}
        {/* <div className="text-center space-y-2 text-sm text-slate-600">
          <p>Test credentials for development:</p>
          <p className="text-xs bg-orange-50 p-3 rounded-lg border border-orange-200">
            Email: <span className="font-mono">admin@example.com</span>
            <br />
            Password: <span className="font-mono">password123</span>
          </p>
        </div> */}
      </div>
    </div>
  );
}
