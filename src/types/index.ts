/**
 * StudyOS Core Domain Types
 * Strict TypeScript models for Class 9 ICSE academic recovery & holistic personal growth.
 */

export type SubjectName =
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English Language'
  | 'English Literature'
  | 'History/Civics'
  | 'Geography'
  | 'Hindi'
  | 'Computer Applications';

export type SessionType =
  | 'morning_maths'
  | 'core_subject'
  | 'second_subject'
  | 'recall_error_review'
  | 'custom_study'
  | 'mixed_test';

export type LearningLoopStep =
  | 'retrieve'   // 1. Retrieve: close notes and recall
  | 'repair'     // 2. Repair: learn only the missing pieces
  | 'produce'    // 3. Produce: solve/write independently
  | 'check'      // 4. Check: compare with trusted answer/material
  | 'error_log'  // 5. Error Log: record the cause of lost marks
  | 'reattempt'; // 6. Reattempt: schedule later retrieval

export type MathsErrorCategory =
  | 'Concept Error'
  | 'Formula Forgotten'
  | 'Calculation Error'
  | 'Careless Mistake'
  | 'Question Misunderstood'
  | 'Time Management';

export type DoubtStatus = 'Unsolved' | 'Learning' | 'Solved' | 'Recheck';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Chapter {
  id: string;
  subject: SubjectName;
  name: string;
  totalTopics: number;
  completedTopics: number;
  evidenceBasedMastery: boolean; // Mastered ONLY via question/test performance, never passive video
}

export interface Subject {
  id: string;
  name: SubjectName;
  color: string;
  chapters: Chapter[];
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  subject: SubjectName;
  chapter: string;
  topic: string;
  plannedDurationMinutes: number;
  actualDurationMinutes: number;
  startTime: string; // ISO string
  endTime?: string;  // ISO string
  sessionType: SessionType;
  confidenceBefore: number; // 1 to 5
  confidenceAfter?: number; // 1 to 5
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  unattempted?: number;
  accuracy?: number; // calculated as (correct / questionsAttempted) * 100
  notes: string;
  doubtsCreatedIds: string[];
  mistakesCreatedIds: string[];
  currentLoopStep?: LearningLoopStep;
  errorCategories?: MathsErrorCategory[];
  isMathsSession: boolean;
  isCompleted: boolean;
}

export interface Doubt {
  id: string;
  subject: SubjectName;
  chapter: string;
  question: string;
  description: string;
  priority: PriorityLevel;
  date: string; // YYYY-MM-DD
  status: DoubtStatus;
  solution?: string;
  recheckDate?: string; // YYYY-MM-DD
  sessionId?: string;
}

export interface Mistake {
  id: string;
  subject: SubjectName;
  chapterTopic: string;
  originalQuestionContext: string;
  wrongApproach: string;
  correctMethod: string;
  reason: string;
  errorCategory: MathsErrorCategory;
  isRepeated: boolean;
  createdDate: string; // YYYY-MM-DD
  revisionHistory: {
    scheduledDate: string;
    completedDate?: string;
    intervalDay: number; // 1, 3, or 7
    status: 'pending' | 'completed' | 'snoozed' | 'reattempt';
    notes?: string;
  }[];
  sessionId?: string;
}

export interface RevisionTask {
  id: string;
  mistakeId?: string;
  subject: SubjectName;
  topic: string;
  intervalDay: 1 | 3 | 7 | number;
  dueDate: string; // YYYY-MM-DD
  status: 'pending' | 'completed' | 'snoozed' | 'reattempt';
  completedAt?: string;
  notes?: string;
}

export interface StudyBlockPlan {
  id: string;
  name: string;
  subject: SubjectName | 'Recall/Error Review' | 'Backlog/Review';
  plannedMinutes: number;
  completedMinutes: number;
  isCompleted: boolean;
  type: SessionType;
  timeSlotHint: string;
  isReplacedByExam?: boolean;
  originalSubject?: string;
  originalName?: string;
}

