'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Mail, RefreshCw, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    if (!email) {
      setResendStatus({ type: 'error', text: 'Email address not found. Please try registering again.' });
      return;
    }

    setResending(true);
    setResendStatus(null);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setResendStatus({
            type: 'error',
            text: error.message || 'Failed to resend confirmation email. Rate limit may apply.',
          });
        } else {
          setResendStatus({
            type: 'success',
            text: 'A fresh verification email has been dispatched to your inbox!',
          });
          setCountdown(60);
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        // Local mode simulation
        setResendStatus({
          type: 'success',
          text: 'Simulation: Verification email re-sent (Local-first mode active).',
        });
      }
    } catch (err: any) {
      setResendStatus({
        type: 'error',
        text: err?.message || 'Failed to resend verification email.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface rounded-3xl border border-border-default shadow-2xl p-8 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary mx-auto">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary-soft text-primary border border-primary/20">
            Account Activation
          </span>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            Verification Email Sent
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            We sent a secure verification link to{' '}
            <strong className="font-mono text-text-primary">{email || 'your registered email'}</strong>.
            Click the link in the message to activate your StudyOS account and enter your workspace.
          </p>
        </div>

        {resendStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 text-left ${
              resendStatus.type === 'success'
                ? 'bg-success-soft border-success/30 text-success-text'
                : 'bg-danger-soft border-danger/30 text-danger-text'
            }`}
          >
            {resendStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-success mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-danger mt-0.5" />
            )}
            <span>{resendStatus.text}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-background border border-border-default text-left text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-text-primary">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>Didn’t receive the email?</span>
          </div>
          <ul className="text-text-muted space-y-1 list-disc list-inside">
            <li>Check your <strong>Spam</strong> or <strong>Promotions</strong> folder.</li>
            <li>Supabase free tier imposes an hourly SMTP rate limit (3 emails/hour).</li>
            <li>Ensure the email was typed correctly without typos.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}</span>
          </button>

          <Link
            href="/onboarding"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface hover:bg-background border border-border-default text-text-primary text-xs font-semibold transition-all"
          >
            <span>Skip to Onboarding</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="pt-2">
          <Link
            href="/auth/login"
            className="text-xs text-primary hover:underline font-medium"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
