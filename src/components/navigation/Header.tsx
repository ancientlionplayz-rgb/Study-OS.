'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Zap,
  Clock,
  Play,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  HelpCircle,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { useAuth } from '@/lib/supabase/AuthContext';
import { NotificationBell } from './NotificationBell';

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function Header() {
  const router = useRouter();
  const {
    profile,
    selectedDate,
    setSelectedDate,
    timerState,
    dailyPlan,
    loadDevTestData,
    resetAllData,
  } = useStudyOS();
  const { profile: authProfile, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    router.replace('/auth/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 lg:px-8 py-3 select-none">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Date Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 text-xs font-semibold text-slate-200">
              <CalendarIcon className="w-3.5 h-3.5 text-brand-blue" />
              <span>{formatDisplayDate(selectedDate)}</span>
              {dailyPlan.isWeekendAcademyDay && (
                <span className="hidden sm:inline-block ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Academy Day
                </span>
              )}
            </div>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleToday}
            className="hidden sm:inline-flex px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-md transition-colors"
          >
            Today
          </button>
        </div>

        {/* Right: Quick Indicators & Focus Banner */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Active Timer Pill */}
          {timerState.status === 'running' ? (
            <Link
              href="/study"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="hidden sm:inline">Focus Timer:</span>
              <span className="font-mono">
                {Math.floor(timerState.remainingSeconds / 60)}m {timerState.remainingSeconds % 60}s
              </span>
            </Link>
          ) : (
            <Link
              href="/study"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-brand-blue" />
              <span>Start Session</span>
            </Link>
          )}

          {/* Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{profile.currentStreak}</span>
          </div>

          {/* Points */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-brand-blue">
            <Zap className="w-4 h-4 fill-brand-blue text-brand-blue" />
            <span>{profile.earnedPoints}</span>
          </div>

          {/* Notification Bell Dropdown (Phase 16) */}
          <NotificationBell />

          {/* Help Center Shortcut */}
          <Link
            href="/help"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Help Center & Guides"
            aria-label="Help Center"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
          </Link>

          {/* Dev Test Mode Switch */}
          {profile.isDevTestMode ? (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] font-mono">
              <FlaskConical className="w-3.5 h-3.5 text-rose-400" />
              <span>DEV MODE</span>
              <button
                onClick={resetAllData}
                className="ml-1 underline text-rose-400 hover:text-rose-200"
                title="Reset to clean defaults"
              >
                Reset
              </button>
            </div>
          ) : (
            <button
              onClick={loadDevTestData}
              className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors"
              title="Load realistic developer test data for ICSE Class 9 verification"
            >
              <FlaskConical className="w-3 h-3" />
              <span>Test Data</span>
            </button>
          )}

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors focus:outline-none"
              title="User Account & Sign Out"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-[11px] font-bold">
                {authProfile?.displayName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                {authProfile?.displayName || 'Student'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-2 border-b border-slate-800">
                  <div className="font-bold text-white truncate">
                    {authProfile?.displayName || 'StudyOS Student'}
                  </div>
                  <div className="text-[11px] text-indigo-400 font-mono truncate">
                    @{authProfile?.username || 'student'}
                  </div>
                  {authProfile?.email && (
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {authProfile.email}
                    </div>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 w-full transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