export interface ExamOverride {
  id: string;
  examName: string;
  subject: SubjectName;
  examDate: string; // YYYY-MM-DD
  targetBlockId?: string; // which block was substituted (Maths is never replaced)
  active: boolean;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Friday, Saturday, etc.
  targetMinutesTotal: number; // Default 210 (3.5 hours)
  mathsTargetMinutes: number; // Mandatory 60 mins
  isWeekendAcademyDay: boolean; // Sat & Sun 4:00 PM - 7:30 PM
  academyDetails?: {
    startTime: string; // 16:00
    endTime: string;   // 19:30
    travelNote: string;
  };
  blocks: StudyBlockPlan[];
  examOverrides: ExamOverride[];
  notes?: string;
  dayCompleted: boolean;
}

export interface SkillTrack {
  id: string;
  title: string;
  category: string;
  level: string; // e.g. "Beginner", "Foundational", "Intermediate", "Practitioner"
  currentTopic: string;
  resourceList: string[];
  practiceTask: string;
  miniProject: string;
  expectedEvidenceType: string; // e.g. "Working Code", "Explanation / Implementation", "Spec / Test", "Circuit / Simulation", "Offer / Proposal", "Derivation"
  totalHoursInvested: number;
  notes: string;
}

export interface SkillSession {
  id: string;
  trackId: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  summary: string;
  topicCovered?: string;
  evidenceType: string;
  evidenceOutput: string; // The working code, derivation, spec, circuit sketch, or offer draft
  deliverable?: string; // Git repo, file link, or demo url
}

export interface FootballSession {
  id: string;
  date: string;
  type: 'academy_training' | 'solo_drills' | 'match' | 'recovery';
  durationMinutes: number;
  isAcademyAttendance: boolean; // Weekend Academy (Sat/Sun 4:00 PM - 7:30 PM)
  drillsDone: string[]; // Dribbling, Passing, Shooting, Weak Foot, Speed, Stamina
  drillRatings?: {
    dribbling?: number;
    passing?: number;
    shooting?: number;
    weakFoot?: number;
    speed?: number;
    stamina?: number;
  };
  performanceRating: number; // 1 to 5
  staminaConditioningNotes: string;
  matchNotes?: string;
}

export interface CalisthenicsHabits {
  pushupsProgression: string; // e.g. "Standard Push-ups", "Knee Push-ups", "Diamond Push-ups", "Decline Push-ups"
  pushupsSets: number;
  pushupsReps: number;
  squatsSets: number;
  squatsReps: number;
  plankSets: number;
  plankDurationSeconds: number;
  mobilityRoutine: string;
  mobilityMinutes: number;
  safePulling: {
    equipmentAvailable: boolean; // Safe pulling ONLY when suitable equipment exists
    exerciseName?: string; // e.g. "Dead Hang", "Inverted Row", "Pull-ups"
    sets?: number;
    reps?: number;
  };
}

export interface WorkoutSession {
  id: string;
  date: string;
  type: 'Calisthenics' | 'Mobility' | 'Core' | 'Endurance';
  durationMinutes: number;
  calisthenics?: CalisthenicsHabits;
  exercises: { name: string; sets: number; reps: number; notes?: string }[];
  notes: string;
  safeHabitVerified: boolean; // Explicit check: safe exercise habit, no extreme diets or dangerous targets
}

export interface ReadingLog {
  id: string;
  date: string;
  bookTitle: string;
  author?: string;
  pagesRead: number; // Target: 5+ pages/day
  targetMet: boolean;
  keyIdea: string; // One key idea distilled from the pages
  takeaways?: string;
}

export interface ProjectWorkItem {
  id: string;
  title: string;
  category: 'LMS' | 'AI' | 'Business' | 'Other';
  definedOutcome: string; // Concrete deliverable to prevent open-ended rabbit holes
  timeCapMinutes: number; // Strict time cap (e.g. 30, 45, max 60 mins) to protect academic study
  actualMinutesSpent: number;
  status: 'planned' | 'in_progress' | 'completed';
  dateCreated: string;
  completedDate?: string;
  notes?: string;
}

