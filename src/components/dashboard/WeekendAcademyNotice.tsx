'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { minutesToFormattedTime, timeToMinutes } from '../../lib/routine/routineEngine';

export function WeekendAcademyNotice() {
  const { routineProfile, recurringCommitments } = useStudyOS();

  // Find if today is a weekend or if user has an academy/sports commitment today
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];

  // Check structured commitments
  const sportsList = [
    ...(recurringCommitments || []).filter((c) => c.category === 'sports' || c.category === 'academy'),
    ...(routineProfile?.sports || routineProfile?.sportsAndAcademy || []),
  ];

  const todayCommitment = sportsList.find((s) => (s.days || []).includes(todayName));

  if (!todayCommitment) return null;

  const startFormatted = minutesToFormattedTime(timeToMinutes(todayCommitment.startTime));
  const endFormatted = minutesToFormattedTime(timeToMinutes(todayCommitment.endTime));
  const targetStudyHours = Math.round(
    ((routineProfile?.studyPreferences?.targetDailyStudyMinutes || routineProfile?.subjects?.targetDailyStudyMinutes || 120) / 60) * 10
  ) / 10;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <Trophy className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {todayCommitment.name}
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
              {startFormatted} – {endFormatted}
            </span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            {todayCommitment.name} is scheduled from <strong className="text-amber-200">{startFormatted}</strong> to{' '}
            <strong className="text-amber-200">{endFormatted}</strong>. Complete your {targetStudyHours}h study target around this commitment.
          </p>
        </div>
      </div>
    </div>
  );
}
