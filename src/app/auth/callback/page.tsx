'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { AuthService } from '@/lib/auth/authService';
import { useAuth } from '@/lib/supabase/AuthContext';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLocalAccount } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const code = searchParams.get('code');
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (isSupabaseConfigured && supabase) {
          if (code) {
            // PKCE code exchange
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('Code exchange error:', error);
              setStatus('error');
              setErrorMessage(error.message);
              return;
            }
            if (data.user) {
              const username =
                data.user.user_metadata?.username ||
                data.user.email?.split('@')[0] ||
                'student';
              const displayName =
                data.user.user_metadata?.full_name || 'StudyOS Student';

              const newAcc = {
                id: data.user.id,
                username,
                displayName,
                email: data.user.email,
                role: 'student' as const,
                accountStatus: 'active' as const,
                emailVerified: true,
                createdAt: data.user.created_at || new Date().toISOString(),
                onboardingCompleted: false,
              };
              AuthService.setCurrentAccount(newAcc);
              setLocalAccount(newAcc);
            }
          } else if (tokenHash && type) {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: type as any,
            });
            if (error) {
              setStatus('error');
              setErrorMessage(error.message);
              return;
            }
            if (data.user) {
              const newAcc = {
                id: data.user.id,
                username: data.user.user_metadata?.username || 'student',
                displayName: data.user.user_metadata?.full_name || 'StudyOS Student',
                email: data.user.email,
                role: 'student' as const,
                accountStatus: 'active' as const,
                emailVerified: true,
                createdAt: data.user.created_at || new Date().toISOString(),
                onboardingCompleted: false,
              };
              AuthService.setCurrentAccount(newAcc);
              setLocalAccount(newAcc);
            }
          } else {
            // Check active session (hash fragment parsed by client)
            const { data } = await supabase.auth.getSession();
            if (data.session?.user) {
              const u = data.session.user;
              const newAcc = {
                id: u.id,
                username: u.user_metadata?.username || u.email?.split('@')[0] || 'student',
                displayName: u.user_metadata?.full_name || 'StudyOS Student',
                email: u.email,
                role: 'student' as const,
                accountStatus: 'active' as const,
                emailVerified: true,
                createdAt: u.created_at || new Date().toISOString(),
                onboardingCompleted: false,
              };
              AuthService.setCurrentAccount(newAcc);
              setLocalAccount(newAcc);
            }
          }
        }

        setStatus('success');
        // Redirect to onboarding or dashboard after a brief moment
        setTimeout(() => {
          router.replace('/onboarding');
        }, 1500);
      } catch (err: any) {
        console.error('Unexpected auth callback error:', err);
        setStatus('error');
        setErrorMessage(err?.message || 'Failed to complete email verification.');
      }
    }

    handleAuthCallback();
  }, [router, searchParams, setLocalAccount]);

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border-default rounded-3xl p-8 text-center shadow-2xl space-y-6">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary mx-auto animate-spin">
              <Loader2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">
              Verifying Your Email
            </h1>
            <p className="text-xs text-text-secondary">
              Confirming your StudyOS credentials and initializing your personalized workspace...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-success-soft border border-success/30 flex items-center justify-center text-success mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">
              Email Verified Successfully!
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your account is active. Redirecting you to set up your academic goals and daily study schedule...
            </p>
            <div className="pt-2">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all w-full"
              >
                <span>Continue to Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-danger-soft border border-danger/30 flex items-center justify-center text-danger mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">
              Verification Link Issue
            </h1>
            <p className="text-xs text-danger-text leading-relaxed">
              {errorMessage || 'The verification link may have expired or was already used.'}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all w-full"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-background border border-border-default hover:bg-surface text-text-secondary text-xs font-semibold transition-all w-full"
              >
                <span>Create a New Account</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