export interface DailyDisciplineCheck {
  date: string; // YYYY-MM-DD
  sleepTargetHours: number; // Target: 7.5 - 8 hours
  sleepActualHours?: number;
  bedtime?: string; // e.g. "10:30 PM"
  wakeTime?: string; // e.g. "06:00 AM"
  morningStartTarget: string; // e.g. "06:00 AM"
  morningStartActual?: string;
  morningStartMet: boolean;
  studyTargetMet: boolean; // 3.5h / 210m
  mathsTargetMet: boolean; // 60m mandatory
  workoutCompleted: boolean;
  readingCompleted: boolean; // 5+ pages
  skillLabCompleted: boolean;
  immediateRestartNote: string; // "Next block is the restart point. No shaming missed days."
}

export interface PointRulesConfig {
  maths60mPoints: number; // default: 2
  study35hPoints: number; // default: 5
  reading5pPoints: number; // default: 1
  workoutPoints: number;   // default: 1
  skillLabPoints: number;  // default: 1
  sleepTargetPoints: number; // default: 1
}

export interface RewardEvent {
  id: string;
  eventKey: string; // Anti-cheat idempotency key, e.g. "2026-09-09_maths_60m"
  date: string; // YYYY-MM-DD
  points: number;
  reason: string;
  category:
    | 'maths_60m'
    | 'study_3_5h'
    | 'reading_5p'
    | 'workout'
    | 'skill_lab'
    | 'sleep_target'
    | 'error_revised'
    | 'custom';
  source: 'verified_timer' | 'self_reported'; // Label self-reported vs timer-verified actions
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
  metricLabel: string;
}

export interface PersonalRewardItem {
  id: string;
  title: string;
  category: 'Gaming' | 'Video' | 'Activity' | 'Privilege' | 'Other';
  costPoints: number;
  description: string;
  requiresParentApproval: boolean;
  timesRedeemed: number;
  lastRedeemedDate?: string;
}

export interface RedemptionRecord {
  id: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  date: string;
  requiresParentApproval: boolean;
  parentApprovalStatus: 'pending' | 'approved' | 'not_required';
  notes?: string;
  timestamp: string;
}

export interface StreaksSummary {
  mathsStreak: number;
  bestMathsStreak: number;
  studyStreak: number;
  bestStudyStreak: number;
  readingStreak: number;
  bestReadingStreak: number;
  workoutStreak: number;
  bestWorkoutStreak: number;
  rolling7DayConsistency: number; // 0 to 100 percentage
}

export interface Goal {
  id: string;
  title: string;
  category: 'Academic' | 'Football' | 'Skills' | 'Fitness' | 'Life';
  targetDate: string;
  description: string;
  progressPercent: number;
  isCompleted: boolean;
  projectMarker?: string; // Exact marker: ... .- -- .--. .- .. -.- -.-
}

export interface ProjectTask {
  id: string;
  title: string;
  track: string;
  status: 'backlog' | 'in_progress' | 'completed';
  dueDate?: string;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string;   // YYYY-MM-DD
  totalStudyHours: number;
  mathsDaysCompleted: number; // out of 7
  subjectHours: Record<string, number>;
  accuracyAverage: number;
  testScores: { testName: string; subject: SubjectName; score: number; maxScore: number; date: string }[];
  unresolvedDoubtsCount: number;
  repeatedMistakesCount: number;
  revisionsCompletedCount: number;
  revisionsDueCount: number;
  mostConsistentDay: string;
  missedTargets: string[];
  keyTakeaways: string;
  nextWeekFocus: string;
  createdDate: string;
}

