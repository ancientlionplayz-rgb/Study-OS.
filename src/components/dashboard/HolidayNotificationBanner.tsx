'use client';

import React, { useState } from 'react';
import { useStudyOS } from '@/lib/storage/context';
import { HolidayService } from '@/lib/routine/holidayService';
import { Calendar, Sparkles, CheckCircle2, ChevronRight, X, Clock, Sun } from 'lucide-react';
import Link from 'next/link';

export function HolidayNotificationBanner() {
  const { selectedDate, holidays, tomorrowBrief } = useStudyOS();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Check today's holiday
  const todayHoliday = HolidayService.getHolidayForDate(selectedDate);

  // Check tomorrow's holiday
  const todayObj = new Date(selectedDate);
  const tomorrowObj = new Date(todayObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];
  const tomorrowHoliday = HolidayService.getHolidayForDate(tomorrowStr);

  const activeHoliday = todayHoliday || tomorrowHoliday;
  if (!activeHoliday) return null;

  const isToday = Boolean(todayHoliday);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border border-amber-500/30 text-text-primary shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">
          <Sun className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              {isToday ? 'Today is a Holiday' : 'Tomorrow is a Holiday'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
              {activeHoliday.holidayName}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {isToday
              ? `School classes are closed today. StudyOS has activated the Holiday Schedule, redistributing daytime to relaxed Skill Lab practice, reading, and core revision.`
              : `StudyOS detected that tomorrow (${activeHoliday.holidayName}) is a holiday. Your school timetable will be automatically substituted with a balanced rest & skill routine.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Link
          href="/review"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm"
        >
          <span>View Schedule</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
