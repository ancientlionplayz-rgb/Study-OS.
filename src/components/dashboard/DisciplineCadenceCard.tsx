'use client';

import React, { useState } from 'react';
import {
  Moon,
  Sunrise,
  BookOpen,
  Calculator,
  Dumbbell,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Edit2,
  X,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';

export function DisciplineCadenceCard() {
  const { disciplineCheck, updateDisciplineCheck, selectedDate } = useStudyOS();
  const [showEditModal, setShowEditModal] = useState(false);
  const [sleepTarget, setSleepTarget] = useState(disciplineCheck.sleepTargetHours);
  const [sleepActual, setSleepActual] = useState(disciplineCheck.sleepActualHours || 7.5);
  const [bedtime, setBedtime] = useState(disciplineCheck.bedtime || '10:30 PM');
  const [wakeTime, setWakeTime] = useState(disciplineCheck.wakeTime || '06:00 AM');
  const [morningTarget, setMorningTarget] = useState(disciplineCheck.morningStartTarget || '06:00 AM');
  const [morningActual, setMorningActual] = useState(disciplineCheck.morningStartActual || '06:05 AM');

  const handleSaveDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    updateDisciplineCheck({
      sleepTargetHours: sleepTarget,
      sleepActualHours: sleepActual,
      bedtime,
      wakeTime,
      morningStartTarget: morningTarget,
      morningStartActual: morningActual,
      morningStartMet: true,
    });
    setShowEditModal(false);
  };

  const habits = [
    {
      label: 'Sleep Rest',
      value: `${disciplineCheck.sleepActualHours || 7.5}h / ${disciplineCheck.sleepTargetHours}h`,
      met: (disciplineCheck.sleepActualHours || 7.5) >= disciplineCheck.sleepTargetHours - 0.5,
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
      sub: `${disciplineCheck.bedtime || '10:30 PM'} - ${disciplineCheck.wakeTime || '06:00 AM'}`,
    },
    {
      label: 'Morning Start',
      value: disciplineCheck.morningStartActual || '06:05 AM',
      met: disciplineCheck.morningStartMet,
      icon: <Sunrise className="w-3.5 h-3.5 text-amber-400" />,
      sub: `Target: ${disciplineCheck.morningStartTarget || '06:00 AM'}`,
    },
    {
      label: 'Study 3.5h Target',
      value: disciplineCheck.studyTargetMet ? 'Met (210m+)' : 'In Progress',
      met: disciplineCheck.studyTargetMet,
      icon: <BookOpen className="w-3.5 h-3.5 text-brand-blue" />,
      sub: 'Academic Core',
    },
    {
      label: 'Maths 60m Quota',
      value: disciplineCheck.mathsTargetMet ? 'Completed' : 'Incomplete',
      met: disciplineCheck.mathsTargetMet,
      icon: <Calculator className="w-3.5 h-3.5 text-blue-400" />,
      sub: 'Mandatory Daily',
    },
    {
      label: 'Safe Calisthenics',
      value: disciplineCheck.workoutCompleted ? 'Logged' : 'Pending',
      met: disciplineCheck.workoutCompleted,
      icon: <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />,
      sub: 'Bodyweight Habit',
    },
    {
      label: 'Reading 5+ Pages',
      value: disciplineCheck.readingCompleted ? 'Achieved' : 'Pending',
      met: disciplineCheck.readingCompleted,
      icon: <BookOpen className="w-3.5 h-3.5 text-amber-300" />,
      sub: 'Non-Fiction Idea',
    },
    {
      label: 'Skill Lab Session',
      value: disciplineCheck.skillLabCompleted ? 'Evidence Saved' : 'Optional',
      met: disciplineCheck.skillLabCompleted,
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
      sub: 'Working Output',
    },
  ];

  const totalMet = habits.filter((h) => h.met).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
      {/* Header with edit button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Daily Discipline & Operating Cadence
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {totalMet} / {habits.length} Anchors
          </span>
        </div>

        <button
          onClick={() => setShowEditModal(true)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          <span>Adjust Schedule</span>
        </button>
      </div>

      {/* Immediate Recovery / Anti-Shame Banner */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-850/90 border border-slate-800 text-xs">
        <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-slate-300 leading-relaxed">
          <strong className="text-white">Zero Shaming Principle: </strong>
          Missed a session or woke up late? Do not abandon the day.
          <span className="text-emerald-400 font-semibold"> The very next scheduled block is your immediate restart point.</span>
        </span>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {habits.map((habit, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
              habit.met
                ? 'bg-emerald-950/15 border-emerald-500/30'
                : 'bg-slate-850/60 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1 rounded-lg bg-slate-800/80">{habit.icon}</div>
                {habit.met ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>
              <div className="text-[11px] font-bold text-white truncate">{habit.label}</div>
              <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                {habit.value}
              </div>
            </div>

            <div className="text-[9px] text-slate-500 truncate pt-2 border-t border-slate-800/60 mt-2">
              {habit.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-brand-blue">
                  Cadence Settings
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Sleep & Morning Targets</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscipline} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Sleep (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="6"
                    max="10"
                    value={sleepTarget}
                    onChange={(e) => setSleepTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Actual Sleep (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="4"
                    max="12"
                    value={sleepActual}
                    onChange={(e) => setSleepActual(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bedtime</label>
                  <input
                    type="text"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    placeholder="e.g. 10:30 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Wake Time</label>
                  <input
                    type="text"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    placeholder="e.g. 06:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Morning Start Target</label>
                  <input
                    type="text"
                    value={morningTarget}
                    onChange={(e) => setMorningTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Actual Morning Start</label>
                  <input
                    type="text"
                    value={morningActual}
                    onChange={(e) => setMorningActual(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold"
                >
                  Save Cadence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