export interface UserProfile {
  id: string;
  name: string;
  grade: 'Class 9 ICSE';
  targetExamYear: number;
  dailyStudyTargetMinutes: number; // 210 = 3.5h
  mathsMandatoryMinutes: number;   // 60m
  currentStreak: number;
  longestStreak: number;
  earnedPoints: number;
  isDevTestMode: boolean; // Developer/test mode switch for validation
  lastActiveDate: string;
  themeTemplate?: DashboardThemeTemplate;
  reducedMotion?: boolean;
}

// Future reserved entities for Phase 2/3
export interface Friend {
  id: string;
  username: string;
  status: 'active' | 'offline';
  weeklyHours: number;
}

export interface Group {
  id: string;
  name: string;
  memberCount: number;
  description: string;
}

export interface Team {
  id: string;
  name: string;
  focus: string;
  memberCount: number;
}

export interface Challenge {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  targetMetric: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  honestPoints: number;
  verifiedHours: number;
}

export interface TimerState {
  sessionId?: string;
  subject?: SubjectName;
  chapter?: string;
  topic?: string;
  sessionType?: SessionType;
  plannedMinutes: number;
  remainingSeconds: number;
  status: 'idle' | 'running' | 'paused';
  startedAtTimestamp?: number; // epoch ms
  currentLoopStep: LearningLoopStep;
  updatedAtTimestamp: number;
}

export interface TutorialState {
  tutorialStarted: boolean;
  tutorialCompleted: boolean;
  currentTutorialStep: number;
  dismissedFeatureHints: Record<string, boolean>;
  completedMiniTutorials: string[];
  isTourActive: boolean;
  lastDismissedAt?: string;
}

export interface HelpTopic {
  id: string;
  title: string;
  category: 'getting_started' | 'study_engine' | 'ai_coach' | 'scores' | 'social_competition' | 'privacy';
  summary: string;
  content: string[];
  tips?: string[];
  relatedActionUrl?: string;
  relatedActionLabel?: string;
}

// --- Theme & Dashboard Templates ---
export type DashboardThemeTemplate =
  | 'focus-light'
  | 'athletic'
  | 'tech-ai'
  | 'calm-study';

export interface ThemeConfig {
  id: DashboardThemeTemplate;
  name: string;
  tagline: string;
  description: string;
  previewColors: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
}

// --- User-Created Custom Skills ---
export type SkillCategory =
  | 'Programming'
  | 'AI'
  | 'Robotics'
  | 'Business'
  | 'Science'
  | 'Creative'
  | 'Communication'
  | 'Sport'
  | 'Other';

export interface CustomSkill {
  id: string;
  userId: string;
  name: string;
  category: SkillCategory | string;
  currentLevel: 'Beginner' | 'Foundational' | 'Intermediate' | 'Practitioner' | 'Advanced';
  targetLevel: 'Beginner' | 'Foundational' | 'Intermediate' | 'Practitioner' | 'Advanced';
  whyLearn: string;
  learningGoal: string;
  estimatedHoursPerWeek: number;
  preferredDays: string[];
  resourceLinks: string[];
  notes?: string;
  createdAt: string;
}

export interface CustomSkillSession {
  id: string;
  skillId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  topic: string;
  whatPracticed: string;
  whatBuilt: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Extreme';
  confidenceBefore: number; // 1-5
  confidenceAfter: number; // 1-5
  proofOfWork: string;
  deliverableUrl?: string;
  notes?: string;
  nextStep?: string;
  createdAt: string;
}

// --- Community Feature Requests & Voting ---
export type FeatureCategory =
  | 'Study'
  | 'AI'
  | 'Social'
  | 'Teams'
  | 'Fitness'
  | 'Skills'
  | 'UI'
  | 'Other';

export type FeatureStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Planned'
  | 'Building'
  | 'Released'
  | 'Declined';

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  problemSolved: string;
  whyHelpful: string;
  category: FeatureCategory;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  votesCount: number;
  status: FeatureStatus;
  createdAt: string;
  screenshotUrl?: string;
  adminResponse?: string;
}

