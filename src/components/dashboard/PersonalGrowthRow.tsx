'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Code,
  Trophy,
  Dumbbell,
  BookOpen,
  ArrowRight,
  Briefcase,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { ProjectWorkItem } from '../../types';

export function PersonalGrowthRow() {
  const {
    skillTracks,
    skillSessions,
    footballSessions,
    workoutSessions,
    readingLogs,
    projectWorkItems,
    createProjectWorkItem,
    updateProjectWorkItem,
    deleteProjectWorkItem,
    selectedDate,
    dailyPlan,
  } = useStudyOS();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState<'LMS' | 'AI' | 'Business' | 'Other'>('AI');
  const [projOutcome, setProjOutcome] = useState('');
  const [projTimeCap, setProjTimeCap] = useState(30);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectWorkItem({
      title: projTitle.trim(),
      category: projCategory,
      definedOutcome: projOutcome.trim(),
      timeCapMinutes: projTimeCap,
      actualMinutesSpent: 0,
      status: 'planned',
      dateCreated: selectedDate,
    });
    setShowProjectModal(false);
    setProjTitle('');
    setProjOutcome('');
  };

  // Metrics for cards
  const totalSkillHours = skillTracks.reduce((acc, t) => acc + t.totalHoursInvested, 0);
  const activeTrack = skillTracks[0] || null;

  const todayReading = readingLogs.filter((r) => r.date === selectedDate);
  const todayPages = todayReading.reduce((acc, r) => acc + r.pagesRead, 0);

  const isWeekendAcademy = dailyPlan.isWeekendAcademyDay;
  const recentFootball = footballSessions[0];
  const recentWorkout = workoutSessions[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Holistic Growth & Project Blocks
          </h3>
          <p className="text-[11px] text-slate-500">
            Complementary tracks built to reinforce focus and practical competence.
          </p>
        </div>
      </div>

      {/* 4 Quick Personal Growth Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Skill Lab Card */}
        <Link
          href="/skills"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 hover:border-slate-700 transition-all hover:translate-y-[-1px] group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-brand-blue border border-blue-500/20">
                <Code className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {totalSkillHours.toFixed(1)}h logged
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-brand-blue transition-colors">
              Skill Lab
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              {activeTrack ? `${activeTrack.title}: ${activeTrack.currentTopic}` : 'Python, AI, Robotics, Quantum'}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-brand-blue font-semibold mt-3">
            <span>Evidence Standard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Football Academy Card */}
        <Link
          href="/football"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 hover:border-slate-700 transition-all hover:translate-y-[-1px] group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Trophy className="w-4 h-4" />
              </div>
              {isWeekendAcademy ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Sat/Sun 4PM
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">Lightweight</span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              Football Academy
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              {recentFootball
                ? `Last: ${recentFootball.drillsDone.slice(0, 3).join(', ')}`
                : 'Drills, ball mastery, weak foot & match stamina.'}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-400 font-semibold mt-3">
            <span>Academy & Drills</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Fitness / Calisthenics Card */}
        <Link
          href="/fitness"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 hover:border-slate-700 transition-all hover:translate-y-[-1px] group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                Safe Habit
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Bodyweight Fitness
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              {recentWorkout
                ? `${recentWorkout.durationMinutes}m ${recentWorkout.type}`
                : 'Push-ups, squats, plank, mobility & safe pulling.'}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-semibold mt-3">
            <span>Safe Calisthenics</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Reading Card */}
        <Link
          href="/reading"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 hover:border-slate-700 transition-all hover:translate-y-[-1px] group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400">
                {todayPages} / 5 Pages
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Daily Non-Fiction
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              {todayReading.length > 0
                ? `${todayReading[0].bookTitle}: ${todayReading[0].keyIdea}`
                : 'Compound mental models with 5+ pages every day.'}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-300 font-semibold mt-3">
            <span>{todayPages >= 5 ? 'Target Achieved' : 'Read 5 Pages'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Lightweight Project Block (Strict Defined Outcome & Time Cap) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Project Work Block (Capped & Defined)
              </h4>
              <p className="text-[11px] text-slate-400">
                A project task must have a defined outcome and strict time cap so it does not consume study time.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowProjectModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project Task</span>
          </button>
        </div>

        {/* Project Items List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {projectWorkItems.slice(0, 3).map((item) => {
            const isDone = item.status === 'completed';
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isDone
                    ? 'bg-slate-850/40 border-slate-800/80 opacity-75'
                    : 'bg-slate-850 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Cap: {item.timeCapMinutes}m
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white mb-1">{item.title}</div>
                  <div className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    <strong className="text-slate-400">Outcome: </strong>
                    {item.definedOutcome}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-3 text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      updateProjectWorkItem(item.id, {
                        status: isDone ? 'in_progress' : 'completed',
                        completedDate: !isDone ? selectedDate : undefined,
                      })
                    }
                    className={`flex items-center gap-1 font-semibold ${
                      isDone ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDone ? 'Delivered' : 'Mark Delivered'}</span>
                  </button>

                  <span className="text-[10px] font-mono text-slate-500">
                    {item.actualMinutesSpent}m spent
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Project Block Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                  Project Guardrail
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Create Capped Project Task</h3>
              </div>
              <button
                onClick={() => setShowProjectModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
              <strong>Rule: </strong>
              Every project task must have a strict defined outcome and a maximum time cap to prevent eating into the 3.5h academic study target.
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Domain Track</label>
                  <select
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="AI">AI / Agents</option>
                    <option value="LMS">LMS / StudyOS</option>
                    <option value="Business">Business / Offer</option>
                    <option value="Other">Other Prototype</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time Cap (Minutes)</label>
                  <select
                    value={projTimeCap}
                    onChange={(e) => setProjTimeCap(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  >
                    <option value={20}>20 mins (Quick Sprint)</option>
                    <option value={30}>30 mins (Standard Cap)</option>
                    <option value={45}>45 mins (Deep Prototype)</option>
                    <option value={60}>60 mins (Maximum Allowed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. JSON Export Script for Mistakes"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Defined Concrete Outcome (What does completion look like?)
                </label>
                <textarea
                  rows={3}
                  required
                  value={projOutcome}
                  onChange={(e) => setProjOutcome(e.target.value)}
                  placeholder="e.g. A tested endpoint returning valid JSON error rows; or 1-page cold outreach template draft."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Schedule Capped Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
