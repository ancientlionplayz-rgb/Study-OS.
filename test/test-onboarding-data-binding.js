/**
 * Test Suite: Onboarding Data Binding, Clean Baseline & Cross-User Isolation
 */

const assert = require('assert');

// We will test RoutineEngine logic directly in Node environment
// Import compiled or transpile via ts-node / jiti / dynamic require
const { RoutineEngine } = require('../src/lib/routine/routineEngine');

console.log('\n======================================================');
console.log('STUDYOS ONBOARDING DATA BINDING VERIFICATION SUITE');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error('    Error:', err.message);
  }
}

// ----------------------------------------------------
// TEST CASE 1: Student A (Owner Preset - 3.5h, 60m Maths, Football Academy)
// ----------------------------------------------------
test('Student A: Full owner preset correctly binds 3.5h study, 60m Maths & Football Academy', () => {
  const profileA = {
    wakeTime: '05:45',
    sleepTime: '22:00',
    difficultyWaking: false,
    schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    schoolStartTime: '07:15',
    schoolEndTime: '15:50',
    commuteMinutes: 20,
    school: {
      schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      sameEveryDay: true,
      startTime: '07:15',
      endTime: '15:50',
      commuteMinutesBefore: 20,
      commuteMinutesAfter: 20,
    },
    breakfastTime: '07:00',
    lunchTime: '14:30',
    dinnerTime: '20:00',
    tuitionCommitments: [],
    tuition: [],
    sportsAndAcademy: [
      {
        id: 'sports_football',
        name: 'Weekend Football Academy',
        days: ['Saturday', 'Sunday'],
        startTime: '16:00',
        endTime: '19:30',
        travelMinutes: 20,
      },
    ],
    sports: [
      {
        id: 'sports_football',
        name: 'Weekend Football Academy',
        category: 'academy',
        recurrence: 'weekly',
        days: ['Saturday', 'Sunday'],
        startTime: '16:00',
        endTime: '19:30',
        commuteMinutesBefore: 20,
        commuteMinutesAfter: 20,
        isLocked: true,
      },
    ],
    studyPreferences: {
      targetDailyStudyMinutes: 210,
      mandatorySubject: {
        enabled: true,
        subject: 'Mathematics',
        dailyMinutes: 60,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      strongSubjects: ['Mathematics'],
      weakSubjects: ['Physics', 'Chemistry'],
    },
    subjects: {
      strong: ['Mathematics'],
      weak: ['Physics', 'Chemistry'],
      targetDailyStudyMinutes: 210,
    },
  };

  const weekA = RoutineEngine.summarizeWeekUnderstanding(profileA);
  assert.strictEqual(weekA.studyTargetDailyMinutes, 210, 'Study target must be 210m');
  assert.ok(weekA.mandatorySubjectSummary.includes('Mathematics (60m'), 'Mandatory subject must be 60m Mathematics');
  assert.ok(weekA.sportsSummary.includes('Weekend Football Academy'), 'Sports summary must contain Football Academy');

  // Generate weekday routine (Monday: 2026-09-14)
  const mondayBlocks = RoutineEngine.generateFullDayRoutine(profileA, '2026-09-14');
  const mondayMaths = mondayBlocks.find((b) => b.title.includes('Mathematics') && b.category === 'study');
  assert.ok(mondayMaths, 'Monday routine must contain mandatory Mathematics block');
  assert.strictEqual(mondayMaths.durationMinutes, 60, 'Maths block must be 60m');

  // Generate weekend routine (Saturday: 2026-09-19)
  const satBlocks = RoutineEngine.generateFullDayRoutine(profileA, '2026-09-19');
  const satFootball = satBlocks.find((b) => (b.category === 'sports' || b.category === 'academy') && b.title === 'Weekend Football Academy');
  assert.ok(satFootball, 'Saturday routine must contain Weekend Football Academy');
  assert.strictEqual(satFootball.startTime, '16:00', 'Football start time must be 16:00');
  assert.strictEqual(satFootball.endTime, '19:30', 'Football end time must be 19:30');
});

// ----------------------------------------------------
// TEST CASE 2: Student B (Clean Baseline - 2h study, NO Maths mandatory, NO sports)
// ----------------------------------------------------
test('Student B: Clean student with 2h target, NO mandatory subject, and NO sports has zero leakage', () => {
  const profileB = {
    wakeTime: '06:30',
    sleepTime: '22:30',
    difficultyWaking: false,
    schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    schoolStartTime: '08:00',
    schoolEndTime: '14:00',
    commuteMinutes: 15,
    school: {
      schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      sameEveryDay: true,
      startTime: '08:00',
      endTime: '14:00',
      commuteMinutesBefore: 15,
      commuteMinutesAfter: 15,
    },
    breakfastTime: '07:00',
    lunchTime: '14:30',
    dinnerTime: '20:00',
    tuitionCommitments: [
      {
        id: 't_chem',
        subject: 'Chemistry Tuition',
        days: ['Tuesday', 'Thursday'],
        startTime: '18:00',
        endTime: '19:30',
        travelMinutes: 10,
      },
    ],
    tuition: [
      {
        id: 't_chem',
        name: 'Chemistry Coaching',
        category: 'tuition',
        subject: 'Chemistry',
        recurrence: 'weekly',
        days: ['Tuesday', 'Thursday'],
        startTime: '18:00',
        endTime: '19:30',
        commuteMinutesBefore: 10,
        commuteMinutesAfter: 10,
        isLocked: true,
      },
    ],
    sportsAndAcademy: [],
    sports: [],
    studyPreferences: {
      targetDailyStudyMinutes: 120,
      mandatorySubject: undefined, // NONE
      strongSubjects: ['English Literature'],
      weakSubjects: ['Chemistry'],
    },
    subjects: {
      strong: ['English Literature'],
      weak: ['Chemistry'],
      targetDailyStudyMinutes: 120,
    },
  };

  const weekB = RoutineEngine.summarizeWeekUnderstanding(profileB);
  assert.strictEqual(weekB.studyTargetDailyMinutes, 120, 'Study target must be 120m (NOT 210m)');
  assert.strictEqual(weekB.mandatorySubjectSummary, 'Not configured', 'Mandatory subject must be "Not configured"');
  assert.strictEqual(weekB.sportsSummary, 'No sports or academy scheduled', 'Sports summary must be clean empty');
  assert.ok(!weekB.weekendScheduleNotes.toLowerCase().includes('football'), 'Weekend notes must NOT mention football');

  // Generate weekday routine (Monday: 2026-09-14)
  const mondayBlocks = RoutineEngine.generateFullDayRoutine(profileB, '2026-09-14');
  const hasForcedMaths = mondayBlocks.some((b) => b.title.includes('Mathematics (Mandatory Focus Block)'));
  assert.strictEqual(hasForcedMaths, false, 'Student B must NEVER have forced Mathematics focus block');

  const hasAnyFootball = mondayBlocks.some((b) => b.title.toLowerCase().includes('football'));
  assert.strictEqual(hasAnyFootball, false, 'Student B must NEVER have football blocks');

  // Generate Saturday routine (2026-09-19)
  const satBlocks = RoutineEngine.generateFullDayRoutine(profileB, '2026-09-19');
  const satFootball = satBlocks.some((b) => b.title.toLowerCase().includes('football') || b.title.toLowerCase().includes('academy'));
  assert.strictEqual(satFootball, false, 'Student B must have zero football academy blocks on Saturday');
});

// ----------------------------------------------------
// TEST CASE 3: Student C (Custom Cadence - 90m target, Physics 45m mandatory, Wed Athletics)
// ----------------------------------------------------
test('Student C: Custom student with 90m target, 45m Physics focus, and Wednesday Athletics binds correctly', () => {
  const profileC = {
    wakeTime: '06:00',
    sleepTime: '22:00',
    difficultyWaking: false,
    schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    schoolStartTime: '08:30',
    schoolEndTime: '13:30',
    commuteMinutes: 30,
    school: {
      schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      sameEveryDay: true,
      startTime: '08:30',
      endTime: '13:30',
      commuteMinutesBefore: 30,
      commuteMinutesAfter: 30,
    },
    breakfastTime: '07:30',
    lunchTime: '14:00',
    dinnerTime: '20:00',
    tuitionCommitments: [
      {
        id: 't_sat_math',
        subject: 'Maths Morning Coaching',
        days: ['Saturday'],
        startTime: '10:00',
        endTime: '11:30',
        travelMinutes: 10,
      },
    ],
    tuition: [
      {
        id: 't_sat_math',
        name: 'Maths Morning Coaching',
        category: 'tuition',
        subject: 'Mathematics',
        recurrence: 'weekly',
        days: ['Saturday'],
        startTime: '10:00',
        endTime: '11:30',
        commuteMinutesBefore: 10,
        commuteMinutesAfter: 10,
        isLocked: true,
      },
    ],
    sportsAndAcademy: [
      {
        id: 's_wed_track',
        name: 'Athletics & Track Practice',
        days: ['Wednesday'],
        startTime: '17:00',
        endTime: '18:30',
        travelMinutes: 15,
      },
    ],
    sports: [
      {
        id: 's_wed_track',
        name: 'Athletics & Track Practice',
        category: 'sports',
        recurrence: 'weekly',
        days: ['Wednesday'],
        startTime: '17:00',
        endTime: '18:30',
        commuteMinutesBefore: 15,
        commuteMinutesAfter: 15,
        isLocked: true,
      },
    ],
    studyPreferences: {
      targetDailyStudyMinutes: 90,
      mandatorySubject: {
        enabled: true,
        subject: 'Physics',
        dailyMinutes: 45,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      strongSubjects: ['History & Civics'],
      weakSubjects: ['Physics'],
    },
    subjects: {
      strong: ['History & Civics'],
      weak: ['Physics'],
      targetDailyStudyMinutes: 90,
    },
  };

  const weekC = RoutineEngine.summarizeWeekUnderstanding(profileC);
  assert.strictEqual(weekC.studyTargetDailyMinutes, 90, 'Study target must be 90m');
  assert.ok(weekC.mandatorySubjectSummary.includes('Physics (45m'), 'Mandatory subject must be 45m Physics');
  assert.ok(weekC.sportsSummary.includes('Athletics & Track Practice'), 'Sports summary must show Athletics');
  assert.ok(!weekC.sportsSummary.toLowerCase().includes('football'), 'Must NOT assume football');

  // Generate Wednesday routine (2026-09-16)
  const wedBlocks = RoutineEngine.generateFullDayRoutine(profileC, '2026-09-16');
  const wedTrack = wedBlocks.find((b) => (b.category === 'sports' || b.category === 'academy') && b.title === 'Athletics & Track Practice');
  assert.ok(wedTrack, 'Wednesday routine must contain Athletics & Track Practice');
  assert.strictEqual(wedTrack.startTime, '17:00', 'Track starts at 17:00');

  const wedPhysics = wedBlocks.find((b) => b.title.includes('Physics') && b.category === 'study');
  assert.ok(wedPhysics, 'Wednesday routine must contain Physics focus block');
  assert.strictEqual(wedPhysics.durationMinutes, 45, 'Physics duration must be 45m');

  // Verify Thursday routine (2026-09-17) does NOT contain Athletics
  const thuBlocks = RoutineEngine.generateFullDayRoutine(profileC, '2026-09-17');
  const thuTrack = thuBlocks.find((b) => (b.category === 'sports' || b.category === 'academy') && b.title === 'Athletics & Track Practice');
  assert.strictEqual(Boolean(thuTrack), false, 'Thursday must NOT have Athletics practice');
});

// ----------------------------------------------------
// TEST CASE 4: Storage Scoping & Clean Default Profile
// ----------------------------------------------------
test('Storage layer: Clean default profile has zero owner data and scoped keys isolate accounts', () => {
  const { LocalStorageRepository } = require('../src/lib/storage/localStorageRepo');
  const repo = new LocalStorageRepository();

  // Test cleanDefaultProfile
  repo.setActiveUserId('test_student_clean');
  const defaultProfile = repo.getStudentRoutineProfile();

  assert.strictEqual(defaultProfile.sportsAndAcademy.length, 0, 'Default profile must have 0 sports');
  assert.strictEqual(defaultProfile.sports.length, 0, 'Default profile sports array must be empty');
  assert.strictEqual(defaultProfile.tuitionCommitments.length, 0, 'Default profile must have 0 tuition');
  assert.strictEqual(defaultProfile.studyPreferences.targetDailyStudyMinutes, 120, 'Default study target must be 120m (not 210m)');
  assert.strictEqual(defaultProfile.studyPreferences.mandatorySubject, undefined, 'Default must have no mandatory subject');

  // Scoped keys check
  const keyA = repo.getUserScopedKey('studyos_routine_profile', 'user_a');
  const keyB = repo.getUserScopedKey('studyos_routine_profile', 'user_b');
  assert.strictEqual(keyA, 'studyos_routine_profile_user_a');
  assert.strictEqual(keyB, 'studyos_routine_profile_user_b');
  assert.notStrictEqual(keyA, keyB, 'Keys must be strictly isolated by userId');
});

console.log(`\n------------------------------------------------------`);
console.log(`Test Results: ${passedTests} / ${totalTests} passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('------------------------------------------------------\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