export interface FeatureVote {
  id: string;
  featureId: string;
  userId: string;
  createdAt: string;
}

// --- Annual & Multi-Timeframe Activity Aggregates ---
export interface DayActivityCell {
  date: string; // YYYY-MM-DD
  studyMinutes: number;
  tasksCompleted: number;
  mathsMinutes: number;
  accuracyAvg?: number;
  workoutMinutes: number;
  readingMinutes: number;
  skillMinutes: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = 0m, 1 = 1-60m, 2 = 61-120m, 3 = 121-180m, 4 = 181m+
}

export interface AnnualAnalyticsSummary {
  year: number;
  totalStudyHours: number;
  studyDaysCount: number;
  mathsTotalHours: number;
  revisionsCompletedCount: number;
  avgAccuracyPercent: number;
  totalSkillHours: number;
  totalFitnessHours: number;
  totalReadingPages: number;
  monthlyBreakdown: {
    monthName: string;
    monthIndex: number;
    studyHours: number;
    tasksDone: number;
    accuracyAvg: number;
  }[];
  subjectDistribution: {
    subject: SubjectName | string;
    hours: number;
    percentage: number;
  }[];
}

// ====================================================
// FULL-DAY ROUTINE ENGINE & HOLIDAYS ARCHITECTURE
// ====================================================

export type RoutineCategory =
  | 'wake'
  | 'morning_routine'
  | 'school'
  | 'commute'
  | 'meal'
  | 'tuition'
  | 'sports'
  | 'academy'
  | 'workout'
  | 'study'
  | 'homework'
  | 'revision'
  | 'skill_lab'
  | 'reading'
  | 'project'
  | 'leisure'
  | 'family'
  | 'break'
  | 'night_routine'
  | 'sleep'
  | 'other';

export interface FullDayRoutineBlock {
  id: string;
  title: string;
  category: RoutineCategory;
  startTime: string; // e.g. "05:45" or "5:45 AM"
  endTime: string;   // e.g. "06:45" or "6:45 AM"
  durationMinutes: number;
  priority: 'critical' | 'high' | 'medium' | 'flexible';
  isLocked: boolean; // Locked commitments like School, Academy, Tuition cannot be shifted
  reason?: string;
  whyThis?: string;
  recurringStatus: 'daily' | 'weekday' | 'weekend' | 'custom';
  source: 'ai_generated' | 'user_defined' | 'schedule_repair' | 'holiday_adjustment';
  subject?: string;
  completed: boolean;
  notes?: string;
  dayOffset?: -1 | 0 | 1; // -1: previous-night continuation, 0: current day, 1: next-day overflow
  isCrossMidnight?: boolean;
  academicSubjectId?: string;
  academicChapterId?: string;
  academicTopicId?: string;
}

export interface ScheduleConflictIssue {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  blockId1?: string;
  blockId2?: string;
  suggestedAction?: string;
}

export type RecurrenceType = 'weekly' | 'specific_date' | 'date_range' | 'one_time';
export type CommitmentType = 'school' | 'tuition' | 'sports' | 'academy' | 'club' | 'custom' | 'other';

export interface RecurringCommitment {
  id: string;
  userId?: string;
  type?: CommitmentType;
  category?: CommitmentType;
  title?: string;
  name?: string;
  subject?: string;
  sportType?: string;
  recurrenceType?: RecurrenceType;
  recurrence?: RecurrenceType;
  daysOfWeek?: string[];
  days?: string[];
  specificDate?: string;
  startDate?: string;
  endDate?: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  commuteBeforeMinutes?: number;
  commuteMinutesBefore?: number;
  commuteAfterMinutes?: number;
  commuteMinutesAfter?: number;
  travelMinutes?: number;
  locationLabel?: string;
  notes?: string;
  isLocked?: boolean;
}

