'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { repo } from './localStorageRepo';
import { useAuth } from '@/lib/supabase/AuthContext';
import { HolidayService } from '../routine/holidayService';
import { NotificationService } from '../routine/notificationService';
import {
  UserProfile,
  DailyPlan,
  StudySession,
  Doubt,
  DoubtStatus,
  Mistake,
  RevisionTask,
  TimerState,
  Goal,
  FootballSession,
  WorkoutSession,
  ReadingLog,
  SkillTrack,
  SkillSession,
  WeeklyReview,
  ExamOverride,
} from '../../types';

interface StudyOSContextType {
  isLoaded: boolean;
  profile: UserProfile;
  dailyPlan: DailyPlan;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  sessions: StudySession[];
  doubts: Doubt[];
  mistakes: Mistake[];
  revisionsDue: RevisionTask[];
  goals: Goal[];
  timerState: TimerState;
  skillTracks: SkillTrack[];
  skillSessions: SkillSession[];
  footballSessions: FootballSession[];
  workoutSessions: WorkoutSession[];
  readingLogs: ReadingLog[];
  projectWorkItems: import('../../types').ProjectWorkItem[];
  disciplineCheck: import('../../types').DailyDisciplineCheck;
  weeklyReview: WeeklyReview;
  pointRules: import('../../types').PointRulesConfig;
  rewardEvents: import('../../types').RewardEvent[];
  personalRewards: import('../../types').PersonalRewardItem[];
  redemptions: import('../../types').RedemptionRecord[];
  streaksSummary: import('../../types').StreaksSummary;
  achievements: import('../../types').Achievement[];

  // Actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  toggleDevTestMode: (enable: boolean) => void;
  createSession: (session: Omit<StudySession, 'id'>) => StudySession;
  updateSession: (id: string, updates: Partial<StudySession>) => void;
  deleteSession: (id: string) => void;
  createDoubt: (doubt: Omit<Doubt, 'id'>) => Doubt;
  updateDoubt: (id: string, updates: Partial<Doubt>) => void;
  deleteDoubt: (id: string) => void;
  createMistake: (mistake: Omit<Mistake, 'id' | 'revisionHistory'>) => Mistake;
  updateMistake: (id: string, updates: Partial<Mistake>) => void;
  completeRevision: (revisionId: string, notes?: string) => void;
  snoozeRevision: (revisionId: string, days?: number) => void;
  reattemptRevision: (revisionId: string) => void;
  saveTimerState: (state: TimerState, notify?: boolean) => void;
  clearTimerState: () => void;
  addExamOverride: (override: Omit<ExamOverride, 'id'>) => void;
  removeExamOverride: (overrideId: string) => void;
  loadDevTestData: () => void;
  resetAllData: () => void;
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
  saveWeeklyReviewNotes: (keyTakeaways: string, nextWeekFocus: string) => void;
  createFootballSession: (s: Omit<FootballSession, 'id'>) => void;
  createWorkoutSession: (w: Omit<WorkoutSession, 'id'>) => void;
  createReadingLog: (r: Omit<ReadingLog, 'id'>) => void;
  createSkillSession: (s: Omit<SkillSession, 'id'>) => SkillSession;
  updateSkillTrack: (id: string, updates: Partial<SkillTrack>) => void;
  createProjectWorkItem: (item: Omit<import('../../types').ProjectWorkItem, 'id'>) => import('../../types').ProjectWorkItem;
  updateProjectWorkItem: (id: string, updates: Partial<import('../../types').ProjectWorkItem>) => void;
  deleteProjectWorkItem: (id: string) => void;
  updateDisciplineCheck: (updates: Partial<import('../../types').DailyDisciplineCheck>) => void;
  createGoal: (g: Omit<Goal, 'id'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  updatePointRules: (rules: Partial<import('../../types').PointRulesConfig>) => void;
  createPersonalReward: (reward: Omit<import('../../types').PersonalRewardItem, 'id' | 'timesRedeemed'>) => import('../../types').PersonalRewardItem;
  updatePersonalReward: (id: string, updates: Partial<import('../../types').PersonalRewardItem>) => void;
  deletePersonalReward: (id: string) => void;
  redeemPersonalReward: (rewardId: string, notes?: string) => import('../../types').RedemptionRecord;
  recomputeAllPoints: () => number;

  // Custom User Skills
  customSkills: import('../../types').CustomSkill[];
  customSkillSessions: import('../../types').CustomSkillSession[];
  createCustomSkill: (skill: Omit<import('../../types').CustomSkill, 'id' | 'createdAt'>) => import('../../types').CustomSkill;
  deleteCustomSkill: (id: string) => void;
  logCustomSkillSession: (session: Omit<import('../../types').CustomSkillSession, 'id' | 'createdAt'>) => import('../../types').CustomSkillSession;

  // Annual & Continuous Analytics
  getAnnualAnalytics: (year?: number) => import('../../types').AnnualAnalyticsSummary;
  getActivityHeatmap: (year?: number) => Record<string, import('../../types').DayActivityCell>;

  // Community Feature Requests & Voting
  featureRequests: import('../../types').FeatureRequest[];
  createFeatureRequest: (req: Omit<import('../../types').FeatureRequest, 'id' | 'votesCount' | 'status' | 'createdAt'>) => import('../../types').FeatureRequest;
  toggleFeatureVote: (featureId: string, userId: string) => { voted: boolean; newCount: number };

  // Tutorial & Guided Tour
  tutorialState: import('../../types').TutorialState;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  closeTour: () => void;
  resetTour: () => void;
  dismissFeatureHint: (featureId: string) => void;

  // Full-Day Routine, Holidays & Tomorrow Brief
  routineProfile: import('../../types').StudentRoutineProfile;
  saveRoutineProfile: (p: import('../../types').StudentRoutineProfile) => void;
  fullDayRoutine: import('../../types').FullDayRoutineBlock[];
  saveFullDayRoutine: (dateStr: string, blocks: import('../../types').FullDayRoutineBlock[]) => void;
  recurringCommitments: import('../../types').RecurringCommitment[];
  saveRecurringCommitments: (c: import('../../types').RecurringCommitment[]) => void;
  holidays: import('../../types').HolidayRecord[];
  addHoliday: (h: Omit<import('../../types').HolidayRecord, 'id'>) => void;
  deleteHoliday: (id: string) => void;
  tomorrowBrief: import('../../types').TomorrowBrief | null;
  refreshTomorrowBrief: () => void;
  notificationSettings: import('../../types').NotificationSettings;
  updateNotificationSettings: (s: Partial<import('../../types').NotificationSettings>) => void;
  inAppNotifications: import('../../types').InAppNotification[];
  markNotificationRead: (id: string) => void;
}

const StudyOSContext = createContext<StudyOSContextType | null>(null);

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function StudyOSProvider({ children }: { children: React.ReactNode }) {
  const { user, profile: authProfile } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [tick, setTick] = useState(0);

  const forceRefresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const readRepository = useCallback(<T,>(read: () => T): T => {
    void tick;
    return read();
  }, [tick]);

  useEffect(() => {
    const currentUserId = authProfile?.id || user?.id || null;
    repo.setActiveUserId(currentUserId);
  }, [authProfile?.id, user?.id]);

  useEffect(() => {
    setIsLoaded(true);
    const unsubscribe = repo.subscribe(forceRefresh);
    return () => unsubscribe();
  }, [forceRefresh]);

  const profile = useMemo(() => (isLoaded ? readRepository(() => repo.getUserProfile()) : {
    id: 'student_icse_9',
    name: 'ICSE Aspirant',
    grade: 'Class 9 ICSE' as const,
    targetExamYear: 2027,
    dailyStudyTargetMinutes: 210,
    mathsMandatoryMinutes: 60,
    currentStreak: 0,
    longestStreak: 0,
    earnedPoints: 0,
    isDevTestMode: false,
    lastActiveDate: getTodayString(),
  }), [isLoaded, readRepository]);

  const dailyPlan = useMemo(() => {
    if (!isLoaded) {
      return {
        date: selectedDate,
        dayOfWeek: 'Friday',
        targetMinutesTotal: 210,
        mathsTargetMinutes: 60,
        isWeekendAcademyDay: false,
        blocks: [],
        examOverrides: [],
        dayCompleted: false,
      };
    }
    return readRepository(() => repo.getDailyPlan(selectedDate));
  }, [isLoaded, selectedDate, readRepository]);

  const sessions = useMemo(() => (isLoaded ? readRepository(() => repo.getStudySessions()) : []), [isLoaded, readRepository]);
  const doubts = useMemo(() => (isLoaded ? readRepository(() => repo.getDoubts()) : []), [isLoaded, readRepository]);
  const mistakes = useMemo(() => (isLoaded ? readRepository(() => repo.getMistakes()) : []), [isLoaded, readRepository]);
  const revisionsDue = useMemo(() => (isLoaded ? readRepository(() => repo.getRevisionsDue(selectedDate)) : []), [isLoaded, selectedDate, readRepository]);
  const goals = useMemo(() => (isLoaded ? readRepository(() => repo.getGoals()) : []), [isLoaded, readRepository]);
  const timerState = useMemo(() => (isLoaded ? readRepository(() => repo.getTimerState()) : {
    plannedMinutes: 60,
    remainingSeconds: 3600,
    status: 'idle' as const,
    currentLoopStep: 'retrieve' as const,
    updatedAtTimestamp: Date.now(),
  }), [isLoaded, readRepository]);

  const skillTracks = useMemo(() => (isLoaded ? readRepository(() => repo.getSkillTracks()) : []), [isLoaded, readRepository]);
  const skillSessions = useMemo(() => (isLoaded ? readRepository(() => repo.getSkillSessions()) : []), [isLoaded, readRepository]);
  const footballSessions = useMemo(() => (isLoaded ? readRepository(() => repo.getFootballSessions()) : []), [isLoaded, readRepository]);
  const workoutSessions = useMemo(() => (isLoaded ? readRepository(() => repo.getWorkoutSessions()) : []), [isLoaded, readRepository]);
  const readingLogs = useMemo(() => (isLoaded ? readRepository(() => repo.getReadingLogs()) : []), [isLoaded, readRepository]);
  const projectWorkItems = useMemo(() => (isLoaded ? readRepository(() => repo.getProjectWorkItems()) : []), [isLoaded, readRepository]);
  const disciplineCheck = useMemo(() => (isLoaded ? readRepository(() => repo.getDisciplineCheck(selectedDate)) : {
    date: selectedDate,
    sleepTargetHours: 8.0,
    sleepActualHours: 7.5,
    bedtime: '10:30 PM',
    wakeTime: '06:00 AM',
    morningStartTarget: '06:00 AM',
    morningStartActual: '06:05 AM',
    morningStartMet: true,
    studyTargetMet: false,
    mathsTargetMet: false,
    workoutCompleted: false,
    readingCompleted: false,
    skillLabCompleted: false,
    immediateRestartNote: 'Next block is the restart point. No shaming missed days.',
  }), [isLoaded, selectedDate, readRepository]);

  const pointRules = useMemo(() => (isLoaded ? readRepository(() => repo.getPointRules()) : {
    maths60mPoints: 2,
    study35hPoints: 5,
    reading5pPoints: 1,
    workoutPoints: 1,
    skillLabPoints: 1,
    sleepTargetPoints: 1,
  }), [isLoaded, readRepository]);

  const rewardEvents = useMemo(() => (isLoaded ? readRepository(() => repo.getRewardEvents()) : []), [isLoaded, readRepository]);
  const personalRewards = useMemo(() => (isLoaded ? readRepository(() => repo.getPersonalRewards()) : []), [isLoaded, readRepository]);
  const redemptions = useMemo(() => (isLoaded ? readRepository(() => repo.getRedemptions()) : []), [isLoaded, readRepository]);
  const streaksSummary = useMemo(() => (isLoaded ? readRepository(() => repo.getStreaksSummary()) : {
    mathsStreak: 0,
    bestMathsStreak: 0,
    studyStreak: 0,
    bestStudyStreak: 0,
    readingStreak: 0,
    bestReadingStreak: 0,
    workoutStreak: 0,
    bestWorkoutStreak: 0,
    rolling7DayConsistency: 0,
  }), [isLoaded, readRepository]);

  const achievements = useMemo(() => (isLoaded ? readRepository(() => repo.getAchievements()) : []), [isLoaded, readRepository]);
  const customSkills = useMemo(() => (isLoaded ? readRepository(() => repo.getCustomSkills()) : []), [isLoaded, readRepository]);
  const customSkillSessions = useMemo(() => (isLoaded ? readRepository(() => repo.getCustomSkillSessions()) : []), [isLoaded, readRepository]);
  const featureRequests = useMemo(() => (isLoaded ? readRepository(() => repo.getFeatureRequests()) : []), [isLoaded, readRepository]);
  const routineProfile = useMemo(() => (isLoaded ? readRepository(() => repo.getStudentRoutineProfile()) : repo.getStudentRoutineProfile()), [isLoaded, readRepository]);
  const fullDayRoutine = useMemo(() => (isLoaded ? readRepository(() => repo.getFullDayRoutine(selectedDate)) : []), [isLoaded, selectedDate, readRepository]);
  const recurringCommitments = useMemo(() => (isLoaded ? readRepository(() => repo.getRecurringCommitments()) : []), [isLoaded, readRepository]);
  const holidays = useMemo(() => (isLoaded ? HolidayService.getHolidays() : []), [isLoaded, readRepository]);
  const tomorrowBrief = useMemo(() => (isLoaded ? NotificationService.getTomorrowBrief() : null), [isLoaded, readRepository]);
  const notificationSettings = useMemo(() => (isLoaded ? NotificationService.getSettings() : NotificationService.getSettings()), [isLoaded, readRepository]);
  const inAppNotifications = useMemo(() => (isLoaded ? NotificationService.getInAppNotifications() : []), [isLoaded, readRepository]);

  // Compute weekly review for current week start
  const weeklyReview = useMemo(() => {
    if (!isLoaded) {
      return {
        id: 'init',
        weekStartDate: selectedDate,
        weekEndDate: selectedDate,
        totalStudyHours: 0,
        mathsDaysCompleted: 0,
        subjectHours: {},
        accuracyAverage: 0,
        testScores: [],
        unresolvedDoubtsCount: 0,
        repeatedMistakesCount: 0,
        revisionsCompletedCount: 0,
        revisionsDueCount: 0,
        mostConsistentDay: 'None',
        missedTargets: [],
        keyTakeaways: '',
        nextWeekFocus: '',
        createdDate: selectedDate,
      };
    }
    // Find Monday of the current selectedDate
    const d = new Date(selectedDate + 'T00:00:00');
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(monday.getDate()).padStart(2, '0');
    const mondayStr = `${year}-${month}-${dayOfMonth}`;
    return readRepository(() => repo.calculateWeeklyReview(mondayStr));
  }, [isLoaded, selectedDate, readRepository]);

  // Actions
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    repo.updateUserProfile(updates);
  }, []);

  const toggleDevTestMode = useCallback((enable: boolean) => {
    repo.toggleDevTestMode(enable);
  }, []);

  const createSession = useCallback((s: Omit<StudySession, 'id'>) => {
    return repo.createStudySession(s);
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<StudySession>) => {
    repo.updateStudySession(id, updates);
  }, []);

  const deleteSession = useCallback((id: string) => {
    repo.deleteStudySession(id);
  }, []);

  const createDoubt = useCallback((d: Omit<Doubt, 'id'>) => {
    return repo.createDoubt(d);
  }, []);

  const updateDoubt = useCallback((id: string, updates: Partial<Doubt>) => {
    repo.updateDoubt(id, updates);
  }, []);

  const deleteDoubt = useCallback((id: string) => {
    repo.deleteDoubt(id);
  }, []);

  const createMistake = useCallback((m: Omit<Mistake, 'id' | 'revisionHistory'>) => {
    return repo.createMistake(m);
  }, []);

  const updateMistake = useCallback((id: string, updates: Partial<Mistake>) => {
    repo.updateMistake(id, updates);
  }, []);

  const completeRevision = useCallback((id: string, notes?: string) => {
    repo.completeRevision(id, notes);
  }, []);

  const snoozeRevision = useCallback((id: string, days?: number) => {
    repo.snoozeRevision(id, days);
  }, []);

  const reattemptRevision = useCallback((id: string) => {
    repo.reattemptRevision(id);
  }, []);

  const saveTimerState = useCallback((state: TimerState, notify?: boolean) => {
    repo.saveTimerState(state, notify);
  }, []);

  const clearTimerState = useCallback(() => {
    repo.clearTimerState();
  }, []);

  const addExamOverride = useCallback((override: Omit<ExamOverride, 'id'>) => {
    repo.addExamOverride(selectedDate, override);
  }, [selectedDate]);

  const removeExamOverride = useCallback((overrideId: string) => {
    repo.removeExamOverride(selectedDate, overrideId);
  }, [selectedDate]);

  const loadDevTestData = useCallback(() => {
    repo.loadDevTestData();
  }, []);

  const resetAllData = useCallback(() => {
    repo.resetToDefaults();
  }, []);

  const exportBackup = useCallback(() => {
    return repo.exportBackup();
  }, []);

  const importBackup = useCallback((json: string) => {
    return repo.importBackup(json);
  }, []);

  const saveWeeklyReviewNotes = useCallback((keyTakeaways: string, nextWeekFocus: string) => {
    const updated = { ...weeklyReview, keyTakeaways, nextWeekFocus };
    repo.saveWeeklyReview(updated);
  }, [weeklyReview]);

  const createFootballSession = useCallback((s: Omit<FootballSession, 'id'>) => {
    repo.createFootballSession(s);
  }, []);

  const createWorkoutSession = useCallback((w: Omit<WorkoutSession, 'id'>) => {
    repo.createWorkoutSession(w);
  }, []);

  const createReadingLog = useCallback((r: Omit<ReadingLog, 'id'>) => {
    repo.createReadingLog(r);
  }, []);

  const createSkillSession = useCallback((s: Omit<SkillSession, 'id'>) => {
    return repo.createSkillSession(s);
  }, []);

  const updateSkillTrack = useCallback((id: string, updates: Partial<SkillTrack>) => {
    repo.updateSkillTrack(id, updates);
  }, []);

  const createProjectWorkItem = useCallback((item: Omit<import('../../types').ProjectWorkItem, 'id'>) => {
    return repo.createProjectWorkItem(item);
  }, []);

  const updateProjectWorkItem = useCallback((id: string, updates: Partial<import('../../types').ProjectWorkItem>) => {
    repo.updateProjectWorkItem(id, updates);
  }, []);

  const deleteProjectWorkItem = useCallback((id: string) => {
    repo.deleteProjectWorkItem(id);
  }, []);

  const updateDisciplineCheck = useCallback((updates: Partial<import('../../types').DailyDisciplineCheck>) => {
    repo.updateDisciplineCheck(selectedDate, updates);
  }, [selectedDate]);

  const createGoal = useCallback((g: Omit<Goal, 'id'>) => {
    return repo.createGoal(g);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    return repo.updateGoal(id, updates);
  }, []);

  const updatePointRules = useCallback((rules: Partial<import('../../types').PointRulesConfig>) => {
    repo.updatePointRules(rules);
  }, []);

  const createPersonalReward = useCallback((reward: Omit<import('../../types').PersonalRewardItem, 'id' | 'timesRedeemed'>) => {
    return repo.createPersonalReward(reward);
  }, []);

  const updatePersonalReward = useCallback((id: string, updates: Partial<import('../../types').PersonalRewardItem>) => {
    repo.updatePersonalReward(id, updates);
  }, []);

  const deletePersonalReward = useCallback((id: string) => {
    repo.deletePersonalReward(id);
  }, []);

  const redeemPersonalReward = useCallback((rewardId: string, notes?: string) => {
    return repo.redeemPersonalReward(rewardId, notes);
  }, []);

  const recomputeAllPoints = useCallback(() => {
    return repo.recomputeAllPoints();
  }, []);

  const tutorialState = useMemo(() => {
    return isLoaded
      ? readRepository(() => repo.getTutorialState())
      : {
          tutorialStarted: false,
          tutorialCompleted: false,
          currentTutorialStep: 1,
          dismissedFeatureHints: {},
          completedMiniTutorials: [],
          isTourActive: false,
        };
  }, [isLoaded, readRepository]);

  const startTour = useCallback(() => {
    repo.updateTutorialState({
      tutorialStarted: true,
      isTourActive: true,
      currentTutorialStep: 1,
    });
  }, []);

  const nextTourStep = useCallback(() => {
    const current = repo.getTutorialState();
    const nextStep = current.currentTutorialStep + 1;
    if (nextStep > 16) {
      repo.updateTutorialState({
        tutorialCompleted: true,
        isTourActive: false,
      });
    } else {
      repo.updateTutorialState({
        currentTutorialStep: nextStep,
        isTourActive: true,
      });
    }
  }, []);

  const prevTourStep = useCallback(() => {
    const current = repo.getTutorialState();
    const prevStep = Math.max(1, current.currentTutorialStep - 1);
    repo.updateTutorialState({
      currentTutorialStep: prevStep,
      isTourActive: true,
    });
  }, []);

  const skipTour = useCallback(() => {
    repo.updateTutorialState({
      tutorialCompleted: true,
      isTourActive: false,
      lastDismissedAt: new Date().toISOString(),
    });
  }, []);

  const completeTour = useCallback(() => {
    repo.updateTutorialState({
      tutorialCompleted: true,
      isTourActive: false,
      currentTutorialStep: 16,
      lastDismissedAt: new Date().toISOString(),
    });
  }, []);

  const closeTour = useCallback(() => {
    repo.updateTutorialState({
      isTourActive: false,
      lastDismissedAt: new Date().toISOString(),
    });
  }, []);

  const resetTour = useCallback(() => {
    repo.resetTutorialProgress();
    repo.updateTutorialState({
      tutorialStarted: true,
      isTourActive: true,
      currentTutorialStep: 1,
    });
  }, []);

  const dismissFeatureHint = useCallback((featureId: string) => {
    const current = repo.getTutorialState();
    repo.updateTutorialState({
      dismissedFeatureHints: {
        ...current.dismissedFeatureHints,
        [featureId]: true,
      },
    });
  }, []);

  // Custom Skills Handlers
  const createCustomSkill = useCallback((skillData: Omit<import('../../types').CustomSkill, 'id' | 'createdAt'>) => {
    return repo.createCustomSkill(skillData);
  }, []);

  const deleteCustomSkill = useCallback((id: string) => {
    repo.deleteCustomSkill(id);
  }, []);

  const logCustomSkillSession = useCallback((sessionData: Omit<import('../../types').CustomSkillSession, 'id' | 'createdAt'>) => {
    return repo.logCustomSkillSession(sessionData);
  }, []);

  // Annual Analytics Handlers
  const getAnnualAnalytics = useCallback((year?: number) => {
    return repo.getAnnualAnalytics(year);
  }, []);

  const getActivityHeatmap = useCallback((year?: number) => {
    return repo.getActivityHeatmap(year);
  }, []);

  // Feature Requests Handlers
  const createFeatureRequest = useCallback((req: Omit<import('../../types').FeatureRequest, 'id' | 'votesCount' | 'status' | 'createdAt'>) => {
    return repo.createFeatureRequest(req);
  }, []);

  const toggleFeatureVote = useCallback((featureId: string, userId: string) => {
    return repo.toggleFeatureVote(featureId, userId);
  }, []);

  // Full-Day Routine, Holidays & Notification Handlers
  const saveRoutineProfile = useCallback((p: import('../../types').StudentRoutineProfile) => {
    repo.saveStudentRoutineProfile(p);
    forceRefresh();
  }, [forceRefresh]);

  const saveFullDayRoutine = useCallback((dateStr: string, blocks: import('../../types').FullDayRoutineBlock[]) => {
    repo.saveFullDayRoutine(dateStr, blocks);
    forceRefresh();
  }, [forceRefresh]);

  const saveRecurringCommitments = useCallback((c: import('../../types').RecurringCommitment[]) => {
    repo.saveRecurringCommitments(c);
    forceRefresh();
  }, [forceRefresh]);

  const addHoliday = useCallback((h: Omit<import('../../types').HolidayRecord, 'id'>) => {
    HolidayService.addHoliday(h);
    forceRefresh();
  }, [forceRefresh]);

  const deleteHoliday = useCallback((id: string) => {
    HolidayService.deleteHoliday(id);
    forceRefresh();
  }, [forceRefresh]);

  const refreshTomorrowBrief = useCallback(() => {
    NotificationService.prepareTomorrowBrief(repo.getStudentRoutineProfile(), repo.getRevisionsDue().length);
    forceRefresh();
  }, [forceRefresh]);

  const updateNotificationSettings = useCallback((s: Partial<import('../../types').NotificationSettings>) => {
    NotificationService.updateSettings(s);
    forceRefresh();
  }, [forceRefresh]);

  const markNotificationRead = useCallback((id: string) => {
    NotificationService.markAsRead(id);
    forceRefresh();
  }, [forceRefresh]);

  const value = useMemo(
    () => ({
      isLoaded,
      profile,
      dailyPlan,
      selectedDate,
      setSelectedDate,
      sessions,
      doubts,
      mistakes,
      revisionsDue,
      goals,
      timerState,
      skillTracks,
      skillSessions,
      footballSessions,
      workoutSessions,
      readingLogs,
      projectWorkItems,
      disciplineCheck,
      weeklyReview,
      pointRules,
      rewardEvents,
      personalRewards,
      redemptions,
      streaksSummary,
      achievements,
      customSkills,
      customSkillSessions,
      createCustomSkill,
      deleteCustomSkill,
      logCustomSkillSession,
      getAnnualAnalytics,
      getActivityHeatmap,
      featureRequests,
      createFeatureRequest,
      toggleFeatureVote,
      tutorialState,
      startTour,
      nextTourStep,
      prevTourStep,
      skipTour,
      completeTour,
      closeTour,
      resetTour,
      dismissFeatureHint,
      updateProfile,
      toggleDevTestMode,
      createSession,
      updateSession,
      deleteSession,
      createDoubt,
      updateDoubt,
      deleteDoubt,
      createMistake,
      updateMistake,
      completeRevision,
      snoozeRevision,
      reattemptRevision,
      saveTimerState,
      clearTimerState,
      addExamOverride,
      removeExamOverride,
      loadDevTestData,
      resetAllData,
      exportBackup,
      importBackup,
      saveWeeklyReviewNotes,
      createFootballSession,
      createWorkoutSession,
      createReadingLog,
      createSkillSession,
      updateSkillTrack,
      createProjectWorkItem,
      updateProjectWorkItem,
      deleteProjectWorkItem,
      updateDisciplineCheck,
      createGoal,
      updateGoal,
      updatePointRules,
      createPersonalReward,
      updatePersonalReward,
      deletePersonalReward,
      redeemPersonalReward,
      recomputeAllPoints,
      routineProfile,
      saveRoutineProfile,
      fullDayRoutine,
      saveFullDayRoutine,
      recurringCommitments,
      saveRecurringCommitments,
      holidays,
      addHoliday,
      deleteHoliday,
      tomorrowBrief,
      refreshTomorrowBrief,
      notificationSettings,
      updateNotificationSettings,
      inAppNotifications,
      markNotificationRead,
    }),
    [
      isLoaded,
      profile,
      dailyPlan,
      selectedDate,
      sessions,
      doubts,
      mistakes,
      revisionsDue,
      goals,
      timerState,
      skillTracks,
      skillSessions,
      footballSessions,
      workoutSessions,
      readingLogs,
      projectWorkItems,
      disciplineCheck,
      weeklyReview,
      pointRules,
      rewardEvents,
      personalRewards,
      redemptions,
      streaksSummary,
      achievements,
      customSkills,
      customSkillSessions,
      createCustomSkill,
      deleteCustomSkill,
      logCustomSkillSession,
      getAnnualAnalytics,
      getActivityHeatmap,
      featureRequests,
      createFeatureRequest,
      toggleFeatureVote,
      tutorialState,
      startTour,
      nextTourStep,
      prevTourStep,
      skipTour,
      completeTour,
      closeTour,
      resetTour,
      dismissFeatureHint,
      updateProfile,
      toggleDevTestMode,
      createSession,
      updateSession,
      deleteSession,
      createDoubt,
      updateDoubt,
      deleteDoubt,
      createMistake,
      updateMistake,
      completeRevision,
      snoozeRevision,
      reattemptRevision,
      saveTimerState,
      clearTimerState,
      addExamOverride,
      removeExamOverride,
      loadDevTestData,
      resetAllData,
      exportBackup,
      importBackup,
      saveWeeklyReviewNotes,
      createFootballSession,
      createWorkoutSession,
      createReadingLog,
      createSkillSession,
      updateSkillTrack,
      createProjectWorkItem,
      updateProjectWorkItem,
      deleteProjectWorkItem,
      updateDisciplineCheck,
      createGoal,
      updateGoal,
      updatePointRules,
      createPersonalReward,
      updatePersonalReward,
      deletePersonalReward,
      redeemPersonalReward,
      recomputeAllPoints,
      routineProfile,
      saveRoutineProfile,
      fullDayRoutine,
      saveFullDayRoutine,
      recurringCommitments,
      saveRecurringCommitments,
      holidays,
      addHoliday,
      deleteHoliday,
      tomorrowBrief,
      refreshTomorrowBrief,
      notificationSettings,
      updateNotificationSettings,
      inAppNotifications,
      markNotificationRead,
    ]
  );

  return <StudyOSContext.Provider value={value}>{children}</StudyOSContext.Provider>;
}

export function useStudyOS() {
  const context = useContext(StudyOSContext);
  if (!context) {
    throw new Error('useStudyOS must be used within a StudyOSProvider');
  }
  return context;
}
