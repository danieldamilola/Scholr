"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { createClientSingleton } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase handles the token from the URL hash automatically.
  // We just need to wait for the session to be established.
  useEffect(() => {
    const supabase = createClientSingleton();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
      else setError("Invalid or expired reset link. Please request a new one.");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClientSingleton();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="bg-surface border border-border rounded-md p-8 w-full max-w-sm">
        <h1 className="text-ink font-bold text-xl mb-1">Scholr</h1>
        <p className="text-ink-muted text-sm mb-6">
          Set a new password for your account.
        </p>

        {done ? (
          <div className="flex flex-col items-center text-center py-4 space-y-3">
            <CheckCircle2 className="size-10 text-success" />
            <p className="text-sm font-medium text-ink">Password updated!</p>
            <p className="text-xs text-ink-muted">
              Your password has been changed successfully.
            </p>
            <Link
              href="/login"
              className="mt-2 text-sm text-brand-muted hover:text-brand transition-colors"
            >
              Sign in with your new password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {!sessionReady && !error && (
              <div className="flex justify-center py-4">
                <Loader2 className="size-5 text-ink-muted animate-spin" />
              </div>
            )}

            {sessionReady && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="newPw"
                    className="block text-ink-soft text-sm font-medium mb-1"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPw"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      disabled={loading}
                      className="bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent h-9 w-full px-3 pr-10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-soft"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="confirmPw"
                    className="block text-ink-soft text-sm font-medium mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    disabled={loading}
                    className="bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent h-9 w-full px-3 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md h-9 w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Set New Password"
                  )}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
