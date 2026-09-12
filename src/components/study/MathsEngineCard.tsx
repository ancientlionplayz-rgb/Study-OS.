'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Award,
  ShieldCheck,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { ERROR_CATEGORIES } from '../../lib/constants';

export function MathsEngineCard() {
  const { sessions, mistakes, selectedDate } = useStudyOS();

  // Filter Maths sessions across history and selected date
  const mathsSessions = sessions.filter((s) => s.isMathsSession || s.subject === 'Mathematics');
  const todayMathsSessions = mathsSessions.filter((s) => s.date === selectedDate);

  const todayMinutes = todayMathsSessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);
  const isMandatoryMet = todayMinutes >= 60;

  // Aggregate stats across all Maths sessions
  const totalQuestions = mathsSessions.reduce((acc, s) => acc + (s.questionsAttempted || 0), 0);
  const totalCorrect = mathsSessions.reduce((acc, s) => acc + (s.correct || 0), 0);
  const totalIncorrect = mathsSessions.reduce((acc, s) => acc + (s.incorrect || 0), 0);
  const overallAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Count error category breakdown from Maths mistakes
  const mathsMistakes = mistakes.filter((m) => m.subject === 'Mathematics');
  const errorCounts: Record<string, number> = {};
  ERROR_CATEGORIES.forEach((cat) => (errorCounts[cat] = 0));
  mathsMistakes.forEach((m) => {
    if (errorCounts[m.errorCategory] !== undefined) {
      errorCounts[m.errorCategory]++;
    }
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
              Core Discipline Pillar
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-brand-blue border border-blue-500/20">
              Mandatory 60m/Day
            </span>
          </div>
          <h3 className="text-xl font-black text-white mt-1">Mathematics Engine</h3>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              isMandatoryMet
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {todayMinutes} / 60 mins Today ({isMandatoryMet ? 'Met' : `${60 - todayMinutes}m left`})
            </span>
          </div>
        </div>
      </div>

      {/* Strict Anti-Passive Learning Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-brand-emerald mt-0.5 shrink-0" />
        <div>
          <strong className="text-slate-200">Evidence-Based Mastery Only: </strong>
          In StudyOS, a Maths topic is never marked as “mastered” simply because a video or lecture was watched. Mastery requires independent textbook problems solved under timed conditions with &gt;85% accuracy.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 mb-1">Total Attempted</div>
          <div className="text-2xl font-black text-white font-mono">{totalQuestions}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Independent Sums</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800">
          <div className="text-[11px] font-semibold text-emerald-400 mb-1">Correct Answers</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{totalCorrect}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Verified Steps</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800">
          <div className="text-[11px] font-semibold text-rose-400 mb-1">Incorrect / Errors</div>
          <div className="text-2xl font-black text-rose-400 font-mono">{totalIncorrect}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Logged to Mistakes</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800">
          <div className="text-[11px] font-semibold text-brand-blue mb-1">Cumulative Accuracy</div>
          <div className="text-2xl font-black text-brand-blue font-mono">{overallAccuracy}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target: &gt;85%</div>
        </div>
      </div>

      {/* Error Category Breakdown */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Mathematical Error Analysis (Why Marks Were Lost)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ERROR_CATEGORIES.map((category) => {
            const count = errorCounts[category] || 0;
            return (
              <div
                key={category}
                className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="text-xs text-slate-300 font-medium truncate mr-2">{category}</div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    count > 0
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Maths Sessions Table / List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Recent Mathematics Production Logs
        </h4>
        {mathsSessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
            No Maths sessions logged yet. Launch a 60m focus timer to start today’s quota.
          </div>
        ) : (
          <div className="space-y-2">
            {mathsSessions.slice(0, 3).map((sess) => (
              <div
                key={sess.id}
                className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{sess.chapter}</span>
                    <span className="text-[10px] font-normal text-slate-400 font-mono">
                      {sess.date}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-0.5">{sess.topic}</div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-300">{sess.actualDurationMinutes} mins</span>
                  <span className="text-slate-400">
                    {sess.correct}/{sess.questionsAttempted} Qs
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      (sess.accuracy || 0) >= 80
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {sess.accuracy || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
