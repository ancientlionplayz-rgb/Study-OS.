'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyOS } from '@/lib/storage/context';
import { useAuth } from '@/lib/supabase/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { RoutineEngine } from '@/lib/routine/routineEngine';
import {
  StudentRoutineProfile,
  WeekUnderstanding,
  RecurringCommitment,
  RecurrenceType,
} from '@/types';
import {
  Sparkles,
  Clock,
  School,
  BookOpen,
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  AlertCircle,
  Trophy,
  Sliders,
  X,
  RotateCcw,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ICSE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'History & Civics',
  'Geography',
  'English Language',
  'English Literature',
  'Computer Applications',
  'Economics / Commercial Studies',
];
const SPORT_TYPES = [
  'Football / Soccer',
  'Cricket',
  'Badminton',
  'Tennis',
  'Swimming',
  'Basketball',
  'Athletics / Running',
  'Martial Arts',
  'Gym / Calisthenics',
  'Other Sport / Activity',
];
const SKILL_OPTIONS = [
  'AI & Machine Learning',
  'Python Programming',
  'Robotics & Hardware',
  'Business & Finance',
  'Web Development',
  'Creative Writing',
  'Public Speaking',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { updateProfile, saveRoutineProfile, saveRecurringCommitments, saveFullDayRoutine, startTour } = useStudyOS();
  const { profile: authProfile, setLocalAccount } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // STEP 1: Sleep & Wake
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('22:30');
  const [difficultyWaking, setDifficultyWaking] = useState(false);

  // STEP 2: School Schedule
  const [schoolDays, setSchoolDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [sameEveryDay, setSameEveryDay] = useState(true);
  const [schoolStartTime, setSchoolStartTime] = useState('08:00');
  const [schoolEndTime, setSchoolEndTime] = useState('14:30');
  const [commuteBefore, setCommuteBefore] = useState(30);
  const [commuteAfter, setCommuteAfter] = useState(30);
  const [oneOffNote, setOneOffNote] = useState('');
  const [perDaySchedule, setPerDaySchedule] = useState<Record<string, {
    enabled: boolean;
    startTime: string;
    endTime: string;
    commuteMinutesBefore: number;
    commuteMinutesAfter: number;
  }>>({
    Monday: { enabled: true, startTime: '08:00', endTime: '14:30', commuteMinutesBefore: 30, commuteMinutesAfter: 30 },
    Tuesday: { enabled: true, startTime: '08:00', endTime: '14:30', commuteMinutesBefore: 30, commuteMinutesAfter: 30 },
    Wednesday: { enabled: true, startTime: '08:00', endTime: '14:30', commuteMinutesBefore: 30, commuteMinutesAfter: 30 },
    Thursday: { enabled: true, startTime: '08:00', endTime: '14:30', commuteMinutesBefore: 30, commuteMinutesAfter: 30 },
    Friday: { enabled: true, startTime: '08:00', endTime: '14:30', commuteMinutesBefore: 30, commuteMinutesAfter: 30 },
    Saturday: { enabled: false, startTime: '08:00', endTime: '12:30', commuteMinutesBefore: 30, commuteMinutesAfter: 30 },
    Sunday: { enabled: false, startTime: '08:00', endTime: '12:30', commuteMinutesBefore: 30, commuteMinutesAfter: 30 },
  });

  // STEP 3: Structured Tuition & Coaching
  const [tuitionList, setTuitionList] = useState<RecurringCommitment[]>([]);
  const [showTuitionModal, setShowTuitionModal] = useState(false);
  const [editingTuitionId, setEditingTuitionId] = useState<string | null>(null);
  const [tuitionForm, setTuitionForm] = useState<{
    name: string;
    subject: string;
    recurrence: RecurrenceType;
    days: string[];
    specificDate: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    commuteBefore: number;
    commuteAfter: number;
    notes: string;
  }>({
    name: '',
    subject: 'Mathematics',
    recurrence: 'weekly',
    days: ['Tuesday', 'Thursday'],
    specificDate: '',
    startDate: '',
    endDate: '',
    startTime: '17:00',
    endTime: '18:30',
    commuteBefore: 15,
    commuteAfter: 15,
    notes: '',
  });

  // STEP 4: Structured Sports & Academy
  const [sportsList, setSportsList] = useState<RecurringCommitment[]>([]);
  const [showSportsModal, setShowSportsModal] = useState(false);
  const [editingSportsId, setEditingSportsId] = useState<string | null>(null);
  const [sportsForm, setSportsForm] = useState<{
    name: string;
    sportType: string;
    recurrence: RecurrenceType;
    days: string[];
    specificDate: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    commuteBefore: number;
    commuteAfter: number;
    notes: string;
  }>({
    name: '',
    sportType: 'Football / Soccer',
    recurrence: 'weekly',
    days: ['Saturday', 'Sunday'],
    specificDate: '',
    startDate: '',
    endDate: '',
    startTime: '16:00',
    endTime: '18:00',
    commuteBefore: 15,
    commuteAfter: 15,
    notes: '',
  });

  // STEP 5: Academic Preferences & Cadence
  const [targetDailyStudyMinutes, setTargetDailyStudyMinutes] = useState(120);
  const [mandatorySubject, setMandatorySubject] = useState<{
    enabled: boolean;
    subject: string;
    dailyMinutes: number;
    days: string[];
  }>({
    enabled: false,
    subject: 'Mathematics',
    dailyMinutes: 60,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  });
  const [strongSubjects, setStrongSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [skillTracks, setSkillTracks] = useState<string[]>([]);
  const [workoutPreference, setWorkoutPreference] = useState<'morning' | 'afternoon' | 'evening' | 'night' | 'none'>('none');
  const [workoutDurationMinutes, setWorkoutDurationMinutes] = useState(30);
  const [dailyReadingGoalMinutes, setDailyReadingGoalMinutes] = useState(15);
  const [saturdayWakeTime, setSaturdayWakeTime] = useState('07:00');
  const [saturdaySleepTime, setSaturdaySleepTime] = useState('22:30');
  const [sundayWakeTime, setSundayWakeTime] = useState('07:30');
  const [sundaySleepTime, setSundaySleepTime] = useState('22:00');
  const [weekendNotes, setWeekendNotes] = useState('');

  // Toggle Helpers
  const toggleDay = (day: string, currentList: string[], setList: (arr: string[]) => void) => {
    if (currentList.includes(day)) {
      setList(currentList.filter((d) => d !== day));
    } else {
      setList([...currentList, day]);
    }
  };

  const toggleSubject = (subj: string, type: 'strong' | 'weak') => {
    if (type === 'strong') {
      if (strongSubjects.includes(subj)) {
        setStrongSubjects(strongSubjects.filter((s) => s !== subj));
      } else {
        setStrongSubjects([...strongSubjects, subj]);
        setWeakSubjects(weakSubjects.filter((s) => s !== subj));
      }
    } else {
      if (weakSubjects.includes(subj)) {
        setWeakSubjects(weakSubjects.filter((s) => s !== subj));
      } else {
        setWeakSubjects([...weakSubjects, subj]);
        setStrongSubjects(strongSubjects.filter((s) => s !== subj));
      }
    }
  };

  const toggleSkill = (skill: string) => {
    if (skillTracks.includes(skill)) {
      setSkillTracks(skillTracks.filter((s) => s !== skill));
    } else {
      setSkillTracks([...skillTracks, skill]);
    }
  };

  // Canonical Student Routine Profile
  const currentProfile: StudentRoutineProfile = {
    wakeTime,
    sleepTime,
    difficultyWaking,
    schoolDays,
    schoolStartTime,
    schoolEndTime,
    commuteMinutes: commuteBefore,
    school: {
      schoolDays,
      sameEveryDay,
      startTime: schoolStartTime,
      endTime: schoolEndTime,
      commuteMinutesBefore: commuteBefore,
      commuteMinutesAfter: commuteAfter,
      perDaySchedule: sameEveryDay ? undefined : perDaySchedule,
      oneOffNotes: oneOffNote,
    },
    breakfastTime: '07:00',
    lunchTime: '14:30',
    dinnerTime: '20:00',
    tuition: tuitionList,
    tuitionCommitments: tuitionList.map((t) => ({
      id: t.id,
      subject: t.subject || t.name || 'Coaching',
      days: t.days || [],
      startTime: t.startTime,
      endTime: t.endTime,
      travelMinutes: t.commuteMinutesBefore || 0,
    })),
    sports: sportsList,
    sportsAndAcademy: sportsList.map((s) => ({
      id: s.id,
      name: s.name || s.title || 'Sports',
      days: s.days || [],
      startTime: s.startTime,
      endTime: s.endTime,
      travelMinutes: s.commuteMinutesBefore || 0,
    })),
    studyPreferences: {
      targetDailyStudyMinutes,
      mandatorySubject: mandatorySubject.enabled
        ? {
            enabled: true,
            subject: mandatorySubject.subject,
            dailyMinutes: mandatorySubject.dailyMinutes,
            days: mandatorySubject.days,
          }
        : undefined,
      strongSubjects,
      weakSubjects,
      skillTracks,
    },
    workoutPreference,
    workoutDurationMinutes,
    dailyReadingGoalMinutes,
    skillTracks,
    personalProjects: [],
    weekendDifferences: {
      saturdayWakeTime,
      saturdaySleepTime,
      sundayWakeTime,
      sundaySleepTime,
      notes: weekendNotes,
    },
    subjects: {
      strong: strongSubjects,
      weak: weakSubjects,
      targetDailyStudyMinutes,
    },
  };

  const weekUnderstanding: WeekUnderstanding = RoutineEngine.summarizeWeekUnderstanding(currentProfile);

  // Validation
  const validateStep = (s: number): boolean => {
    setError(null);
    if (s === 1) {
      if (!wakeTime || !sleepTime) {
        setError('Please enter valid wake and sleep times.');
        return false;
      }
      return true;
    }
    if (s === 2) {
      if (schoolDays.length === 0) {
        setError('Please select at least one school day or configure your schedule.');
        return false;
      }
      if (sameEveryDay) {
        if (!schoolStartTime || !schoolEndTime) {
          setError('Please provide school start and end times.');
          return false;
        }
        if (schoolStartTime >= schoolEndTime) {
          setError('School end time must be after school start time.');
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  // Tuition Handlers
  const handleSaveTuition = () => {
    if (!tuitionForm.name.trim()) {
      setError('Please provide a name or subject for this tuition.');
      return;
    }
    if (!tuitionForm.startTime || !tuitionForm.endTime) {
      setError('Please provide start and end times.');
      return;
    }
    if (tuitionForm.startTime >= tuitionForm.endTime) {
      setError('End time must be after start time.');
      return;
    }

    const commitment: RecurringCommitment = {
      id: editingTuitionId || `tuition_${Date.now()}`,
      name: tuitionForm.name.trim(),
      category: 'tuition',
      subject: tuitionForm.subject || tuitionForm.name.trim(),
      recurrence: tuitionForm.recurrence,
      days: tuitionForm.recurrence === 'weekly' ? tuitionForm.days : [],
      specificDate: tuitionForm.recurrence === 'specific_date' || tuitionForm.recurrence === 'one_time' ? tuitionForm.specificDate : undefined,
      startDate: tuitionForm.recurrence === 'date_range' ? tuitionForm.startDate : undefined,
      endDate: tuitionForm.recurrence === 'date_range' ? tuitionForm.endDate : undefined,
      startTime: tuitionForm.startTime,
      endTime: tuitionForm.endTime,
      commuteMinutesBefore: tuitionForm.commuteBefore,
      commuteMinutesAfter: tuitionForm.commuteAfter,
      notes: tuitionForm.notes,
      isLocked: true,
    };

    if (editingTuitionId) {
      setTuitionList(tuitionList.map((t) => (t.id === editingTuitionId ? commitment : t)));
    } else {
      setTuitionList([...tuitionList, commitment]);
    }

    setShowTuitionModal(false);
    setEditingTuitionId(null);
    setError(null);
  };

  const handleDeleteTuition = (id: string) => {
    setTuitionList(tuitionList.filter((t) => t.id !== id));
  };

  const handleOpenEditTuition = (t: RecurringCommitment) => {
    setEditingTuitionId(t.id);
    setTuitionForm({
      name: t.name || t.title || '',
      subject: t.subject || t.name || t.title || 'Mathematics',
      recurrence: t.recurrence || 'weekly',
      days: t.days || [],
      specificDate: t.specificDate || '',
      startDate: t.startDate || '',
      endDate: t.endDate || '',
      startTime: t.startTime,
      endTime: t.endTime,
      commuteBefore: t.commuteMinutesBefore || 0,
      commuteAfter: t.commuteMinutesAfter || 0,
      notes: t.notes || '',
    });
    setShowTuitionModal(true);
  };

  // Sports Handlers
  const handleSaveSports = () => {
    if (!sportsForm.name.trim()) {
      setError('Please provide a name for this sports or academy commitment.');
      return;
    }
    if (!sportsForm.startTime || !sportsForm.endTime) {
      setError('Please provide start and end times.');
      return;
    }
    if (sportsForm.startTime >= sportsForm.endTime) {
      setError('End time must be after start time.');
      return;
    }

    const commitment: RecurringCommitment = {
      id: editingSportsId || `sports_${Date.now()}`,
      name: sportsForm.name.trim(),
      category: sportsForm.name.toLowerCase().includes('academy') ? 'academy' : 'sports',
      recurrence: sportsForm.recurrence,
      days: sportsForm.recurrence === 'weekly' ? sportsForm.days : [],
      specificDate: sportsForm.recurrence === 'specific_date' || sportsForm.recurrence === 'one_time' ? sportsForm.specificDate : undefined,
      startDate: sportsForm.recurrence === 'date_range' ? sportsForm.startDate : undefined,
      endDate: sportsForm.recurrence === 'date_range' ? sportsForm.endDate : undefined,
      startTime: sportsForm.startTime,
      endTime: sportsForm.endTime,
      commuteMinutesBefore: sportsForm.commuteBefore,
      commuteMinutesAfter: sportsForm.commuteAfter,
      notes: `${sportsForm.sportType}: ${sportsForm.notes}`.trim(),
      isLocked: true,
    };

    if (editingSportsId) {
      setSportsList(sportsList.map((s) => (s.id === editingSportsId ? commitment : s)));
    } else {
      setSportsList([...sportsList, commitment]);
    }

    setShowSportsModal(false);
    setEditingSportsId(null);
    setError(null);
  };

  const handleDeleteSports = (id: string) => {
    setSportsList(sportsList.filter((s) => s.id !== id));
  };

  const handleOpenEditSports = (s: RecurringCommitment) => {
    setEditingSportsId(s.id);
    setSportsForm({
      name: s.name || s.title || '',
      sportType: s.notes?.split(':')[0] || 'Football / Soccer',
      recurrence: s.recurrence || 'weekly',
      days: s.days || [],
      specificDate: s.specificDate || '',
      startDate: s.startDate || '',
      endDate: s.endDate || '',
      startTime: s.startTime,
      endTime: s.endTime,
      commuteBefore: s.commuteMinutesBefore || 0,
      commuteAfter: s.commuteMinutesAfter || 0,
      notes: s.notes?.includes(':') ? s.notes.split(':')[1].trim() : s.notes || '',
    });
    setShowSportsModal(true);
  };

  // Optional Demo Preset Loader
  const handleLoadDemoRoutine = () => {
    setWakeTime('05:45');
    setSleepTime('22:00');
    setDifficultyWaking(false);

    setSchoolDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setSameEveryDay(true);
    setSchoolStartTime('07:15');
    setSchoolEndTime('15:50');
    setCommuteBefore(20);
    setCommuteAfter(20);

    setTuitionList([
      {
        id: 'demo_tuition_maths',
        name: 'Mathematics Mastery Coaching',
        category: 'tuition',
        subject: 'Mathematics',
        recurrence: 'weekly',
        days: ['Tuesday', 'Thursday'],
        startTime: '17:30',
        endTime: '19:00',
        commuteMinutesBefore: 15,
        commuteMinutesAfter: 15,
        isLocked: true,
      },
    ]);

    setSportsList([
      {
        id: 'demo_sports_football',
        name: 'Weekend Football Academy',
        category: 'academy',
        recurrence: 'weekly',
        days: ['Saturday', 'Sunday'],
        startTime: '16:00',
        endTime: '19:30',
        commuteMinutesBefore: 20,
        commuteMinutesAfter: 20,
        notes: 'Tactical matches & physical conditioning',
        isLocked: true,
      },
    ]);

    setTargetDailyStudyMinutes(210);
    setMandatorySubject({
      enabled: true,
      subject: 'Mathematics',
      dailyMinutes: 60,
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });

    setStrongSubjects(['Mathematics']);
    setWeakSubjects(['Physics', 'Chemistry']);
    setSkillTracks(['AI & Machine Learning']);
    setWorkoutPreference('evening');
    setWorkoutDurationMinutes(30);
    setDailyReadingGoalMinutes(20);
    setSaturdayWakeTime('06:30');
    setSaturdaySleepTime('22:30');
    setSundayWakeTime('07:00');
    setSundaySleepTime('22:00');
    setWeekendNotes('Weekend football academy on Sat & Sun afternoons, morning homework and syllabus review.');

    setInfoMessage('Loaded ICSE Class 9 Demo Routine. You can inspect or modify any value.');
    setTimeout(() => setInfoMessage(null), 4000);
  };

  // Final Approval & Activation
  const handleApproveAndActivate = async () => {
    // 1. Save canonical profile
    saveRoutineProfile(currentProfile);

    // 2. Save recurring commitments
    const allCommitments = [...tuitionList, ...sportsList];
    saveRecurringCommitments(allCommitments);

    // 3. Generate Today's and Tomorrow's Full-Day Routine
    const today = new Date().toISOString().split('T')[0];
    const generatedToday = RoutineEngine.generateFullDayRoutine(currentProfile, today);
    saveFullDayRoutine(today, generatedToday);

    // 4. Update core user profile
    updateProfile({
      dailyStudyTargetMinutes: targetDailyStudyMinutes,
      mathsMandatoryMinutes: mandatorySubject.enabled && mandatorySubject.subject === 'Mathematics' ? mandatorySubject.dailyMinutes : 0,
    });

    // 5. Mark onboarding completed in Auth profile & Supabase
    if (authProfile) {
      const updated = { ...authProfile, onboardingCompleted: true };
      setLocalAccount(updated);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.updateUser({
          data: { onboarding_completed: true },
        });
      } catch (err) {
        console.error('Failed to persist onboarding status to Supabase:', err);
      }
    }

    // 6. Start guided tour and redirect to dashboard
    startTour();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-surface rounded-3xl border border-border-default shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full bg-border-default h-1.5">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          {/* Header Step Label & Demo Loader Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
            <span className="font-bold uppercase tracking-wider text-primary">
              AI Routine Interview • Step {step} of {totalSteps}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLoadDemoRoutine}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border-default hover:border-primary/50 text-[11px] font-semibold text-text-secondary hover:text-primary transition-all"
                title="Populates an optional ICSE Class 9 routine for quick testing"
              >
                <RotateCcw className="w-3 h-3 text-primary" />
                <span>Load ICSE Demo Routine</span>
              </button>
              <span className="font-mono text-[11px]">
                {step === 1 && 'Circadian Rhythm'}
                {step === 2 && 'School & Commute'}
                {step === 3 && 'Tuition & Coaching'}
                {step === 4 && 'Sports & Academy'}
                {step === 5 && 'Academic Cadence'}
                {step === 6 && 'Review & Approval'}
              </span>
            </div>
          </div>

          {infoMessage && (
            <div className="p-3 rounded-xl bg-primary-soft border border-primary/30 text-primary-text text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-primary" />
              <span>{infoMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-danger-soft border border-danger/30 text-danger-text text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Sleep & Wake */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-text-primary">
                  Circadian Rhythm & Sleep Foundation
                </h1>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  StudyOS schedules deep work around your actual body clock. Provide your real wake and sleep times.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-background border border-border-default space-y-2">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Target Wake Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full bg-surface border border-border-default rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-text-muted">Start of your daily routine and morning hydration.</p>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border-default space-y-2">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Target Sleep Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                    <input
                      type="time"
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                      className="w-full bg-surface border border-border-default rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-text-muted">Target lights out for cognitive consolidation.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border-default">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={difficultyWaking}
                    onChange={(e) => setDifficultyWaking(e.target.checked)}
                    className="rounded border-border-default text-primary focus:ring-primary w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-primary">I struggle to wake up immediately</span>
                    <p className="text-[11px] text-text-muted">
                      StudyOS will schedule gentle 15-minute hydration and daylight cooldown blocks before academic tasks.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: School Schedule */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-text-primary">
                  School Schedule & Transit Times
                </h1>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  School hours and commutes are locked in stone. Study blocks will never conflict with your school obligations.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Which days do you attend school?
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = schoolDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day, schoolDays, setSchoolDays)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-background text-text-secondary border-border-default hover:border-primary/50'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border-default">
                <input
                  type="checkbox"
                  id="sameEveryDayToggle"
                  checked={sameEveryDay}
                  onChange={(e) => setSameEveryDay(e.target.checked)}
                  className="rounded border-border-default text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="sameEveryDayToggle" className="text-xs font-semibold text-text-primary cursor-pointer">
                  Same timing on all school days
                </label>
              </div>

              {sameEveryDay ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-background border border-border-default space-y-1.5">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">School Starts</label>
                    <input
                      type="time"
                      value={schoolStartTime}
                      onChange={(e) => setSchoolStartTime(e.target.value)}
                      className="w-full bg-surface border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-background border border-border-default space-y-1.5">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">School Ends</label>
                    <input
                      type="time"
                      value={schoolEndTime}
                      onChange={(e) => setSchoolEndTime(e.target.value)}
                      className="w-full bg-surface border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-background border border-border-default space-y-1.5">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">Morning Commute</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={180}
                        value={commuteBefore}
                        onChange={(e) => setCommuteBefore(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full bg-surface border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-text-muted font-bold">min</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-background border border-border-default space-y-1.5">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">Return Commute</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={180}
                        value={commuteAfter}
                        onChange={(e) => setCommuteAfter(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full bg-surface border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-text-muted font-bold">min</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-3 rounded-2xl bg-background border border-border-default max-h-60 overflow-y-auto">
                  <div className="text-xs font-bold text-text-secondary uppercase mb-2">Per-Day School Timings</div>
                  {schoolDays.map((day) => {
                    const sched = perDaySchedule[day] || {
                      enabled: true,
                      startTime: '08:00',
                      endTime: '14:30',
                      commuteMinutesBefore: 30,
                      commuteMinutesAfter: 30,
                    };
                    return (
                      <div key={day} className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-surface border border-border-default text-xs">
                        <span className="w-20 font-bold text-text-primary">{day}</span>
                        <input
                          type="time"
                          value={sched.startTime}
                          onChange={(e) =>
                            setPerDaySchedule({
                              ...perDaySchedule,
                              [day]: { ...sched, startTime: e.target.value },
                            })
                          }
                          className="bg-background border border-border-default rounded-lg px-2 py-1 text-[11px] font-mono"
                        />
                        <span className="text-text-muted">to</span>
                        <input
                          type="time"
                          value={sched.endTime}
                          onChange={(e) =>
                            setPerDaySchedule({
                              ...perDaySchedule,
                              [day]: { ...sched, endTime: e.target.value },
                            })
                          }
                          className="bg-background border border-border-default rounded-lg px-2 py-1 text-[11px] font-mono"
                        />
                        <span className="text-text-muted text-[10px]">Commute:</span>
                        <input
                          type="number"
                          value={sched.commuteMinutesBefore}
                          onChange={(e) =>
                            setPerDaySchedule({
                              ...perDaySchedule,
                              [day]: { ...sched, commuteMinutesBefore: parseInt(e.target.value, 10) || 0 },
                            })
                          }
                          className="w-12 bg-background border border-border-default rounded-lg px-1.5 py-1 text-[11px] text-center font-mono"
                        />
                        <span className="text-[10px] text-text-muted">m</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-background border border-border-default space-y-1.5">
                <label className="block text-[11px] font-bold text-text-secondary uppercase">One-off / Event Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sports day practice on Wednesday mornings, half day on Fridays"
                  value={oneOffNote}
                  onChange={(e) => setOneOffNote(e.target.value)}
                  className="w-full bg-surface border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Tuition & Coaching */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-text-primary">
                    Tuition & External Coaching
                  </h1>
                  <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                    Add any external coaching, tutor sessions, or batch classes. They will be protected as locked routine commitments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTuitionId(null);
                    setTuitionForm({
                      name: '',
                      subject: 'Mathematics',
                      recurrence: 'weekly',
                      days: ['Tuesday', 'Thursday'],
                      specificDate: '',
                      startDate: '',
                      endDate: '',
                      startTime: '17:00',
                      endTime: '18:30',
                      commuteBefore: 15,
                      commuteAfter: 15,
                      notes: '',
                    });
                    setShowTuitionModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tuition</span>
                </button>
              </div>

              {tuitionList.length === 0 ? (
                <div className="p-8 rounded-2xl bg-background border border-dashed border-border-default text-center space-y-2">
                  <BookOpen className="w-8 h-8 text-text-muted mx-auto opacity-50" />
                  <div className="text-xs font-bold text-text-secondary">No External Tuition Scheduled</div>
                  <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                    If you don’t attend any external coaching or tuitions, simply continue. All study will be self-paced.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tuitionList.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl bg-background border border-border-default flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">{t.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {t.subject}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted flex items-center gap-2">
                          <span>
                            {t.recurrence === 'weekly' && (t.days || []).join(', ')}
                            {t.recurrence === 'specific_date' && `Date: ${t.specificDate}`}
                            {t.recurrence === 'date_range' && `${t.startDate} to ${t.endDate}`}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{t.startTime} – {t.endTime}</span>
                          {(t.commuteMinutesBefore || 0) > 0 && (
                            <>
                              <span>•</span>
                              <span>{t.commuteMinutesBefore}m commute</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTuition(t)}
                          className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTuition(t.id)}
                          className="p-1.5 rounded-lg hover:bg-danger-soft text-text-muted hover:text-danger-text transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tuition Modal */}
              {showTuitionModal && (
                <div className="p-4 rounded-2xl bg-surface border border-primary/40 shadow-xl space-y-4 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-border-default">
                    <h3 className="text-xs font-bold text-text-primary uppercase">
                      {editingTuitionId ? 'Edit Tuition' : 'Add New Tuition / Coaching'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowTuitionModal(false)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Class / Teacher Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Sharma Maths Batch, Allen Physics"
                        value={tuitionForm.name}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, name: e.target.value })}
                        className="w-full bg-background border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Subject</label>
                      <select
                        value={tuitionForm.subject}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, subject: e.target.value })}
                        className="w-full bg-background border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary"
                      >
                        {ICSE_SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">Recurrence Cadence</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['weekly', 'specific_date', 'date_range'] as RecurrenceType[]).map((rec) => (
                        <button
                          key={rec}
                          type="button"
                          onClick={() => setTuitionForm({ ...tuitionForm, recurrence: rec })}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            tuitionForm.recurrence === rec
                              ? 'bg-primary text-white border-primary'
                              : 'bg-background text-text-secondary border-border-default hover:border-primary/50'
                          }`}
                        >
                          {rec === 'weekly' && 'Weekly Repeating'}
                          {rec === 'specific_date' && 'Specific Date'}
                          {rec === 'date_range' && 'Date Range'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {tuitionForm.recurrence === 'weekly' && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-text-secondary uppercase">Active Days</label>
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSel = tuitionForm.days.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const newDays = isSel
                                  ? tuitionForm.days.filter((d) => d !== day)
                                  : [...tuitionForm.days, day];
                                setTuitionForm({ ...tuitionForm, days: newDays });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                isSel
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-background text-text-secondary border-border-default'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {tuitionForm.recurrence === 'specific_date' && (
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Session Date</label>
                      <input
                        type="date"
                        value={tuitionForm.specificDate}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, specificDate: e.target.value })}
                        className="w-full bg-background border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                  )}

                  {tuitionForm.recurrence === 'date_range' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Start Date</label>
                        <input
                          type="date"
                          value={tuitionForm.startDate}
                          onChange={(e) => setTuitionForm({ ...tuitionForm, startDate: e.target.value })}
                          className="w-full bg-background border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">End Date</label>
                        <input
                          type="date"
                          value={tuitionForm.endDate}
                          onChange={(e) => setTuitionForm({ ...tuitionForm, endDate: e.target.value })}
                          className="w-full bg-background border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase">Start Time</label>
                      <input
                        type="time"
                        value={tuitionForm.startTime}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, startTime: e.target.value })}
                        className="w-full bg-background border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase">End Time</label>
                      <input
                        type="time"
                        value={tuitionForm.endTime}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, endTime: e.target.value })}
                        className="w-full bg-background border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase">Travel To</label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={tuitionForm.commuteBefore}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, commuteBefore: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-background border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase">Travel Back</label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={tuitionForm.commuteAfter}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, commuteAfter: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-background border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTuitionModal(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-border-default text-xs font-semibold text-text-secondary hover:bg-background"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTuition}
                      className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover"
                    >
                      {editingTuitionId ? 'Update Tuition' : 'Save Tuition'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Sports & Academy */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-text-primary">
                    Sports, Fitness & Academy Training
                  </h1>
                  <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                    StudyOS balances athletic conditioning with academics. Add any sports academies, swimming, or team practices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSportsId(null);
                    setSportsForm({
                      name: '',
                      sportType: 'Football / Soccer',
                      recurrence: 'weekly',
                      days: ['Saturday', 'Sunday'],
                      specificDate: '',
                      startDate: '',
                      endDate: '',
                      startTime: '16:00',
                      endTime: '18:00',
                      commuteBefore: 15,
                      commuteAfter: 15,
                      notes: '',
                    });
                    setShowSportsModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Sport / Academy</span>
                </button>
              </div>

              {sportsList.length === 0 ? (
                <div className="p-8 rounded-2xl bg-background border border-dashed border-border-default text-center space-y-2">
                  <Trophy className="w-8 h-8 text-text-muted mx-auto opacity-50" />
                  <div className="text-xs font-bold text-text-secondary">No Sports or Academy Added</div>
                  <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                    If you do not attend a sports academy or team training, leave this empty. StudyOS will allocate extra rest and personal project time.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sportsList.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-background border border-border-default flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">{s.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {s.notes?.split(':')[0] || 'Sport'}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted flex items-center gap-2">
                          <span>
                            {s.recurrence === 'weekly' && (s.days || []).join(', ')}
                            {s.recurrence === 'specific_date' && `Date: ${s.specificDate}`}
                            {s.recurrence === 'date_range' && `${s.startDate} to ${s.endDate}`}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{s.startTime} – {s.endTime}</span>
                          {(s.commuteMinutesBefore || 0) > 0 && (
                            <>
                              <span>•</span>
                              <span>{s.commuteMinutesBefore}m transit</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSports(s)}
                          className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSports(s.id)}
                          className="p-1.5 rounded-lg hover:bg-danger-soft text-text-muted hover:text-danger-text transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sports Modal */}
              {showSportsModal && (
                <div className="p-4 rounded-2xl bg-surface border border-amber-500/40 shadow-xl space-y-4 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-border-default">
                    <h3 className="text-xs font-bold text-text-primary uppercase">
                      {editingSportsId ? 'Edit Sports Commitment' : 'Add Sports / Academy Commitment'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowSportsModal(false)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Activity Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Football Academy, Cricket Net Practice, Swimming"
                        value={sportsForm.name}
                        onChange={(e) => setSportsForm({ ...sportsForm, name: e.target.value })}
                        className="w-full bg-background border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Sport Type</label>
                      <select
                        value={sportsForm.sportType}
                        onChange={(e) => setSportsForm({ ...sportsForm, sportType: e.target.value })}
                        className="w-full bg-background border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-amber-500"
                      >
                        {SPORT_TYPES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">Recurrence</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['weekly', 'specific_date', 'date_range'] as RecurrenceType[]).map((rec) => (
                        <button
                          key={rec}
                          type="button"
                          onClick={() => setSportsForm({ ...sportsForm, recurrence: rec })}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            sportsForm.recurrence === rec
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-background text-text-secondary border-border-default hover:border-amber-500/50'
                          }`}
                        >
                          {rec === 'weekly' && 'Weekly Repeating'}
                          {rec === 'specific_date' && 'Specific Date'}
                          {rec === 'date_range' && 'Date Range'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {sportsForm.recurrence === 'weekly' && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-text-secondary uppercase">Days</label>
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSel = sportsForm.days.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const newDays = isSel
                                  ? sportsForm.days.filter((d) => d !== day)
                                  : [...sportsForm.days, day];
                                setSportsForm({ ...sportsForm, days: newDays });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                isSel
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-background text-text-secondary border-border-default'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase">Start Time</label>
                      <input
                        type="time"
                        value={sportsForm.startTime}
                        onChange={(e) => setSportsForm({ ...sportsForm, startTime: e.target.value })}
                        className="w-full bg-background border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase">End Time</label>
                      <input
                        type="time"
                        value={sportsForm.endTime}
                        onChange={(e) => setSportsForm({ ...sportsForm, endTime: e.target.value })}
                        className="w-full bg-background border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase">Travel Before</label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={sportsForm.commuteBefore}
                        onChange={(e) => setSportsForm({ ...sportsForm, commuteBefore: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-background border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase">Travel After</label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={sportsForm.commuteAfter}
                        onChange={(e) => setSportsForm({ ...sportsForm, commuteAfter: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-background border border-border-default rounded-xl px-2.5 py-1.5 text-xs text-text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSportsModal(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-border-default text-xs font-semibold text-text-secondary hover:bg-background"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSports}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                    >
                      {editingSportsId ? 'Update Activity' : 'Save Activity'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Academic Preferences & Cadence */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-text-primary">
                  Academic Cadence & Target Study Hours
                </h1>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Configure your personal study target and optional mandatory subject focus block.
                </p>
              </div>

              {/* Study Target Slider */}
              <div className="p-4 rounded-2xl bg-background border border-border-default space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text-primary uppercase">Daily Self-Study Target</span>
                    <p className="text-[11px] text-text-muted">Pure focused study excluding school and external tuitions</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-primary">
                      {Math.floor(targetDailyStudyMinutes / 60)}h {targetDailyStudyMinutes % 60 > 0 ? `${targetDailyStudyMinutes % 60}m` : ''}
                    </span>
                    <span className="text-[10px] text-text-muted block">({targetDailyStudyMinutes} minutes)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="range"
                    min={30}
                    max={360}
                    step={15}
                    value={targetDailyStudyMinutes}
                    onChange={(e) => setTargetDailyStudyMinutes(parseInt(e.target.value, 10))}
                    className="w-full accent-primary h-2 bg-surface rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span>30m</span>
                    <span>1.5h</span>
                    <span>2.5h</span>
                    <span>3.5h</span>
                    <span>6h</span>
                  </div>
                </div>
              </div>

              {/* Mandatory Subject Toggle */}
              <div className="p-4 rounded-2xl bg-background border border-border-default space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text-primary uppercase">Daily Mandatory Subject Focus</span>
                    <p className="text-[11px] text-text-muted">
                      Reserve an uncompromised high-priority prime block for your core subject (e.g. Maths, Physics)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mandatorySubject.enabled}
                      onChange={(e) => setMandatorySubject({ ...mandatorySubject, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {mandatorySubject.enabled && (
                  <div className="pt-3 border-t border-border-default grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in-50 duration-150">
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Subject</label>
                      <select
                        value={mandatorySubject.subject}
                        onChange={(e) => setMandatorySubject({ ...mandatorySubject, subject: e.target.value })}
                        className="w-full bg-surface border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary"
                      >
                        {ICSE_SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Block Duration</label>
                      <select
                        value={mandatorySubject.dailyMinutes}
                        onChange={(e) => setMandatorySubject({ ...mandatorySubject, dailyMinutes: parseInt(e.target.value, 10) })}
                        className="w-full bg-surface border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
                      >
                        <option value={30}>30 Minutes</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>60 Minutes (Standard)</option>
                        <option value={90}>90 Minutes (Deep Work)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Weak & Strong Subjects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-background border border-border-default space-y-2">
                  <label className="block text-xs font-bold text-danger-text uppercase">
                    Needs Improvement / Weak Subjects
                  </label>
                  <p className="text-[11px] text-text-muted">These subjects get priority evening problem-solving slots.</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ICSE_SUBJECTS.map((s) => {
                      const isWeak = weakSubjects.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSubject(s, 'weak')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            isWeak
                              ? 'bg-danger/20 text-danger border-danger/40'
                              : 'bg-surface text-text-secondary border-border-default hover:border-danger/30'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border-default space-y-2">
                  <label className="block text-xs font-bold text-success-text uppercase">
                    Strong / High Confidence Subjects
                  </label>
                  <p className="text-[11px] text-text-muted">These subjects are reviewed via rapid active recall.</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ICSE_SUBJECTS.map((s) => {
                      const isStrong = strongSubjects.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSubject(s, 'strong')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            isStrong
                              ? 'bg-success/20 text-success border-success/40'
                              : 'bg-surface text-text-secondary border-border-default hover:border-success/30'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Weekend Wake & Sleep */}
              <div className="p-4 rounded-2xl bg-background border border-border-default space-y-3">
                <span className="text-xs font-bold text-text-primary uppercase">Weekend Circadian Cadence</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted block mb-1">Sat Wake</label>
                    <input
                      type="time"
                      value={saturdayWakeTime}
                      onChange={(e) => setSaturdayWakeTime(e.target.value)}
                      className="w-full bg-surface border border-border-default rounded-xl px-2 py-1 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-muted block mb-1">Sat Sleep</label>
                    <input
                      type="time"
                      value={saturdaySleepTime}
                      onChange={(e) => setSaturdaySleepTime(e.target.value)}
                      className="w-full bg-surface border border-border-default rounded-xl px-2 py-1 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-muted block mb-1">Sun Wake</label>
                    <input
                      type="time"
                      value={sundayWakeTime}
                      onChange={(e) => setSundayWakeTime(e.target.value)}
                      className="w-full bg-surface border border-border-default rounded-xl px-2 py-1 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-muted block mb-1">Sun Sleep</label>
                    <input
                      type="time"
                      value={sundaySleepTime}
                      onChange={(e) => setSundaySleepTime(e.target.value)}
                      className="w-full bg-surface border border-border-default rounded-xl px-2 py-1 text-xs text-text-primary font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Approval ("This is what StudyOS understood about your week") */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-soft text-success text-xs font-bold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI Interpretation Ready
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
                  This Is What StudyOS Understood About Your Week
                </h1>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Review your personalized schedule breakdown below. Click Edit on any section to make changes.
                </p>
              </div>

              {/* Dynamic 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-primary-soft text-primary-text border border-primary/20 text-center">
                  <div className="text-2xl font-black">{weekUnderstanding.fixedCommitmentsHours}h</div>
                  <div className="text-[10px] uppercase font-bold text-primary mt-0.5">Fixed / School</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-success-soft text-success-text border border-success/20 text-center">
                  <div className="text-2xl font-black">{weekUnderstanding.freeTimeHours}h</div>
                  <div className="text-[10px] uppercase font-bold text-success mt-0.5">Free Time / Week</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-center">
                  <div className="text-2xl font-black">{Math.round((weekUnderstanding.studyTargetDailyMinutes / 60) * 10) / 10}h</div>
                  <div className="text-[10px] uppercase font-bold mt-0.5">Daily Study Target</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-center">
                  {mandatorySubject.enabled ? (
                    <>
                      <div className="text-2xl font-black">{mandatorySubject.dailyMinutes}m</div>
                      <div className="text-[10px] uppercase font-bold mt-0.5 truncate">{mandatorySubject.subject}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-black text-text-muted mt-1.5">None</div>
                      <div className="text-[10px] uppercase font-bold text-text-muted mt-1">Subject Focus</div>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown with Direct Edit Actions */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-background border border-border-default flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <School className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">School & Transit: </strong>
                      <span className="text-text-secondary">{weekUnderstanding.schoolSummary}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-bold shrink-0 ml-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border-default flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Tuition Coaching: </strong>
                      <span className="text-text-secondary">{weekUnderstanding.tuitionSummary}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-bold shrink-0 ml-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border-default flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Sports & Academy: </strong>
                      <span className="text-text-secondary">{weekUnderstanding.sportsSummary}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-bold shrink-0 ml-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border-default flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Sleep & Wake: </strong>
                      <span className="text-text-secondary">{weekUnderstanding.sleepTarget}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-bold shrink-0 ml-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border-default flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary">Weekend Cadence: </strong>
                      <span className="text-text-secondary">{weekUnderstanding.weekendScheduleNotes}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-bold shrink-0 ml-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border-default">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-default hover:bg-background text-xs font-bold text-text-secondary transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all btn-interactive"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApproveAndActivate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-bold shadow-lg shadow-success/25 transition-all btn-interactive"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Generate Routine</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
