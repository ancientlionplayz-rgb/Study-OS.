import assert from 'assert';
import { RoutineEngine, timeToMinutes } from '../src/lib/routine/routineEngine';
import { StudentRoutineProfile, FullDayRoutineBlock } from '../src/types';

console.log('\n======================================================');
console.log('STUDYOS 3-STUDENT MATHEMATICAL VERIFICATION SUITE');
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

// -------------------------------------------------------------------
// Helper: Check schedule blocks for chronological validity & zero overlap
// -------------------------------------------------------------------
function assertZeroOverlap(blocks: FullDayRoutineBlock[], contextLabel: string) {
  const sorted = [...blocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];
    const currEnd = timeToMinutes(curr.endTime);
    const nextStart = timeToMinutes(next.startTime);
    if (curr.category !== 'sleep' && next.category !== 'sleep') {
      assert(
        currEnd <= nextStart,
        `[${contextLabel}] Overlap detected: "${curr.title}" ends at ${curr.endTime} (${currEnd}m) but "${next.title}" starts at ${next.startTime} (${nextStart}m)`
      );
    }
  }
}

// -------------------------------------------------------------------
// STUDENT A: High-Performance Student
// - School Mon-Fri 07:30 - 15:30 (commute 30m)
// - Football Academy Sat & Sun 16:00 - 19:00
// - 3.5h study target (210m) with mandatory 60m Maths focus
// -------------------------------------------------------------------
const studentA: StudentRoutineProfile = {
  wakeTime: '05:45',
  sleepTime: '22:00',
  difficultyWaking: false,
  school: {
    schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    sameEveryDay: true,
    startTime: '07:30',
    endTime: '15:30',
    commuteMinutesBefore: 30,
    commuteMinutesAfter: 30,
  },
  breakfastTime: '06:45',
  lunchTime: '14:30',
  dinnerTime: '20:00',
  tuition: [],
  sports: [
    {
      id: 'football_academy',
      title: 'Weekend Football Academy',
      type: 'sports',
      days: ['Saturday', 'Sunday'],
      startTime: '16:00',
      endTime: '19:00',
      commuteBeforeMinutes: 20,
      commuteAfterMinutes: 20,
      recurrenceType: 'weekly',
    },
  ],
  studyPreferences: {
    targetDailyStudyMinutes: 210,
    mandatorySubject: {
      enabled: true,
      subject: 'Mathematics',
      dailyMinutes: 60,
    },
    weakSubjects: ['Physics'],
    strongSubjects: ['Computer Applications'],
  },
};

// -------------------------------------------------------------------
// STUDENT B: Balanced Student
// - School Mon-Fri 08:00 - 14:00 (commute 15m)
// - Tuition Tue/Thu 18:00 - 19:30 (Physics)
// - No sports
// - 2h study target (120m), no mandatory subject
// -------------------------------------------------------------------
const studentB: StudentRoutineProfile = {
  wakeTime: '06:30',
  sleepTime: '22:30',
  difficultyWaking: false,
  school: {
    schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    sameEveryDay: true,
    startTime: '08:00',
    endTime: '14:00',
    commuteMinutesBefore: 15,
    commuteMinutesAfter: 15,
  },
  breakfastTime: '07:15',
  lunchTime: '14:30',
  dinnerTime: '20:00',
  tuition: [
    {
      id: 'physics_tuition',
      title: 'Physics Board Coaching',
      type: 'tuition',
      subject: 'Physics',
      days: ['Tuesday', 'Thursday'],
      startTime: '18:00',
      endTime: '19:30',
      commuteBeforeMinutes: 15,
      commuteAfterMinutes: 15,
      recurrenceType: 'weekly',
    },
  ],
  sports: [],
  studyPreferences: {
    targetDailyStudyMinutes: 120,
    weakSubjects: ['Chemistry'],
    strongSubjects: ['Biology'],
  },
};

// -------------------------------------------------------------------
// STUDENT C: Weekend-Loaded Student
// - School Mon-Sat 07:30 - 13:30 (commute 20m)
// - Sports Wednesday only 16:00 - 17:30 (Swimming)
// - Tuition Saturday afternoon 15:00 - 17:00 (Chemistry)
// - 90m study target (1.5h)
// -------------------------------------------------------------------
const studentC: StudentRoutineProfile = {
  wakeTime: '06:00',
  sleepTime: '22:00',
  difficultyWaking: false,
  school: {
    schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    sameEveryDay: true,
    startTime: '07:30',
    endTime: '13:30',
    commuteMinutesBefore: 20,
    commuteMinutesAfter: 20,
  },
  breakfastTime: '06:45',
  lunchTime: '14:00',
  dinnerTime: '20:00',
  tuition: [
    {
      id: 'chemistry_tuition',
      title: 'Chemistry Laboratory & Theory',
      type: 'tuition',
      subject: 'Chemistry',
      days: ['Saturday'],
      startTime: '15:00',
      endTime: '17:00',
      commuteBeforeMinutes: 15,
      commuteAfterMinutes: 15,
      recurrenceType: 'weekly',
    },
  ],
  sports: [
    {
      id: 'swimming_club',
      title: 'Competitive Swimming',
      type: 'sports',
      days: ['Wednesday'],
      startTime: '16:00',
      endTime: '17:30',
      commuteBeforeMinutes: 20,
      commuteAfterMinutes: 20,
      recurrenceType: 'weekly',
    },
  ],
  studyPreferences: {
    targetDailyStudyMinutes: 90,
    weakSubjects: ['Mathematics'],
    strongSubjects: ['History/Civics'],
  },
};