export interface SchoolScheduleConfig {
  days?: string[];
  schoolDays?: string[];
  startTime: string;
  endTime: string;
  sameEveryDay: boolean;
  perDaySchedule?: Record<string, { enabled?: boolean; startTime: string; endTime: string; commuteMinutesBefore?: number; commuteMinutesAfter?: number }>;
  commuteMinutes?: number;
  commuteMinutesBefore?: number;
  commuteMinutesAfter?: number;
  oneOffNotes?: string;
  specialEvent?: {
    date: string;
    title: string;
    startTime: string;
    endTime: string;
  };
}

export interface SubjectRequirement {
  enabled?: boolean;
  subject: string;
  frequency?: 'daily' | 'weekdays' | 'custom_days' | 'none';
  days?: string[];
  dailyMinutes?: number;
  targetMinutes?: number;
}

export interface StudyPreferences {
  targetDailyStudyMinutes: number;
  weekdayTargetMinutes?: number;
  weekendTargetMinutes?: number;
  mandatorySubject?: SubjectRequirement;
  strongSubjects?: string[];
  weakSubjects?: string[];
  skillTracks?: string[];
}

export interface StudentRoutineProfile {
  // Canonical structured sections
  school?: SchoolScheduleConfig;
  tuition?: RecurringCommitment[];
  sports?: RecurringCommitment[];
  customCommitments?: RecurringCommitment[];
  studyPreferences?: StudyPreferences;

  // Timings & Cadence
  wakeTime?: string;           // "05:45"
  sleepTime?: string;          // "22:00"
  difficultyWaking?: boolean;
  schoolDays?: string[];       // ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  schoolStartTime?: string;    // "07:30"
  schoolEndTime?: string;      // "14:15"
  commuteMinutes?: number;     // 30
  breakfastTime?: string;      // "07:00"
  lunchTime?: string;          // "14:30"
  dinnerTime?: string;         // "20:00"
  tuitionCommitments?: any[];
  sportsAndAcademy?: any[];
  workoutPreference?: 'morning' | 'afternoon' | 'evening' | 'night' | 'none';
  workoutDurationMinutes?: number;
  dailyReadingGoalMinutes?: number;
  skillTracks?: string[];
  personalProjects?: string[];
  weekendDifferences?: {
    saturdayWakeTime?: string;
    saturdaySleepTime?: string;
    sundayWakeTime?: string;
    sundaySleepTime?: string;
    notes?: string;
  };
  subjects?: {
    strong?: string[];
    weak?: string[];
    targetDailyStudyMinutes?: number;
    mandatorySubject?: SubjectRequirement;
  };
}

export interface WeekUnderstanding {
  fixedCommitmentsHours: number;
  freeTimeHours: number;
  schoolSummary: string;
  tuitionSummary: string;
  sportsSummary: string;
  sleepTarget: string;
  commuteDailyHours: number;
  studyTargetDailyMinutes: number;
  weakSubjects: string[];
  strongSubjects: string[];
  weekendScheduleNotes: string;
  mandatorySubjectSummary?: string;
  approvedByUser: boolean;
}

export type HolidayType =
  | 'school_holiday'
  | 'national_holiday'
  | 'local_holiday'
  | 'vacation'
  | 'exam_holiday'
  | 'teacher_announced'
  | 'personal_day';

export interface HolidayRecord {
  id: string;
  holidayName: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  type: HolidayType;
  schoolClosed: boolean;
  notes?: string;
  createdBy: 'system' | 'student' | 'school';
}

export interface TomorrowBrief {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  isHoliday: boolean;
  holidayName?: string;
  wakeTime: string;
  sleepTargetTime: string;
  schoolHours?: string;
  keyBlocks: Array<{
    time: string;
    title: string;
    category: RoutineCategory;
    durationMinutes: number;
  }>;
  examsTomorrow: string[];
  revisionsDue: string[];
  unfinishedTasksCount: number;
  academyOrSportsNotes?: string;
  holidayAdjustmentNotes?: string;
  generatedAt: string;
  viewed: boolean;
}

