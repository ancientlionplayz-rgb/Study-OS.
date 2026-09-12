'use client';

import React, { useState, useEffect } from 'react';
import { useStudyOS } from '@/lib/storage/context';
import { TomorrowBrief } from '@/types';
import {
  Moon,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  Dumbbell,
  Shield,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export function TomorrowBriefModal() {
  const { tomorrowBrief, refreshTomorrowBrief, notificationSettings } = useStudyOS();
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    // Check if evening brief time is reached and hasn't been shown in this session
    if (!tomorrowBrief) {
      refreshTomorrowBrief();
      return;
    }

    if (!hasPrompted && notificationSettings.tomorrowScheduleEnabled) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();
      const targetTimeParts = (notificationSettings.tomorrowScheduleTime || '20:45').split(':');
      const targetHours = parseInt(targetTimeParts[0], 10) || 20;
      const targetMins = parseInt(targetTimeParts[1], 10) || 45;

      // If current time is past evening notification time (e.g. >= 20:45)
      if (currentHours > targetHours || (currentHours === targetHours && currentMins >= targetMins)) {
        setIsOpen(true);
        setHasPrompted(true);
      }
    }
  }, [tomorrowBrief, hasPrompted, notificationSettings, refreshTomorrowBrief]);

  if (!isOpen || !tomorrowBrief) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface rounded-3xl border border-border-default shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with Evening Theme */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
            <Moon className="w-3.5 h-3.5" />
            <span>Evening Tomorrow Brief</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">Tomorrow’s Plan ({tomorrowBrief.dayOfWeek})</h2>
          <p className="text-xs text-indigo-200 mt-1">
            Prepared by StudyOS so you wake up with complete clarity and zero morning decision fatigue.
          </p>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Holiday Alert if Applicable */}
          {tomorrowBrief.isHoliday && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Tomorrow is {tomorrowBrief.holidayName}: </strong>
                <span>School hours have been converted into relaxed Skill Lab and reading blocks.</span>
              </div>
            </div>
          )}

          {/* Quick Targets Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-background border border-border-default">
              <div className="text-[10px] uppercase font-bold text-text-muted">Target Wake Time</div>
              <div className="text-lg font-black text-text-primary mt-0.5">{tomorrowBrief.wakeTime}</div>
            </div>
            <div className="p-3 rounded-2xl bg-background border border-border-default">
              <div className="text-[10px] uppercase font-bold text-text-muted">Target Sleep Time</div>
              <div className="text-lg font-black text-text-primary mt-0.5">{tomorrowBrief.sleepTargetTime}</div>
            </div>
          </div>

          {/* School Hours & Commitments */}
          <div className="p-3.5 rounded-2xl bg-background border border-border-default text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-text-muted">School Timetable</div>
            <div className="font-semibold text-text-primary">{tomorrowBrief.schoolHours}</div>
            {tomorrowBrief.academyOrSportsNotes && (
              <div className="text-primary font-medium pt-1">
                ⚽ Sports / Academy: {tomorrowBrief.academyOrSportsNotes}
              </div>
            )}
          </div>

          {/* Key Scheduled Blocks */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Key Blocks Tomorrow ({tomorrowBrief.keyBlocks.length})
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {tomorrowBrief.keyBlocks.map((b, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-background border border-border-default flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-bold text-text-primary">{b.title}</span>
                  </div>
                  <span className="font-mono text-[11px] text-text-muted">{b.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revisions & Tasks */}
          {tomorrowBrief.revisionsDue.length > 0 && (
            <div className="p-3 rounded-2xl bg-success-soft border border-success/30 text-success-text text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{tomorrowBrief.revisionsDue.join(', ')}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md btn-interactive"
            >
              Acknowledge & Rest Well
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