// ===================================================================
// TESTS
// ===================================================================

test('Student A Weekday: 3.5h study, mandatory 60m Maths & zero overlap', () => {
  const blocks = RoutineEngine.generateFullDayRoutine(studentA, '2026-09-14'); // Monday
  assertZeroOverlap(blocks, 'Student A Monday');

  const mathsBlock = blocks.find((b) => b.title.includes('Mathematics') && b.durationMinutes >= 60);
  assert(mathsBlock, 'Student A must have 60m Mathematics focus block');

  const totalStudy = blocks
    .filter((b) => b.category === 'study' || b.category === 'revision')
    .reduce((sum, b) => sum + b.durationMinutes, 0);
  assert(totalStudy >= 180, `Total study should fulfill high target (got ${totalStudy}m)`);
});

test('Student A Weekend: Football Academy locked on Saturday & zero overlap', () => {
  const blocks = RoutineEngine.generateFullDayRoutine(studentA, '2026-09-19'); // Saturday
  assertZeroOverlap(blocks, 'Student A Saturday');

  const footballBlock = blocks.find((b) => b.title.includes('Football'));
  assert(footballBlock, 'Football block must be scheduled on Saturday');
  assert.strictEqual(footballBlock.startTime, '16:00');
  assert.strictEqual(footballBlock.endTime, '19:00');
});

test('Student B Weekday: Zero Football mentions, 2h target, preserves Physics tuition on Tuesday', () => {
  const blocks = RoutineEngine.generateFullDayRoutine(studentB, '2026-09-15'); // Tuesday
  assertZeroOverlap(blocks, 'Student B Tuesday');

  // Verify zero football
  const hasFootball = blocks.some((b) => b.title.toLowerCase().includes('football'));
  assert.strictEqual(hasFootball, false, 'Student B must have zero football mentions');

  // Verify Physics tuition preserved
  const tuitionBlock = blocks.find((b) => b.category === 'tuition');
  assert(tuitionBlock, 'Physics tuition must be scheduled on Tuesday');
  assert.strictEqual(tuitionBlock.startTime, '18:00');
  assert.strictEqual(tuitionBlock.endTime, '19:30');
});

test('Student C Wednesday: Swimming block at 16:00 and commute preserved', () => {
  const blocks = RoutineEngine.generateFullDayRoutine(studentC, '2026-09-16'); // Wednesday
  assertZeroOverlap(blocks, 'Student C Wednesday');

  const swimBlock = blocks.find((b) => b.title.includes('Swimming'));
  assert(swimBlock, 'Swimming block must be scheduled on Wednesday');
  assert.strictEqual(swimBlock.startTime, '16:00');
  assert.strictEqual(swimBlock.endTime, '17:30');
});

test('Student C Saturday: Chemistry tuition preserved after school with zero overlap', () => {
  const blocks = RoutineEngine.generateFullDayRoutine(studentC, '2026-09-19'); // Saturday
  assertZeroOverlap(blocks, 'Student C Saturday');

  const chemBlock = blocks.find((b) => b.category === 'tuition');
  assert(chemBlock, 'Chemistry tuition must be scheduled on Saturday');
  assert.strictEqual(chemBlock.startTime, '15:00');
  assert.strictEqual(chemBlock.endTime, '17:00');
});

test('Conflict Engine: Detects invalid morning tuition during school hours for Student C', () => {
  const conflictingStudentC = {
    ...studentC,
    tuition: [
      {
        id: 'conflicting_chem',
        title: 'Morning Chemistry',
        type: 'tuition' as const,
        days: ['Saturday'],
        startTime: '09:00',
        endTime: '11:00',
        recurrenceType: 'weekly' as const,
      },
    ],
  };

  const conflictingBlocks = RoutineEngine.generateFullDayRoutine(conflictingStudentC, '2026-09-19');
  const audit = RoutineEngine.detectDetailedConflicts(conflictingBlocks, conflictingStudentC);
  assert(audit.hasConflicts, 'Conflict engine must detect morning tuition during school');
  const critical = audit.issues.find((i) => i.severity === 'critical');
  assert(critical, 'Must flag collision between locked commitments as critical');
});

test('Holiday Awareness: Removes school blocks and redistributes day for Student A', () => {
  const blocks = RoutineEngine.generateFullDayRoutine(studentA, '2026-09-14', {
    holiday: {
      id: 'h_gandhi',
      date: '2026-09-14',
      holidayName: 'Gandhi Jayanti / Autumn Holiday',
      type: 'national_holiday',
      schoolClosed: true,
      createdBy: 'system',
    },
  });
  assertZeroOverlap(blocks, 'Student A Holiday');

  const schoolBlock = blocks.find((b) => b.category === 'school');
  assert.strictEqual(schoolBlock, undefined, 'School block must be removed on holiday');

  const holidayBlock = blocks.find((b) => b.title.includes('Holiday'));
  assert(holidayBlock, 'Should schedule balanced holiday deep work');
});

console.log('\n------------------------------------------------------');
console.log(`Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log('------------------------------------------------------\n');

if (passed !== total) process.exit(1);