export interface NotificationSettings {
  tomorrowScheduleEnabled: boolean;
  tomorrowScheduleTime: string; // e.g. "20:45"
  revisionRemindersEnabled: boolean;
  taskRemindersEnabled: boolean;
  examRemindersEnabled: boolean;
  teamInvitationsEnabled: boolean;
  challengeUpdatesEnabled: boolean;
}

export interface InAppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'team_invite' | 'friend_request' | 'challenge' | 'schedule' | 'revision' | 'holiday' | 'system';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ============================================================================
// ACADEMIC HIERARCHY & SYLLABUS ENGINE
// ============================================================================

export interface Board {
  id: string;
  name: string;
  code: string; // e.g. "ICSE", "CBSE", "IGCSE", "IB"
  country: string;
  createdAt?: string;
}

export interface AcademicYear {
  id: string;
  label: string; // e.g. "2026-2027"
  startDate: string;
  endDate: string;
  createdAt?: string;
}

export interface AcademicGrade {
  id: string;
  boardId: string;
  name: string; // e.g. "Class 9", "Class 10"
  numericLevel: number; // 9, 10
  createdAt?: string;
}

export interface AcademicSubject {
  id: string;
  boardId: string;
  gradeId: string;
  name: string; // e.g. "Mathematics", "Physics"
  code: string; // e.g. "MATH_ICSE_9"
  category: 'core' | 'science' | 'humanities' | 'language' | 'technical' | 'elective';
  active: boolean;
  color?: string;
  chapters?: AcademicChapter[];
  createdAt?: string;
}

export interface AcademicChapter {
  id: string;
  subjectId: string;
  title: string;
  orderIndex: number;
  description?: string;
  active: boolean;
  topics?: AcademicTopic[];
  createdAt?: string;
}

export interface AcademicTopic {
  id: string;
  chapterId: string;
  title: string;
  orderIndex: number;
  description?: string;
  active: boolean;
  subtopics?: AcademicSubtopic[];
  createdAt?: string;
}

export interface AcademicSubtopic {
  id: string;
  topicId: string;
  title: string;
  orderIndex: number;
  createdAt?: string;
}

export type TopicProgressStatus =
  | 'Not Started'
  | 'Learning'
  | 'Practicing'
  | 'Revision Due'
  | 'Strong'
  | 'Completed';

export interface StudentTopicProgress {
  id: string;
  userId: string;
  topicId: string;
  status: TopicProgressStatus;
  confidence: number; // 1 to 5
  firstStartedAt?: string;
  completedAt?: string;
  lastRevisedAt?: string;
  revisionCount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// TEST PAPER GENERATOR & FAIR INTEGRITY SYSTEM
// ============================================================================

export type TestDifficulty = 'Foundational' | 'Standard Board Level' | 'Challenging / Advanced';
export type TestQuestionType =
  | 'MCQ'
  | 'Short Answer'
  | 'Long Answer'
  | 'Numerical'
  | 'Reasoning'
  | 'Diagram-based'
  | 'True/False'
  | 'Programming';

export type TestMode =
  | 'chapter'      // One chapter
  | 'topic'        // Selected topics
  | 'subject'      // Multiple chapters
  | 'revision'     // Weak / revision-due topics
  | 'mock'         // Selected syllabus range
  | 'adaptive';    // Uses weak topics and recent mistakes

export interface TestConfiguration {
  board: string;
  grade: string;
  subjectId: string;
  subjectName: string;
  chapterIds: string[];
  topicIds: string[];
  difficulty: TestDifficulty;
  totalMarks: number;
  durationMinutes: number;
  questionTypes: TestQuestionType[];
  mode: TestMode;
  isPracticeMode?: boolean; // Instant answer preview allowed if true
}

export interface GeneratedTest {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  title: string;
  configuration: TestConfiguration;
  totalMarks: number;
  durationMinutes: number;
  instructions: string[];
  mode: TestMode;
  questions: TestQuestion[];
  createdAt: string;
}

export interface TestQuestion {
  id: string;
  testId: string;
  topicId?: string;
  topicTitle?: string;
  question: string;
  type: TestQuestionType;
  marks: number;
  options?: string[]; // for MCQ
  answerKey: string;
  explanation: string;
  markingLogic?: string;
  orderIndex: number;
}

export type IntegrityStatus = 'clear' | 'warning' | 'review_required' | 'resolved';

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  startedAt: string;
  submittedAt?: string;
  score: number;
  totalMarks: number;
  accuracyPercentage: number;
  integrityStatus: IntegrityStatus;
  integrityFlagsCount: number;
  createdAt: string;
}

