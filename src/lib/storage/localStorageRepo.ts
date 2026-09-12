import {
  UserProfile,
  DailyPlan,
  StudyBlockPlan,
  StudySession,
  Doubt,
  DoubtStatus,
  Mistake,
  RevisionTask,
  TimerState,
  WeeklyReview,
  Goal,
  FootballSession,
  WorkoutSession,
  ReadingLog,
  SkillTrack,
  SkillSession,
  RewardEvent,
  ExamOverride,
  SubjectName,
  ProjectWorkItem,
  DailyDisciplineCheck,
  PointRulesConfig,
  PersonalRewardItem,
  RedemptionRecord,
  StreaksSummary,
  Achievement,
} from '../../types';
import { IStudyOSRepository } from './repository';
import {
  DEFAULT_WEEKLY_ROTATION,
  EXACT_PROJECT_MARKER,
  DEFAULT_SKILL_TRACKS,
  DEFAULT_POINT_RULES,
  DEFAULT_PERSONAL_REWARDS,
} from '../constants';

const STORAGE_KEYS = {
  PROFILE: 'studyos_profile',
  DAILY_PLANS: 'studyos_daily_plans',
  SESSIONS: 'studyos_sessions',
  DOUBTS: 'studyos_doubts',
  MISTAKES: 'studyos_mistakes',
  REVISIONS: 'studyos_revisions',
  TIMER: 'studyos_timer_state',
  WEEKLY_REVIEWS: 'studyos_weekly_reviews',
  GOALS: 'studyos_goals',
  FOOTBALL: 'studyos_football',
  WORKOUT: 'studyos_workout',
  READING: 'studyos_reading',
  SKILLS: 'studyos_skills',
  SKILL_SESSIONS: 'studyos_skill_sessions',
  PROJECTS: 'studyos_projects',
  DISCIPLINE: 'studyos_discipline',
  REWARDS: 'studyos_rewards',
  POINT_RULES: 'studyos_point_rules',
  PERSONAL_REWARDS: 'studyos_personal_rewards',
  REDEMPTIONS: 'studyos_redemptions',
  TUTORIAL: 'studyos_tutorial_state',
  DEV_MODE: 'studyos_dev_mode',
  CUSTOM_SKILLS: 'studyos_custom_skills',
  CUSTOM_SKILL_SESSIONS: 'studyos_custom_skill_sessions',
  FEATURE_REQUESTS: 'studyos_feature_requests',
  FEATURE_VOTES: 'studyos_feature_votes',
  ROUTINE_PROFILE: 'studyos_routine_profile',
  FULL_DAY_ROUTINES: 'studyos_full_day_routines',
};

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function getDayOfWeekName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
}

/**
 * Deterministically deduplicates RevisionTask array by mistakeId + intervalDay or topic + intervalDay + dueDate.
 * Preserves completed status and notes where duplicates exist.
 */
export function deduplicateRevisionTasks(tasks: RevisionTask[]): RevisionTask[] {
  if (!Array.isArray(tasks)) return [];
  const seen = new Map<string, RevisionTask>();

  for (const task of tasks) {
    if (!task) continue;
    const key = task.mistakeId
      ? `${task.mistakeId}_${task.intervalDay}`
      : `${(task.topic || '').trim().toLowerCase()}_${task.intervalDay}_${task.dueDate}`;

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, task);
    } else {
      // Prioritize completed status and latest notes
      if (existing.status !== 'completed' && task.status === 'completed') {
        seen.set(key, task);
      } else if (existing.status === task.status && task.completedAt && !existing.completedAt) {
        seen.set(key, task);
      }
    }
  }

  return Array.from(seen.values());
}

export class LocalStorageRepository implements IStudyOSRepository {
  private listeners: Set<() => void> = new Set();
  private isNotifying = false;
  private pendingNotification = false;

  constructor() {
    this.cleanDuplicateRevisions();
  }

  public cleanDuplicateRevisions(): void {
    if (!this.isBrowser()) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REVISIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const deduplicated = deduplicateRevisionTasks(parsed);
          if (deduplicated.length !== parsed.length) {
            this.setItem(STORAGE_KEYS.REVISIONS, deduplicated, false);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private activeUserId: string | null = null;

  public setActiveUserId(userId: string | null): void {
    if (this.activeUserId !== userId) {
      this.activeUserId = userId;
      this.notify();
    }
  }

  public getActiveUserId(): string | null {
    return this.activeUserId;
  }

  private getUserScopedKey(baseKey: string, specificUserId?: string): string {
    const uid = specificUserId || this.activeUserId;
    return uid ? `${baseKey}_${uid}` : baseKey;
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T, notify: boolean = true): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (notify) {
        this.notify();
      }
    } catch (e) {
      console.error(`Error saving ${key} to localStorage`, e);
    }
  }

  private notify(): void {
    if (this.isNotifying) {
      this.pendingNotification = true;
      return;
    }
    this.isNotifying = true;
    try {
      this.listeners.forEach((listener) => {
        try {
          listener();
        } catch (err) {
          console.error('Error in storage listener', err);
        }
      });
    } finally {
      this.isNotifying = false;
      if (this.pendingNotification) {
        this.pendingNotification = false;
        if (typeof queueMicrotask === 'function') {
          queueMicrotask(() => this.notify());
        }
      }
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- Profile ---
  public getUserProfile(): UserProfile {
    const today = formatDate(new Date());
    const fallback: UserProfile = {
      id: 'student_icse_9',
      name: 'ICSE Aspirant',
      grade: 'Class 9 ICSE',
      targetExamYear: 2027,
      dailyStudyTargetMinutes: 210, // 3.5 hours
      mathsMandatoryMinutes: 60,   // 60 minutes
      currentStreak: 0,
      longestStreak: 0,
      earnedPoints: 0,
      isDevTestMode: false,
      lastActiveDate: today,
    };
    return this.getItem<UserProfile>(STORAGE_KEYS.PROFILE, fallback);
  }

  public updateUserProfile(profile: Partial<UserProfile>, notify: boolean = true): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...profile };
    this.setItem(STORAGE_KEYS.PROFILE, updated, notify);
    return updated;
  }

  public toggleDevTestMode(enable: boolean): void {
    this.updateUserProfile({ isDevTestMode: enable });
  }

  // --- Daily Plan Generation & Exam Overrides ---
  public getDailyPlan(date: string): DailyPlan {
    const plans = this.getItem<Record<string, DailyPlan>>(STORAGE_KEYS.DAILY_PLANS, {});
    if (plans[date]) {
      return plans[date];
    }

    const dayName = getDayOfWeekName(date);
    const rotation = DEFAULT_WEEKLY_ROTATION[dayName] || DEFAULT_WEEKLY_ROTATION['Friday'];

    const blocks: StudyBlockPlan[] = [
      {
        id: `block-1-${date}`,
        name: rotation.block1.name,
        subject: rotation.block1.subject,
        plannedMinutes: rotation.block1.minutes,
        completedMinutes: 0,
        isCompleted: false,
        type: 'morning_maths',
        timeSlotHint: rotation.block1.hint,
      },
      {
        id: `block-2-${date}`,
        name: rotation.block2.name,
        subject: rotation.block2.subject,
        plannedMinutes: rotation.block2.minutes,
        completedMinutes: 0,
        isCompleted: false,
        type: 'core_subject',
        timeSlotHint: rotation.block2.hint,
      },
      {
        id: `block-3-${date}`,
        name: rotation.block3.name,
        subject: rotation.block3.subject,
        plannedMinutes: rotation.block3.minutes,
        completedMinutes: 0,
        isCompleted: false,
        type: 'second_subject',
        timeSlotHint: rotation.block3.hint,
      },
      {
        id: `block-4-${date}`,
        name: rotation.block4.name,
        subject: rotation.block4.subject,
        plannedMinutes: rotation.block4.minutes,
        completedMinutes: 0,
        isCompleted: false,
        type: 'recall_error_review',
        timeSlotHint: rotation.block4.hint,
      },
    ];

    const generated: DailyPlan = {
      date,
      dayOfWeek: dayName,
      targetMinutesTotal: 210, // 3.5 hrs
      mathsTargetMinutes: 60,  // Mandatory Maths
      isWeekendAcademyDay: rotation.isWeekendAcademy,
      academyDetails: rotation.isWeekendAcademy
        ? {
            startTime: '16:00',
            endTime: '19:30',
            travelNote: rotation.academyNote || 'Academy starts 4:00 PM. Return ~7:30 PM.',
          }
        : undefined,
      blocks,
      examOverrides: [],
      dayCompleted: false,
    };

    plans[date] = generated;
    this.setItem(STORAGE_KEYS.DAILY_PLANS, plans, false);
    return generated;
  }

  public updateDailyPlan(plan: DailyPlan): void {
    const plans = this.getItem<Record<string, DailyPlan>>(STORAGE_KEYS.DAILY_PLANS, {});
    plans[plan.date] = plan;
    this.setItem(STORAGE_KEYS.DAILY_PLANS, plans);
  }

  public updateStudyBlock(date: string, blockId: string, updates: Partial<StudyBlockPlan>): void {
    const plan = this.getDailyPlan(date);
    plan.blocks = plan.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
    this.updateDailyPlan(plan);
  }

  public addExamOverride(date: string, override: Omit<ExamOverride, 'id'>): void {
    const plan = this.getDailyPlan(date);
    const newOverride: ExamOverride = {
      ...override,
      id: 'exam_' + Date.now(),
      active: true,
    };

    // Maths block (Block 1) is NEVER replaced.
    // Replace Block 3 (Second subject) by default or Block 2.
    const targetBlock = plan.blocks.find((b) => b.type === 'second_subject') || plan.blocks[1];
    if (targetBlock) {
      targetBlock.originalSubject = targetBlock.subject;
      targetBlock.originalName = targetBlock.name;
      targetBlock.subject = newOverride.subject;
      targetBlock.name = `Exam Prep: ${newOverride.subject}`;
      targetBlock.isReplacedByExam = true;
      newOverride.targetBlockId = targetBlock.id;
    }

    plan.examOverrides.push(newOverride);
    this.updateDailyPlan(plan);
  }

  public removeExamOverride(date: string, overrideId: string): void {
    const plan = this.getDailyPlan(date);
    const override = plan.examOverrides.find((o) => o.id === overrideId);
    if (override && override.targetBlockId) {
      const block = plan.blocks.find((b) => b.id === override.targetBlockId);
      if (block && block.originalSubject) {
        block.subject = block.originalSubject as SubjectName;
        block.name = block.originalName || `${block.originalSubject} Study`;
        block.isReplacedByExam = false;
        delete block.originalSubject;
        delete block.originalName;
      }
    }
    plan.examOverrides = plan.examOverrides.filter((o) => o.id !== overrideId);
    this.updateDailyPlan(plan);
  }

