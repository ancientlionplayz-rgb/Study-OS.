'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  CalendarCheck,
  BookOpen,
  HelpCircle,
  AlertOctagon,
  Bot,
  Cpu,
  Trophy,
  Dumbbell,
  BookMarked,
  Award,
  BarChart3,
  Users,
  UserCheck,
  Shield,
  Flag,
  ListOrdered,
  Target,
  Settings,
  Flame,
  Zap,
  GraduationCap,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { useAuth } from '@/lib/supabase/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  category: 'core' | 'growth' | 'community' | 'system';
}

const NAV_ITEMS: NavItem[] = [
  // Core Academic Engine
  { name: 'Today', href: '/', icon: Calendar, category: 'core' },
  { name: 'Schedule', href: '/scheduler', icon: CalendarCheck, category: 'core' },
  { name: 'Study', href: '/study', icon: BookOpen, category: 'core' },
  { name: 'Academics', href: '/academics/syllabus', icon: GraduationCap, category: 'core' },
  { name: 'Doubts', href: '/doubts', icon: HelpCircle, category: 'core' },
  { name: 'Mistakes', href: '/mistakes', icon: AlertOctagon, category: 'core' },
  { name: 'Weekly Review', href: '/review', icon: BarChart3, category: 'core' },
  { name: 'AI Coach', href: '/ai-coach', icon: Bot, category: 'core' },

  // Holistic Growth
  { name: 'Skill Lab', href: '/skills', icon: Cpu, category: 'growth' },
  { name: 'Football', href: '/football', icon: Trophy, category: 'growth' },
  { name: 'Fitness', href: '/fitness', icon: Dumbbell, category: 'growth' },
  { name: 'Reading', href: '/reading', icon: BookMarked, badge: '5p/d', category: 'growth' },
  { name: 'Goals', href: '/goals', icon: Target, category: 'growth' },
  { name: 'Rewards', href: '/rewards', icon: Award, category: 'growth' },

  // Social & Competition (Open Community & Squads)
  { name: 'Community', href: '/community', icon: Users, category: 'community' },
  { name: 'Friends', href: '/friends', icon: UserCheck, category: 'community' },
  { name: 'Groups', href: '/groups', icon: Users, category: 'community' },
  { name: 'Teams', href: '/teams', icon: Shield, category: 'community' },
  { name: 'Challenges', href: '/challenges', icon: Flag, category: 'community' },
  { name: 'Leaderboard', href: '/leaderboard', icon: ListOrdered, category: 'community' },

  // System
  { name: 'Help Center', href: '/help', icon: HelpCircle, category: 'system' },
  { name: 'Settings', href: '/settings', icon: Settings, category: 'system' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, routineProfile, timerState } = useStudyOS();
  const { profile: authProfile, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/95 h-screen sticky top-0 overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20">
            S
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              StudyOS
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-blue-500/10 text-indigo-600 dark:text-brand-blue border border-indigo-100 dark:border-blue-500/20">
                ICSE 9
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Academic Comeback OS</div>
          </div>
        </Link>
      </div>

      {/* Focus Timer Mini Pill if active */}
      {timerState.status === 'running' && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <div className="text-xs font-semibold text-blue-200 truncate">
              {timerState.subject || 'Session in Progress'}
            </div>
          </div>
          <Link
            href="/study"
            className="text-[10px] font-bold text-brand-blue hover:text-blue-300 uppercase px-2 py-0.5 rounded bg-blue-500/10"
          >
            View
          </Link>
        </div>
      )}

      {/* User Stats Card */}
      <div className="px-4 py-3 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold" title="Current Daily Streak">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{profile.currentStreak}d Streak</span>
        </div>
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-brand-blue font-semibold" title="Honest Earned Points">
          <Zap className="w-4 h-4 fill-indigo-600 dark:fill-brand-blue text-indigo-600 dark:text-brand-blue" />
          <span>{profile.earnedPoints} pts</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 space-y-6 pb-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Academic Engine
          </div>
          <div className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.category === 'core').map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {(() => {
                    const studyMins = routineProfile?.studyPreferences?.targetDailyStudyMinutes || profile.dailyStudyTargetMinutes;
                    const itemBadge = item.href === '/study' && studyMins
                      ? `${Math.round((studyMins / 60) * 10) / 10}h`
                      : item.badge;
                    if (!itemBadge) return null;
                    return (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {itemBadge}
                      </span>
                    );
                  })()}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Holistic Growth
          </div>
          <div className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.category === 'growth').map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Community & Competition
          </div>
          <div className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.category === 'community').map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800/80 text-slate-500 font-mono">
                    Phase 2
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Preferences
          </div>
          <div className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.category === 'system').map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
            {role === 'admin' && (
              <Link
                href="/admin"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 font-semibold'
                    : 'text-purple-400 hover:text-purple-200 hover:bg-purple-950/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Portal</span>
                </div>
                <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                  Staff
                </span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Footer / Authenticated Student Account */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 space-y-2">
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
              {authProfile?.displayName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="text-[11px] leading-tight min-w-0">
              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {authProfile?.displayName || 'StudyOS Student'}
              </div>
              <div className="text-indigo-600 dark:text-brand-blue text-[10px] font-mono truncate">
                @{authProfile?.username || 'student'}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
            title="Sign Out of StudyOS"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
