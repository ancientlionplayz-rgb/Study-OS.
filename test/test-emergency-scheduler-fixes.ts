import assert from 'assert';
import { RoutineEngine, calculateIntervalDuration, getCircadianSortKey } from '../src/lib/routine/routineEngine';
import { deduplicateRevisionTasks } from '../src/lib/storage/localStorageRepo';
import { FullDayRoutineBlock, StudentRoutineProfile, RevisionTask } from '../src/types';

console.log('\n======================================================');
console.log('STUDYOS EMERGENCY SCHEDULER & REVISION QUEUE TEST SUITE');
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

// BUG 1: Morning activities must NOT report false Bedtime Encroachment
test('Bug 1: Morning Maths block (05:45 - 06:45) with wake 05:30 reports NO bedtime encroachment', () => {
  const profile: StudentRoutineProfile = {
    wakeTime: '05:30',
    sleepTime: '22:00',
    difficultyWaking: false,
    studyPreferences: {
      targetDailyStudyMinutes: 120,
      mandatorySubject: {
        enabled: true,
        subject: 'Mathematics',
        dailyMinutes: 60,
      },
    },
  };

  const morningMathsBlock: FullDayRoutineBlock = {
    id: 'blk_maths',
    title: 'Mathematics (Mandatory Focus Block)',
    category: 'study',
    startTime: '05:45',
    endTime: '06:45',
    durationMinutes: 60,
    priority: 'critical',
    isLocked: false,
    recurringStatus: 'daily',
    source: 'ai_generated',
    completed: false,
  };

  const result = RoutineEngine.detectDetailedConflicts([morningMathsBlock], profile);
  const bedtimeIssue = result.issues.find((i) => i.title.toLowerCase().includes('bedtime encroachment'));
  assert.strictEqual(bedtimeIssue, undefined, 'Morning block must not trigger bedtime encroachment');
});

test('Bug 1: Morning Maths block (05:45 - 06:45) with wake 06:30 flags early wake overlap, NOT bedtime encroachment', () => {
  const profile: StudentRoutineProfile = {
    wakeTime: '06:30',
    sleepTime: '22:00',
    difficultyWaking: false,
  };

  const morningMathsBlock: FullDayRoutineBlock = {
    id: 'blk_maths',
    title: 'Mathematics (Mandatory Focus Block)',
    category: 'study',
    startTime: '05:45',
    endTime: '06:45',
    durationMinutes: 60,
    priority: 'critical',
    isLocked: false,
    recurringStatus: 'daily',
    source: 'ai_generated',
    completed: false,
  };

  const result = RoutineEngine.detectDetailedConflicts([morningMathsBlock], profile);
  const bedtimeIssue = result.issues.find((i) => i.title.toLowerCase().includes('bedtime encroachment'));
  assert.strictEqual(bedtimeIssue, undefined, 'Must not be bedtime encroachment');

  const earlyOverlap = result.issues.find((i) => i.title.toLowerCase().includes('early morning sleep overlap'));
  assert(earlyOverlap, 'Should flag early morning sleep overlap relative to wake target');
});

// BUG 2: Late-night revision extending past bedtime is repaired deterministically
test('Bug 2: Late-night revision is deterministically repaired before sleepTargetMins', () => {
  const profile: StudentRoutineProfile = {
    wakeTime: '06:00',
    sleepTime: '22:00',
    dinnerTime: '20:45',
    difficultyWaking: false,
    studyPreferences: {
      targetDailyStudyMinutes: 180,
    },
  };

  const blocks = RoutineEngine.generateFullDayRoutine(profile, '2026-09-15');
  const revisionBlock = blocks.find((b) => b.category === 'revision');
  assert(revisionBlock, 'Should have a revision block');

  const sleepBlock = blocks.find((b) => b.category === 'sleep');
  assert(sleepBlock, 'Should have a sleep block');

  const revEndKey = getCircadianSortKey(revisionBlock.endTime, profile.wakeTime, revisionBlock.dayOffset);
  const sleepStartKey = getCircadianSortKey(sleepBlock.startTime, profile.wakeTime, sleepBlock.dayOffset);

  assert(revEndKey <= sleepStartKey, `Revision end (${revisionBlock.endTime}) must conclude on or before sleep (${sleepBlock.startTime})`);
});

// BUG 2: If evening is packed, revision shifts to morning slot without compressing sleep
test('Bug 2: Revision shifts to morning slot when locked evening commitments prevent pre-bedtime revision', () => {
  const profile: StudentRoutineProfile = {
    wakeTime: '06:00',
    sleepTime: '22:00',
    difficultyWaking: false,
    tuition: [
      {
        id: 't_late',
        title: 'Late Night Board Coaching',
        type: 'tuition',
        days: ['Tuesday'],
        startTime: '19:45',
        endTime: '21:15',
        commuteBeforeMinutes: 0,
        commuteAfterMinutes: 15,
        recurrenceType: 'weekly',
      },
    ],
  };

  const blocks = RoutineEngine.generateFullDayRoutine(profile, '2026-09-15');
  const sleepBlock = blocks.find((b) => b.category === 'sleep');
  assert.strictEqual(sleepBlock?.startTime, '22:00', 'Sleep must remain uncompromised at 22:00');

  // Verify that any revision scheduled does not encroach on sleep
  const lateRevision = blocks.find(
    (b) => b.category === 'revision' && b.startTime >= '21:30' && b.endTime > '22:00'
  );
  assert.strictEqual(lateRevision, undefined, 'No late revision block should push past 22:00');

  const revisionBlock = blocks.find((b) => b.category === 'revision');
  assert(revisionBlock, 'Revision block must be present (morning or pre-sleep)');
});

