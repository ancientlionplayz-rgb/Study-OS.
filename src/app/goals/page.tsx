'use client';

import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Sparkles, Trophy } from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { EXACT_PROJECT_MARKER } from '../../lib/constants';

export default function GoalsPage() {
  const { goals, createGoal, updateGoal } = useStudyOS();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Academic' | 'Football' | 'Skills' | 'Fitness' | 'Life'>('Academic');
  const [targetDate, setTargetDate] = useState('2027-03-15');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createGoal({
      title: title.trim(),
      category,
      targetDate,
      description: description.trim(),
      progressPercent: 0,
      isCompleted: false,
    });
    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  const handleToggleComplete = (id: string, current: boolean) => {
    updateGoal(id, {
      isCompleted: !current,
      progressPercent: !current ? 100 : 50,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Long-Term Vision & Milestones
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Class 9 ICSE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Strategic Goals & Pillars
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Academic recovery milestones, football academy athleticism, and deep intellectual mastery.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 shrink-0 btn-interactive"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Project Marker Core System Card */}
      <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Project Marker
            </span>
            <div className="font-mono text-sm sm:text-base font-bold text-text-primary bg-surface-soft px-3 py-2 rounded-xl border border-border-default inline-block tracking-widest">
              {EXACT_PROJECT_MARKER}
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Class 9 Academic Comeback Core System marker for holistic execution and discipline.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
              goal.isCompleted
                ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                : 'border-border-default bg-surface shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-surface-soft text-text-secondary border border-border-default">
                  {goal.category}
                </span>
                <span className="text-[10px] font-mono text-text-muted">Due: {goal.targetDate}</span>
              </div>

              <h3 className="text-base font-bold text-text-primary mb-1.5 flex items-start gap-2">
                <button
                  onClick={() => handleToggleComplete(goal.id, goal.isCompleted)}
                  className="mt-0.5 text-text-muted hover:text-emerald-500 transition-colors"
                >
                  {goal.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <span className={goal.isCompleted ? 'line-through text-text-muted' : ''}>
                  {goal.title}
                </span>
              </h3>

              <p className="text-xs text-text-secondary leading-relaxed mb-4">{goal.description}</p>

              {goal.projectMarker && (
                <div className="mb-3 p-2 rounded-lg bg-surface-soft border border-border-default font-mono text-xs text-text-primary tracking-wider">
                  {goal.projectMarker}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-text-muted font-mono mb-1">
                <span>Progress</span>
                <span>{goal.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${goal.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Growth Goal</h3>
            <p className="text-xs text-slate-400 mb-4">
              Set clear milestones for academics, football, or skills.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master all ICSE Physics derivation steps"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as 'Academic' | 'Football' | 'Skills' | 'Fitness' | 'Life')
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Football">Football</option>
                    <option value="Skills">Skills</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Life">Life</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Criteria
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why this goal matters and what defines success..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-blue hover:bg-brand-blue-dark text-white"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
