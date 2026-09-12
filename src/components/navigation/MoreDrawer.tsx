'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  X,
  Calendar,
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
  LogOut,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { useAuth } from '@/lib/supabase/AuthContext';

interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreDrawer({ isOpen, onClose }: MoreDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useStudyOS();
  const { profile: authProfile, signOut } = useAuth();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    onClose();
    await signOut();
    router.replace('/auth/login');
  };

  const links = [
    { name: 'Today', href: '/', icon: Calendar },
    { name: 'Study Session', href: '/study', icon: BookOpen },
    { name: 'Doubts Inbox', href: '/doubts', icon: HelpCircle },
    { name: 'Mistake Log', href: '/mistakes', icon: AlertOctagon },
    { name: 'Weekly Review', href: '/review', icon: BarChart3 },
    { name: 'AI Coach', href: '/ai-coach', icon: Bot },
    { name: 'Skill Lab', href: '/skills', icon: Cpu },
    { name: 'Football', href: '/football', icon: Trophy },
    { name: 'Fitness', href: '/fitness', icon: Dumbbell },
    { name: 'Reading', href: '/reading', icon: BookMarked },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Rewards', href: '/rewards', icon: Award },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Friends', href: '/friends', icon: UserCheck },
    { name: 'Teams', href: '/teams', icon: Shield },
    { name: 'Challenges', href: '/challenges', icon: Flag },
    { name: 'Leaderboard', href: '/leaderboard', icon: ListOrdered },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-t border-slate-800 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">All Modules</h3>
            <p className="text-xs text-slate-400">Personal Growth Operating System</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center gap-2 text-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-slate-200">{profile.currentStreak} Day Streak</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-brand-blue fill-brand-blue" />
            <span className="font-semibold text-slate-200">{profile.earnedPoints} Earned Pts</span>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-2 pb-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium border transition-colors ${
                  isActive
                    ? 'bg-brand-blue/10 border-brand-blue text-brand-blue font-semibold'
                    : 'bg-slate-850 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Account & Sign Out */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {authProfile?.displayName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {authProfile?.displayName || 'StudyOS Student'}
              </div>
              <div className="text-[10px] text-indigo-400 font-mono truncate">
                @{authProfile?.username || 'student'}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-semibold hover:bg-rose-900/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
