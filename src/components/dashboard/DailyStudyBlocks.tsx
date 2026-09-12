'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Circle,
  Play,
  CalendarCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  School,
  BookOpen,
  Dumbbell,
  Moon,
  Sun,
  Coffee,
  Trophy,
  Layers,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { SubjectName, RoutineCategory, FullDayRoutineBlock } from '../../types';
import { ICSE_SUBJECTS } from '../../lib/constants';
import { HelpButton } from '../help/HelpButton';
import { WhyAmISeeingThis } from '../help/WhyAmISeeingThis';
import { minutesToFormattedTime, timeToMinutes, sortBlocksCircadian, isCrossMidnight } from '@/lib/routine/routineEngine';

export function DailyStudyBlocks() {
  const { dailyPlan, fullDayRoutine, saveFullDayRoutine, selectedDate, addExamOverride, removeExamOverride, routineProfile } = useStudyOS();
  const [viewMode, setViewMode] = useState<'routine' | 'study_blocks'>('routine');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideSubject, setOverrideSubject] = useState<SubjectName>('Physics');
  const [examName, setExamName] = useState('ICSE Term Unit Test');
  const [examDate, setExamDate] = useState(dailyPlan.date);

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    addExamOverride({
      examName,
      subject: overrideSubject,
      examDate,
      active: true,
    });
    setShowOverrideModal(false);
  };

  const toggleBlockCompleted = (blockId: string) => {
    const updated = fullDayRoutine.map((b) =>
      b.id === blockId ? { ...b, completed: !b.completed } : b
    );
    saveFullDayRoutine(selectedDate, updated);
  };

  const getCategoryIcon = (cat: RoutineCategory) => {
    switch (cat) {
      case 'wake':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'school':
      case 'commute':
        return <School className="w-4 h-4 text-primary" />;
      case 'meal':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'sports':
      case 'academy':
        return <Trophy className="w-4 h-4 text-emerald-500" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-emerald-600" />;
      case 'study':
      case 'homework':
      case 'revision':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case 'skill_lab':
      case 'project':
        return <Sparkles className="w-4 h-4 text-cyan-600" />;
      case 'sleep':
      case 'night_routine':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <span>Daily Schedule & Routine</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-soft text-primary font-bold">
              {dailyPlan.dayOfWeek}
            </span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {viewMode === 'routine'
              ? 'Complete 24-hour chronological routine from wake to sleep.'
              : 'Dedicated academic focus blocks and active error retrieval.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle Switch */}
          <div className="flex p-0.5 rounded-xl bg-background border border-border-default text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('routine')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'routine'
                  ? 'bg-surface text-primary shadow-sm font-bold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Full-Day Routine ({fullDayRoutine.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('study_blocks')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'study_blocks'
                  ? 'bg-surface text-primary shadow-sm font-bold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Study Blocks
            </button>
          </div>

          <Link
            href="/scheduler"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border-default hover:border-primary text-text-secondary hover:text-primary text-xs font-semibold transition-colors"
            title="Open AI Scheduler Architect"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Tune</span>
          </Link>

          <HelpButton topicKey="schedule" />

          {viewMode === 'study_blocks' && (
            <button
              onClick={() => setShowOverrideModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border-default hover:border-primary text-text-secondary text-xs font-semibold transition-colors"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-primary" />
              <span>Exam Override</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Exam Override Alert */}
      {dailyPlan.examOverrides.length > 0 && viewMode === 'study_blocks' && (
        <div className="p-3 rounded-xl bg-primary-soft border border-primary/30 flex items-center justify-between text-xs text-primary-text">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>Exam Override Active:</strong> Rotating block replaced by{' '}
              <strong className="underline">{dailyPlan.examOverrides[0].subject}</strong> (Maths remains mandatory).
            </span>
          </div>
          <button
            onClick={() => removeExamOverride(dailyPlan.examOverrides[0].id)}
            className="text-text-muted hover:text-danger p-1"
            title="Remove exam override"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW MODE 1: FULL-DAY 24-HOUR LIFE ROUTINE */}
      {viewMode === 'routine' && (
        <div className="space-y-2">
          {sortBlocksCircadian(fullDayRoutine, routineProfile?.wakeTime || '06:00').map((block) => {
            const isDone = block.completed;
            const crossMidnight = block.isCrossMidnight || isCrossMidnight(block.startTime, block.endTime);
            const isNextDay = block.dayOffset === 1;
            const isPrevNight = block.dayOffset === -1;

            return (
              <div
                key={block.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-success-soft/40 border-success/30 opacity-75'
                    : block.isLocked
                    ? 'bg-surface border-primary/30 shadow-xs'
                    : 'bg-surface border-border-default hover:border-primary/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleBlockCompleted(block.id)}
                    className={`mt-0.5 sm:mt-0 p-1 rounded-full transition-colors ${
                      isDone ? 'text-success' : 'text-text-muted hover:text-primary'
                    }`}
                    title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>

                  <div className="p-2 rounded-xl bg-background border border-border-default shrink-0">
                    {getCategoryIcon(block.category)}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-xs font-bold ${
                          isDone ? 'line-through text-text-muted' : 'text-text-primary'
                        }`}
                      >
                        {block.title}
                      </h4>
                      {block.isLocked && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-soft text-primary uppercase">
                          Locked
                        </span>
                      )}
                      {crossMidnight && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          Cross-Midnight
                        </span>
                      )}
                      {isNextDay && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30">
                          Past Midnight
                        </span>
                      )}
                      {isPrevNight && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-500/15 text-slate-800 dark:text-slate-300 border border-slate-500/30">
                          Previous Night
                        </span>
                      )}
                      {block.subject && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background text-text-secondary border border-border-default">
                          {block.subject}
                        </span>
                      )}
                    </div>
                    {block.reason && (
                      <p className="text-[11px] text-text-muted leading-relaxed">{block.reason}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-text-primary">
                      {minutesToFormattedTime(timeToMinutes(block.startTime))} –{' '}
                      {minutesToFormattedTime(timeToMinutes(block.endTime))}
                    </div>
                    <div className="text-[10px] text-text-muted font-mono">{block.durationMinutes}m</div>
                  </div>

                  {block.category === 'study' || block.category === 'revision' ? (
                    <Link
                      href="/study"
                      className="p-2 rounded-xl bg-primary-soft hover:bg-primary text-primary hover:text-white transition-colors"
                      title="Launch Study Timer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: ACADEMIC 3.5-HOUR STUDY BLOCKS */}
      {viewMode === 'study_blocks' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dailyPlan.blocks.map((block, idx) => {
            const isComplete = block.isCompleted || block.completedMinutes >= block.plannedMinutes;
            const isMaths = block.type === 'morning_maths';

            return (
              <div
                key={block.id || idx}
                className={`rounded-2xl border p-4 relative flex flex-col justify-between transition-all ${
                  isComplete
                    ? 'border-success/40 bg-success-soft/30'
                    : isMaths
                    ? 'border-primary/40 bg-primary-soft/20'
                    : 'border-border-default bg-surface'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                      Block 0{idx + 1}
                    </span>
                    {isComplete ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-success bg-success-soft px-1.5 py-0.5 rounded border border-success/30">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-muted" />
                        {block.plannedMinutes}m
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-text-primary">{block.subject}</span>
                      <span>•</span>
                      <span className="text-[11px] text-text-muted">{block.timeSlotHint}</span>
                    </div>
                    <WhyAmISeeingThis task={block} subject={block.subject} />
                  </div>

                  {block.isReplacedByExam && (
                    <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 mb-2">
                      Substituted for Upcoming Exam
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-border-default flex items-center justify-between">
                  <span className="text-[11px] font-mono text-text-muted">
                    {block.completedMinutes} / {block.plannedMinutes}m
                  </span>
                  <Link
                    href="/study"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>{isComplete ? 'Review' : 'Start'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exam Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-3xl border border-border-default bg-surface p-6 max-w-md w-full shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-text-primary">Set Upcoming Exam Override</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                When an upcoming exam is scheduled, <strong>Mathematics remains strictly mandatory (60m)</strong>, but one rotating block is safely replaced by high-priority exam preparation.
              </p>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Exam / Test Name
                </label>
                <input
                  type="text"
                  required
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs text-text-primary focus:outline-none focus:border-primary"
                  placeholder="e.g. ICSE Mid-Term Physics Exam"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Target Subject
                </label>
                <select
                  value={overrideSubject}
                  onChange={(e) => setOverrideSubject(e.target.value as SubjectName)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs text-text-primary focus:outline-none focus:border-primary"
                >
                  {ICSE_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl border border-border-default text-xs font-semibold text-text-secondary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
