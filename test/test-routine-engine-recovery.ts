import assert from 'assert';
import { RoutineEngine } from '../src/lib/routine/routineEngine';
import { FullDayRoutineBlock, StudentRoutineProfile } from '../src/types';

console.log('\n======================================================');
console.log('STUDYOS ROUTINE ENGINE RECOVERY VERIFICATION SUITE');
console.log('======================================================\n');

let passed = 0;
let total = 0;

function test(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error('    Error:', err.message);
  }
}

const baseProfile: StudentRoutineProfile = {
  wakeTime: '06:00',
  sleepTime: '22:00',
  difficultyWaking: false,
  school: {
    schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    sameEveryDay: true,
    startTime: '08:00',
    endTime: '14:30',
    commuteMinutesBefore: 30,
    commuteMinutesAfter: 30,
  },
  breakfastTime: '06:45',
  lunchTime: '15:00',
  dinnerTime: '20:00',
  tuition: [
    {
      id: 'tuition_math',
      title: 'Maths Coaching',
      type: 'tuition',
      days: ['Tuesday', 'Thursday'],
      startTime: '17:00',
      endTime: '18:30',
      commuteBeforeMinutes: 15,
      commuteAfterMinutes: 15,
      recurrenceType: 'weekly',
    },
  ],
  sports: [
    {
      id: 'sports_football',
      title: 'Football Training',
      type: 'sports',
      days: ['Saturday', 'Sunday'],
      startTime: '16:00',
      endTime: '18:00',
      commuteBeforeMinutes: 20,
      commuteAfterMinutes: 20,
      recurrenceType: 'weekly',
    },
  ],
  studyPreferences: {
    targetDailyStudyMinutes: 120,
    weakSubjects: ['Physics'],
    strongSubjects: ['Computer Applications'],
  },
};

test('1. Every generated block has a valid whyThis explanation', () => {
  const blocks = RoutineEngine.generateFullDayRoutine(baseProfile, '2026-09-15'); // A Tuesday
  assert(blocks.length > 0, 'Should generate blocks');
  blocks.forEach((b) => {
    assert(b.whyThis && b.whyThis.length > 5, `Block "${b.title}" should have whyThis rationale`);
  });
});

test('2. detectDetailedConflicts flags locked commitment overlap as CRITICAL', () => {
  const overlappingBlocks: FullDayRoutineBlock[] = [
    {
      id: 'b1',
      title: 'School Attendance',
      category: 'school',
      startTime: '08:00',
      endTime: '14:30',
      durationMinutes: 390,
      priority: 'critical',
      isLocked: true,
      recurringStatus: 'weekday',
      source: 'user_defined',
      completed: false,
    },
    {
      id: 'b2',
      title: 'Maths Board Coaching',
      category: 'tuition',
      startTime: '14:00',
      endTime: '15:30',
      durationMinutes: 90,
      priority: 'critical',
      isLocked: true,
      recurringStatus: 'weekday',
      source: 'user_defined',
      completed: false,
    },
  ];

  const result = RoutineEngine.detectDetailedConflicts(overlappingBlocks, baseProfile);
  assert(result.hasConflicts, 'Should detect conflict');
  const critical = result.issues.find((i) => i.severity === 'critical');
  assert(critical, 'Should flag collision between locked commitments as critical');
});

test('3. detectDetailedConflicts flags insufficient transit buffer', () => {
  const tightTransitBlocks: FullDayRoutineBlock[] = [
    {
      id: 'b1',
      title: 'School Attendance',
      category: 'school',
      startTime: '08:00',
      endTime: '14:00',
      durationMinutes: 360,
      priority: 'critical',
      isLocked: true,
      recurringStatus: 'weekday',
      source: 'user_defined',
      completed: false,
    },
    {
      id: 'b2',
      title: 'Maths Coaching',
      category: 'tuition',
      startTime: '14:05', // Only 5 mins after school
      endTime: '15:30',
      durationMinutes: 85,
      priority: 'critical',
      isLocked: true,
      recurringStatus: 'weekday',
      source: 'user_defined',
      completed: false,
    },
  ];

  const result = RoutineEngine.detectDetailedConflicts(tightTransitBlocks, baseProfile);
  const transitWarning = result.issues.find((i) => i.title.includes('Travel Buffer'));
  assert(transitWarning, 'Should warn about tight transit buffer between school and coaching');
});

test('4. Fix This Schedule - makeLighter reduces study durations', () => {
  const blocks = RoutineEngine.generateFullDayRoutine(baseProfile, '2026-09-15');
  const initialStudy = blocks
    .filter((b) => b.category === 'study')
    .reduce((sum, b) => sum + b.durationMinutes, 0);

  const lighterBlocks = RoutineEngine.makeLighter(blocks, baseProfile);
  const lighterStudy = lighterBlocks
    .filter((b) => b.category === 'study')
    .reduce((sum, b) => sum + b.durationMinutes, 0);

  assert(lighterStudy < initialStudy, `Lighter study (${lighterStudy}m) should be less than initial (${initialStudy}m)`);
});

test('5. Fix This Schedule - prioritizeSports locks athletic blocks and injects recovery', () => {
  const weekendBlocks = RoutineEngine.generateFullDayRoutine(baseProfile, '2026-09-19'); // A Saturday
  const prioritized = RoutineEngine.prioritizeSports(weekendBlocks, baseProfile);

  const sportsBlock = prioritized.find((b) => b.category === 'sports' || b.category === 'academy');
  assert(sportsBlock, 'Should have sports block');
  assert(sportsBlock.isLocked === true, 'Sports block must be locked');

  const recoveryBlock = prioritized.find((b) => b.title.includes('Athletic Cool-down'));
  assert(recoveryBlock, 'Should inject athletic cool-down and recovery block');
});

test('6. Fix This Schedule - prioritizeSleep caps blocks before bedtime', () => {
  const blocksWithLateStudy: FullDayRoutineBlock[] = [
    {
      id: 'b_late',
      title: 'Late Physics Problem Set',
      category: 'study',
      startTime: '21:30',
      endTime: '22:45', // past 22:00 sleep target
      durationMinutes: 75,
      priority: 'high',
      isLocked: false,
      recurringStatus: 'daily',
      source: 'ai_generated',
      completed: false,
    },
  ];

  const sleepProtected = RoutineEngine.prioritizeSleep(blocksWithLateStudy, baseProfile);
  // Cutoff is sleep (22:00) - 45m = 21:15, so a block starting at 21:30 gets eliminated or capped
  assert(sleepProtected.length === 0, 'Late study starting after cutoff should be cleared to protect sleep');
});

console.log('\n------------------------------------------------------');
console.log(`Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log('------------------------------------------------------\n');

if (passed !== total) process.exit(1);
