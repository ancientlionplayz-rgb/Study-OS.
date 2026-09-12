'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Mail, ArrowLeft, Send, CheckCircle2, Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setSubmitted(true);
      return;
    }

    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : undefined,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-3xl border border-border-default shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary-soft text-primary mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Reset Password</h1>
          <p className="text-xs text-text-muted">We will send you a secure link to recover your StudyOS account.</p>
        </div>

        {submitted ? (
          <div className="p-5 rounded-2xl bg-success-soft border border-success/30 text-success-text space-y-2 text-center">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
            <div className="font-bold text-sm">Recovery Link Dispatched</div>
            <p className="text-xs">
              Check your inbox at <span className="font-bold font-mono">{email}</span> for instructions to reset your password.
            </p>
            <div className="pt-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-danger-soft border border-danger/30 text-danger-text text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@studyos.local"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-default focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs text-text-primary bg-background placeholder-text-muted transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Instructions...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
