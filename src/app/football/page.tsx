'use client';

import React, { useState } from 'react';
import { Trophy, Plus, Clock, Star, CheckCircle2, ShieldCheck, Footprints, Flame, X } from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';

export default function FootballPage() {
  const { footballSessions, createFootballSession, selectedDate, dailyPlan } = useStudyOS();
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState(120);
  const [type, setType] = useState<'academy_training' | 'solo_drills' | 'match' | 'recovery'>('academy_training');
  const [isAcademy, setIsAcademy] = useState(dailyPlan.isWeekendAcademyDay);

  // Quick drill toggles
  const [selectedDrills, setSelectedDrills] = useState<string[]>([
    'Dribbling',
    'Passing',
    'Weak Foot',
    'Stamina',
  ]);

  const [rating, setRating] = useState(4);
  const [matchNotes, setMatchNotes] = useState('');
  const [staminaNotes, setStaminaNotes] = useState('Maintained high pressing intensity; good aerobic recovery during transitions');

  const drillOptions = [
    'Dribbling',
    'Passing',
    'Shooting',
    'Weak Foot',
    'Speed',
    'Stamina',
  ];

  const toggleDrill = (drill: string) => {
    if (selectedDrills.includes(drill)) {
      setSelectedDrills(selectedDrills.filter((d) => d !== drill));
    } else {
      setSelectedDrills([...selectedDrills, drill]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createFootballSession({
      date: selectedDate,
      durationMinutes: duration,
      type,
      isAcademyAttendance: isAcademy,
      drillsDone: selectedDrills,
      performanceRating: rating,
      staminaConditioningNotes: staminaNotes.trim(),
      matchNotes: matchNotes.trim() || undefined,
    });
    setShowModal(false);
    setMatchNotes('');
  };

  const academySessions = footballSessions.filter((s) => s.isAcademyAttendance || s.type === 'academy_training');
  const totalTrainingHours = footballSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Athletic Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Weekend Academy Focus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Football Academy & Match Fitness
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Track weekend academy attendance, ball mastery (dribbling, weak foot, passing) and match stamina.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-surface border border-border-default text-right shadow-sm">
            <div className="text-[10px] font-mono uppercase text-text-muted font-bold">Academy Logs</div>
            <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">{academySessions.length} sessions</div>
          </div>
          <button
            onClick={() => {
              setIsAcademy(dailyPlan.isWeekendAcademyDay);
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0 btn-interactive"
          >
            <Plus className="w-4 h-4" />
            <span>Log Practice</span>
          </button>
        </div>
      </div>

      {/* Weekend Academy Schedule Card */}
      <div className="rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Weekend Academy Schedule (Saturday & Sunday)
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                4:00 PM – 7:30 PM
              </span>
            </div>
            <p className="text-xs text-amber-950/80 dark:text-amber-100/90 leading-relaxed font-medium">
              Academy training commences at <strong>4:00 PM</strong> and return home is around <strong>7:00–7:30 PM</strong>.
              Always front-load your mandatory 60m Maths block and core ICSE academics in the morning so training never creates study guilt.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Drill Metric Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {drillOptions.map((drill) => {
          const count = footballSessions.filter((s) => s.drillsDone.includes(drill)).length;
          return (
            <div key={drill} className="p-3 rounded-xl border border-border-default bg-surface text-center shadow-sm">
              <div className="text-[10px] font-mono uppercase text-text-muted font-bold mb-1">{drill}</div>
              <div className="text-base font-black font-mono text-text-primary">{count}</div>
              <div className="text-[10px] text-text-muted">practices</div>
            </div>
          );
        })}
      </div>

      {/* Training Sessions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Football Logs ({footballSessions.length})
          </h3>
          <span className="text-xs font-mono text-text-muted font-medium">
            {totalTrainingHours.toFixed(1)} total hours logged
          </span>
        </div>

        {footballSessions.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500">
            No training sessions logged yet. Record your weekend academy attendance or solo drill practice.
          </div>
        ) : (
          footballSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase text-[11px] px-2 py-0.5 rounded bg-slate-800">
                    {session.type.replace('_', ' ')}
                  </span>
                  {session.isAcademyAttendance && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Academy Attendance Verified
                    </span>
                  )}
                  <span className="text-slate-400 font-mono">{session.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-400">{session.durationMinutes}m</span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{session.performanceRating}/5</span>
                  </div>
                </div>
              </div>

              {/* Drills badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-slate-400 font-semibold mr-1">Drills:</span>
                {session.drillsDone.map((d, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium"
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Match notes if any */}
              {session.matchNotes && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-amber-300">Match Notes: </strong>
                  {session.matchNotes}
                </div>
              )}

              {/* Stamina conditioning notes */}
              {session.staminaConditioningNotes && (
                <div className="text-slate-400">
                  <strong className="text-slate-300">Conditioning & Recovery: </strong>
                  {session.staminaConditioningNotes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lightweight Log Practice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                  Lightweight Practice Entry
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Log Football Practice</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Session Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="academy_training">Academy Training</option>
                    <option value="solo_drills">Solo Drills</option>
                    <option value="match">Match Play</option>
                    <option value="recovery">Active Recovery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Academy attendance toggle */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAcademy}
                  onChange={(e) => setIsAcademy(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
                />
                <span className="text-xs text-white font-medium">
                  Official Weekend Academy Attendance (Sat / Sun)
                </span>
              </label>

              {/* Quick Drill Checkboxes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Drills & Skills Practiced (Tap to toggle)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {drillOptions.map((drill) => {
                    const active = selectedDrills.includes(drill);
                    return (
                      <button
                        type="button"
                        key={drill}
                        onClick={() => toggleDrill(drill)}
                        className={`p-2 rounded-xl border text-center font-medium transition-all ${
                          active
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {drill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Performance Rating */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Overall Intensity / Performance (1 to 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                        rating >= star
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Match notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Match Notes / Tactical Insights (Optional)
                </label>
                <textarea
                  rows={2}
                  value={matchNotes}
                  onChange={(e) => setMatchNotes(e.target.value)}
                  placeholder="e.g. Scored with weak left foot; created 3 chances through half-space runs"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Stamina notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Stamina & Conditioning Notes
                </label>
                <input
                  type="text"
                  required
                  value={staminaNotes}
                  onChange={(e) => setStaminaNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Save Practice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
