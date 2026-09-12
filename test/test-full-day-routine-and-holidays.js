/**
 * Comprehensive Unit & Integration Test Suite
 * Validating:
 * 1. Full-Day Routine Synthesis (Wake → Morning → School → Afternoon → Evening → Night → Sleep)
 * 2. Week Understanding Comprehension Model
 * 3. Deterministic Schedule Validator & Overlap Repair
 * 4. Holiday Calendar System & Timetable Redistribution
 * 5. Evening Tomorrow Brief Generation & Notification Settings
 */

const assert = require('assert');
const path = require('path');
const { execFileSync } = require('child_process');

// Compile storage and routine engines
const projectRoot = path.resolve(__dirname, '..');
const tscPath = require.resolve('typescript/bin/tsc');

console.log('====================================================');
console.log(' RUNNING STUDYOS FULL-DAY ROUTINE & HOLIDAY TESTS   ');
console.log('====================================================\n');

// Mock localStorage
class MemoryStorage {
  constructor() {
    this.values = new Map();
  }
  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }
  setItem(key, value) {
    this.values.set(key, String(value));
  }
  removeItem(key) {
    this.values.delete(key);
  }
  clear() {
    this.values.clear();
  }
}

const storage = new MemoryStorage();
global.window = { localStorage: storage };
global.localStorage = storage;

// Transpile with tsc
execFileSync(
  process.execPath,
  [
    tscPath,
    'src/lib/routine/routineEngine.ts',
    'src/lib/routine/holidayService.ts',
    'src/lib/routine/notificationService.ts',
    '--outDir',
    'test/.routine-dist',
    '--module',
    'commonjs',
    '--target',
    'es2020',
    '--esModuleInterop',
    '--skipLibCheck',
  ],
  {
    cwd: projectRoot,
    stdio: 'inherit',
  }
);

const { RoutineEngine } = require('./.routine-dist/routineEngine.js');
const { HolidayService } = require('./.routine-dist/holidayService.js');
const { NotificationService } = require('./.routine-dist/notificationService.js');

// Test Profile
const testProfile = {
  wakeTime: '05:45',
  sleepTime: '22:00',
  difficultyWaking: false,
  schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  schoolStartTime: '07:30',
  schoolEndTime: '14:15',
  commuteMinutes: 30,
  breakfastTime: '07:00',
  lunchTime: '14:30',
  dinnerTime: '20:00',
  tuitionCommitments: [
    {
      id: 'tuit_physics',
      subject: 'Physics Tuition',
      days: ['Tuesday', 'Thursday'],
      startTime: '17:30',
      endTime: '19:00',
      travelMinutes: 15,
    },
  ],
  sportsAndAcademy: [
    {
      id: 'football_acad',
      name: 'Weekend Football Academy',
      days: ['Saturday', 'Sunday'],
      startTime: '16:00',
      endTime: '19:30',
      travelMinutes: 20,
    },
  ],
  workoutPreference: 'evening',
  workoutDurationMinutes: 30,
  dailyReadingGoalMinutes: 20,
  skillTracks: ['AI & Python'],
  personalProjects: ['StudyOS Companion'],
  weekendDifferences: {
    saturdayWakeTime: '06:30',
    saturdaySleepTime: '22:30',
    sundayWakeTime: '07:00',
    sundaySleepTime: '22:00',
    notes: 'Weekend football academy and homework backlog clearing',
  },
  subjects: {
    strong: ['Mathematics'],
    weak: ['Physics', 'Chemistry'],
    targetDailyStudyMinutes: 210,
  },
};

// --- TEST 1: AI Week Understanding Interpretation ---
console.log('--- TEST 1: Week Understanding Interpretation ---');
const understanding = RoutineEngine.summarizeWeekUnderstanding(testProfile);
assert(understanding.fixedCommitmentsHours > 0, 'Fixed commitments hours must be positive');
assert(understanding.freeTimeHours > 0, 'Free time hours must be positive');
assert(understanding.schoolSummary.includes('7:30 AM'), 'School summary must contain start time');
assert(understanding.sleepTarget.includes('10:00 PM'), 'Sleep target must state 10:00 PM');
console.log(`✓ Week understanding calculated: ${understanding.fixedCommitmentsHours}h fixed, ${understanding.freeTimeHours}h free.`);

// --- TEST 2: Deterministic Schedule Validator ---
console.log('\n--- TEST 2: Deterministic Schedule Validation ---');
const invalidBlocks = [
  {
    id: 'b1',
    title: 'School',
    category: 'school',
    startTime: '07:30',
    endTime: '14:15',
    durationMinutes: 405,
    priority: 'critical',
    isLocked: true,
    recurringStatus: 'weekday',
    source: 'user_defined',
    completed: false,
  },
  {
    id: 'b2',
    title: 'Conflicting Tuition',
    category: 'tuition',
    startTime: '13:00', // Overlaps with school (13:00 < 14:15)
    endTime: '14:30',
    durationMinutes: 90,
    priority: 'critical',
    isLocked: true,
    recurringStatus: 'weekday',
    source: 'user_defined',
    completed: false,
  },
];