export interface TestAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  studentAnswer: string;
  marksAwarded: number;
  feedback?: string;
  mistakeCategory?: string;
}

export type IntegrityEventType =
  | 'tab_switch'
  | 'window_blur'
  | 'unusual_navigation'
  | 'copy_paste'
  | 'interruption';

export interface IntegrityEvent {
  id: string;
  attemptId: string;
  userId: string;
  eventType: IntegrityEventType;
  timestamp: string;
  metadata?: Record<string, any>;
  severity: 'info' | 'warning' | 'critical';
}

export interface IntegrityReview {
  id: string;
  attemptId: string;
  status: 'Clear' | 'Warning' | 'Review Required' | 'Resolved';
  reviewerId?: string;
  notes?: string;
  studentExplanation?: string;
  reviewedAt?: string;
  createdAt: string;
}

// ============================================================================
// SPORTS & ATHLETICS ENGINE (MULTI-SPORT + CUSTOM METRICS)
// ============================================================================

export interface SportDefinition {
  id: string;
  name: string;
  category: 'team' | 'racquet' | 'individual' | 'combat' | 'fitness' | 'other';
  icon: string;
  isBuiltin: boolean;
  defaultMetrics: string[];
}

export interface UserSport {
  id: string;
  userId: string;
  sportId: string;
  name: string;
  rolePosition?: string;
  level: 'Recreational' | 'School Team' | 'Academy' | 'District / State' | 'National';
  academyClub?: string;
  goals?: string;
  trainingDays: string[];
  trainingTime: string;
  competitions?: string[];
  skillsTracked: string[];
  notes?: string;
  createdAt: string;
}

export interface SportSessionLog {
  id: string;
  userId: string;
  sportId: string;
  sportName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  trainingType: 'academy_training' | 'solo_drills' | 'match' | 'recovery' | 'conditioning';
  activities: string[];
  intensity: 'Light' | 'Moderate' | 'Intense' | 'Maximum';
  performanceRating: number; // 1-5
  metrics: Record<string, number | string>;
  notes?: string;
  improvement?: string;
  nextTarget?: string;
  createdAt: string;
}

// ============================================================================
// CREATIVE & PERFORMING ARTS MODULE
// ============================================================================

export type CreativeCategory =
  | 'Drawing'
  | 'Painting'
  | 'Digital Art'
  | 'Photography'
  | 'Design'
  | 'Dance'
  | 'Singing'
  | 'Instrument'
  | 'Music Production'
  | 'Acting'
  | 'Theatre'
  | 'Writing'
  | 'Public Speaking'
  | 'Other';

export interface CreativeSkill {
  id: string;
  userId: string;
  category: CreativeCategory;
  skillName: string;
  currentLevel: string;
  goal: string;
  weeklyTargetMinutes: number;
  notes?: string;
  createdAt: string;
}

export interface CreativeSessionLog {
  id: string;
  userId: string;
  creativeSkillId: string;
  skillName: string;
  category: CreativeCategory;
  date: string;
  durationMinutes: number;
  pieceOrProject: string;
  techniquePracticed: string;
  rhythmOrTempo?: string;
  theoryNotes?: string;
  completedOutputUrl?: string;
  notes?: string;
  nextTarget?: string;
  createdAt: string;
}
