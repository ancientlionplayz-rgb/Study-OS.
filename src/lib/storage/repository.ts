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
} from '../../types';

export interface IStudyOSRepository {
  // Profile & System
  getUserProfile(): UserProfile;
  updateUserProfile(profile: Partial<UserProfile>, notify?: boolean): UserProfile;
  toggleDevTestMode(enable: boolean): void;

  // Daily Plan & Academic Schedule
  getDailyPlan(date: string): DailyPlan;
  updateDailyPlan(plan: DailyPlan): void;
  updateStudyBlock(date: string, blockId: string, updates: Partial<StudyBlockPlan>): void;
  addExamOverride(date: string, override: Omit<ExamOverride, 'id'>): void;
  removeExamOverride(date: string, overrideId: string): void;

  // Study Sessions
  getStudySessions(filterDate?: string): StudySession[];
  getStudySessionById(id: string): StudySession | undefined;
  createStudySession(session: Omit<StudySession, 'id'>): StudySession;
  updateStudySession(id: string, updates: Partial<StudySession>): StudySession;
  deleteStudySession(id: string): void;

  // Doubt Inbox
  getDoubts(statusFilter?: DoubtStatus): Doubt[];
  createDoubt(doubt: Omit<Doubt, 'id'>): Doubt;
  updateDoubt(id: string, updates: Partial<Doubt>): Doubt;
  deleteDoubt(id: string): void;

  // Mistake Log & Deterministic Revision Engine (+1, +3, +7)
  getMistakes(): Mistake[];
  createMistake(mistake: Omit<Mistake, 'id' | 'revisionHistory'>): Mistake;
  updateMistake(id: string, updates: Partial<Mistake>): Mistake;
  getRevisionsDue(date?: string): RevisionTask[];
  completeRevision(revisionId: string, notes?: string): void;
  snoozeRevision(revisionId: string, daysToAdd?: number): void;
  reattemptRevision(revisionId: string): void;

  // Timer Persistence
  getTimerState(): TimerState;
  saveTimerState(state: TimerState, notify?: boolean): void;
  clearTimerState(): void;

  // Weekly Review (strictly real data)
  getWeeklyReviews(): WeeklyReview[];
  calculateWeeklyReview(weekStartDate: string): WeeklyReview;
  saveWeeklyReview(review: WeeklyReview): void;

  // Goals
  getGoals(): Goal[];
  createGoal(goal: Omit<Goal, 'id'>): Goal;
  updateGoal(id: string, updates: Partial<Goal>): Goal;

  // Holistic Growth Tracks & Skill Lab
  getFootballSessions(): FootballSession[];
  createFootballSession(session: Omit<FootballSession, 'id'>): FootballSession;
  getWorkoutSessions(): WorkoutSession[];
  createWorkoutSession(session: Omit<WorkoutSession, 'id'>): WorkoutSession;
  getReadingLogs(): ReadingLog[];
  createReadingLog(log: Omit<ReadingLog, 'id'>): ReadingLog;
  getSkillTracks(): SkillTrack[];
  updateSkillTrack(id: string, updates: Partial<SkillTrack>): SkillTrack;
  getSkillSessions(trackId?: string): SkillSession[];
  createSkillSession(session: Omit<SkillSession, 'id'>): SkillSession;

  // Lightweight Project Work (Defined outcome & strict time cap)
  getProjectWorkItems(): import('../../types').ProjectWorkItem[];
  createProjectWorkItem(item: Omit<import('../../types').ProjectWorkItem, 'id'>): import('../../types').ProjectWorkItem;
  updateProjectWorkItem(id: string, updates: Partial<import('../../types').ProjectWorkItem>): import('../../types').ProjectWorkItem;
  deleteProjectWorkItem(id: string): void;

  // Daily Discipline & Recovery Cadence
  getDisciplineCheck(date: string): import('../../types').DailyDisciplineCheck;
  updateDisciplineCheck(date: string, updates: Partial<import('../../types').DailyDisciplineCheck>): import('../../types').DailyDisciplineCheck;

  // Transparent Reward Economy & Anti-Cheat Foundations
  getPointRules(): import('../../types').PointRulesConfig;
  updatePointRules(rules: Partial<import('../../types').PointRulesConfig>): import('../../types').PointRulesConfig;
  getRewardEvents(): RewardEvent[];
  recordRewardEvent(event: Omit<RewardEvent, 'id' | 'timestamp'>): RewardEvent | null;
  recomputeAllPoints(): number;

  // Personal Reward Store (Non-monetary, parent-acknowledged)
  getPersonalRewards(): import('../../types').PersonalRewardItem[];
  createPersonalReward(reward: Omit<import('../../types').PersonalRewardItem, 'id' | 'timesRedeemed'>): import('../../types').PersonalRewardItem;
  updatePersonalReward(id: string, updates: Partial<import('../../types').PersonalRewardItem>): import('../../types').PersonalRewardItem;
  deletePersonalReward(id: string): void;
  getRedemptions(): import('../../types').RedemptionRecord[];
  redeemPersonalReward(rewardId: string, notes?: string): import('../../types').RedemptionRecord;

  // Streaks & Achievements
  getStreaksSummary(): import('../../types').StreaksSummary;
  getAchievements(): import('../../types').Achievement[];

  // Tutorial & Guided Tour State
  getTutorialState(): import('../../types').TutorialState;
  updateTutorialState(updates: Partial<import('../../types').TutorialState>): import('../../types').TutorialState;
  resetTutorialProgress(): import('../../types').TutorialState;

  // Full-Day Routine & User Scoping
  setActiveUserId(userId: string | null): void;
  getStudentRoutineProfile(userId?: string): import('../../types').StudentRoutineProfile;
  saveStudentRoutineProfile(profile: import('../../types').StudentRoutineProfile, userId?: string): void;
  getFullDayRoutine(dateStr: string, userId?: string): import('../../types').FullDayRoutineBlock[];
  saveFullDayRoutine(dateStr: string, blocks: import('../../types').FullDayRoutineBlock[], userId?: string): void;
  getRecurringCommitments(userId?: string): import('../../types').RecurringCommitment[];
  saveRecurringCommitments(commitments: import('../../types').RecurringCommitment[], userId?: string): void;

  // Utilities
  exportBackup(): string;
  importBackup(json: string): boolean;
  resetToDefaults(): void;
  loadDevTestData(): void;
  subscribe(listener: () => void): () => void;
}
