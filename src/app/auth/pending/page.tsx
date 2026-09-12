'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/AuthContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PendingApprovalPage() {
  const { profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Normal StudyOS registration is OPEN to any student
    if (profile && profile.accountStatus !== 'blocked' && profile.accountStatus !== 'rejected') {
      router.replace('/');
    }
  }, [profile, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">StudyOS Registration is Open</h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          Administrator approval is no longer required for ordinary students. Redirecting you to your dashboard...
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all w-full"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}