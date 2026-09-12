'use client';

import React, { useState } from 'react';
import { Dumbbell, Plus, CheckCircle2, ShieldCheck, Activity, AlertTriangle, X } from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';

export default function FitnessPage() {
  const { workoutSessions, createWorkoutSession, selectedDate } = useStudyOS();
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState(35);
  const [type, setType] = useState<'Calisthenics' | 'Mobility' | 'Core' | 'Endurance'>('Calisthenics');

  // Calisthenics habits state
  const [pushupProgression, setPushupProgression] = useState('Standard Push-ups');
  const [pushupSets, setPushupSets] = useState(3);
  const [pushupReps, setPushupReps] = useState(15);

  const [squatSets, setSquatSets] = useState(3);
  const [squatReps, setSquatReps] = useState(20);

  const [plankSets, setPlankSets] = useState(3);
  const [plankSeconds, setPlankSeconds] = useState(60);

  const [mobilityRoutine, setMobilityRoutine] = useState('Hip openers, thoracic rotation, shoulder dislocates');
  const [mobilityMinutes, setMobilityMinutes] = useState(10);

  const [hasPullEquipment, setHasPullEquipment] = useState(true);
  const [pullExercise, setPullExercise] = useState('Dead Hang & Pull-ups');
  const [pullSets, setPullSets] = useState(3);
  const [pullReps, setPullReps] = useState(6);

  const [notes, setNotes] = useState('Clean strict form, protected lower back during planks, full range of motion.');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const exercises: { name: string; sets: number; reps: number; notes?: string }[] = [
      { name: `${pushupProgression}`, sets: pushupSets, reps: pushupReps },
      { name: 'Bodyweight Squats', sets: squatSets, reps: squatReps },
      { name: `Plank (${plankSeconds}s hold)`, sets: plankSets, reps: 1 },
      { name: `Mobility (${mobilityRoutine})`, sets: 1, reps: mobilityMinutes },
    ];

    if (hasPullEquipment) {
      exercises.push({
        name: `Safe Pulling: ${pullExercise}`,
        sets: pullSets,
        reps: pullReps,
        notes: 'Verified safe pull-up bar equipment',
      });
    }

    createWorkoutSession({
      date: selectedDate,
      type,
      durationMinutes: duration,
      calisthenics: {
        pushupsProgression: pushupProgression,
        pushupsSets: pushupSets,
        pushupsReps: pushupReps,
        squatsSets: squatSets,
        squatsReps: squatReps,
        plankSets: plankSets,
        plankDurationSeconds: plankSeconds,
        mobilityRoutine: mobilityRoutine,
        mobilityMinutes: mobilityMinutes,
        safePulling: {
          equipmentAvailable: hasPullEquipment,
          exerciseName: hasPullEquipment ? pullExercise : undefined,
          sets: hasPullEquipment ? pullSets : undefined,
          reps: hasPullEquipment ? pullReps : undefined,
        },
      },
      exercises,
      notes: notes.trim(),
      safeHabitVerified: true,
    });

    setShowModal(false);
  };

  const totalWorkouts = workoutSessions.length;
  const totalMinutes = workoutSessions.reduce((acc, w) => acc + w.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Physical Discipline
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Safe Calisthenics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Fitness & Calisthenics
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Safe bodyweight habit tracking (push-ups, squats, plank, mobility, and safe pulling).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-surface border border-border-default text-right shadow-sm">
            <div className="text-[10px] font-mono uppercase text-text-muted font-bold">Total Workouts</div>
            <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">{totalWorkouts} sessions</div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 shrink-0 btn-interactive"
          >
            <Plus className="w-4 h-4" />
            <span>Log Calisthenics</span>
          </button>
        </div>
      </div>

      {/* Health & Safety Standard Card */}
      <div className="rounded-2xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/40 p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              Safe Habit Principles (Zero Extreme Diets, Zero Dangerous Pulling)
            </h3>
            <p className="text-xs text-emerald-950/80 dark:text-emerald-100/90 leading-relaxed font-medium">
              Exercise in StudyOS is engineered to support intense intellectual energy, desk posture, and athletic health.
              Extreme diets, dehydrating regimens, and unsafe targets are strictly barred. Pulling movements (pull-ups / inverted rows) must only be performed when a secure, tested pull-up bar or gym equipment exists—never improvising with furniture or doors.
            </p>
          </div>
        </div>
      </div>

      {/* Habit Columns Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-border-default bg-surface text-center shadow-sm">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Push-ups</div>
          <div className="text-xs font-bold text-white">Progression</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Chest & Triceps</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Squats</div>
          <div className="text-xs font-bold text-white">Bodyweight</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Quad & Glute Power</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Plank</div>
          <div className="text-xs font-bold text-white">Isometric Core</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Spine Stability</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Mobility</div>
          <div className="text-xs font-bold text-white">Desk Posture</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hips & Thoracic</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-center col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Safe Pulling</div>
          <div className="text-xs font-bold text-white">Equipment Gated</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dead Hangs & Rows</div>
        </div>
      </div>

      {/* Workout Sessions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Recorded Workouts ({workoutSessions.length})
          </h3>
          <span className="text-xs font-mono text-slate-400 font-medium">
            {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m active time
          </span>
        </div>

        {workoutSessions.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500">
            No workouts logged yet. Maintain physical vitality with daily bodyweight calisthenics.
          </div>
        ) : (
          workoutSessions.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase text-[11px] px-2 py-0.5 rounded bg-slate-800">
                    {w.type}
                  </span>
                  <span className="text-slate-400 font-mono">{w.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">{w.durationMinutes} mins</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                    Safe Form Verified
                  </span>
                </div>
              </div>

              {/* Exercises List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {w.exercises.map((e, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-850 border border-slate-800"
                  >
                    <span className="text-slate-200 font-medium">{e.name}</span>
                    <span className="font-mono text-slate-400 font-semibold">
                      {e.sets} x {e.reps}
                    </span>
                  </div>
                ))}
              </div>

              {w.notes && (
                <div className="text-slate-400 pt-1">
                  <strong className="text-slate-300">Notes: </strong>
                  {w.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Safe Workout Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                  Calisthenics & Mobility Log
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Record Daily Bodyweight Habit</h3>
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
                  <label className="block text-slate-300 font-semibold mb-1">Focus Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Calisthenics">Calisthenics</option>
                    <option value="Mobility">Mobility & Posture</option>
                    <option value="Core">Core & Spinal Stability</option>
                    <option value="Endurance">Aerobic Conditioning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Duration (mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Push-ups progression */}
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="font-semibold text-white">1. Push-ups / Progression</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block text-slate-400 text-[11px] mb-0.5">Variation</label>
                    <select
                      value={pushupProgression}
                      onChange={(e) => setPushupProgression(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-[11px]"
                    >
                      <option value="Knee Push-ups">Knee Push-ups</option>
                      <option value="Standard Push-ups">Standard Push-ups</option>
                      <option value="Diamond Push-ups">Diamond Push-ups</option>
                      <option value="Decline Push-ups">Decline Push-ups</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-0.5">Sets</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={pushupSets}
                      onChange={(e) => setPushupSets(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-0.5">Reps per set</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={pushupReps}
                      onChange={(e) => setPushupReps(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Squats & Plank */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                  <div className="font-semibold text-white">2. Squats</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={squatSets}
                      onChange={(e) => setSquatSets(Number(e.target.value))}
                      className="w-16 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                    />
                    <span className="text-slate-400">sets x</span>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={squatReps}
                      onChange={(e) => setSquatReps(Number(e.target.value))}
                      className="w-16 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                    />
                    <span className="text-slate-400">reps</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                  <div className="font-semibold text-white">3. Plank Hold</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={plankSets}
                      onChange={(e) => setPlankSets(Number(e.target.value))}
                      className="w-16 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                    />
                    <span className="text-slate-400">sets x</span>
                    <input
                      type="number"
                      min="15"
                      max="300"
                      step="5"
                      value={plankSeconds}
                      onChange={(e) => setPlankSeconds(Number(e.target.value))}
                      className="w-20 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                    />
                    <span className="text-slate-400">sec</span>
                  </div>
                </div>
              </div>

              {/* Mobility */}
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="font-semibold text-white">4. Mobility & Spine Health</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={mobilityRoutine}
                    onChange={(e) => setMobilityRoutine(e.target.value)}
                    className="col-span-2 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={mobilityMinutes}
                      onChange={(e) => setMobilityMinutes(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                    />
                    <span className="text-slate-400">mins</span>
                  </div>
                </div>
              </div>

              {/* Safe pulling with equipment check */}
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">5. Safe Pulling (Equipment Gated)</div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasPullEquipment}
                      onChange={(e) => setHasPullEquipment(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span>Equipment Available</span>
                  </label>
                </div>

                {hasPullEquipment ? (
                  <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-100">
                    <input
                      type="text"
                      value={pullExercise}
                      onChange={(e) => setPullExercise(e.target.value)}
                      className="col-span-3 sm:col-span-1 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-[11px]"
                    />
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={pullSets}
                        onChange={(e) => setPullSets(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={pullReps}
                        onChange={(e) => setPullReps(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Pulling skipped safely today. Never attempt pull-ups on unstable doorframes or furniture.</span>
                  </div>
                )}
              </div>

              {/* Session Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Workout Notes & Recovery</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20"
                >
                  Save Calisthenics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
