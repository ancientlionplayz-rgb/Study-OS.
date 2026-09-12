'use client';

import React from 'react';
import Link from 'next/link';
import { Target, CheckCircle2, Clock, AlertCircle, Play } from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { HelpButton } from '../help/HelpButton';

export function TodayProgressCard() {
  const { profile, routineProfile, dailyPlan, sessions, selectedDate } = useStudyOS();

  // Calculate real metrics from sessions on selectedDate
  const todaySessions = sessions.filter((s) => s.date === selectedDate);
  const totalActualMinutes = todaySessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);

  const targetMinutes = routineProfile?.studyPreferences?.targetDailyStudyMinutes || profile.dailyStudyTargetMinutes || dailyPlan.targetMinutesTotal || 120;
  const overallPercent = Math.min(100, Math.round((totalActualMinutes / targetMinutes) * 100));
  const isOverallMet = totalActualMinutes >= targetMinutes;

  // Focus Subject (Mandatory subject if configured, or weak subject, or Core Study)
  const mandatoryConfig = routineProfile?.studyPreferences?.mandatorySubject;
  const hasMandatory = mandatoryConfig && mandatoryConfig.enabled && mandatoryConfig.subject;
  const focusSubject = hasMandatory ? mandatoryConfig.subject : (routineProfile?.studyPreferences?.weakSubjects?.[0] || 'Mathematics');
  const focusTarget = hasMandatory ? (mandatoryConfig.dailyMinutes || 60) : Math.min(60, targetMinutes);

  const focusSessions = todaySessions.filter(
    (s) => s.subject === focusSubject || (hasMandatory && s.isMathsSession && focusSubject === 'Mathematics')
  );
  const actualFocusMinutes = focusSessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);
  const focusPercent = Math.min(100, Math.round((actualFocusMinutes / focusTarget) * 100));
  const isFocusMet = actualFocusMinutes >= focusTarget;

  // SVG Circular Progress Ring calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercent / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6 backdrop-blur-sm relative overflow-hidden shadow-xl">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Progress Ring & Main Stats */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-brand-blue transition-all duration-500 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-white">{overallPercent}%</span>
              <span className="text-[10px] text-slate-400 font-medium">Daily</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {profile.grade || 'Academic'} Daily Target
              </span>
              <HelpButton topicKey="today" size="sm" />
              {isOverallMet && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Completed
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-baseline gap-2">
              <span>{Math.round((totalActualMinutes / 60) * 10) / 10}h</span>
              <span className="text-sm font-normal text-slate-400">
                / {Math.round((targetMinutes / 60) * 10) / 10}h Target
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {totalActualMinutes >= targetMinutes
                ? `${Math.round((targetMinutes / 60) * 10) / 10}h target fulfilled with focused deep work.`
                : `${targetMinutes - totalActualMinutes} mins remaining to meet baseline.`}
            </p>
          </div>
        </div>

        {/* Priority Focus Status Card */}
        <div className="flex-1 max-w-sm rounded-xl bg-slate-850/80 border border-slate-800 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-slate-200">
                {hasMandatory ? `Mandatory ${focusSubject}` : `Priority: ${focusSubject}`}
              </span>
            </div>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                isFocusMet
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {actualFocusMinutes} / {focusTarget}m
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${
                isFocusMet ? 'bg-emerald-500' : 'bg-brand-blue'
              }`}
              style={{ width: `${focusPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {isFocusMet
                ? `${focusTarget}m target achieved`
                : `${Math.max(0, focusTarget - actualFocusMinutes)}m required today`}
            </span>
            <Link
              href="/study"
              className="text-brand-blue hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>Launch</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
