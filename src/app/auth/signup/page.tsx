'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/AuthContext';
import { AuthService } from '@/lib/auth/authService';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Username validation state
  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
  const isUsernameLengthValid = cleanUsername.length >= 3 && cleanUsername.length <= 25;
  const isUsernameAvailable = !AuthService.getRegisteredUsers().some(
    (u) => u.username.toLowerCase() === cleanUsername
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!displayName.trim()) {
      setError('Please enter your full display name.');
      setLoading(false);
      return;
    }

    if (!isUsernameLengthValid) {
      setError('Username must be between 3 and 25 characters (lowercase letters, numbers, and underscores).');
      setLoading(false);
      return;
    }

    if (!isUsernameAvailable) {
      setError(`The username @${cleanUsername} is already taken. Please choose another.`);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter both passwords.');
      setLoading(false);
      return;
    }

    // Validate username on server/database as well
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(cleanUsername)}`);
      if (res.ok) {
        const check = await res.json();
        if (!check.available) {
          setError(check.message || `The username @${cleanUsername} is already taken.`);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall back to client availability check if network error
    }

    try {
      const result = await signUp({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        username: cleanUsername,
      });

      if (!result.success) {
        setError(result.error || 'Failed to complete registration.');
        setLoading(false);
        return;
      }

      if (result.requiresEmailVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else {
        router.replace('/onboarding');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during signup.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl border border-border-default bg-surface shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: Brand Showcase (Clean & bright) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border-default">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Student Registration</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-black text-text-primary tracking-tight leading-tight">
                Design Your Complete Daily Routine.
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                StudyOS coordinates your school schedule, sports academy, commute, tuition coaching, and mistake-free study blocks in one unified cockpit.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface border border-border-default shadow-sm">
                <div className="p-2 rounded-xl bg-primary-soft text-primary mt-0.5 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Whole-Day Routine Synthesis</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Covers wake-up, school commute, meals, workouts, reading, and sleep targets.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface border border-border-default shadow-sm">
                <div className="p-2 rounded-xl bg-success-soft text-success mt-0.5 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Mandatory Mathematics</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Uncompromising daily 60m Maths block locked in during morning peak focus.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface border border-border-default shadow-sm">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 mt-0.5 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Privacy Vault Architecture</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Your email and schedule details are never exposed to other students or public feeds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border-default flex items-center justify-between text-[11px] text-text-muted">
            <span>Class 9 ICSE Focus</span>
            <span className="font-mono text-primary font-bold">100% Free & Open</span>
          </div>
        </div>

        {/* Right Column: Complete Validated Sign Up Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-surface">
          <div className="max-w-md w-full mx-auto space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">Create Student Account</h2>
              <p className="text-xs text-text-muted mt-1">
                Enter your details to generate your personalized workspace.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-danger-soft border border-danger/30 text-danger-text text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Display Name <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full bg-background border border-border-default rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Unique Username <span className="text-danger">*</span></span>
                  {username && (
                    <span className="text-[10px] flex items-center gap-1 font-semibold">
                      {isUsernameLengthValid && isUsernameAvailable ? (
                        <span className="text-success flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Available
                        </span>
                      ) : (
                        <span className="text-danger flex items-center gap-0.5">
                          <X className="w-3 h-3" /> {!isUsernameLengthValid ? '3-25 chars' : 'Taken'}
                        </span>
                      )}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-xs font-bold text-primary">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rohan_icse"
                    className="w-full bg-background border border-border-default rounded-xl pl-8 pr-4 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-0.5">Letters, numbers, underscores only (e.g. ananya_9).</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full bg-background border border-border-default rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Password <span className="text-danger">*</span>
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
                    className="w-full bg-background border border-border-default rounded-xl pl-10 pr-10 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-text-muted hover:text-text-primary p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-danger">*</span>
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
                    className="w-full bg-background border border-border-default rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95 btn-interactive"
              >
                <span>{loading ? 'Creating Your Account...' : 'Create Account & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-text-muted">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-bold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