  // --- Study Sessions ---
  public getStudySessions(filterDate?: string): StudySession[] {
    const sessions = this.getItem<StudySession[]>(STORAGE_KEYS.SESSIONS, []);
    if (filterDate) {
      return sessions.filter((s) => s.date === filterDate);
    }
    return sessions;
  }

  public getStudySessionById(id: string): StudySession | undefined {
    const sessions = this.getItem<StudySession[]>(STORAGE_KEYS.SESSIONS, []);
    return sessions.find((s) => s.id === id);
  }

  public createStudySession(sessionData: Omit<StudySession, 'id'>): StudySession {
    const sessions = this.getItem<StudySession[]>(STORAGE_KEYS.SESSIONS, []);
    const newSession: StudySession = {
      ...sessionData,
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      accuracy:
        sessionData.questionsAttempted > 0
          ? Math.round((sessionData.correct / sessionData.questionsAttempted) * 100)
          : undefined,
    };
    sessions.unshift(newSession);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);

    // Recompute from persisted sessions so reload, edits, and deletes stay consistent.
    this.recomputeDailyPlanProgress(newSession.date);

    // Transparent Reward Economy: Award points via configurable point rules & idempotent event keys
    if (newSession.isCompleted) {
      const rules = this.getPointRules();
      const daySessions = this.getStudySessions(newSession.date).filter((s) => s.isCompleted);
      const dayMathsMinutes = daySessions
        .filter((s) => s.isMathsSession || s.subject === 'Mathematics')
        .reduce((acc, s) => acc + s.actualDurationMinutes, 0);
      const dayTotalMinutes = daySessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);

      if (dayMathsMinutes >= 60) {
        this.recordRewardEvent({
          eventKey: `${newSession.date}_maths_60m`,
          date: newSession.date,
          points: rules.maths60mPoints,
          reason: 'Completed mandatory 60m Mathematics quota',
          category: 'maths_60m',
          source: 'verified_timer',
        });
      }

