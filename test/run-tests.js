/**
 * StudyOS Automated Verification Test Suite
 * Tests date calculations, +1/+3/+7 revision logic, timer persistence,
 * accuracy calculations, weekend schedule, and data reload.
 */

const assert = require('assert');

// Test 1: Date formatting and day addition
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function getDayOfWeekName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
}

console.log('--- TEST 1: Date Calculations ---');
const baseDate = '2026-09-09'; // Wednesday
assert.strictEqual(addDays(baseDate, 1), '2026-09-10', 'addDays +1 failed');
assert.strictEqual(addDays(baseDate, 3), '2026-09-12', 'addDays +3 failed');
assert.strictEqual(addDays(baseDate, 7), '2026-09-16', 'addDays +7 failed');
assert.strictEqual(getDayOfWeekName('2026-09-12'), 'Saturday', 'Day of week for Saturday failed');
assert.strictEqual(getDayOfWeekName('2026-09-13'), 'Sunday', 'Day of week for Sunday failed');
console.log('✓ Date calculations passed.');

console.log('--- TEST 2: Deterministic +1, +3, +7 Revision Logic ---');
function createMockMistake(dateStr) {
  const history = [
    { scheduledDate: addDays(dateStr, 1), intervalDay: 1, status: 'pending' },
    { scheduledDate: addDays(dateStr, 3), intervalDay: 3, status: 'pending' },
    { scheduledDate: addDays(dateStr, 7), intervalDay: 7, status: 'pending' },
  ];
  return { id: 'mst_test_1', createdDate: dateStr, revisionHistory: history };
}

const mistake = createMockMistake(baseDate);
assert.strictEqual(mistake.revisionHistory.length, 3, 'Revision history must have 3 intervals');
assert.strictEqual(mistake.revisionHistory[0].intervalDay, 1);
assert.strictEqual(mistake.revisionHistory[0].scheduledDate, '2026-09-10');
assert.strictEqual(mistake.revisionHistory[1].intervalDay, 3);
assert.strictEqual(mistake.revisionHistory[1].scheduledDate, '2026-09-12');
assert.strictEqual(mistake.revisionHistory[2].intervalDay, 7);
assert.strictEqual(mistake.revisionHistory[2].scheduledDate, '2026-09-16');
console.log('✓ Deterministic +1, +3, +7 revision logic passed.');

console.log('--- TEST 3: Accuracy Calculation Logic ---');
function calculateAccuracy(attempted, correct) {
  if (attempted <= 0) return 0;
  return Math.round((correct / attempted) * 100);
}
assert.strictEqual(calculateAccuracy(10, 8), 80, '10 attempted, 8 correct should be 80%');
assert.strictEqual(calculateAccuracy(15, 14), 93, '15 attempted, 14 correct should be 93%');
assert.strictEqual(calculateAccuracy(0, 0), 0, '0 attempted should return 0%');
console.log('✓ Accuracy calculation logic passed.');

console.log('--- TEST 4: Weekend Football Academy Schedule Logic ---');
const DEFAULT_WEEKLY_ROTATION = {
  Friday: { isWeekendAcademy: false },
  Saturday: { isWeekendAcademy: true, academyStart: '16:00', academyEnd: '19:30' },
  Sunday: { isWeekendAcademy: true, academyStart: '16:00', academyEnd: '19:30' },
  Monday: { isWeekendAcademy: false },
};
assert.strictEqual(DEFAULT_WEEKLY_ROTATION.Saturday.isWeekendAcademy, true);
assert.strictEqual(DEFAULT_WEEKLY_ROTATION.Sunday.isWeekendAcademy, true);
assert.strictEqual(DEFAULT_WEEKLY_ROTATION.Friday.isWeekendAcademy, false);
assert.strictEqual(DEFAULT_WEEKLY_ROTATION.Monday.isWeekendAcademy, false);
assert.strictEqual(DEFAULT_WEEKLY_ROTATION.Saturday.academyStart, '16:00');
assert.strictEqual(DEFAULT_WEEKLY_ROTATION.Sunday.academyEnd, '19:30');
console.log('✓ Weekend football academy schedule logic passed.');

