'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Calendar,
  Shield,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, resendVerificationEmail, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[StudyOS LoginPage] Sign In form submission intercepted.');
    setLoading(true);
    setError(null);
    setVerificationNeeded(false);
    setResendSuccess(false);

    try {
      const result = await signIn(email, password);
      console.log('[StudyOS LoginPage] signIn response:', {
        success: result.success,
        requiresEmailVerification: Boolean(result.requiresEmailVerification),
        role: result.profile?.role,
        onboardingCompleted: result.profile?.onboardingCompleted,
      });

      if (!result.success) {
        setLoading(false);
        if (result.requiresEmailVerification) {
          setVerificationNeeded(true);
          setError('Please verify your email address before signing in. Check your inbox for the confirmation link.');
        } else {
          setError(result.error || 'Authentication failed. Please verify your credentials.');
        }
        return;
      }

      // Route cleanly based on resolved user profile
      const role = result.profile?.role;
      const onboardingCompleted = result.profile?.onboardingCompleted;

      if (role === 'admin') {
        console.log('[StudyOS LoginPage] Routing to /admin');
        router.replace('/admin');
      } else if (onboardingCompleted === false) {
        console.log('[StudyOS LoginPage] Routing to /onboarding');
        router.replace('/onboarding');
      } else {
        console.log('[StudyOS LoginPage] Routing to / (dashboard)');
        router.replace('/');
      }
    } catch (err: any) {
      console.error('[StudyOS LoginPage] Unexpected sign in error:', err);
      setError(err?.message || 'Login failed. Please verify your internet connection and credentials.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setResending(true);
    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        setResendSuccess(true);
      } else {
        setError(res.error || 'Failed to resend verification email.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch verification email.');
    } finally {
      setResending(false);
    }
  };

  const autofillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('studyos2026');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl border border-border-default bg-surface shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Column: Brand Showcase (Clean, bright, premium indigo) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border-default">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>StudyOS • Class 9 ICSE Growth Engine</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-black text-text-primary tracking-tight leading-tight">
                All-Day Operating Cadence.
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Log in to resume your active routine, review spaced mistake revisions, manage sports and skill practice, and consult your Socratic AI Coach.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface border border-border-default shadow-sm">
                <div className="p-2 rounded-xl bg-primary-soft text-primary mt-0.5 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Full-Day Life Routine</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Wake → Morning Focus → School → Coaching → Sports → Evening Study → Sleep.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface border border-border-default shadow-sm">
                <div className="p-2 rounded-xl bg-success-soft text-success mt-0.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Spaced Error Revisions</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Deterministic +1, +3, +7 intervals designed to turn mistakes into high-scoring mastery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface border border-border-default shadow-sm">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 mt-0.5 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Private & Safe Architecture</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Your routines, mistake notes, and AI chats remain 100% private to your account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border-default flex items-center justify-between text-[11px] text-text-muted">
            <span>Class 9 ICSE Academic Comeback</span>
            <span className="font-mono">v1.0 Production</span>
          </div>
        </div>

        {/* Right Column: High-Contrast Accessible Login Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-surface">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">Sign In to Your Workspace</h2>
              <p className="text-xs text-text-muted mt-1">
                Enter your registered email or username to continue.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-danger-soft border border-danger/30 text-danger-text text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
                {verificationNeeded && (
                  <div className="pt-2 border-t border-danger/20 flex items-center justify-between">
                    <span className="text-[11px] text-text-secondary">Didn&apos;t receive verification link?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending || resendSuccess}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-bold disabled:opacity-50 transition-all shadow-sm"
                    >
                      <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                      <span>{resending ? 'Sending...' : resendSuccess ? 'Email Sent!' : 'Resend Link'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Email or Username <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rohan@studyos.local or username"
                    className="w-full bg-background border border-border-default rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Password <span className="text-danger">*</span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-background border border-border-default rounded-xl pl-10 pr-10 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border-default text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                onClick={() => console.log('[StudyOS LoginPage] Sign In button action triggered')}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95 btn-interactive cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to StudyOS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="p-3 rounded-xl bg-background border border-border-default text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-text-secondary font-semibold">
                <span>Quick Test Accounts:</span>
                <span className="text-[10px] text-primary font-bold">Autofill</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => autofillDemoAccount('rohan@studyos.local')}
                  className="px-2.5 py-1 rounded-lg bg-surface border border-border-default hover:border-primary/50 text-text-primary text-[11px] font-medium transition-all"
                >
                  rohan@studyos.local
                </button>
                <button
                  type="button"
                  onClick={() => autofillDemoAccount('admin@studyos.local')}
                  className="px-2.5 py-1 rounded-lg bg-surface border border-border-default hover:border-primary/50 text-text-primary text-[11px] font-medium transition-all"
                >
                  admin@studyos.local
                </button>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-text-muted">
              Don&apos;t have an account yet?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline font-bold">
                Create Free Student Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