      if (dayTotalMinutes >= 210) {
        this.recordRewardEvent({
          eventKey: `${newSession.date}_study_3_5h`,
          date: newSession.date,
          points: rules.study35hPoints,
          reason: 'Completed 3.5h (210m) full study target',
          category: 'study_3_5h',
          source: 'verified_timer',
        });
      }
    }

    return newSession;
  }

  private recomputeDailyPlanProgress(date: string): void {
    const plan = this.getDailyPlan(date);
    const sessions = this.getStudySessions(date).filter((session) => session.isCompleted);

    plan.blocks = plan.blocks.map((block) => {
      const completedMinutes = sessions
        .filter(
          (session) => session.sessionType === block.type || session.subject === block.subject
        )
        .reduce((total, session) => total + Math.max(0, session.actualDurationMinutes), 0);

      return {
        ...block,
        completedMinutes,
        isCompleted: completedMinutes >= block.plannedMinutes,
      };
    });
    plan.dayCompleted = plan.blocks.length > 0 && plan.blocks.every((block) => block.isCompleted);
    this.updateDailyPlan(plan);
  }

  public updateStudySession(id: string, updates: Partial<StudySession>): StudySession {
    const sessions = this.getItem<StudySession[]>(STORAGE_KEYS.SESSIONS, []);
    const previous = sessions.find((session) => session.id === id);
    const updated = sessions.map((s) => {
      if (s.id === id) {
        const merged = { ...s, ...updates };
        if (merged.questionsAttempted > 0) {
          merged.accuracy = Math.round((merged.correct / merged.questionsAttempted) * 100);
        }
        return merged;
      }
      return s;
    });
    const updatedSession = updated.find((session) => session.id === id);

    if (updatedSession) {
      this.setItem(STORAGE_KEYS.SESSIONS, updated);
      if (previous) {
        this.recomputeDailyPlanProgress(previous.date);
      }
      if (updatedSession.date !== previous?.date) {
        this.recomputeDailyPlanProgress(updatedSession.date);
      }
      return updatedSession;
    }
    throw new Error(`Session ${id} not found`);
  }

  public deleteStudySession(id: string): void {
    const sessions = this.getItem<StudySession[]>(STORAGE_KEYS.SESSIONS, []);
    const deleted = sessions.find((session) => session.id === id);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions.filter((s) => s.id !== id));
    if (deleted) {
      this.recomputeDailyPlanProgress(deleted.date);
    }
  }

  // --- Doubt Inbox ---
  public getDoubts(statusFilter?: DoubtStatus): Doubt[] {
    const doubts = this.getItem<Doubt[]>(STORAGE_KEYS.DOUBTS, []);
    if (statusFilter) {
      return doubts.filter((d) => d.status === statusFilter);
    }
    return doubts;
  }

  public createDoubt(doubtData: Omit<Doubt, 'id'>): Doubt {
    const doubts = this.getItem<Doubt[]>(STORAGE_KEYS.DOUBTS, []);
    const newDoubt: Doubt = {
      ...doubtData,
      id: 'doubt_' + Date.now(),
    };
    doubts.unshift(newDoubt);
    this.setItem(STORAGE_KEYS.DOUBTS, doubts);
    return newDoubt;
  }

  public updateDoubt(id: string, updates: Partial<Doubt>): Doubt {
    const doubts = this.getItem<Doubt[]>(STORAGE_KEYS.DOUBTS, []);
    let updatedDoubt: Doubt | null = null;
    const updated = doubts.map((d) => {
      if (d.id === id) {
        updatedDoubt = { ...d, ...updates };
        return updatedDoubt;
      }
      return d;
    });

    if (updatedDoubt) {
      this.setItem(STORAGE_KEYS.DOUBTS, updated);
      return updatedDoubt;
    }
    throw new Error(`Doubt ${id} not found`);
  }

  public deleteDoubt(id: string): void {
    const doubts = this.getItem<Doubt[]>(STORAGE_KEYS.DOUBTS, []);
    this.setItem(STORAGE_KEYS.DOUBTS, doubts.filter((d) => d.id !== id));
  }

  // --- Mistake Log & Deterministic Revision Engine (+1, +3, +7) ---
  public getMistakes(): Mistake[] {
    return this.getItem<Mistake[]>(STORAGE_KEYS.MISTAKES, []);
  }

  public createMistake(mistakeData: Omit<Mistake, 'id' | 'revisionHistory'>): Mistake {
    const mistakes = this.getItem<Mistake[]>(STORAGE_KEYS.MISTAKES, []);
    const createdDate = mistakeData.createdDate || formatDate(new Date());

    // Deterministically generate +1, +3, +7 revisions
    const revisionHistory = [
      { scheduledDate: addDays(createdDate, 1), intervalDay: 1, status: 'pending' as const },
      { scheduledDate: addDays(createdDate, 3), intervalDay: 3, status: 'pending' as const },
      { scheduledDate: addDays(createdDate, 7), intervalDay: 7, status: 'pending' as const },
    ];

    const mistakeId = 'mst_' + Date.now();
    const newMistake: Mistake = {
      ...mistakeData,
      id: mistakeId,
      createdDate,
      revisionHistory,
    };

    mistakes.unshift(newMistake);
    this.setItem(STORAGE_KEYS.MISTAKES, mistakes);

    // Populate individual RevisionTasks for the revision queue with strict idempotency
    const revisions = this.getItem<RevisionTask[]>(STORAGE_KEYS.REVISIONS, []);
    const newTasks: RevisionTask[] = [];
    const intervals: Array<1 | 3 | 7> = [1, 3, 7];

    for (const interval of intervals) {
      const exists = revisions.some(
        (t) => t.mistakeId === mistakeId && t.intervalDay === interval
      );
      if (!exists) {
        newTasks.push({
          id: `rev_${mistakeId}_${interval}`,
          mistakeId,
          subject: newMistake.subject,
          topic: newMistake.chapterTopic,
          intervalDay: interval,
          dueDate: addDays(createdDate, interval),
          status: 'pending',
        });
      }
    }

    const mergedRevisions = deduplicateRevisionTasks([...newTasks, ...revisions]);
    this.setItem(STORAGE_KEYS.REVISIONS, mergedRevisions);
    return newMistake;
  }

  public updateMistake(id: string, updates: Partial<Mistake>): Mistake {
    const mistakes = this.getItem<Mistake[]>(STORAGE_KEYS.MISTAKES, []);
    let updatedMistake: Mistake | null = null;
    const updated = mistakes.map((m) => {
      if (m.id === id) {
        updatedMistake = { ...m, ...updates };
        return updatedMistake;
      }
      return m;
    });

    if (updatedMistake) {
      this.setItem(STORAGE_KEYS.MISTAKES, updated);
      return updatedMistake;
    }
    throw new Error(`Mistake ${id} not found`);
  }

  public getRevisionsDue(date?: string): RevisionTask[] {
    const targetDate = date || formatDate(new Date());
    const tasks = this.getItem<RevisionTask[]>(STORAGE_KEYS.REVISIONS, []);
    const deduplicated = deduplicateRevisionTasks(tasks);
    if (deduplicated.length !== tasks.length) {
      this.setItem(STORAGE_KEYS.REVISIONS, deduplicated, false);
    }
    // Return pending, snoozed, or reattempt revisions due on or before targetDate
    return deduplicated.filter((t) => t.dueDate <= targetDate && t.status !== 'completed');
  }

  public completeRevision(revisionId: string, notes?: string): void {
    const tasks = this.getItem<RevisionTask[]>(STORAGE_KEYS.REVISIONS, []);
    const currentTask = tasks.find((task) => task.id === revisionId);
    if (!currentTask || currentTask.status === 'completed') {
      return;
    }
    const today = formatDate(new Date());
    let taskFound: RevisionTask | undefined;

    const updated = tasks.map((t) => {
      if (t.id === revisionId) {
        taskFound = t;
        return {
          ...t,
          status: 'completed' as const,
          completedAt: today,
          notes: notes || t.notes,
        };
      }
      return t;
    });

    this.setItem(STORAGE_KEYS.REVISIONS, updated);

    // Sync with parent Mistake object
    if (taskFound && taskFound.mistakeId) {
      const mistakes = this.getItem<Mistake[]>(STORAGE_KEYS.MISTAKES, []);
      const updatedMistakes = mistakes.map((m) => {
        if (m.id === taskFound!.mistakeId) {
          const revHistory = m.revisionHistory.map((rh) =>
            rh.intervalDay === taskFound!.intervalDay
              ? { ...rh, status: 'completed' as const, completedDate: today, notes }
              : rh
          );
          return { ...m, revisionHistory: revHistory };
        }
        return m;
      });
      this.setItem(STORAGE_KEYS.MISTAKES, updatedMistakes);

      // Reward points for revision
      const profile = this.getUserProfile();
      this.updateUserProfile({ earnedPoints: profile.earnedPoints + 15 });
      this.recordRewardEvent({
        date: today,
        points: 15,
        reason: `Completed +${taskFound.intervalDay}d revision on ${taskFound.subject}`,
        category: 'error_revised',
        source: 'verified_timer',
        eventKey: `${today}_rev_${revisionId}`,
      });
    }
  }

  public snoozeRevision(revisionId: string, daysToAdd: number = 1): void {
    const tasks = this.getItem<RevisionTask[]>(STORAGE_KEYS.REVISIONS, []);
    const updated = tasks.map((t) => {
      if (t.id === revisionId) {
        return {
          ...t,
          dueDate: addDays(t.dueDate, daysToAdd),
          status: 'snoozed' as const,
        };
      }
      return t;
    });
    this.setItem(STORAGE_KEYS.REVISIONS, updated);
  }

  public reattemptRevision(revisionId: string): void {
    const tasks = this.getItem<RevisionTask[]>(STORAGE_KEYS.REVISIONS, []);
    const updated = tasks.map((t) => {
      if (t.id === revisionId) {
        return {
          ...t,
          status: 'reattempt' as const,
          dueDate: formatDate(new Date()), // immediate reattempt
        };
      }
      return t;
    });
    this.setItem(STORAGE_KEYS.REVISIONS, updated);
  }

  // --- Timer Persistence ---
  public getTimerState(): TimerState {
    const fallback: TimerState = {
      plannedMinutes: 60,
      remainingSeconds: 3600,
      status: 'idle',
      currentLoopStep: 'retrieve',
      updatedAtTimestamp: Date.now(),
    };
    return this.getItem<TimerState>(STORAGE_KEYS.TIMER, fallback);
  }

  public saveTimerState(state: TimerState, notify: boolean = true): void {
    this.setItem(
      STORAGE_KEYS.TIMER,
      {
        ...state,
        updatedAtTimestamp: Date.now(),
      },
      notify
    );
  }

  public clearTimerState(): void {
    const fallback: TimerState = {
      plannedMinutes: 60,
      remainingSeconds: 3600,
      status: 'idle',
      currentLoopStep: 'retrieve',
      updatedAtTimestamp: Date.now(),
    };
    this.setItem(STORAGE_KEYS.TIMER, fallback);
  }

  // --- Weekly Review (Strictly real data calculation) ---
  public getWeeklyReviews(): WeeklyReview[] {
    return this.getItem<WeeklyReview[]>(STORAGE_KEYS.WEEKLY_REVIEWS, []);
  }

  public calculateWeeklyReview(weekStartDate: string): WeeklyReview {
    const weekEndDate = addDays(weekStartDate, 6);
    const sessions = this.getStudySessions().filter(
      (s) => s.date >= weekStartDate && s.date <= weekEndDate
    );
    const doubts = this.getDoubts();
    const mistakes = this.getMistakes();
    const revisions = this.getItem<RevisionTask[]>(STORAGE_KEYS.REVISIONS, []);

    // Total study hours
    const totalMinutes = sessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);
    const totalStudyHours = Math.round((totalMinutes / 60) * 10) / 10;

    // Maths days completed (days with at least 60m of Maths)
    const mathsMinutesByDate: Record<string, number> = {};
    sessions
      .filter((s) => s.isMathsSession || s.subject === 'Mathematics')
      .forEach((s) => {
        mathsMinutesByDate[s.date] = (mathsMinutesByDate[s.date] || 0) + s.actualDurationMinutes;
      });
    const mathsDaysCompleted = Object.values(mathsMinutesByDate).filter((m) => m >= 60).length;

    // Subject hours breakdown
    const subjectMinutes: Record<string, number> = {};
    sessions.forEach((s) => {
      subjectMinutes[s.subject] = (subjectMinutes[s.subject] || 0) + s.actualDurationMinutes;
    });
    const subjectHours: Record<string, number> = {};
    for (const [sub, min] of Object.entries(subjectMinutes)) {
      subjectHours[sub] = Math.round((min / 60) * 10) / 10;
    }

    // Accuracy average from legitimate question sessions
    const sessionsWithQuestions = sessions.filter((s) => s.questionsAttempted > 0);
    const totalQuestions = sessionsWithQuestions.reduce((acc, s) => acc + s.questionsAttempted, 0);
    const totalCorrect = sessionsWithQuestions.reduce((acc, s) => acc + s.correct, 0);
    const accuracyAverage =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Unresolved doubts
    const unresolvedDoubtsCount = doubts.filter(
      (d) => d.status === 'Unsolved' || d.status === 'Learning'
    ).length;

    // Repeated mistakes in this timeframe
    const weekMistakes = mistakes.filter(
      (m) => m.createdDate >= weekStartDate && m.createdDate <= weekEndDate
    );
    const repeatedMistakesCount = weekMistakes.filter((m) => m.isRepeated).length;

    // Revisions
    const weekRevisions = revisions.filter(
      (r) => r.dueDate >= weekStartDate && r.dueDate <= weekEndDate
    );
    const revisionsCompletedCount = weekRevisions.filter((r) => r.status === 'completed').length;
    const revisionsDueCount = weekRevisions.filter((r) => r.status !== 'completed').length;

    // Most consistent day
    const minutesByDay: Record<string, number> = {};
    sessions.forEach((s) => {
      const dayName = getDayOfWeekName(s.date);
      minutesByDay[dayName] = (minutesByDay[dayName] || 0) + s.actualDurationMinutes;
    });
    let mostConsistentDay = 'None yet';
    let maxDayMinutes = 0;
    for (const [day, mins] of Object.entries(minutesByDay)) {
      if (mins > maxDayMinutes) {
        maxDayMinutes = mins;
        mostConsistentDay = `${day} (${Math.round((mins / 60) * 10) / 10}h)`;
      }
    }

    // Missed targets
    const missedTargets: string[] = [];
    if (mathsDaysCompleted < 7) {
      missedTargets.push(`Missed mandatory 60m Maths on ${7 - mathsDaysCompleted} days`);
    }
    if (totalStudyHours < 24.5) {
      // 3.5h * 7 = 24.5h
      missedTargets.push(
        `Studied ${totalStudyHours}h vs weekly target of 24.5h (${Math.round((24.5 - totalStudyHours) * 10) / 10}h deficit)`
      );
    }
    if (unresolvedDoubtsCount > 0) {
      missedTargets.push(`${unresolvedDoubtsCount} doubts left unresolved`);
    }

    return {
      id: 'rev_' + weekStartDate,
      weekStartDate,
      weekEndDate,
      totalStudyHours,
      mathsDaysCompleted,
      subjectHours,
      accuracyAverage,
      testScores: [],
      unresolvedDoubtsCount,
      repeatedMistakesCount,
      revisionsCompletedCount,
      revisionsDueCount,
      mostConsistentDay,
      missedTargets,
      keyTakeaways: '',
      nextWeekFocus: '',
      createdDate: formatDate(new Date()),
    };
  }

  public saveWeeklyReview(review: WeeklyReview): void {
    const reviews = this.getItem<WeeklyReview[]>(STORAGE_KEYS.WEEKLY_REVIEWS, []);
    const index = reviews.findIndex((r) => r.id === review.id);
    if (index >= 0) {
      reviews[index] = review;
    } else {
      reviews.unshift(review);
    }
    this.setItem(STORAGE_KEYS.WEEKLY_REVIEWS, reviews);
  }

  // --- Goals (Contains exact marker ... .- -- .--. .- .. -.- -.-) ---
  public getGoals(): Goal[] {
    const fallback: Goal[] = [
      {
        id: 'goal-icse-maths',
        title: 'ICSE Mathematics Mastery (>95%)',
        category: 'Academic',
        targetDate: '2027-03-15',
        description: 'Consistent 60m daily practice, zero unsolved doubts, master all 15 syllabus chapters.',
        progressPercent: 0,
        isCompleted: false,
      },
      {
        id: 'goal-study-target',
        title: '3.5h Daily Focused Deep Work Discipline',
        category: 'Academic',
        targetDate: '2026-12-31',
        description: 'Morning Maths 60m + Core 60m + Second 60m + Recall/Error 30m every single day.',
        progressPercent: 0,
        isCompleted: false,
      },
      {
        id: 'goal-project-marker',
        title: 'Class 9 Academic Comeback Core System',
        category: 'Life',
        targetDate: '2027-02-28',
        description: 'Core recovery marker for holistic execution and discipline.',
        progressPercent: 0,
        isCompleted: false,
        projectMarker: EXACT_PROJECT_MARKER, // ... .- -- .--. .- .. -.- -.- VERBATIM
      },
      {
        id: 'goal-football-stamina',
        title: 'Football Academy Match Fitness & Stamina',
        category: 'Football',
        targetDate: '2026-11-30',
        description: 'High intensity weekend training (4:00 PM - 7:30 PM), aerobic endurance, sprint recovery.',
        progressPercent: 0,
        isCompleted: false,
      },
      {
        id: 'goal-skills-ai',
        title: 'Python, AI Agents & Robotics Foundation',
        category: 'Skills',
        targetDate: '2027-01-31',
        description: 'Build working agent prototypes, learn quantum mechanics basics, practice Python daily.',
        progressPercent: 0,
        isCompleted: false,
      },
    ];
    return this.getItem<Goal[]>(STORAGE_KEYS.GOALS, fallback);
  }

  public createGoal(goalData: Omit<Goal, 'id'>): Goal {
    const goals = this.getGoals();
    const newGoal: Goal = {
      ...goalData,
      id: 'goal_' + Date.now(),
    };
    goals.push(newGoal);
    this.setItem(STORAGE_KEYS.GOALS, goals);
    return newGoal;
  }

  public updateGoal(id: string, updates: Partial<Goal>): Goal {
    const goals = this.getGoals();
    let updatedGoal: Goal | null = null;
    const updated = goals.map((g) => {
      if (g.id === id) {
        updatedGoal = { ...g, ...updates };
        return updatedGoal;
      }
      return g;
    });
    if (updatedGoal) {
      this.setItem(STORAGE_KEYS.GOALS, updated);
      return updatedGoal;
    }
    throw new Error(`Goal ${id} not found`);
  }

  // --- Holistic Growth Tracks ---
  public getFootballSessions(): FootballSession[] {
    return this.getItem<FootballSession[]>(STORAGE_KEYS.FOOTBALL, []);
  }

  public createFootballSession(sessionData: Omit<FootballSession, 'id'>): FootballSession {
    const sessions = this.getFootballSessions();
    const newSession: FootballSession = {
      ...sessionData,
      id: 'fb_' + Date.now(),
    };
    sessions.unshift(newSession);
    this.setItem(STORAGE_KEYS.FOOTBALL, sessions);
    return newSession;
  }

  public getWorkoutSessions(): WorkoutSession[] {
    return this.getItem<WorkoutSession[]>(STORAGE_KEYS.WORKOUT, []);
  }

  public createWorkoutSession(sessionData: Omit<WorkoutSession, 'id'>): WorkoutSession {
    const sessions = this.getWorkoutSessions();
    const newSession: WorkoutSession = {
      ...sessionData,
      id: 'wo_' + Date.now(),
    };
    sessions.unshift(newSession);
    this.setItem(STORAGE_KEYS.WORKOUT, sessions);

    // Transparent Reward Economy
    const rules = this.getPointRules();
    this.recordRewardEvent({
      eventKey: `${newSession.date}_workout`,
      date: newSession.date,
      points: rules.workoutPoints,
      reason: 'Logged safe calisthenics & mobility workout',
      category: 'workout',
      source: 'self_reported',
    });

    return newSession;
  }

  public getReadingLogs(): ReadingLog[] {
    return this.getItem<ReadingLog[]>(STORAGE_KEYS.READING, []);
  }

  public createReadingLog(logData: Omit<ReadingLog, 'id'>): ReadingLog {
    const logs = this.getReadingLogs();
    const newLog: ReadingLog = {
      ...logData,
      id: 'rd_' + Date.now(),
    };
    logs.unshift(newLog);
    this.setItem(STORAGE_KEYS.READING, logs);

    // Transparent Reward Economy: Award when meeting 5+ pages minimum
    if (newLog.pagesRead >= 5) {
      const rules = this.getPointRules();
      this.recordRewardEvent({
        eventKey: `${newLog.date}_reading_5p`,
        date: newLog.date,
        points: rules.reading5pPoints,
        reason: 'Read 5+ pages non-fiction and distilled key idea',
        category: 'reading_5p',
        source: 'self_reported',
      });
    }

    return newLog;
  }

  public getSkillTracks(): SkillTrack[] {
    return this.getItem<SkillTrack[]>(STORAGE_KEYS.SKILLS, DEFAULT_SKILL_TRACKS);
  }

  public updateSkillTrack(id: string, updates: Partial<SkillTrack>): SkillTrack {
    const tracks = this.getSkillTracks();
    let updatedTrack: SkillTrack | null = null;
    const updated = tracks.map((t) => {
      if (t.id === id) {
        updatedTrack = { ...t, ...updates };
        return updatedTrack;
      }
      return t;
    });
    if (updatedTrack) {
      this.setItem(STORAGE_KEYS.SKILLS, updated);
      return updatedTrack;
    }
    throw new Error(`Skill track ${id} not found`);
  }

  public getSkillSessions(trackId?: string): SkillSession[] {
    const sessions = this.getItem<SkillSession[]>(STORAGE_KEYS.SKILL_SESSIONS, []);
    if (trackId) {
      return sessions.filter((s) => s.trackId === trackId);
    }
    return sessions;
  }

  public createSkillSession(sessionData: Omit<SkillSession, 'id'>): SkillSession {
    const sessions = this.getItem<SkillSession[]>(STORAGE_KEYS.SKILL_SESSIONS, []);
    const newSession: SkillSession = {
      ...sessionData,
      id: 'sks_' + Date.now(),
    };
    sessions.unshift(newSession);
    this.setItem(STORAGE_KEYS.SKILL_SESSIONS, sessions);

    // Update track total hours
    const tracks = this.getSkillTracks();
    const updatedTracks = tracks.map((t) => {
      if (t.id === newSession.trackId) {
        return {
          ...t,
          totalHoursInvested: Math.round((t.totalHoursInvested + newSession.minutes / 60) * 10) / 10,
        };
      }
      return t;
    });
    this.setItem(STORAGE_KEYS.SKILLS, updatedTracks);

    // Transparent Reward Economy: Award when tangible evidence output is registered
    if (newSession.evidenceOutput && newSession.evidenceOutput.trim().length > 0) {
      const rules = this.getPointRules();
      this.recordRewardEvent({
        eventKey: `${newSession.date}_skill_lab`,
        date: newSession.date,
        points: rules.skillLabPoints,
        reason: 'Delivered tangible Skill Lab evidence output',
        category: 'skill_lab',
        source: 'self_reported',
      });
    }

    return newSession;
  }

  // --- Lightweight Project Work (Defined outcome & strict time cap) ---
  public getProjectWorkItems(): ProjectWorkItem[] {
    const today = formatDate(new Date());
    const fallback: ProjectWorkItem[] = [
      {
        id: 'proj-1',
        title: 'ICSE Mistake Log CSV & JSON Exporter',
        category: 'LMS',
        definedOutcome: 'Working one-click export script producing valid Selina & Past Paper error format',
        timeCapMinutes: 45,
        actualMinutesSpent: 45,
        status: 'completed',
        dateCreated: today,
        completedDate: today,
        notes: 'Strictly capped at 45m. Preserved morning 60m Maths block.',
      },
      {
        id: 'proj-2',
        title: 'Autonomous Study Slot Recovery Tool',
        category: 'AI',
        definedOutcome: 'Deterministic JSON schedule validator that detects missed sessions and suggests recovery slot',
        timeCapMinutes: 45,
        actualMinutesSpent: 20,
        status: 'in_progress',
        dateCreated: today,
        notes: 'Time-capped at 45m maximum to ensure core academic targets are not eaten into.',
      },
      {
        id: 'proj-3',
        title: 'Local Client AI Workflow Audit Proposal',
        category: 'Business',
        definedOutcome: '1-page structured proposal identifying manual data entry bottleneck with estimated time-savings',
        timeCapMinutes: 30,
        actualMinutesSpent: 0,
        status: 'planned',
        dateCreated: today,
        notes: 'Time-capped to 30 mins after evening study block.',
      },
    ];
    return this.getItem<ProjectWorkItem[]>(STORAGE_KEYS.PROJECTS, fallback);
  }

  public createProjectWorkItem(itemData: Omit<ProjectWorkItem, 'id'>): ProjectWorkItem {
    const items = this.getProjectWorkItems();
    const newItem: ProjectWorkItem = {
      ...itemData,
      id: 'proj_' + Date.now(),
    };
    items.unshift(newItem);
    this.setItem(STORAGE_KEYS.PROJECTS, items);
    return newItem;
  }

  public updateProjectWorkItem(id: string, updates: Partial<ProjectWorkItem>): ProjectWorkItem {
    const items = this.getProjectWorkItems();
    let updatedItem: ProjectWorkItem | null = null;
    const updated = items.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });
    if (updatedItem) {
      this.setItem(STORAGE_KEYS.PROJECTS, updated);
      return updatedItem;
    }
    throw new Error(`Project item ${id} not found`);
  }

  public deleteProjectWorkItem(id: string): void {
    const items = this.getProjectWorkItems().filter((item) => item.id !== id);
    this.setItem(STORAGE_KEYS.PROJECTS, items);
  }

  // --- Daily Discipline & Recovery Cadence ---
  public getDisciplineCheck(date: string): DailyDisciplineCheck {
    const disciplineStore = this.getItem<Record<string, Partial<DailyDisciplineCheck>>>(STORAGE_KEYS.DISCIPLINE, {});
    const custom = disciplineStore[date] || {};

    // Auto-calculate academic metrics for the day
    const daySessions = this.getStudySessions(date);
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);
    const mathsMinutes = daySessions
      .filter((s) => s.isMathsSession || s.subject === 'Mathematics')
      .reduce((acc, s) => acc + s.actualDurationMinutes, 0);

    const dayWorkouts = this.getWorkoutSessions().filter((w) => w.date === date);
    const dayReadings = this.getReadingLogs().filter((r) => r.date === date);
    const totalPages = dayReadings.reduce((acc, r) => acc + r.pagesRead, 0);
    const daySkills = this.getItem<SkillSession[]>(STORAGE_KEYS.SKILL_SESSIONS, []).filter((s) => s.date === date);

    const studyTargetMet = totalMinutes >= 210; // 3.5h
    const mathsTargetMet = mathsMinutes >= 60;   // mandatory 60m
    const workoutCompleted = dayWorkouts.length > 0 || !!custom.workoutCompleted;
    const readingCompleted = totalPages >= 5 || !!custom.readingCompleted;
    const skillLabCompleted = daySkills.length > 0 || !!custom.skillLabCompleted;

    return {
      date,
      sleepTargetHours: custom.sleepTargetHours ?? 8.0,
      sleepActualHours: custom.sleepActualHours ?? 7.5,
      bedtime: custom.bedtime ?? '10:30 PM',
      wakeTime: custom.wakeTime ?? '06:00 AM',
      morningStartTarget: custom.morningStartTarget ?? '06:00 AM',
      morningStartActual: custom.morningStartActual ?? '06:05 AM',
      morningStartMet: custom.morningStartMet ?? true,
      studyTargetMet,
      mathsTargetMet,
      workoutCompleted,
      readingCompleted,
      skillLabCompleted,
      immediateRestartNote: 'Next block is the restart point. No shaming missed days.',
    };
  }

  public updateDisciplineCheck(date: string, updates: Partial<DailyDisciplineCheck>): DailyDisciplineCheck {
    const disciplineStore = this.getItem<Record<string, Partial<DailyDisciplineCheck>>>(STORAGE_KEYS.DISCIPLINE, {});
    const current = disciplineStore[date] || {};
    disciplineStore[date] = { ...current, ...updates };
    this.setItem(STORAGE_KEYS.DISCIPLINE, disciplineStore);

    // Transparent Reward Economy: Award when sleep recovery target is satisfied
    const sleepTarget = updates.sleepTargetHours ?? current.sleepTargetHours ?? 8.0;
    const sleepActual = updates.sleepActualHours ?? current.sleepActualHours;
    if (sleepActual !== undefined && sleepActual >= sleepTarget - 0.5) {
      const rules = this.getPointRules();
      this.recordRewardEvent({
        eventKey: `${date}_sleep_target`,
        date,
        points: rules.sleepTargetPoints,
        reason: `Protected healthy sleep recovery target (${sleepActual}h / ${sleepTarget}h)`,
        category: 'sleep_target',
        source: 'self_reported',
      });
    }

    return this.getDisciplineCheck(date);
  }

  // --- Transparent Reward Economy & Anti-Cheat Foundations ---
  public getPointRules(): PointRulesConfig {
    return this.getItem<PointRulesConfig>(STORAGE_KEYS.POINT_RULES, DEFAULT_POINT_RULES);
  }

  public updatePointRules(rules: Partial<PointRulesConfig>): PointRulesConfig {
    const current = this.getPointRules();
    const updated = { ...current, ...rules };
    this.setItem(STORAGE_KEYS.POINT_RULES, updated);
    return updated;
  }

  public getRewardEvents(): RewardEvent[] {
    return this.getItem<RewardEvent[]>(STORAGE_KEYS.REWARDS, []);
  }

  public recordRewardEvent(eventData: Omit<RewardEvent, 'id' | 'timestamp'>): RewardEvent | null {
    const events = this.getRewardEvents();
    // Anti-cheat idempotency check: prevent duplicate awards for same task/date
    const duplicate = events.find((e) => e.eventKey === eventData.eventKey);
    if (duplicate) {
      return null;
    }

    const newEvent: RewardEvent = {
      ...eventData,
      id: 'rew_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };

    events.unshift(newEvent);
    this.setItem(STORAGE_KEYS.REWARDS, events);
    this.recomputeAllPoints();
    return newEvent;
  }

  public recomputeAllPoints(): number {
    const events = this.getRewardEvents();
    const redemptions = this.getRedemptions();
    const totalEarned = events.reduce((acc, e) => acc + e.points, 0);
    const totalSpent = redemptions.reduce((acc, r) => acc + r.pointsSpent, 0);
    const netPoints = Math.max(0, totalEarned - totalSpent);

    const profile = this.getUserProfile();
    if (profile.earnedPoints !== netPoints) {
      this.updateUserProfile({ earnedPoints: netPoints }, false);
    }
    return netPoints;
  }

  // --- Personal Reward Store (Non-monetary, parent-acknowledged) ---
  public getPersonalRewards(): PersonalRewardItem[] {
    return this.getItem<PersonalRewardItem[]>(STORAGE_KEYS.PERSONAL_REWARDS, DEFAULT_PERSONAL_REWARDS);
  }

  public createPersonalReward(rewardData: Omit<PersonalRewardItem, 'id' | 'timesRedeemed'>): PersonalRewardItem {
    const rewards = this.getPersonalRewards();
    const newReward: PersonalRewardItem = {
      ...rewardData,
      id: 'rew_item_' + Date.now(),
      timesRedeemed: 0,
    };
    rewards.push(newReward);
    this.setItem(STORAGE_KEYS.PERSONAL_REWARDS, rewards);
    return newReward;
  }

  public updatePersonalReward(id: string, updates: Partial<PersonalRewardItem>): PersonalRewardItem {
    const rewards = this.getPersonalRewards();
    let updatedItem: PersonalRewardItem | null = null;
    const updated = rewards.map((r) => {
      if (r.id === id) {
        updatedItem = { ...r, ...updates };
        return updatedItem;
      }
      return r;
    });
    if (updatedItem) {
      this.setItem(STORAGE_KEYS.PERSONAL_REWARDS, updated);
      return updatedItem;
    }
    throw new Error(`Personal reward ${id} not found`);
  }

  public deletePersonalReward(id: string): void {
    const rewards = this.getPersonalRewards().filter((r) => r.id !== id);
    this.setItem(STORAGE_KEYS.PERSONAL_REWARDS, rewards);
  }

  public getRedemptions(): RedemptionRecord[] {
    return this.getItem<RedemptionRecord[]>(STORAGE_KEYS.REDEMPTIONS, []);
  }

  public redeemPersonalReward(rewardId: string, notes?: string): RedemptionRecord {
    const rewards = this.getPersonalRewards();
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) {
      throw new Error(`Reward ${rewardId} not found`);
    }

    const netPoints = this.recomputeAllPoints();
    if (netPoints < reward.costPoints) {
      throw new Error(`Insufficient points: need ${reward.costPoints} pts, currently have ${netPoints} pts`);
    }

    const today = formatDate(new Date());
    const redemptions = this.getRedemptions();
    const newRedemption: RedemptionRecord = {
      id: 'rdm_' + Date.now(),
      rewardId,
      rewardTitle: reward.title,
      pointsSpent: reward.costPoints,
      date: today,
      requiresParentApproval: reward.requiresParentApproval,
      parentApprovalStatus: reward.requiresParentApproval ? 'pending' : 'not_required',
      notes: notes?.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    redemptions.unshift(newRedemption);
    this.setItem(STORAGE_KEYS.REDEMPTIONS, redemptions);

    // Increment redemption count on reward
    this.updatePersonalReward(rewardId, {
      timesRedeemed: reward.timesRedeemed + 1,
      lastRedeemedDate: today,
    });

    this.recomputeAllPoints();
    return newRedemption;
  }

  // --- Streaks & Consistency Computation ---
  public getStreaksSummary(): StreaksSummary {
    const sessions = this.getStudySessions();
    const readings = this.getReadingLogs();
    const workouts = this.getWorkoutSessions();
    const today = formatDate(new Date());

    // Maths dates (>=60m)
    const mathsMinutesByDate: Record<string, number> = {};
    sessions
      .filter((s) => s.isMathsSession || s.subject === 'Mathematics')
      .forEach((s) => {
        mathsMinutesByDate[s.date] = (mathsMinutesByDate[s.date] || 0) + s.actualDurationMinutes;
      });
    const mathsDates = new Set(
      Object.entries(mathsMinutesByDate)
        .filter(([_, mins]) => mins >= 60)
        .map(([date]) => date)
    );

    // Study 3.5h dates (>=210m)
    const studyMinutesByDate: Record<string, number> = {};
    sessions.forEach((s) => {
      studyMinutesByDate[s.date] = (studyMinutesByDate[s.date] || 0) + s.actualDurationMinutes;
    });
    const studyDates = new Set(
      Object.entries(studyMinutesByDate)
        .filter(([_, mins]) => mins >= 210)
        .map(([date]) => date)
    );

    // Reading 5+ pages dates
    const readingPagesByDate: Record<string, number> = {};
    readings.forEach((r) => {
      readingPagesByDate[r.date] = (readingPagesByDate[r.date] || 0) + r.pagesRead;
    });
    const readingDates = new Set(
      Object.entries(readingPagesByDate)
        .filter(([_, pages]) => pages >= 5)
        .map(([date]) => date)
    );

    // Workout dates
    const workoutDates = new Set(workouts.map((w) => w.date));

    // Calculate individual streaks
    const maths = this.calcStreakFromDates(mathsDates, today);
    const study = this.calcStreakFromDates(studyDates, today);
    const reading = this.calcStreakFromDates(readingDates, today);
    const workout = this.calcStreakFromDates(workoutDates, today);

    // Rolling 7-day consistency (any habit done on that day)
    let consistentDaysInLast7 = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(today, -i);
      if (mathsDates.has(d) || studyDates.has(d) || readingDates.has(d) || workoutDates.has(d)) {
        consistentDaysInLast7 += 1;
      }
    }
    const rolling7DayConsistency = Math.round((consistentDaysInLast7 / 7) * 100);

    // Synchronize profile current and longest streak silently without triggering reactive notifications during read queries
    const maxCurrentStreak = Math.max(maths.current, study.current);
    const maxBestStreak = Math.max(maths.best, study.best);
    const currentProfile = this.getUserProfile();
    const newLongest = Math.max(currentProfile.longestStreak, maxBestStreak);
    if (currentProfile.currentStreak !== maxCurrentStreak || currentProfile.longestStreak !== newLongest) {
      this.updateUserProfile(
        {
          currentStreak: maxCurrentStreak,
          longestStreak: newLongest,
        },
        false
      );
    }

    return {
      mathsStreak: maths.current,
      bestMathsStreak: maths.best,
      studyStreak: study.current,
      bestStudyStreak: study.best,
      readingStreak: reading.current,
      bestReadingStreak: reading.best,
      workoutStreak: workout.current,
      bestWorkoutStreak: workout.best,
      rolling7DayConsistency,
    };
  }

  private calcStreakFromDates(datesSet: Set<string>, todayStr: string): { current: number; best: number } {
    const dates = Array.from(datesSet).sort();
    if (dates.length === 0) return { current: 0, best: 0 };

    let best = 0;
    let currentRun = 0;
    let prevDate: Date | null = null;

    for (const dStr of dates) {
      const currDate = new Date(dStr + 'T00:00:00');
      if (!prevDate) {
        currentRun = 1;
      } else {
        const diffMs = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentRun += 1;
        } else if (diffDays > 1) {
          currentRun = 1;
        }
      }
      if (currentRun > best) best = currentRun;
      prevDate = currDate;
    }

    let current = 0;
    const checkDate = new Date(todayStr + 'T00:00:00');
    if (!datesSet.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const str = `${y}-${m}-${d}`;
      if (datesSet.has(str)) {
        current += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    if (current > best) best = current;
    return { current, best };
  }

  // --- Meaningful & Restrained Achievements ---
  public getAchievements(): Achievement[] {
    const sessions = this.getStudySessions();
    const readings = this.getReadingLogs();
    const reviews = this.getWeeklyReviews();
    const revisions = this.getItem<RevisionTask[]>(STORAGE_KEYS.REVISIONS, []);

    // 1. 7 Maths Days
    const mathsMinutesByDate: Record<string, number> = {};
    sessions
      .filter((s) => s.isMathsSession || s.subject === 'Mathematics')
      .forEach((s) => {
        mathsMinutesByDate[s.date] = (mathsMinutesByDate[s.date] || 0) + s.actualDurationMinutes;
      });
    const distinctMathsDays = Object.values(mathsMinutesByDate).filter((m) => m >= 60).length;

    // 2. First 10 Study Hours
    const totalStudyHours = Math.round(sessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0) / 60);

    // 3. 7-Day Reading
    const readingPagesByDate: Record<string, number> = {};
    readings.forEach((r) => {
      readingPagesByDate[r.date] = (readingPagesByDate[r.date] || 0) + r.pagesRead;
    });
    const distinctReadingDays = Object.values(readingPagesByDate).filter((p) => p >= 5).length;

    // 4. 100 Questions Solved
    const totalQuestionsAttempted = sessions.reduce((acc, s) => acc + (s.questionsAttempted || 0), 0);

    // 5. First Weekly Review
    const weeklyReviewsCount = reviews.length;

    // 6. 10 Revisions Completed
    const completedRevisionsCount = revisions.filter((r) => r.status === 'completed').length;

    return [
      {
        id: 'ach-maths-7',
        title: '7 Maths Days',
        description: 'Complete 7 distinct days of mandatory 60m Mathematics practice.',
        icon: 'Calculator',
        unlocked: distinctMathsDays >= 7,
        progress: Math.min(distinctMathsDays, 7),
        maxProgress: 7,
        metricLabel: `${Math.min(distinctMathsDays, 7)} / 7 Days`,
      },
      {
        id: 'ach-study-10h',
        title: 'First 10 Study Hours',
        description: 'Accumulate 10 verified deep work study hours across ICSE subjects.',
        icon: 'Clock',
        unlocked: totalStudyHours >= 10,
        progress: Math.min(totalStudyHours, 10),
        maxProgress: 10,
        metricLabel: `${Math.min(totalStudyHours, 10)} / 10 Hours`,
      },
      {
        id: 'ach-reading-7',
        title: '7-Day Reading',
        description: 'Read at least 5 pages of non-fiction on 7 separate days.',
        icon: 'BookOpen',
        unlocked: distinctReadingDays >= 7,
        progress: Math.min(distinctReadingDays, 7),
        maxProgress: 7,
        metricLabel: `${Math.min(distinctReadingDays, 7)} / 7 Days`,
      },
      {
        id: 'ach-questions-100',
        title: '100 Questions Solved',
        description: 'Independently attempt 100 ICSE textbook questions in timed production.',
        icon: 'CheckCircle2',
        unlocked: totalQuestionsAttempted >= 100,
        progress: Math.min(totalQuestionsAttempted, 100),
        maxProgress: 100,
        metricLabel: `${Math.min(totalQuestionsAttempted, 100)} / 100 Questions`,
      },
      {
        id: 'ach-weekly-review-1',
        title: 'First Weekly Review',
        description: 'Complete your first weekly audit with genuine data and reflection.',
        icon: 'Calendar',
        unlocked: weeklyReviewsCount >= 1,
        progress: Math.min(weeklyReviewsCount, 1),
        maxProgress: 1,
        metricLabel: `${Math.min(weeklyReviewsCount, 1)} / 1 Review`,
      },
      {
        id: 'ach-revisions-10',
        title: '10 Revisions Completed',
        description: 'Clear 10 mistake-driven spaced retrieval tasks (+1d/+3d/+7d).',
        icon: 'RotateCcw',
        unlocked: completedRevisionsCount >= 10,
        progress: Math.min(completedRevisionsCount, 10),
        maxProgress: 10,
        metricLabel: `${Math.min(completedRevisionsCount, 10)} / 10 Revisions`,
      },
    ];
  }

  // --- Backup, Reset & Developer Mode ---
  public exportBackup(): string {
    if (!this.isBrowser()) return '{}';
    const data: Record<string, unknown> = {};
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      const val = localStorage.getItem(storageKey);
      if (val) {
        try {
          data[key] = JSON.parse(val);
        } catch {
          data[key] = val;
        }
      }
    }
    return JSON.stringify(data, null, 2);
  }

  public importBackup(json: string): boolean {
    if (!this.isBrowser()) return false;
    try {
      const data: unknown = JSON.parse(json);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return false;
      }
      const backup = data as Record<string, unknown>;
      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        if (Object.prototype.hasOwnProperty.call(backup, key) && backup[key] !== undefined) {
          localStorage.setItem(storageKey, JSON.stringify(backup[key]));
        }
      }
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  }

  public resetToDefaults(): void {
    if (!this.isBrowser()) return;
    for (const storageKey of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(storageKey);
    }
    this.notify();
  }

  public loadDevTestData(): void {
    const today = formatDate(new Date());
    const yesterday = addDays(today, -1);
    const twoDaysAgo = addDays(today, -2);

    // Realistic sample test study sessions
    const sampleSessions: StudySession[] = [
      {
        id: 'sess_dev_1',
        date: today,
        subject: 'Mathematics',
        chapter: 'Simultaneous Linear Equations',
        topic: 'Cross Multiplication Method',
        plannedDurationMinutes: 60,
        actualDurationMinutes: 60,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        sessionType: 'morning_maths',
        confidenceBefore: 3,
        confidenceAfter: 5,
        questionsAttempted: 12,
        correct: 10,
        incorrect: 2,
        accuracy: 83,
        notes: 'Independent practice from ICSE Selina textbook. Lost marks on sign errors.',
        doubtsCreatedIds: [],
        mistakesCreatedIds: ['mst_dev_1'],
        errorCategories: ['Calculation Error', 'Careless Mistake'],
        isMathsSession: true,
        isCompleted: true,
      },
      {
        id: 'sess_dev_2',
        date: yesterday,
        subject: 'Mathematics',
        chapter: 'Expansions',
        topic: 'Identities using (a+b+c)^2',
        plannedDurationMinutes: 60,
        actualDurationMinutes: 65,
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() - 86400000 + 3900000).toISOString(),
        sessionType: 'morning_maths',
        confidenceBefore: 4,
        confidenceAfter: 5,
        questionsAttempted: 15,
        correct: 14,
        incorrect: 1,
        accuracy: 93,
        notes: 'Timed production phase. Excellent speed.',
        doubtsCreatedIds: [],
        mistakesCreatedIds: [],
        errorCategories: ['Careless Mistake'],
        isMathsSession: true,
        isCompleted: true,
      },
      {
        id: 'sess_dev_3',
        date: yesterday,
        subject: 'Physics',
        chapter: 'Laws of Motion',
        topic: 'Newton second law derivation F=ma',
        plannedDurationMinutes: 60,
        actualDurationMinutes: 60,
        startTime: new Date(Date.now() - 70000000).toISOString(),
        endTime: new Date(Date.now() - 70000000 + 3600000).toISOString(),
        sessionType: 'core_subject',
        confidenceBefore: 2,
        confidenceAfter: 4,
        questionsAttempted: 8,
        correct: 6,
        incorrect: 2,
        accuracy: 75,
        notes: 'Momentum rate of change numericals.',
        doubtsCreatedIds: ['doubt_dev_1'],
        mistakesCreatedIds: ['mst_dev_2'],
        isMathsSession: false,
        isCompleted: true,
      },
    ];

    const sampleMistakes: Mistake[] = [
      {
        id: 'mst_dev_1',
        subject: 'Mathematics',
        chapterTopic: 'Simultaneous Equations - Cross Multiplication',
        originalQuestionContext: 'Solve 2x + 3y = 7 and 3x - 2y = 4',
        wrongApproach: 'Forgot to transpose constant term to LHS (b1*c2 - b2*c1 format error)',
        correctMethod: 'Write both in ax + by + c = 0 form: 2x + 3y - 7 = 0 and 3x - 2y - 4 = 0 before applying coefficients.',
        reason: 'Rushed through signs without checking standard form alignment.',
        errorCategory: 'Calculation Error',
        isRepeated: false,
        createdDate: today,
        revisionHistory: [
          { scheduledDate: addDays(today, 1), intervalDay: 1, status: 'pending' },
          { scheduledDate: addDays(today, 3), intervalDay: 3, status: 'pending' },
          { scheduledDate: addDays(today, 7), intervalDay: 7, status: 'pending' },
        ],
      },
      {
        id: 'mst_dev_2',
        subject: 'Physics',
        chapterTopic: 'Laws of Motion - Force and Momentum',
        originalQuestionContext: 'Bullet of mass 20g moving at 400 m/s stopped by sand bag in 0.02s. Find retarding force.',
        wrongApproach: 'Did not convert mass 20g into kg (0.02 kg), resulting in force 1000x too large.',
        correctMethod: 'Always convert units to SI: m = 0.02 kg. F = m(v - u)/t = 0.02 * (0 - 400)/0.02 = -400 N.',
        reason: 'Unit conversion overlooked during time pressure.',
        errorCategory: 'Careless Mistake',
        isRepeated: true,
        createdDate: twoDaysAgo,
        revisionHistory: [
          { scheduledDate: addDays(twoDaysAgo, 1), completedDate: yesterday, intervalDay: 1, status: 'completed' },
          { scheduledDate: addDays(twoDaysAgo, 3), intervalDay: 3, status: 'pending' },
          { scheduledDate: addDays(twoDaysAgo, 7), intervalDay: 7, status: 'pending' },
        ],
      },
    ];

    const sampleDoubts: Doubt[] = [
      {
        id: 'doubt_dev_1',
        subject: 'Physics',
        chapter: 'Laws of Motion',
        question: 'Why does an athlete run a certain distance before taking a long jump?',
        description: 'Need exact ICSE keyword reason regarding inertia of motion and momentum.',
        priority: 'High',
        date: today,
        status: 'Learning',
        solution: 'To acquire inertia of motion, which adds to the muscular effort and carries the athlete farther.',
        recheckDate: addDays(today, 2),
      },
      {
        id: 'doubt_dev_2',
        subject: 'Mathematics',
        chapter: 'Triangles',
        question: 'Conditions for RHS congruency vs SAS in right-angled triangles.',
        description: 'When can SAS be used instead of RHS if hypotenuse is not equal?',
        priority: 'Medium',
        date: yesterday,
        status: 'Unsolved',
      },
    ];

    const sampleRevisions: RevisionTask[] = [
      {
        id: 'rev_mst_dev_1_1',
        mistakeId: 'mst_dev_1',
        subject: 'Mathematics',
        topic: 'Simultaneous Equations - Cross Multiplication',
        intervalDay: 1,
        dueDate: addDays(today, 1),
        status: 'pending',
      },
      {
        id: 'rev_mst_dev_1_3',
        mistakeId: 'mst_dev_1',
        subject: 'Mathematics',
        topic: 'Simultaneous Equations - Cross Multiplication',
        intervalDay: 3,
        dueDate: addDays(today, 3),
        status: 'pending',
      },
      {
        id: 'rev_mst_dev_1_7',
        mistakeId: 'mst_dev_1',
        subject: 'Mathematics',
        topic: 'Simultaneous Equations - Cross Multiplication',
        intervalDay: 7,
        dueDate: addDays(today, 7),
        status: 'pending',
      },
      {
        id: 'rev_mst_dev_2_3',
        mistakeId: 'mst_dev_2',
        subject: 'Physics',
        topic: 'Laws of Motion - SI Unit Conversions',
        intervalDay: 3,
        dueDate: today, // Due today for immediate test!
        status: 'pending',
      },
    ];

    this.setItem(STORAGE_KEYS.SESSIONS, sampleSessions);
    this.setItem(STORAGE_KEYS.MISTAKES, sampleMistakes);
    this.setItem(STORAGE_KEYS.DOUBTS, sampleDoubts);
    this.setItem(STORAGE_KEYS.REVISIONS, sampleRevisions);
    this.updateUserProfile({
      currentStreak: 4,
      longestStreak: 7,
      earnedPoints: 340,
      isDevTestMode: true,
    });
  }

  // Tutorial & Guided Tour State
  getTutorialState(): import('../../types').TutorialState {
    const defaultState: import('../../types').TutorialState = {
      tutorialStarted: false,
      tutorialCompleted: false,
      currentTutorialStep: 1,
      dismissedFeatureHints: {},
      completedMiniTutorials: [],
      isTourActive: false,
    };
    return this.getItem<import('../../types').TutorialState>(STORAGE_KEYS.TUTORIAL, defaultState);
  }

  updateTutorialState(updates: Partial<import('../../types').TutorialState>): import('../../types').TutorialState {
    const current = this.getTutorialState();
    const updated: import('../../types').TutorialState = {
      ...current,
      ...updates,
      dismissedFeatureHints: {
        ...current.dismissedFeatureHints,
        ...(updates.dismissedFeatureHints || {}),
      },
      completedMiniTutorials: updates.completedMiniTutorials !== undefined
        ? updates.completedMiniTutorials
        : current.completedMiniTutorials,
    };
    this.setItem(STORAGE_KEYS.TUTORIAL, updated);
    return updated;
  }

  resetTutorialProgress(): import('../../types').TutorialState {
    const fresh: import('../../types').TutorialState = {
      tutorialStarted: false,
      tutorialCompleted: false,
      currentTutorialStep: 1,
      dismissedFeatureHints: {},
      completedMiniTutorials: [],
      isTourActive: false,
    };
    this.setItem(STORAGE_KEYS.TUTORIAL, fresh);
    return fresh;
  }

  // ==========================================
  // CUSTOM USER-CREATED SKILLS & SESSIONS
  // ==========================================
  getCustomSkills(userId?: string): import('../../types').CustomSkill[] {
    const all = this.getItem<import('../../types').CustomSkill[]>(STORAGE_KEYS.CUSTOM_SKILLS, []);
    if (!userId) return all;
    return all.filter((s) => s.userId === userId);
  }

  createCustomSkill(skillData: Omit<import('../../types').CustomSkill, 'id' | 'createdAt'>): import('../../types').CustomSkill {
    const all = this.getCustomSkills();
    const newSkill: import('../../types').CustomSkill = {
      ...skillData,
      id: `skill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.CUSTOM_SKILLS, [newSkill, ...all]);
    return newSkill;
  }

  deleteCustomSkill(id: string): void {
    const all = this.getCustomSkills();
    this.setItem(STORAGE_KEYS.CUSTOM_SKILLS, all.filter((s) => s.id !== id));
    // Also cleanup related sessions
    const sessions = this.getCustomSkillSessions();
    this.setItem(STORAGE_KEYS.CUSTOM_SKILL_SESSIONS, sessions.filter((s) => s.skillId !== id));
  }

  getCustomSkillSessions(skillId?: string): import('../../types').CustomSkillSession[] {
    const all = this.getItem<import('../../types').CustomSkillSession[]>(STORAGE_KEYS.CUSTOM_SKILL_SESSIONS, []);
    if (!skillId) return all;
    return all.filter((s) => s.skillId === skillId);
  }

  logCustomSkillSession(sessionData: Omit<import('../../types').CustomSkillSession, 'id' | 'createdAt'>): import('../../types').CustomSkillSession {
    const all = this.getItem<import('../../types').CustomSkillSession[]>(STORAGE_KEYS.CUSTOM_SKILL_SESSIONS, []);
    const newSession: import('../../types').CustomSkillSession = {
      ...sessionData,
      id: `skillsess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.CUSTOM_SKILL_SESSIONS, [newSession, ...all]);

    // Transparently reward points: 15 points per 30m skill practice
    const pts = Math.min(60, Math.floor(sessionData.durationMinutes / 30) * 15);
    if (pts > 0) {
      this.recordRewardEvent({
        category: 'skill_lab',
        points: pts,
        reason: `Logged custom skill session: ${sessionData.topic} (${sessionData.durationMinutes}m)`,
        date: sessionData.date,
        source: 'self_reported',
        eventKey: `custom_skill_${newSession.id}`,
      });
    }

    return newSession;
  }

  // ==========================================
  // ANNUAL & CONTINUOUS ANALYTICS (REAL DATA)
  // ==========================================
  getAnnualAnalytics(targetYear = new Date().getFullYear()): import('../../types').AnnualAnalyticsSummary {
    const sessions = this.getStudySessions();
    const mistakes = this.getMistakes();
    const customSessions = this.getCustomSkillSessions();
    const football = this.getFootballSessions();
    const workouts = this.getWorkoutSessions();
    const reading = this.getReadingLogs();

    // Filter by target year
    const yearPrefix = `${targetYear}-`;
    const yearSessions = sessions.filter((s) => s.date.startsWith(yearPrefix));
    const yearMistakes = mistakes.filter((m) => m.createdDate?.startsWith(yearPrefix));
    const yearCustomSessions = customSessions.filter((s) => s.date.startsWith(yearPrefix));
    const yearFootball = football.filter((f) => f.date.startsWith(yearPrefix));
    const yearWorkouts = workouts.filter((w) => w.date.startsWith(yearPrefix));
    const yearReading = reading.filter((r) => r.date.startsWith(yearPrefix));

    // Unique study days
    const studyDaysSet = new Set<string>();
    let totalStudyMinutes = 0;
    let mathsMinutes = 0;
    let totalQuestionsAttempted = 0;
    let totalQuestionsCorrect = 0;
    const subjectMinutesMap: Record<string, number> = {};

    yearSessions.forEach((s) => {
      studyDaysSet.add(s.date);
      const mins = s.actualDurationMinutes || s.plannedDurationMinutes || 0;
      totalStudyMinutes += mins;
      if (s.subject === 'Mathematics') {
        mathsMinutes += mins;
      }
      const subj = s.subject || 'General';
      subjectMinutesMap[subj] = (subjectMinutesMap[subj] || 0) + mins;
      if (s.questionsAttempted > 0) {
        totalQuestionsAttempted += s.questionsAttempted;
        totalQuestionsCorrect += s.correct || 0;
      }
    });

    // Revisions completed in this year
    let revisionsCompletedCount = 0;
    mistakes.forEach((m) => {
      (m.revisionHistory || []).forEach((r) => {
        if (r.status === 'completed' && r.completedDate && r.completedDate.startsWith(yearPrefix)) {
          revisionsCompletedCount++;
        }
      });
    });

    // Fitness & Reading totals
    let totalFitnessMinutes = 0;
    yearFootball.forEach((f) => { totalFitnessMinutes += f.durationMinutes || 0; });
    yearWorkouts.forEach((w) => { totalFitnessMinutes += w.durationMinutes || 0; });

    let totalSkillMinutes = 0;
    yearCustomSessions.forEach((cs) => { totalSkillMinutes += cs.durationMinutes || 0; });

    let totalReadingPages = 0;
    yearReading.forEach((r) => { totalReadingPages += r.pagesRead || 0; });

    // Monthly breakdown (12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyBreakdown = monthNames.map((name, idx) => {
      const mStr = String(idx + 1).padStart(2, '0');
      const prefix = `${targetYear}-${mStr}-`;
      const mSessions = yearSessions.filter((s) => s.date.startsWith(prefix));
      let mMinutes = 0;
      let mAtt = 0;
      let mCorr = 0;
      mSessions.forEach((s) => {
        mMinutes += s.actualDurationMinutes || s.plannedDurationMinutes || 0;
        if (s.questionsAttempted > 0) {
          mAtt += s.questionsAttempted;
          mCorr += s.correct || 0;
        }
      });
      return {
        monthName: name,
        monthIndex: idx,
        studyHours: Math.round((mMinutes / 60) * 10) / 10,
        tasksDone: mSessions.length,
        accuracyAvg: mAtt > 0 ? Math.round((mCorr / mAtt) * 100) : 0,
      };
    });

    // Subject distribution
    const subjectDistribution = Object.entries(subjectMinutesMap).map(([subject, mins]) => ({
      subject,
      hours: Math.round((mins / 60) * 10) / 10,
      percentage: totalStudyMinutes > 0 ? Math.round((mins / totalStudyMinutes) * 100) : 0,
    })).sort((a, b) => b.hours - a.hours);

    const avgAccuracy = totalQuestionsAttempted > 0 ? Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100) : 0;

    return {
      year: targetYear,
      totalStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
      studyDaysCount: studyDaysSet.size,
      mathsTotalHours: Math.round((mathsMinutes / 60) * 10) / 10,
      revisionsCompletedCount,
      avgAccuracyPercent: avgAccuracy,
      totalSkillHours: Math.round((totalSkillMinutes / 60) * 10) / 10,
      totalFitnessHours: Math.round((totalFitnessMinutes / 60) * 10) / 10,
      totalReadingPages,
      monthlyBreakdown,
      subjectDistribution,
    };
  }

  getActivityHeatmap(targetYear = new Date().getFullYear()): Record<string, import('../../types').DayActivityCell> {
    const sessions = this.getStudySessions();
    const workouts = this.getWorkoutSessions();
    const football = this.getFootballSessions();
    const reading = this.getReadingLogs();
    const customSkills = this.getCustomSkillSessions();

    const map: Record<string, import('../../types').DayActivityCell> = {};
    const yearPrefix = `${targetYear}-`;

    const getOrInit = (date: string) => {
      if (!map[date]) {
        map[date] = {
          date,
          studyMinutes: 0,
          tasksCompleted: 0,
          mathsMinutes: 0,
          workoutMinutes: 0,
          readingMinutes: 0,
          skillMinutes: 0,
          level: 0,
        };
      }
      return map[date];
    };

    sessions.forEach((s) => {
      if (s.date && s.date.startsWith(yearPrefix)) {
        const cell = getOrInit(s.date);
        const mins = s.actualDurationMinutes || s.plannedDurationMinutes || 0;
        cell.studyMinutes += mins;
        cell.tasksCompleted += 1;
        if (s.subject === 'Mathematics') {
          cell.mathsMinutes += mins;
        }
      }
    });

    workouts.forEach((w) => {
      if (w.date && w.date.startsWith(yearPrefix)) {
        const cell = getOrInit(w.date);
        cell.workoutMinutes += w.durationMinutes || 0;
      }
    });

    football.forEach((f) => {
      if (f.date && f.date.startsWith(yearPrefix)) {
        const cell = getOrInit(f.date);
        cell.workoutMinutes += f.durationMinutes || 0;
      }
    });

    reading.forEach((r) => {
      if (r.date && r.date.startsWith(yearPrefix)) {
        const cell = getOrInit(r.date);
        cell.readingMinutes += (r.pagesRead || 0) * 3; // ~3 mins per page
      }
    });

    customSkills.forEach((cs) => {
      if (cs.date && cs.date.startsWith(yearPrefix)) {
        const cell = getOrInit(cs.date);
        cell.skillMinutes += cs.durationMinutes || 0;
      }
    });

    // Compute intensity levels (0-4)
    Object.values(map).forEach((cell) => {
      const totalActiveMinutes = cell.studyMinutes + cell.workoutMinutes + cell.readingMinutes + cell.skillMinutes;
      if (totalActiveMinutes === 0) cell.level = 0;
      else if (totalActiveMinutes <= 60) cell.level = 1;
      else if (totalActiveMinutes <= 120) cell.level = 2;
      else if (totalActiveMinutes <= 180) cell.level = 3;
      else cell.level = 4;
    });

    return map;
  }

  // ==========================================
  // COMMUNITY FEATURE REQUESTS & VOTING
  // ==========================================
  getFeatureRequests(): import('../../types').FeatureRequest[] {
    const initialSeed: import('../../types').FeatureRequest[] = [
      {
        id: 'feat_1',
        title: 'Formula Audio Flashcards for Morning Commute',
        description: 'Listen to ICSE Physics and Chemistry formulas in audio mode while traveling.',
        problemSolved: 'Helps students utilize 30-minute school bus travel without straining eyes with paper notes.',
        whyHelpful: 'Boosts passive retrieval and preserves consistency on exhausting school days.',
        category: 'Study',
        authorId: 'usr_seed_rohan',
        authorUsername: 'rohan_icse',
        authorDisplayName: 'Rohan (ICSE 9th)',
        votesCount: 14,
        status: 'Planned',
        createdAt: '2026-09-01T10:00:00.000Z',
      },
      {
        id: 'feat_2',
        title: 'Real-time Squad Study Pomodoro Sync',
        description: 'Allow squad members to join a shared quiet study room with synced 45-minute focus intervals.',
        problemSolved: 'Students feel isolated during night revisions and easily succumb to phone distractions.',
        whyHelpful: 'Peer accountability without intrusive video feeds.',
        category: 'Teams',
        authorId: 'usr_seed_ananya',
        authorUsername: 'ananya_maths',
        authorDisplayName: 'Ananya S.',
        votesCount: 21,
        status: 'Building',
        createdAt: '2026-09-02T14:30:00.000Z',
      },
      {
        id: 'feat_3',
        title: 'Export Mistake Logbook to Print-Ready PDF',
        description: 'One-click generator to print all unresolved mistakes formatted with standard ICSE margins.',
        problemSolved: 'Parents and teachers want physical review material before midterm examinations.',
        whyHelpful: 'Bridges digital tracking with offline desk practice.',
        category: 'Study',
        authorId: 'usr_seed_aarav',
        authorUsername: 'aarav_icse',
        authorDisplayName: 'Aarav Sharma',
        votesCount: 18,
        status: 'Under Review',
        createdAt: '2026-09-04T16:00:00.000Z',
      },
    ];

    return this.getItem<import('../../types').FeatureRequest[]>(STORAGE_KEYS.FEATURE_REQUESTS, initialSeed);
  }

  createFeatureRequest(req: Omit<import('../../types').FeatureRequest, 'id' | 'votesCount' | 'status' | 'createdAt'>): import('../../types').FeatureRequest {
    const all = this.getFeatureRequests();
    const newReq: import('../../types').FeatureRequest = {
      ...req,
      id: `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      votesCount: 0,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.FEATURE_REQUESTS, [newReq, ...all]);

    // Record author's vote (increments votesCount from 0 to 1)
    const voteRes = this.toggleFeatureVote(newReq.id, req.authorId);
    newReq.votesCount = voteRes.newCount;

    return newReq;
  }

  getFeatureVotes(userId?: string): import('../../types').FeatureVote[] {
    const all = this.getItem<import('../../types').FeatureVote[]>(STORAGE_KEYS.FEATURE_VOTES, []);
    if (!userId) return all;
    return all.filter((v) => v.userId === userId);
  }

  toggleFeatureVote(featureId: string, userId: string): { voted: boolean; newCount: number } {
    const allVotes = this.getItem<import('../../types').FeatureVote[]>(STORAGE_KEYS.FEATURE_VOTES, []);
    const existingIndex = allVotes.findIndex((v) => v.featureId === featureId && v.userId === userId);
    const allRequests = this.getFeatureRequests();
    const targetReq = allRequests.find((r) => r.id === featureId);

    let voted = false;
    let newCount = targetReq ? targetReq.votesCount : 0;

    if (existingIndex >= 0) {
      // Remove vote
      allVotes.splice(existingIndex, 1);
      if (targetReq) {
        targetReq.votesCount = Math.max(0, targetReq.votesCount - 1);
        newCount = targetReq.votesCount;
      }
      voted = false;
    } else {
      // Add vote
      allVotes.push({
        id: `vote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        featureId,
        userId,
        createdAt: new Date().toISOString(),
      });
      if (targetReq) {
        targetReq.votesCount += 1;
        newCount = targetReq.votesCount;
      }
      voted = true;
    }

    this.setItem(STORAGE_KEYS.FEATURE_VOTES, allVotes);
    this.setItem(STORAGE_KEYS.FEATURE_REQUESTS, allRequests);

    return { voted, newCount };
  }

  // ====================================================
  // FULL-DAY ROUTINE ENGINE PERSISTENCE (PER-USER SCOPED)
  // ====================================================

  getStudentRoutineProfile(userId?: string): import('../../types').StudentRoutineProfile {
    const cleanDefaultProfile: import('../../types').StudentRoutineProfile = {
      wakeTime: '06:00',
      sleepTime: '22:30',
      difficultyWaking: false,
      schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      schoolStartTime: '08:00',
      schoolEndTime: '14:30',
      commuteMinutes: 20,
      breakfastTime: '07:15',
      lunchTime: '15:00',
      dinnerTime: '20:00',
      tuitionCommitments: [],
      tuition: [],
      sportsAndAcademy: [],
      sports: [],
      customCommitments: [],
      studyPreferences: {
        targetDailyStudyMinutes: 120,
        strongSubjects: [],
        weakSubjects: [],
      },
      workoutPreference: 'none',
      workoutDurationMinutes: 0,
      dailyReadingGoalMinutes: 15,
      skillTracks: [],
      personalProjects: [],
      weekendDifferences: {
        saturdayWakeTime: '07:00',
        saturdaySleepTime: '22:30',
        sundayWakeTime: '07:30',
        sundaySleepTime: '22:00',
        notes: '',
      },
      subjects: {
        strong: [],
        weak: [],
        targetDailyStudyMinutes: 120, // Clean generic baseline
      },
    };

    const key = this.getUserScopedKey(STORAGE_KEYS.ROUTINE_PROFILE, userId);
    return this.getItem<import('../../types').StudentRoutineProfile>(
      key,
      cleanDefaultProfile
    );
  }

  saveStudentRoutineProfile(profile: import('../../types').StudentRoutineProfile, userId?: string): void {
    const key = this.getUserScopedKey(STORAGE_KEYS.ROUTINE_PROFILE, userId);
    this.setItem(key, profile);

    const uid = userId || this.activeUserId;
    if (uid) {
      try {
        const { CloudSyncService } = require('./supabaseSync');
        CloudSyncService.pushRecord('student_routine_profiles', {
          wake_time: profile.wakeTime,
          sleep_time: profile.sleepTime,
          difficulty_waking: profile.difficultyWaking,
          school_days: profile.schoolDays,
          school_start_time: profile.schoolStartTime,
          school_end_time: profile.schoolEndTime,
          commute_minutes: profile.commuteMinutes,
          breakfast_time: profile.breakfastTime,
          lunch_time: profile.lunchTime,
          dinner_time: profile.dinnerTime,
          tuition_commitments: profile.tuitionCommitments || [],
          sports_and_academy: profile.sportsAndAcademy || [],
          workout_preference: profile.workoutPreference,
          workout_duration_minutes: profile.workoutDurationMinutes,
          daily_reading_goal_minutes: profile.dailyReadingGoalMinutes,
          skill_tracks: profile.skillTracks || [],
          personal_projects: profile.personalProjects || [],
          weekend_differences: profile.weekendDifferences,
          subjects: profile.subjects,
          updated_at: new Date().toISOString(),
        }, uid);
      } catch (err) {
        console.warn('Routine profile sync warning:', err);
      }
    }
  }

  getRecurringCommitments(userId?: string): import('../../types').RecurringCommitment[] {
    const key = this.getUserScopedKey('studyos_recurring_commitments', userId);
    return this.getItem<import('../../types').RecurringCommitment[]>(key, []);
  }

  saveRecurringCommitments(commitments: import('../../types').RecurringCommitment[], userId?: string): void {
    const key = this.getUserScopedKey('studyos_recurring_commitments', userId);
    this.setItem(key, commitments);

    const uid = userId || this.activeUserId;
    if (uid && commitments.length > 0) {
      try {
        const { CloudSyncService } = require('./supabaseSync');
        commitments.forEach((c) => {
          CloudSyncService.pushRecord('recurring_commitments', {
            id: c.id,
            type: c.type,
            title: c.title,
            subject: c.subject,
            sport_type: c.sportType,
            recurrence_type: c.recurrenceType,
            days_of_week: c.daysOfWeek,
            specific_date: c.specificDate,
            start_date: c.startDate,
            end_date: c.endDate,
            start_time: c.startTime,
            end_time: c.endTime,
            commute_before_minutes: c.commuteBeforeMinutes || 0,
            commute_after_minutes: c.commuteAfterMinutes || 0,
            location_label: c.locationLabel,
            notes: c.notes,
            updated_at: new Date().toISOString(),
          }, uid);
        });
      } catch (err) {
        console.warn('Commitments sync warning:', err);
      }
    }
  }

  getFullDayRoutine(dateStr: string, userId?: string): import('../../types').FullDayRoutineBlock[] {
    const key = this.getUserScopedKey(STORAGE_KEYS.FULL_DAY_ROUTINES, userId);
    const all = this.getItem<Record<string, import('../../types').FullDayRoutineBlock[]>>(
      key,
      {}
    );
    if (all[dateStr]) {
      return all[dateStr];
    }
    // Lazily generate routine if not yet generated for this date
    const profile = this.getStudentRoutineProfile(userId);
    const { RoutineEngine } = require('../routine/routineEngine');
    const { HolidayService } = require('../routine/holidayService');
    const holiday = HolidayService.getHolidayForDate(dateStr) || undefined;
    const generated = RoutineEngine.generateFullDayRoutine(profile, dateStr, { holiday });
    all[dateStr] = generated;
    this.setItem(key, all);
    return generated;
  }

  saveFullDayRoutine(dateStr: string, blocks: import('../../types').FullDayRoutineBlock[], userId?: string): void {
    const key = this.getUserScopedKey(STORAGE_KEYS.FULL_DAY_ROUTINES, userId);
    const all = this.getItem<Record<string, import('../../types').FullDayRoutineBlock[]>>(
      key,
      {}
    );
    all[dateStr] = blocks;
    this.setItem(key, all);

    const uid = userId || this.activeUserId;
    if (uid) {
      try {
        const { CloudSyncService } = require('./supabaseSync');
        CloudSyncService.pushRecord('full_day_routines', {
          date: dateStr,
          blocks: blocks,
          updated_at: new Date().toISOString(),
        }, uid);
      } catch (err) {
        console.warn('Full day routine sync warning:', err);
      }
    }
  }
}

export const repo = new LocalStorageRepository();

