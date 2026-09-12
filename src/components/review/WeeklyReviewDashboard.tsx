'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  ShieldCheck,
  Save,
  Flame,
  BookOpen,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';

export function ContinuousTrackerDashboard() {
  const {
    weeklyReview,
    saveWeeklyReviewNotes,
    getAnnualAnalytics,
    getActivityHeatmap,
    dailyPlan,
    sessions,
  } = useStudyOS();

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('weekly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [takeaways, setTakeaways] = useState(weeklyReview.keyTakeaways || '');
  const [nextFocus, setNextFocus] = useState(weeklyReview.nextWeekFocus || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Real annual analytics
  const annualData = useMemo(() => getAnnualAnalytics(selectedYear), [getAnnualAnalytics, selectedYear]);
  const heatmap = useMemo(() => getActivityHeatmap(selectedYear), [getActivityHeatmap, selectedYear]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveWeeklyReviewNotes(takeaways, nextFocus);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const isMathsPerfect = weeklyReview.mathsDaysCompleted === 7;
  const targetWeeklyHours = 24.5; // 3.5h * 7

  // Generate 52 weeks or full 365 days for the annual heatmap grid
  const daysInYear = useMemo(() => {
    const days: { date: string; level: number; dayOfWeek: number; studyMinutes: number }[] = [];
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const cell = heatmap[dateStr];
      days.push({
        date: dateStr,
        level: cell ? cell.level : 0,
        dayOfWeek: d.getDay(),
        studyMinutes: cell ? cell.studyMinutes : 0,
      });
    }
    return days;
  }, [selectedYear, heatmap]);

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800';
      case 2:
        return 'bg-emerald-400 dark:bg-emerald-800 border-emerald-500 dark:border-emerald-700';
      case 3:
        return 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500';
      case 4:
        return 'bg-emerald-600 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-400';
      default:
        return 'bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Continuous Lifelong Tracker
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Zero Artificial Program Limits
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Academic Performance & Growth Tracker
          </h1>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          {(['daily', 'weekly', 'monthly', 'annual'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimeframe(mode)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                timeframe === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DAILY TIMEFRAME VIEW */}
      {/* ========================================================= */}
      {timeframe === 'daily' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Target Study Today</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {dailyPlan.targetMinutesTotal} mins
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">3.5 hours planned blocks</span>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Maths Mandatory Quota</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {dailyPlan.mathsTargetMinutes} mins
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Morning focused problem sums</span>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Study Blocks Count</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {dailyPlan.blocks.length} blocks
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {dailyPlan.blocks.filter((b) => b.isCompleted).length} completed today
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Weekend Academy</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {dailyPlan.isWeekendAcademyDay ? 'Football Academy' : 'Regular Schedule'}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {dailyPlan.isWeekendAcademyDay ? '4:00 PM - 7:30 PM' : 'Full study cadence'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today&apos;s Study Blocks & Progress</h3>
            <div className="space-y-2">
              {dailyPlan.blocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    block.isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      block.isCompleted ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {block.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{block.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {block.subject} • {block.timeSlotHint}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold">
                    {block.plannedMinutes} mins
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. WEEKLY TIMEFRAME VIEW */}
      {/* ========================================================= */}
      {timeframe === 'weekly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Total Study Hours</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {weeklyReview.totalStudyHours}h
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Target: {targetWeeklyHours}h ({Math.round((weeklyReview.totalStudyHours / targetWeeklyHours) * 100)}%)
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Maths Quota (&gt;=60m)</span>
              <div className={`text-2xl font-black font-mono ${isMathsPerfect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {weeklyReview.mathsDaysCompleted} / 7
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {isMathsPerfect ? '100% daily discipline' : `${7 - weeklyReview.mathsDaysCompleted} missed days`}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Question Accuracy</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {weeklyReview.accuracyAverage}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">From timed production blocks</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Revisions Completed</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {weeklyReview.revisionsCompletedCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {weeklyReview.revisionsDueCount} still due in queue
              </div>
            </div>
          </div>

          {/* Retrospective Notes & Action Planning */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Weekly Reflection & Next Week Focus
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  Key Academic Takeaways & Root Causes
                </label>
                <textarea
                  rows={3}
                  value={takeaways}
                  onChange={(e) => setTakeaways(e.target.value)}
                  placeholder="What study habits worked? Where did attention wander? Derivations that still need work..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  Next Week Prime Focus Chapter & Objective
                </label>
                <input
                  type="text"
                  value={nextFocus}
                  onChange={(e) => setNextFocus(e.target.value)}
                  placeholder="e.g. Master Simultaneous Linear Equations and Newton's Second Law derivations"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {savedSuccess ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 btn-interactive"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Weekly Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MONTHLY TIMEFRAME VIEW */}
      {/* ========================================================= */}
      {timeframe === 'monthly' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">12-Month Academic Performance</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {annualData.monthlyBreakdown.map((m) => (
                <div
                  key={m.monthName}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{m.monthName} {selectedYear}</span>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{m.studyHours}h</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Study Tasks</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{m.tasksDone}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Avg Accuracy</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{m.accuracyAvg}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ANNUAL CONTINUOUS HEATMAP & METRICS */}
      {/* ========================================================= */}
      {timeframe === 'annual' && (
        <div className="space-y-6">
          {/* Annual KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Year-to-Date Study</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {annualData.totalStudyHours}h
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Across {annualData.studyDaysCount} active study days</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Total Mathematics</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {annualData.mathsTotalHours}h
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Mandatory problem sums</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Revisions Mastered</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {annualData.revisionsCompletedCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">+1, +3, +7 spaced retrievals</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Holistic Growth Hours</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {(annualData.totalSkillHours + annualData.totalFitnessHours).toFixed(1)}h
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Skills ({annualData.totalSkillHours}h) + Fitness ({annualData.totalFitnessHours}h)</div>
            </div>
          </div>

          {/* 365-Day Activity Heatmap */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Annual Activity Heatmap ({selectedYear})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real study and training telemetry. 365 days of recorded desk sessions, workouts, and skills.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white px-2">
                  {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedYear((y) => y + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-1 min-w-[700px]">
                {Array.from({ length: 53 }).map((_, weekIdx) => {
                  const weekDays = daysInYear.slice(weekIdx * 7, (weekIdx + 1) * 7);
                  return (
                    <div key={weekIdx} className="flex flex-col gap-1">
                      {weekDays.map((d) => (
                        <div
                          key={d.date}
                          title={`${d.date}: ${d.studyMinutes}m active`}
                          className={`w-3 h-3 rounded-sm border ${getHeatmapColor(d.level)} transition-colors`}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Less</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800" />
                <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-950 border border-emerald-300" />
                <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-800 border border-emerald-500" />
                <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600 border border-emerald-600" />
                <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500 border border-emerald-700" />
              </div>
              <span>More Active</span>
            </div>
          </div>

          {/* Subject Distribution */}
          {annualData.subjectDistribution.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subject Hours Distribution</h3>
              <div className="space-y-2">
                {annualData.subjectDistribution.map((item) => (
                  <div key={item.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.subject}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.hours}h ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const WeeklyReviewDashboard = ContinuousTrackerDashboard;
export default ContinuousTrackerDashboard;
