"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Radar, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../src/lib/supabase";
import { Button } from "../../src/components/ui/button";

type Tab = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signup");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.fullName) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName } },
      });
      if (error) throw error;
      toast.success("Account created! Check your email to confirm, then complete onboarding.");
      router.push("/onboarding");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!form.email) {
      toast.error("Enter your email first");
      return;
    }
    setMagicLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: form.email });
      if (error) throw error;
      toast.success("Magic link sent! Check your inbox.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setMagicLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      toast.error("Enter your email first");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email);
      if (error) throw error;
      toast.success("Password reset email sent!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 text-gray-900 dark:text-white font-bold text-xl">
        <Radar className="w-6 h-6 text-indigo-600" />
        OpportunityRadar
      </Link>

      {/* Card */}
      <div className="w-full max-w-[480px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        {/* Tabs */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 mb-8">
          {(["signup", "signin"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === t
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t === "signup" ? "Sign up" : "Sign in"}
            </button>
          ))}
        </div>

        <form onSubmit={tab === "signup" ? handleSignUp : handleSignIn} className="flex flex-col gap-4">
          {tab === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete={tab === "signup" ? "new-password" : "current-password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {tab === "signin" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="mt-1.5 text-xs text-indigo-600 hover:underline float-right"
              >
                Forgot password?
              </button>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-1 gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {tab === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 dark:text-gray-500">
            <span className="bg-white dark:bg-gray-900 px-3">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleMagicLink}
          disabled={magicLoading}
        >
          {magicLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Sign in with email link
        </Button>
      </div>

      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center">
        By signing up you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
