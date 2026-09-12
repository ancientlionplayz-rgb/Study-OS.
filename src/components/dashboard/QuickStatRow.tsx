'use client';

import React from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  AlertOctagon,
  BookMarked,
  Dumbbell,
  Cpu,
  ArrowUpRight,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';

export function QuickStatRow() {
  const { doubts, revisionsDue, readingLogs, workoutSessions, skillTracks, selectedDate } =
    useStudyOS();

  const unresolvedDoubtsCount = doubts.filter(
    (d) => d.status === 'Unsolved' || d.status === 'Learning'
  ).length;

  const todayReading = readingLogs.filter((r) => r.date === selectedDate);
  const totalPagesToday = todayReading.reduce((acc, r) => acc + r.pagesRead, 0);

  const todayWorkouts = workoutSessions.filter((w) => w.date === selectedDate);
  const totalWorkoutMinutes = todayWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0);

  const totalSkillHours = skillTracks.reduce((acc, t) => acc + t.totalHoursInvested, 0);

  const stats = [
    {
      title: 'Unresolved Doubts',
      value: unresolvedDoubtsCount,
      subtext: unresolvedDoubtsCount > 0 ? `${unresolvedDoubtsCount} waiting` : 'Zero doubts clean',
      icon: HelpCircle,
      href: '/doubts',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Revisions Due',
      value: revisionsDue.length,
      subtext: revisionsDue.length > 0 ? '+1/+3/+7 queue' : 'Up to date',
      icon: AlertOctagon,
      href: '/mistakes',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
    {
      title: 'Reading Progress',
      value: `${totalPagesToday}p`,
      subtext: totalPagesToday >= 5 ? '5+ pages goal met' : `${Math.max(0, 5 - totalPagesToday)}p remaining`,
      icon: BookMarked,
      href: '/reading',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Fitness & Calisthenics',
      value: `${totalWorkoutMinutes}m`,
      subtext: totalWorkoutMinutes > 0 ? 'Logged today' : 'Rest / Not logged',
      icon: Dumbbell,
      href: '/fitness',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Skill Lab Total',
      value: `${totalSkillHours}h`,
      subtext: 'Python, AI & Robotics',
      icon: Cpu,
      href: '/skills',
      color: 'text-brand-blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Link
            key={idx}
            href={stat.href}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 hover:border-slate-700 hover:bg-slate-850 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-lg ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center ${stat.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
            </div>

            <div>
              <div className="text-lg font-bold text-white font-mono">{stat.value}</div>
              <div className="text-[11px] font-semibold text-slate-300 truncate">{stat.title}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{stat.subtext}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
