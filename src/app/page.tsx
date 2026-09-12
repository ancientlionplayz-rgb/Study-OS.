'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  AlertOctagon,
  Play,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';
import { useStudyOS } from '../lib/storage/context';
import { TodayProgressCard } from '../components/dashboard/TodayProgressCard';
import { DailyStudyBlocks } from '../components/dashboard/DailyStudyBlocks';
import { WeekendAcademyNotice } from '../components/dashboard/WeekendAcademyNotice';
import { NextActionCard } from '../components/dashboard/NextActionCard';
import { QuickStatRow } from '../components/dashboard/QuickStatRow';
import { RevisionQueue } from '../components/mistakes/RevisionQueue';
import { NewSessionModal } from '../components/study/NewSessionModal';
import { DisciplineCadenceCard } from '../components/dashboard/DisciplineCadenceCard';
import { PersonalGrowthRow } from '../components/dashboard/PersonalGrowthRow';
import { HolidayNotificationBanner } from '../components/dashboard/HolidayNotificationBanner';
import { TomorrowBriefModal } from '../components/dashboard/TomorrowBriefModal';

export default function TodayPage() {
  const { profile, routineProfile, dailyPlan, sessions, revisionsDue, selectedDate } = useStudyOS();
  const [showSessionModal, setShowSessionModal] = useState(false);

  const todaySessions = sessions.filter((s) => s.date === selectedDate);
  const targetMins = routineProfile?.studyPreferences?.targetDailyStudyMinutes || profile.dailyStudyTargetMinutes || 120;
  const mandatorySub = routineProfile?.studyPreferences?.mandatorySubject;

  return (
    <div className="space-y-6">
      {/* Holiday Notification Banner */}
      <HolidayNotificationBanner />

      {/* Evening Tomorrow's Schedule Brief Modal */}
      <TomorrowBriefModal />

      {/* Top Banner / Welcome & Target Reminder */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Academic Recovery & Life Routine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-soft text-primary border border-primary/20 font-bold">
              {profile.grade}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Today’s Operating Cadence
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Target: {Math.round((targetMins / 60) * 10) / 10}h focused deep work {mandatorySub?.enabled ? `with ${mandatorySub.dailyMinutes || 60}m ${mandatorySub.subject}` : 'tailored to your verified commitments'}.
          </p>
        </div>

        <button
          onClick={() => setShowSessionModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95 shrink-0 btn-interactive"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Quick Log Session</span>
        </button>
      </div>

      {/* Weekend Academy Alert if applicable */}
      <WeekendAcademyNotice />

      {/* High-density metrics row */}
      <QuickStatRow />

      {/* Responsive 12-Column Adaptive Grid (Laptop & Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Left Column: Academic Core & Schedule (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Study Progress & Focus status */}
          <div id="tour-today-progress">
            <TodayProgressCard />
          </div>

          {/* Most Important Next Action */}
          <NextActionCard />

          {/* Today Study Blocks & Full-Day Routine */}
          <div id="tour-schedule-section">
            <div id="tour-tasks-grid">
              <DailyStudyBlocks />
            </div>
          </div>

          {/* Today's Logged Sessions List */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Logged Study Sessions Today ({todaySessions.length})
                </h3>
              </div>
              <Link
                href="/study"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Focus Timer</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {todaySessions.length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-background border border-border-default">
                <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-60" />
                <div className="text-xs font-semibold text-text-primary">No Sessions Logged Yet Today</div>
                <p className="text-[11px] text-text-muted max-w-sm mx-auto mt-1 mb-3">
                  Launch a focus session timer or record completed study time to build momentum.
                </p>
                <button
                  onClick={() => setShowSessionModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-background text-text-primary text-xs font-semibold border border-border-default transition-colors shadow-xs"
                >
                  Record First Session
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-xl border border-border-default bg-background p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-text-primary">{session.subject}</span>
                        <span className="text-text-muted">•</span>
                        <span className="text-text-secondary font-medium">{session.chapter}</span>
                        {session.isMathsSession && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary-soft text-primary border border-primary/20 font-bold">
                            Maths
                          </span>
                        )}
                      </div>
                      <div className="text-text-muted text-[11px] flex items-center gap-3 font-mono">
                        <span>{session.actualDurationMinutes} mins</span>
                        {session.questionsAttempted > 0 && (
                          <span>
                            {session.correct}/{session.questionsAttempted} Qs (
                            {Math.round((session.correct / session.questionsAttempted) * 100)}%)
                          </span>
                        )}
                        <span>{session.startTime} - {session.endTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-success-soft text-success border border-success/30 font-semibold">
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Right Column: Cadence, Discipline & Revision Queue (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revision Queue */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Revision Queue ({revisionsDue.length})
                </h3>
              </div>
              <Link href="/mistakes" className="text-[11px] text-primary hover:underline font-semibold">
                View Journal →
              </Link>
            </div>
            {revisionsDue.length > 0 ? (
              <RevisionQueue />
            ) : (
              <div className="p-4 rounded-xl bg-background border border-border-default text-center text-xs text-text-muted space-y-1">
                <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1" />
                <p className="font-semibold text-text-primary">All Revisions Cleared!</p>
                <p className="text-[11px] text-text-muted">No +1, +3, or +7 mistake tasks due for today.</p>
              </div>
            )}
          </div>

          {/* Daily Discipline & Operating Cadence (Sleep, Morning Start, Recovery) */}
          <DisciplineCadenceCard />
        </div>
      </div>

      {/* Full Width Personal Growth Section Across All Breakpoints */}
      <PersonalGrowthRow />

      {/* Quick Session Modal */}
      {showSessionModal && (
        <NewSessionModal
          isOpen={showSessionModal}
          onClose={() => setShowSessionModal(false)}
        />
      )}
    </div>
  );
}
