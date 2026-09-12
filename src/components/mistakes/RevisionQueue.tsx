'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Calendar,
  AlertOctagon,
  Sparkles,
  Check,
  X,
  Award,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { RevisionTask } from '../../types';

export function RevisionQueue() {
  const { revisionsDue, completeRevision, snoozeRevision, reattemptRevision } = useStudyOS();
  const [completedNotes, setCompletedNotes] = useState<Record<string, string>>({});
  const [selectedConfidence, setSelectedConfidence] = useState<Record<string, string>>({});
  const [activeVerifyTaskId, setActiveVerifyTaskId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<Record<string, string>>({});

  if (revisionsDue.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Revision Queue Up To Date</span>
        </div>
        <p className="text-[11px] text-slate-400">
          All +1d, +3d, and +7d deterministic retrieval tasks are completed for today.
        </p>
      </div>
    );
  }

  const handleConfirmVerification = (task: RevisionTask) => {
    const rawNote = completedNotes[task.id]?.trim() || '';
    const confidence = selectedConfidence[task.id] || 'Flawless';
    const finalNote = rawNote
      ? `[${confidence}] ${rawNote}`
      : `[${confidence}] Verified active retrieval on ${new Date().toLocaleDateString()}`;

    completeRevision(task.id, finalNote);
    setActiveVerifyTaskId(null);
    setStatusFeedback((prev) => ({ ...prev, [task.id]: 'Verified! +15 XP' }));
    setTimeout(() => {
      setStatusFeedback((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    }, 2500);
  };

  const handleSnooze = (task: RevisionTask) => {
    snoozeRevision(task.id, 1);
    setStatusFeedback((prev) => ({ ...prev, [task.id]: 'Snoozed (+1d)' }));
    setTimeout(() => {
      setStatusFeedback((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    }, 2000);
  };

  const handleReattempt = (task: RevisionTask) => {
    reattemptRevision(task.id);
    setStatusFeedback((prev) => ({ ...prev, [task.id]: 'Queued for today' }));
    setTimeout(() => {
      setStatusFeedback((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-900 p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Deterministic Revision Queue (+1, +3, +7)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold shrink-0">
                {revisionsDue.length} Due
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              Spaced retrieval scheduled automatically upon logging mistakes — test without looking at notes
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {revisionsDue.map((task) => {
          const isVerifying = activeVerifyTaskId === task.id;
          const currentConfidence = selectedConfidence[task.id] || 'Flawless';
          const feedback = statusFeedback[task.id];

          return (
            <div
              key={task.id}
              className="rounded-xl border border-slate-800 bg-slate-850/90 p-3.5 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
                      +{task.intervalDay} Day Retrieval
                    </span>
                    <span className="text-xs font-bold text-brand-blue">{task.subject}</span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-slate-400 text-[11px] font-mono whitespace-nowrap">
                      Due: {task.dueDate}
                    </span>
                    {task.status === 'reattempt' && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Reattempt Active
                      </span>
                    )}
                  </div>
                  <div className="text-slate-200 font-semibold text-xs sm:text-sm break-words">
                    {task.topic}
                  </div>
                </div>

                {/* Responsive Action Buttons Container (Never Overflows) */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0 w-full sm:w-auto justify-start sm:justify-end">
                  {feedback ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                      {feedback}
                    </span>
                  ) : !isVerifying ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveVerifyTaskId(task.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap active:scale-95 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSnooze(task)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors whitespace-nowrap border border-slate-700/60 hover:text-white"
                        title="Snooze due date by +1 day"
                      >
                        Snooze (+1d)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReattempt(task)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors whitespace-nowrap border border-slate-700/60 hover:text-white"
                        title="Schedule immediate reattempt for today"
                      >
                        Reattempt
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Interactive Verification & Evidence Prompt Modal/Card */}
              {isVerifying && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <Award className="w-4 h-4" />
                      <span>Verify Spaced Retrieval Evidence</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveVerifyTaskId(null)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                      Retrieval Proof / Retest Notes:
                    </label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Solved problem 4 without formula sheet in 2m, recalled all steps cleanly..."
                      value={completedNotes[task.id] || ''}
                      onChange={(e) =>
                        setCompletedNotes({ ...completedNotes, [task.id]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                      Retrieval Confidence:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Flawless', 'Minor Hesitation', 'Needed Effort'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedConfidence({ ...selectedConfidence, [task.id]: tag })}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                            currentConfidence === tag
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveVerifyTaskId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmVerification(task)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Earn +15 XP</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