const valResult = RoutineEngine.validateSchedule(invalidBlocks);
assert.strictEqual(valResult.valid, false, 'Validator must reject overlapping locked commitments');
assert(valResult.errors.length > 0, 'Must produce error message for critical conflict');
console.log('✓ Overlapping commitment caught by deterministic validator.');

// --- TEST 3: Deterministic Schedule Repair ---
console.log('\n--- TEST 3: Deterministic Schedule Repair Engine ---');
const overlappingStudyBlocks = [
  {
    id: 'b1',
    title: 'School',
    category: 'school',
    startTime: '07:30',
    endTime: '14:15',
    durationMinutes: 405,
    isLocked: true,
    completed: false,
  },
  {
    id: 'b2',
    title: 'Flexible Study Block',
    category: 'study',
    startTime: '14:00', // Overlaps school by 15 mins
    endTime: '15:00',
    durationMinutes: 60,
    isLocked: false,
    completed: false,
  },
];

const repaired = RoutineEngine.repairSchedule(overlappingStudyBlocks);
assert.strictEqual(repaired[0].endTime, '14:15', 'School end time preserved');
assert(repaired[1].startTime >= '14:15', 'Flexible study block moved after school');
console.log('✓ Schedule repair shifted flexible block to eliminate conflict.');

// --- TEST 4: Full-Day 24-Hour Routine Generation ---
console.log('\n--- TEST 4: Full-Day 24-Hour Routine Generation ---');
const weekdayDate = '2026-09-08'; // Tuesday
const routine = RoutineEngine.generateFullDayRoutine(testProfile, weekdayDate);

assert(routine.length >= 8, 'Full-day routine must contain at least 8 blocks covering the whole day');

const categories = routine.map((b) => b.category);
assert(categories.includes('wake'), 'Routine must include Wake Up');
assert(categories.includes('study'), 'Routine must include Study blocks');
assert(categories.includes('meal'), 'Routine must include Meals');
assert(categories.includes('school'), 'Routine must include School');
assert(categories.includes('tuition'), 'Routine must include Tuition on Tuesday');
assert(categories.includes('revision'), 'Routine must include Active Mistake Revision');
assert(categories.includes('reading'), 'Routine must include Night Reading');
assert(categories.includes('sleep'), 'Routine must include Sleep target');

// Ensure chronological order
for (let i = 0; i < routine.length - 1; i++) {
  assert(
    routine[i].startTime <= routine[i + 1].startTime,
    `Blocks must be in chronological order: ${routine[i].title} (${routine[i].startTime}) vs ${routine[i + 1].title} (${routine[i + 1].startTime})`
  );
}
console.log(`✓ 24-hour chronological routine synthesized with ${routine.length} blocks.`);

// --- TEST 5: Holiday Calendar System & Routine Redistribution ---
console.log('\n--- TEST 5: Holiday Calendar & Timetable Redistribution ---');
const holidays = HolidayService.getHolidays();
assert(holidays.length >= 5, 'Must contain standard holiday calendar defaults');

const testHoliday = {
  holidayName: 'Gandhi Jayanti',
  date: '2026-10-02',
  type: 'national_holiday',
  schoolClosed: true,
  notes: 'National holiday',
  createdBy: 'system',
};

const holidayRoutine = RoutineEngine.generateFullDayRoutine(testProfile, '2026-10-02', { holiday: testHoliday });
const holidayCategories = holidayRoutine.map((b) => b.category);
assert(!holidayCategories.includes('school'), 'School must NOT be scheduled on a holiday');
assert(holidayCategories.includes('skill_lab'), 'Holiday must allocate daytime to Skill Lab / Projects');
console.log('✓ Holiday timetable dynamically substituted school with Skill Lab and rest.');

// --- TEST 6: Evening Tomorrow Brief & Notification Engine ---
console.log('\n--- TEST 6: Evening Tomorrow Brief & Notification Engine ---');
const brief = NotificationService.prepareTomorrowBrief(testProfile, 3);
assert(brief.date, 'Brief must have tomorrow date');
assert(brief.wakeTime, 'Brief must specify wake time');
assert(brief.sleepTargetTime, 'Brief must specify sleep target time');
assert(brief.keyBlocks.length > 0, 'Brief must highlight key blocks');
assert.strictEqual(brief.revisionsDue.length, 1, 'Brief must show due revisions');

const notifs = NotificationService.getInAppNotifications();
assert(notifs.length >= 1, 'Tomorrow schedule in-app notification must be delivered');
console.log(`✓ Tomorrow Brief prepared for ${brief.dayOfWeek} with ${brief.keyBlocks.length} key blocks.`);

console.log('\n====================================================');
console.log(' ALL FULL-DAY ROUTINE & HOLIDAY TESTS PASSED!       ');
console.log('====================================================\n');