// BUG 3: Duplicate revision tasks deduplicated and +1/+3/+7 idempotent
test('Bug 3: deduplicateRevisionTasks eliminates duplicates and preserves completed status', () => {
  const tasks: RevisionTask[] = [
    { id: '1', mistakeId: 'm1', subject: 'Mathematics', topic: 'Quadratic Equations', intervalDay: 1, dueDate: '2026-09-12', status: 'pending' },
    { id: '2', mistakeId: 'm1', subject: 'Mathematics', topic: 'Quadratic Equations', intervalDay: 1, dueDate: '2026-09-12', status: 'completed', completedAt: '2026-09-12' },
    { id: '3', mistakeId: 'm1', subject: 'Mathematics', topic: 'Quadratic Equations', intervalDay: 3, dueDate: '2026-09-14', status: 'pending' },
    { id: '4', mistakeId: 'm1', subject: 'Mathematics', topic: 'Quadratic Equations', intervalDay: 7, dueDate: '2026-09-18', status: 'pending' },
    { id: '5', mistakeId: 'm1', subject: 'Mathematics', topic: 'Quadratic Equations', intervalDay: 7, dueDate: '2026-09-18', status: 'pending' },
  ];

  const deduped = deduplicateRevisionTasks(tasks);
  assert.strictEqual(deduped.length, 3, 'Must reduce 5 tasks to 3 unique intervals (1, 3, 7)');
  const rev1 = deduped.find((t) => t.intervalDay === 1);
  assert.strictEqual(rev1?.status, 'completed', 'Completed task must be preserved');
});

// BUG 5: Sleep window collisions strictly detected
test('Bug 5: Sleep window collision flagged when block is scheduled during overnight sleep', () => {
  const profile: StudentRoutineProfile = {
    wakeTime: '06:00',
    sleepTime: '22:00',
    difficultyWaking: false,
  };

  const overnightStudyBlock: FullDayRoutineBlock = {
    id: 'blk_midnight',
    title: 'Late Night Physics Cramming',
    category: 'study',
    startTime: '23:00',
    endTime: '00:30',
    durationMinutes: 90,
    priority: 'high',
    isLocked: false,
    recurringStatus: 'daily',
    source: 'ai_generated',
    completed: false,
  };

  const result = RoutineEngine.detectDetailedConflicts([overnightStudyBlock], profile);
  const sleepCollision = result.issues.find((i) => i.title.toLowerCase().includes('sleep window collision'));
  assert(sleepCollision, 'Should flag sleep window collision for study block inside sleep window');
});

// BUG 5 & Time Calculation: Cross-midnight interval duration
test('Time Calculation: calculateIntervalDuration computes 23:50 -> 00:35 as 45 minutes', () => {
  const duration = calculateIntervalDuration('23:50', '00:35', true);
  assert.strictEqual(duration, 45, '23:50 to 00:35 must be exactly 45 minutes');
});

// BUG 6: summarizeWeekUnderstanding calculates dynamic weekly metrics without cached owner defaults
test('Bug 6: summarizeWeekUnderstanding dynamically calculates fixed commitments and free time', () => {
  const profile: StudentRoutineProfile = {
    wakeTime: '06:00',
    sleepTime: '22:00',
    difficultyWaking: false,
    school: {
      schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      sameEveryDay: true,
      startTime: '08:00',
      endTime: '14:00',
      commuteMinutesBefore: 30,
      commuteMinutesAfter: 30,
    },
    tuition: [
      {
        id: 't1',
        title: 'Maths Coaching',
        type: 'tuition',
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '16:00',
        endTime: '17:30',
        commuteBeforeMinutes: 15,
        commuteAfterMinutes: 15,
        recurrenceType: 'weekly',
      },
    ],
    studyPreferences: {
      targetDailyStudyMinutes: 150,
    },
  };

  const summary = RoutineEngine.summarizeWeekUnderstanding(profile);

  // Daily school: 6h duration + 1h commute = 7h. 5 days = 35 hours.
  // Tuition: 1.5h duration + 0.5h commute = 2h. 3 days = 6 hours.
  // Total fixed = 41 hours.
  assert.strictEqual(summary.fixedCommitmentsHours, 41, `Fixed commitments should be 41h, got ${summary.fixedCommitmentsHours}`);

  // Awake per day = 16h. Weekly awake = 112h. Free time = 112 - 41 = 71h.
  assert.strictEqual(summary.freeTimeHours, 71, `Free time should be 71h, got ${summary.freeTimeHours}`);

  // Study target = 150m daily
  assert.strictEqual(summary.studyTargetDailyMinutes, 150, 'Daily study target should match profile (150m)');
});

console.log('\n------------------------------------------------------');
console.log(`Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log('------------------------------------------------------\n');

if (passed !== total) process.exit(1);
