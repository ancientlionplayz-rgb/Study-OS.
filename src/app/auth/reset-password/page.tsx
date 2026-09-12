'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter both fields.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.replace('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-3xl border border-border-default shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary-soft text-primary mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Set New Password</h1>
          <p className="text-xs text-text-muted">
            Enter your new password below to regain full access to your StudyOS workspace.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-danger-soft border border-danger/30 text-danger-text text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-5 rounded-2xl bg-success-soft border border-success/30 text-success-text text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
            <div className="font-bold text-sm">Password Updated Successfully</div>
            <p className="text-xs">Redirecting you to login with your new credentials...</p>
            <div className="pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all w-full"
              >
                <span>Go to Login Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-background border border-border-default rounded-xl pl-10 pr-10 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-background border border-border-default rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/auth/login"
            className="text-xs text-primary hover:underline font-medium"
          >
            Cancel and Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
