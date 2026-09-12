'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Shield,
  Sun,
  Moon,
  School,
  Trophy,
  Coffee,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  Flame,
  Zap,
  Check,
  Info,
  Dumbbell,
} from 'lucide-react';
import { useStudyOS } from '@/lib/storage/context';
import { RoutineEngine, timeToMinutes, minutesToFormattedTime, sortBlocksCircadian, isCrossMidnight } from '@/lib/routine/routineEngine';
import {
  FullDayRoutineBlock,
  StudentRoutineProfile,
  RecurringCommitment,
  ScheduleConflictIssue,
  RoutineCategory,
} from '@/types';
import { ICSE_SUBJECTS } from '@/lib/constants';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulerPage() {
  const {
    profile,
    routineProfile,
    saveRoutineProfile,
    fullDayRoutine,
    saveFullDayRoutine,
    selectedDate,
  } = useStudyOS();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeDate, setActiveDate] = useState<string>(selectedDate || new Date().toISOString().split('T')[0]);

  // Form State (Single Source of Truth)
  const [formProfile, setFormProfile] = useState<StudentRoutineProfile>(routineProfile || {});
  const [naturalText, setNaturalText] = useState('');
  const [isParsingNatural, setIsParsingNatural] = useState(false);
  const [parseStatus, setParseStatus] = useState<string | null>(null);

  // New commitment temporary inputs
  const [showAddTuition, setShowAddTuition] = useState(false);
  const [tuitionTitle, setTuitionTitle] = useState('');
  const [tuitionSubject, setTuitionSubject] = useState('Mathematics');
  const [tuitionDays, setTuitionDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [tuitionStart, setTuitionStart] = useState('17:00');
  const [tuitionEnd, setTuitionEnd] = useState('18:30');
  const [tuitionCommute, setTuitionCommute] = useState(15);

  const [showAddSports, setShowAddSports] = useState(false);
  const [sportsTitle, setSportsTitle] = useState('');
  const [sportsDays, setSportsDays] = useState<string[]>(['Saturday', 'Sunday']);
  const [sportsStart, setSportsStart] = useState('16:00');
  const [sportsEnd, setSportsEnd] = useState('18:00');
  const [sportsCommute, setSportsCommute] = useState(20);

  // Generated schedule state for Step 3
  const [generatedBlocks, setGeneratedBlocks] = useState<FullDayRoutineBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeFixMessage, setActiveFixMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync initial form profile from context on mount
  useEffect(() => {
    if (routineProfile) {
      setFormProfile(routineProfile);
    }
  }, [routineProfile]);

  // Re-generate blocks whenever moving to Step 3 or activeDate changes
  useEffect(() => {
    if (step === 3) {
      const blocks = RoutineEngine.generateFullDayRoutine(formProfile, activeDate);
      setGeneratedBlocks(blocks);
      if (blocks.length > 0) {
        setSelectedBlockId((prev) => prev || blocks[0].id);
      }
    }
  }, [step, activeDate, formProfile]);

  // Conflict detection for review
  const conflictReport = RoutineEngine.detectDetailedConflicts(
    RoutineEngine.generateFullDayRoutine(formProfile, activeDate),
    formProfile
  );

  const weekUnderstanding = RoutineEngine.summarizeWeekUnderstanding(formProfile);

  // Handle Natural Language AI Routine Intake
  const handleParseNatural = async () => {
    if (!naturalText.trim()) return;
    setIsParsingNatural(true);
    setParseStatus('AI is analyzing your commitments...');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineText: naturalText,
          grade: profile.grade || 'Class 9 ICSE',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const parsed = json.data;
        const targetMins = parsed.studentProfile?.dailyStudyTargetMinutes || formProfile.studyPreferences?.targetDailyStudyMinutes || 120;
        setFormProfile((prev) => ({
          ...prev,
          studyPreferences: {
            ...prev.studyPreferences,
            targetDailyStudyMinutes: targetMins,
            mandatorySubject: parsed.studentProfile?.mathsMandatoryMinutes > 0
              ? { enabled: true, subject: 'Mathematics', dailyMinutes: parsed.studentProfile.mathsMandatoryMinutes }
              : prev.studyPreferences?.mandatorySubject,
          },
        }));
        setParseStatus(`Routine parsed (${targetMins}m daily target). Review updated fields below.`);
      } else {
        setParseStatus('Parsed routine into standard cadence.');
      }
    } catch {
      setParseStatus('Could not connect to AI parser. Using deterministic defaults.');
    } finally {
      setIsParsingNatural(false);
    }
  };

  // Add Tuition Commitment
  const handleAddTuition = () => {
    if (!tuitionTitle.trim()) return;
    const newCommitment: RecurringCommitment = {
      id: `tuition_${Date.now()}`,
      title: tuitionTitle.trim(),
      name: tuitionTitle.trim(),
      subject: tuitionSubject,
      type: 'tuition',
      category: 'tuition',
      days: tuitionDays,
      daysOfWeek: tuitionDays,
      startTime: tuitionStart,
      endTime: tuitionEnd,
      commuteBeforeMinutes: tuitionCommute,
      commuteMinutesBefore: tuitionCommute,
      commuteAfterMinutes: tuitionCommute,
      commuteMinutesAfter: tuitionCommute,
      recurrenceType: 'weekly',
      isLocked: true,
    };

    setFormProfile((prev) => {
      const existing = (prev.tuition || prev.tuitionCommitments || []) as RecurringCommitment[];
      return {
        ...prev,
        tuition: [...existing, newCommitment],
        tuitionCommitments: [...existing, newCommitment],
      };
    });

    setTuitionTitle('');
    setShowAddTuition(false);
  };

  // Remove Tuition Commitment
  const handleRemoveTuition = (id: string) => {
    setFormProfile((prev) => {
      const filtered = ((prev.tuition || prev.tuitionCommitments || []) as RecurringCommitment[]).filter(
        (t) => t.id !== id
      );
      return {
        ...prev,
        tuition: filtered,
        tuitionCommitments: filtered,
      };
    });
  };

  // Add Sports Commitment
  const handleAddSports = () => {
    if (!sportsTitle.trim()) return;
    const newCommitment: RecurringCommitment = {
      id: `sports_${Date.now()}`,
      title: sportsTitle.trim(),
      name: sportsTitle.trim(),
      type: 'sports',
      category: 'sports',
      days: sportsDays,
      daysOfWeek: sportsDays,
      startTime: sportsStart,
      endTime: sportsEnd,
      commuteBeforeMinutes: sportsCommute,
      commuteMinutesBefore: sportsCommute,
      commuteAfterMinutes: sportsCommute,
      commuteMinutesAfter: sportsCommute,
      recurrenceType: 'weekly',
      isLocked: true,
    };

    setFormProfile((prev) => {
      const existing = (prev.sports || prev.sportsAndAcademy || []) as RecurringCommitment[];
      return {
        ...prev,
        sports: [...existing, newCommitment],
        sportsAndAcademy: [...existing, newCommitment],
      };
    });

    setSportsTitle('');
    setShowAddSports(false);
  };

  // Remove Sports Commitment
  const handleRemoveSports = (id: string) => {
    setFormProfile((prev) => {
      const filtered = ((prev.sports || prev.sportsAndAcademy || []) as RecurringCommitment[]).filter(
        (s) => s.id !== id
      );
      return {
        ...prev,
        sports: filtered,
        sportsAndAcademy: filtered,
      };
    });
  };

  // Deterministic "Fix This Schedule" Handlers
  const handleMakeLighter = () => {
    const adjusted = RoutineEngine.makeLighter(generatedBlocks, formProfile);
    setGeneratedBlocks(adjusted);
    setActiveFixMessage('Applied: Made schedule lighter with reduced study duration.');
    setTimeout(() => setActiveFixMessage(null), 4000);
  };

  const handleMakeMoreIntensive = () => {
    const adjusted = RoutineEngine.makeMoreIntensive(generatedBlocks, formProfile);
    setGeneratedBlocks(adjusted);
    setActiveFixMessage('Applied: Expanded academic focus blocks to maximum daylight limit.');
    setTimeout(() => setActiveFixMessage(null), 4000);
  };

  const handlePrioritizeSports = () => {
    const adjusted = RoutineEngine.prioritizeSports(generatedBlocks, formProfile);
    setGeneratedBlocks(adjusted);
    setActiveFixMessage('Applied: Locked all athletic training and injected recovery buffers.');
    setTimeout(() => setActiveFixMessage(null), 4000);
  };

  const handlePrioritizeSleep = () => {
    const adjusted = RoutineEngine.prioritizeSleep(generatedBlocks, formProfile);
    setGeneratedBlocks(adjusted);
    setActiveFixMessage('Applied: Protected bedtime wind-down by capping late evening tasks.');
    setTimeout(() => setActiveFixMessage(null), 4000);
  };

  const handleRegenerateUnlocked = () => {
    const adjusted = RoutineEngine.regenerateUnlocked(generatedBlocks, formProfile, activeDate);
    setGeneratedBlocks(adjusted);
    setActiveFixMessage('Applied: Regenerated flexible study blocks while preserving all locked commitments.');
    setTimeout(() => setActiveFixMessage(null), 4000);
  };

  // Save to StudyOS Context
  const handleSaveToActiveSchedule = () => {
    saveRoutineProfile(formProfile);
    saveFullDayRoutine(activeDate, generatedBlocks);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const getCategoryColor = (cat: RoutineCategory) => {
    switch (cat) {
      case 'wake':
        return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'school':
      case 'commute':
        return 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'meal':
        return 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'sports':
      case 'academy':
      case 'workout':
        return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'study':
      case 'homework':
      case 'revision':
        return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'sleep':
      case 'night_routine':
        return 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              AI Routine Scheduler
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-soft text-primary font-bold">
              Deterministic Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Schedule & Cadence Architect
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Build, review, and mathematically verify your balanced 24-hour academic & life routine.
          </p>
        </div>

        {/* 3-Step Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border-default shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              step === 1 ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span>1. Your Day</span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              step === 2 ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span>2. Review</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              step === 3 ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span>3. Generate</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          STEP 1: TELL US ABOUT YOUR DAY
          ==================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Natural Language Fast-Intake Card */}
          <div className="rounded-2xl border border-primary/30 bg-primary-soft/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-text-primary">
                Quick-Start with Natural Language
              </h3>
            </div>
            <p className="text-xs text-text-secondary">
              Describe your typical day in plain text, and StudyOS will automatically fill in your wake, school, coaching, and sports times below.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="e.g. Wake at 6am, school 7:30 to 2pm with 20m bus, tuition Tue/Thu 5-6:30pm, daily study target 2 hours"
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-surface border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                onClick={handleParseNatural}
                disabled={isParsingNatural || !naturalText.trim()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                {isParsingNatural ? 'Analyzing...' : 'Auto-Fill Fields'}
              </button>
            </div>
            {parseStatus && (
              <div className="text-[11px] font-medium text-primary flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>{parseStatus}</span>
              </div>
            )}
          </div>

          {/* Section 1: Wake & Sleep Window */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Circadian Rhythm & Sleep Cadence</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Wake-Up Time
                </label>
                <input
                  type="time"
                  value={formProfile.wakeTime || '06:00'}
                  onChange={(e) => setFormProfile({ ...formProfile, wakeTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-mono text-text-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Bedtime Target (Lights Out)
                </label>
                <input
                  type="time"
                  value={formProfile.sleepTime || '22:00'}
                  onChange={(e) => setFormProfile({ ...formProfile, sleepTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-mono text-text-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>

          {/* Section 2: School Schedule */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <School className="w-4 h-4 text-primary" />
              <span>School Schedule & Transit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  School Start Time
                </label>
                <input
                  type="time"
                  value={formProfile.school?.startTime || formProfile.schoolStartTime || '08:00'}
                  onChange={(e) =>
                    setFormProfile({
                      ...formProfile,
                      schoolStartTime: e.target.value,
                      school: { ...formProfile.school, sameEveryDay: true, startTime: e.target.value, endTime: formProfile.school?.endTime || '14:00' },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-mono text-text-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  School End Time
                </label>
                <input
                  type="time"
                  value={formProfile.school?.endTime || formProfile.schoolEndTime || '14:00'}
                  onChange={(e) =>
                    setFormProfile({
                      ...formProfile,
                      schoolEndTime: e.target.value,
                      school: { ...formProfile.school, sameEveryDay: true, startTime: formProfile.school?.startTime || '08:00', endTime: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-mono text-text-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  One-Way Commute (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formProfile.school?.commuteMinutesBefore ?? formProfile.commuteMinutes ?? 20}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setFormProfile({
                      ...formProfile,
                      commuteMinutes: val,
                      school: { ...formProfile.school, sameEveryDay: true, startTime: formProfile.school?.startTime || '08:00', endTime: formProfile.school?.endTime || '14:00', commuteMinutesBefore: val, commuteMinutesAfter: val },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-mono text-text-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                School Days
              </label>
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((d) => {
                  const currentDays = formProfile.school?.schoolDays || formProfile.schoolDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                  const isSelected = currentDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        const updated = isSelected
                          ? currentDays.filter((day) => day !== d)
                          : [...currentDays, d];
                        setFormProfile({
                          ...formProfile,
                          schoolDays: updated,
                          school: { ...formProfile.school, sameEveryDay: true, startTime: formProfile.school?.startTime || '08:00', endTime: formProfile.school?.endTime || '14:00', schoolDays: updated },
                        });
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-background border border-border-default text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Tuition & Coaching */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>External Tuition & Coaching Classes</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Locked commitments that the AI scheduler must build around.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTuition(!showAddTuition)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-soft text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class</span>
              </button>
            </div>

            {/* Added Tuitions List */}
            {((formProfile.tuition || formProfile.tuitionCommitments || []) as RecurringCommitment[]).length === 0 ? (
              <div className="text-xs text-text-muted italic py-2">
                No coaching or external tuition scheduled.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {((formProfile.tuition || formProfile.tuitionCommitments || []) as RecurringCommitment[]).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-border-default bg-background flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-text-primary">{t.title || t.name}</div>
                      <div className="text-[11px] text-text-muted font-mono">
                        {(t.days || []).join(', ')} • {t.startTime} - {t.endTime} ({t.commuteBeforeMinutes || 0}m transit)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTuition(t.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Tuition Form Modal/Accordion */}
            {showAddTuition && (
              <div className="p-4 rounded-xl border border-primary/20 bg-primary-soft/20 space-y-3">
                <div className="text-xs font-bold text-primary">New Coaching Class Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">Class / Teacher Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Physics Board Coaching"
                      value={tuitionTitle}
                      onChange={(e) => setTuitionTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border-default text-xs text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">Subject</label>
                    <select
                      value={tuitionSubject}
                      onChange={(e) => setTuitionSubject(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border-default text-xs text-text-primary"
                    >
                      {ICSE_SUBJECTS.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">Timing (Start - End)</label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={tuitionStart}
                        onChange={(e) => setTuitionStart(e.target.value)}
                        className="w-1/2 px-2 py-1.5 rounded-lg bg-surface border border-border-default text-xs font-mono"
                      />
                      <input
                        type="time"
                        value={tuitionEnd}
                        onChange={(e) => setTuitionEnd(e.target.value)}
                        className="w-1/2 px-2 py-1.5 rounded-lg bg-surface border border-border-default text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">One-Way Commute (min)</label>
                    <input
                      type="number"
                      value={tuitionCommute}
                      onChange={(e) => setTuitionCommute(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border-default text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">Days of Week</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAY_NAMES.map((d) => {
                      const isSel = tuitionDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setTuitionDays(isSel ? tuitionDays.filter((x) => x !== d) : [...tuitionDays, d]);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            isSel ? 'bg-indigo-600 text-white' : 'bg-surface border border-border-default text-text-muted'
                          }`}
                        >
                          {d.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTuition(false)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTuition}
                    disabled={!tuitionTitle.trim()}
                    className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold"
                  >
                    Save Class
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Sports & Physical Training */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                  <span>Sports, Academy & Athletics</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Protects cardiovascular performance and cool-down recovery intervals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSports(!showAddSports)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sport / Activity</span>
              </button>
            </div>

            {/* Added Sports List */}
            {((formProfile.sports || formProfile.sportsAndAcademy || []) as RecurringCommitment[]).length === 0 ? (
              <div className="text-xs text-text-muted italic py-2">
                No sports or academy commitments entered.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {((formProfile.sports || formProfile.sportsAndAcademy || []) as RecurringCommitment[]).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-border-default bg-background flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-text-primary">{s.title || s.name}</div>
                      <div className="text-[11px] text-text-muted font-mono">
                        {(s.days || []).join(', ')} • {s.startTime} - {s.endTime} ({s.commuteBeforeMinutes || 0}m transit)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSports(s.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove sport"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Sports Form */}
            {showAddSports && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-3">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">New Sports Commitment Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">Activity Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Football Academy or Swimming"
                      value={sportsTitle}
                      onChange={(e) => setSportsTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border-default text-xs text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">One-Way Commute (min)</label>
                    <input
                      type="number"
                      value={sportsCommute}
                      onChange={(e) => setSportsCommute(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border-default text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">Timing (Start - End)</label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={sportsStart}
                        onChange={(e) => setSportsStart(e.target.value)}
                        className="w-1/2 px-2 py-1.5 rounded-lg bg-surface border border-border-default text-xs font-mono"
                      />
                      <input
                        type="time"
                        value={sportsEnd}
                        onChange={(e) => setSportsEnd(e.target.value)}
                        className="w-1/2 px-2 py-1.5 rounded-lg bg-surface border border-border-default text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">Days of Week</label>
                    <div className="flex flex-wrap gap-1.5">
                      {DAY_NAMES.map((d) => {
                        const isSel = sportsDays.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setSportsDays(isSel ? sportsDays.filter((x) => x !== d) : [...sportsDays, d]);
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              isSel ? 'bg-emerald-600 text-white' : 'bg-surface border border-border-default text-text-muted'
                            }`}
                          >
                            {d.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSports(false)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSports}
                    disabled={!sportsTitle.trim()}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Save Sport
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Academic Preferences & Study Target */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Study Cadence & Academic Priorities</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Daily Study Target (Minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="60"
                    max="300"
                    step="15"
                    value={formProfile.studyPreferences?.targetDailyStudyMinutes || 120}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFormProfile({
                        ...formProfile,
                        studyPreferences: { ...formProfile.studyPreferences, targetDailyStudyMinutes: val },
                      });
                    }}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded-lg bg-primary-soft">
                    {Math.floor((formProfile.studyPreferences?.targetDailyStudyMinutes || 120) / 60)}h{' '}
                    {(formProfile.studyPreferences?.targetDailyStudyMinutes || 120) % 60}m
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Primary Focus Subject (Weak Subject)
                </label>
                <select
                  value={formProfile.studyPreferences?.weakSubjects?.[0] || 'Physics'}
                  onChange={(e) => {
                    const sub = e.target.value;
                    setFormProfile({
                      ...formProfile,
                      studyPreferences: { ...formProfile.studyPreferences, targetDailyStudyMinutes: formProfile.studyPreferences?.targetDailyStudyMinutes || 120, weakSubjects: [sub] },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs text-text-primary font-medium focus:ring-2 focus:ring-primary/40"
                >
                  {ICSE_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 1 Action Bar */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all"
            >
              <span>Review Schedule Understanding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          STEP 2: REVIEW SCHEDULE UNDERSTANDING
          ==================================================== */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Conflict & Transit Audit Banner */}
          {conflictReport.hasConflicts ? (
            <div className="rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Detected Schedule Conflicts ({conflictReport.issues.length})</span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                The deterministic engine caught potential collisions or transit issues. Review the warnings below before generating your routine:
              </p>
              <div className="space-y-2">
                {conflictReport.issues.map((iss, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface border border-rose-200 dark:border-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-text-primary flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                          iss.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {iss.severity}
                        </span>
                        <span>{iss.title}</span>
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">{iss.detail}</div>
                    </div>
                    {iss.suggestedAction && (
                      <span className="text-[11px] text-primary font-semibold shrink-0">
                        Tip: {iss.suggestedAction}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">Zero Collisions Detected:</span> All commitments, commute windows, and rest intervals are mathematically validated with zero overlapping conflicts.
              </div>
            </div>
          )}

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Fixed Commitments</span>
              <div className="text-xl sm:text-2xl font-black text-text-primary mt-1">
                {weekUnderstanding.fixedCommitmentsHours}h
              </div>
              <span className="text-[11px] text-text-muted">Per week (School + Travel)</span>
            </div>

            <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Available Free Time</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {weekUnderstanding.freeTimeHours}h
              </div>
              <span className="text-[11px] text-text-muted">Awake hours unallocated</span>
            </div>

            <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Daily Study Cadence</span>
              <div className="text-xl sm:text-2xl font-black text-primary mt-1">
                {Math.round((weekUnderstanding.studyTargetDailyMinutes / 60) * 10) / 10}h
              </div>
              <span className="text-[11px] text-text-muted">Focus deep work target</span>
            </div>

            <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Sleep Target</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-500 mt-1">
                {formProfile.sleepTime || '22:00'}
              </div>
              <span className="text-[11px] text-text-muted">Lights out & recovery</span>
            </div>
          </div>

          {/* Detailed Synthesis Cards */}
          <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-text-primary">Weekly Understanding Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-background border border-border-default space-y-1">
                <span className="font-bold text-text-secondary">School Routine</span>
                <p className="text-text-muted">{weekUnderstanding.schoolSummary}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-background border border-border-default space-y-1">
                <span className="font-bold text-text-secondary">Coaching & Tuitions</span>
                <p className="text-text-muted">{weekUnderstanding.tuitionSummary}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-background border border-border-default space-y-1">
                <span className="font-bold text-text-secondary">Athletic & Sports Sessions</span>
                <p className="text-text-muted">{weekUnderstanding.sportsSummary}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-background border border-border-default space-y-1">
                <span className="font-bold text-text-secondary">Weekend Cadence</span>
                <p className="text-text-muted">{weekUnderstanding.weekendScheduleNotes}</p>
              </div>
            </div>
          </div>

          {/* Step 2 Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all"
            >
              <span>Generate Daily Operating Cadence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          STEP 3: GENERATE & FINE-TUNE ROUTINE
          ==================================================== */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Top Controls & Date Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <span className="text-xs font-bold text-text-primary">Viewing Routine For:</span>
                <input
                  type="date"
                  value={activeDate}
                  onChange={(e) => setActiveDate(e.target.value)}
                  className="ml-2 px-2.5 py-1 rounded-lg bg-background border border-border-default text-xs font-mono text-text-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveToActiveSchedule}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply as Active Daily Schedule</span>
              </button>
            </div>
          </div>

          {/* Success / Fix Message Toasts */}
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Successfully saved to your active StudyOS operating cadence and cloud storage!</span>
            </div>
          )}

          {activeFixMessage && (
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>{activeFixMessage}</span>
            </div>
          )}

          {/* "Fix This Schedule" Deterministic Transformations Toolbar */}
          <div className="rounded-2xl border border-border-default bg-surface p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span>Fix & Optimize This Schedule (Instant Deterministic Tweaks)</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleMakeLighter}
                className="px-3 py-1.5 rounded-xl bg-background hover:bg-border-default text-text-primary border border-border-default text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>⚡ Make Lighter</span>
              </button>
              <button
                type="button"
                onClick={handleMakeMoreIntensive}
                className="px-3 py-1.5 rounded-xl bg-background hover:bg-border-default text-text-primary border border-border-default text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>🚀 Make More Intensive</span>
              </button>
              <button
                type="button"
                onClick={handlePrioritizeSports}
                className="px-3 py-1.5 rounded-xl bg-background hover:bg-border-default text-text-primary border border-border-default text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>⚽ Keep Sports Priority</span>
              </button>
              <button
                type="button"
                onClick={handlePrioritizeSleep}
                className="px-3 py-1.5 rounded-xl bg-background hover:bg-border-default text-text-primary border border-border-default text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>🌙 Keep Sleep Priority</span>
              </button>
              <button
                type="button"
                onClick={handleRegenerateUnlocked}
                className="px-3 py-1.5 rounded-xl bg-background hover:bg-border-default text-primary border border-primary/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate Unlocked</span>
              </button>
            </div>
          </div>

          {/* Schedule Timeline & Rationale Cards */}
          <div className="space-y-3">
            {sortBlocksCircadian(generatedBlocks, formProfile.wakeTime || '06:00').map((b) => {
              const isSelected = selectedBlockId === b.id;
              const crossMidnight = b.isCrossMidnight || isCrossMidnight(b.startTime, b.endTime);
              const isNextDay = b.dayOffset === 1;
              const isPrevNight = b.dayOffset === -1;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBlockId(b.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary-soft/10 ring-2 ring-primary/20 shadow-sm'
                      : 'border-border-default bg-surface hover:border-border-strong'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-xs text-text-secondary shrink-0 w-28">
                        {minutesToFormattedTime(timeToMinutes(b.startTime))} - {minutesToFormattedTime(timeToMinutes(b.endTime))}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border shrink-0 ${getCategoryColor(b.category)}`}>
                        {b.category}
                      </span>
                      <span className="font-bold text-text-primary text-xs sm:text-sm">
                        {b.title}
                      </span>
                      {crossMidnight && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
                          Cross-Midnight
                        </span>
                      )}
                      {isNextDay && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 shrink-0">
                          Past Midnight
                        </span>
                      )}
                      {isPrevNight && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-500/15 text-slate-800 dark:text-slate-300 border border-slate-500/30 shrink-0">
                          Previous Night
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {b.isLocked && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-text-muted border border-border-default">
                          Locked
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-text-muted">
                        {b.durationMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* "Why this?" Contextual Rationale Drawer */}
                  <div className="mt-2.5 pt-2.5 border-t border-border-default/60 flex items-start gap-2 text-[11px]">
                    <span className="font-bold text-primary shrink-0">Why this?</span>
                    <p className="text-text-secondary leading-relaxed">
                      {b.whyThis || b.reason || RoutineEngine.getBlockRationale(b)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 3 Footer Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Review</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface hover:bg-background text-text-primary border border-border-default text-xs font-bold transition-all"
            >
              <span>View Today’s Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
