'use client';

import React from 'react';
import { Flag, Sparkles, Trophy, Calendar, CheckCircle2, Flame } from 'lucide-react';
import { DragonEggTrophy } from '../../components/assets/DragonEggTrophy';

export default function ChallengesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-brand-blue">
              Performance Sprints & Dragon Egg
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-blue-500/10 text-indigo-700 dark:text-brand-blue border border-indigo-200/80 dark:border-blue-500/20">
              Active Sprint
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Weekly Challenges & Fair Trophies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compete on personal plan adherence and consistency—not unhealthy all-nighters.
          </p>
        </div>
      </div>

      {/* Featured Dragon Egg Showcase Card */}
      <div className="rounded-3xl border border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-br from-amber-50/70 via-white to-indigo-50/50 dark:from-slate-900 dark:to-slate-900/60 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Weekly Supreme Trophy
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              The Dragon Egg Championship
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Awarded each Sunday evening to the student who achieves the highest normalized plan completion and revision discipline. Whether you have weekend academy or evening tuition, you compete fairly against your own committed hours.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Normalized Schedule Adherence
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> 7-Day Consistency Multiplier
              </div>
            </div>
          </div>

          <div className="shrink-0 p-4 rounded-3xl bg-white/80 dark:bg-slate-800/60 border border-amber-200/80 dark:border-amber-500/30 shadow-lg shadow-amber-500/10 flex flex-col items-center">
            <DragonEggTrophy size={110} glow={true} />
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-2">Dragon Egg #04</span>
            <span className="text-[10px] text-slate-500">Sunday 9:00 PM Reveal</span>
          </div>
        </div>
      </div>

      {/* Active Sprint Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20">
              Mathematics Sprint
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">Day 5/7</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">7-Day Mandatory Maths Streak</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Complete 60m of Mathematics every day without skipping.</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full w-[71%]" />
          </div>
          <div className="text-[11px] text-slate-500 text-right font-semibold">5 of 7 Days Done</div>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/20">
              Zero Mistakes Left
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">Weekly Goal</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Clear +1/+3 Spaced Revisions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Retest every mistake logged in your error journal before the weekend.</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full w-[85%]" />
          </div>
          <div className="text-[11px] text-slate-500 text-right font-semibold">12 of 14 Revisions Cleared</div>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20">
              Holistic Growth
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">Habit Sprint</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Reading & Calisthenics</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Log 5+ non-fiction pages and complete daily mobility or pull-up sets.</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[60%]" />
          </div>
          <div className="text-[11px] text-slate-500 text-right font-semibold">3 of 5 Days Logged</div>
        </div>
      </div>
    </div>
  );
}