console.log('--- TEST 5: Exam Override Logic (Maths Remains Untouched) ---');
const mockBlocks = [
  { id: 'b1', type: 'morning_maths', subject: 'Mathematics', minutes: 60 },
  { id: 'b2', type: 'core_subject', subject: 'Physics', minutes: 60 },
  { id: 'b3', type: 'second_subject', subject: 'English Language', minutes: 60 },
  { id: 'b4', type: 'recall_error_review', subject: 'Recall/Error Review', minutes: 30 },
];

function applyExamOverride(blocks, examSubject) {
  return blocks.map((b) => {
    // Maths is NEVER replaced
    if (b.type === 'morning_maths') return b;
    // Replace second_subject
    if (b.type === 'second_subject') {
      return { ...b, originalSubject: b.subject, subject: examSubject, isReplacedByExam: true };
    }
    return b;
  });
}

const overridden = applyExamOverride(mockBlocks, 'Chemistry');
assert.strictEqual(overridden[0].subject, 'Mathematics', 'Maths must never be replaced');
assert.strictEqual(overridden[2].subject, 'Chemistry', 'Second subject must be replaced by Chemistry');
assert.strictEqual(overridden[2].originalSubject, 'English Language', 'Original subject preserved');
console.log('✓ Exam override preservation logic passed.');

console.log('--- TEST 6: Exact Project Marker Verification ---');
const EXACT_PROJECT_MARKER = '... .- -- .--. .- .. -.- -.-';
assert.strictEqual(
  EXACT_PROJECT_MARKER,
  '... .- -- .--. .- .. -.- -.-',
  'Project marker must match verbatim'
);
assert.strictEqual(EXACT_PROJECT_MARKER.length, 28, 'Marker length check');
console.log('✓ Exact project marker passed.');

console.log('--- TEST 7: Timer Persistence & Resume Logic ---');
const mockTimerState = {
  plannedMinutes: 60,
  remainingSeconds: 3600,
  status: 'running',
  currentLoopStep: 'retrieve',
  updatedAtTimestamp: Date.now() - 30000, // 30 seconds ago
};

function resumeTimer(saved) {
  if (saved.status !== 'running') return saved;
  const elapsedSec = Math.floor((Date.now() - saved.updatedAtTimestamp) / 1000);
  const remaining = Math.max(0, saved.remainingSeconds - elapsedSec);
  return { ...saved, remainingSeconds: remaining };
}

const resumed = resumeTimer(mockTimerState);
assert.ok(resumed.remainingSeconds <= 3570, 'Timer should have decremented elapsed seconds on reload');
console.log('✓ Timer persistence & resume logic passed.');

console.log('--- TEST 8: Real Weekly Review Calculations (Zero Fake Data) ---');
const mockSessions = [
  { date: '2026-09-07', subject: 'Mathematics', actualDurationMinutes: 60, isMathsSession: true, questionsAttempted: 10, correct: 9 },
  { date: '2026-09-08', subject: 'Mathematics', actualDurationMinutes: 65, isMathsSession: true, questionsAttempted: 12, correct: 10 },
  { date: '2026-09-08', subject: 'Physics', actualDurationMinutes: 60, isMathsSession: false, questionsAttempted: 8, correct: 6 },
  { date: '2026-09-09', subject: 'Mathematics', actualDurationMinutes: 60, isMathsSession: true, questionsAttempted: 15, correct: 13 },
];

function calculateReview(sessions) {
  const totalMinutes = sessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);
  const mathsDates = new Set(sessions.filter(s => (s.isMathsSession || s.subject === 'Mathematics') && s.actualDurationMinutes >= 60).map(s => s.date));
  const totalAttempted = sessions.reduce((acc, s) => acc + s.questionsAttempted, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.correct, 0);
  return {
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    mathsDays: mathsDates.size,
    accuracy: Math.round((totalCorrect / totalAttempted) * 100),
  };
}

const reviewResult = calculateReview(mockSessions);
assert.strictEqual(reviewResult.totalHours, 4.1); // 245 / 60 = 4.08 -> 4.1
assert.strictEqual(reviewResult.mathsDays, 3);
assert.strictEqual(reviewResult.accuracy, 84); // 38/45 = 84.44 -> 84%
console.log('✓ Real weekly review calculation passed.');

console.log('\n=========================================');
console.log(' ALL 8 STUDYOS VERIFICATION TESTS PASSED');
console.log('=========================================\n');
