'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/supabase/AuthContext';
import { AlertTriangle, LogOut, Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/callback',
  '/auth/pending',
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, role, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (isLoading) return;

    const hasActiveSession = Boolean(user || profile);

    // 1. If not authenticated and attempting to access private route -> redirect to login
    if (!hasActiveSession && !isPublicRoute) {
      router.replace('/auth/login');
      return;
    }

    // 2. If authenticated and on a public auth route (e.g. /auth/login or /auth/signup) -> redirect to appropriate home
    if (hasActiveSession && isPublicRoute && !pathname.startsWith('/auth/callback')) {
      if (profile && !profile.onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/');
      }
      return;
    }

    // 3. If authenticated, verify onboarding completion (allow /onboarding, public routes, or admin)
    if (hasActiveSession && !isPublicRoute && !isOnboardingRoute && !isAdminRoute) {
      if (profile && profile.onboardingCompleted === false) {
        router.replace('/onboarding');
        return;
      }
    }

    // 4. Admin route protection
    if (isAdminRoute && role !== 'admin') {
      router.replace('/');
      return;
    }
  }, [user, profile, role, isLoading, isPublicRoute, isOnboardingRoute, isAdminRoute, router, pathname]);

  // Loading state (Branded splash)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 animate-spin shadow-md shadow-indigo-500/10">
          <Loader2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Loading StudyOS...</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verifying session authorization and account permissions.</p>
      </div>
    );
  }

  // Public route access
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Suspended or rejected account restriction
  if (profile && (profile.accountStatus === 'rejected' || profile.accountStatus === 'blocked')) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-6 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Your StudyOS account is marked as <strong>{profile.accountStatus}</strong>. Access has been suspended by the administrator.
            </p>
          </div>
          <button
            onClick={() => {
              signOut();
              router.replace('/auth/login');
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Return to Login</span>
          </button>
        </div>
      </div>
    );
  }

  // If no active session, render nothing while router redirect runs
  if (!user && !profile) {
    return null;
  }

  return <>{children}</>;
}