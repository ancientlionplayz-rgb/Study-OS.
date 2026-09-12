const assert = require('assert');
const path = require('path');
const { execFileSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const tscPath = require.resolve('typescript/bin/tsc');

// Ensure source files are compiled to .storage-dist
execFileSync(process.execPath, [tscPath, '-p', path.join(__dirname, 'tsconfig.storage.json')], {
  cwd: projectRoot,
  stdio: 'inherit',
});

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

const { LocalStorageRepository } = require('./.storage-dist/src/lib/storage/localStorageRepo.js');

console.log('\n====================================================');
console.log(' RUNNING STUDYOS TRANSPARENT REWARDS ECONOMY TESTS ');
console.log('====================================================\n');

// Initialize repo
const repo = new LocalStorageRepository();

// --- TEST 1: Default Configurable Point Rules ---
console.log('--- TEST 1: Configurable Point Rules ---');
const defaultRules = repo.getPointRules();
assert.strictEqual(defaultRules.maths60mPoints, 2, 'Default maths 60m must be 2 pts');
assert.strictEqual(defaultRules.study35hPoints, 5, 'Default 3.5h study target must be 5 pts');
assert.strictEqual(defaultRules.reading5pPoints, 1, 'Default 5+ pages reading must be 1 pt');
assert.strictEqual(defaultRules.workoutPoints, 1, 'Default workout must be 1 pt');
assert.strictEqual(defaultRules.skillLabPoints, 1, 'Default skill lab must be 1 pt');
assert.strictEqual(defaultRules.sleepTargetPoints, 1, 'Default sleep target must be 1 pt');

// Test updating point rules
repo.updatePointRules({ maths60mPoints: 3, study35hPoints: 6 });
const updatedRules = repo.getPointRules();
assert.strictEqual(updatedRules.maths60mPoints, 3, 'Updated maths 60m should be 3 pts');
assert.strictEqual(updatedRules.study35hPoints, 6, 'Updated study target should be 6 pts');
assert.strictEqual(updatedRules.reading5pPoints, 1, 'Unmodified rules should remain unchanged');
// Restore default rules
repo.updatePointRules({ maths60mPoints: 2, study35hPoints: 5 });
console.log('✓ Configurable point rules verified.');

// --- TEST 2: Anti-Cheat Idempotency & Duplicate Prevention ---
console.log('\n--- TEST 2: Anti-Cheat Idempotency & Event Key Prevention ---');
const dateToday = '2026-09-09';
const event1 = repo.recordRewardEvent({
  eventKey: `${dateToday}_maths_60m`,
  date: dateToday,
  points: 2,
  reason: 'Completed 60m Mathematics session',
  category: 'maths_60m',
  source: 'verified_timer',
});
assert(event1 !== null, 'First event should be recorded');
assert.strictEqual(event1.points, 2);

// Attempt duplicate recording with same eventKey
const duplicateEvent = repo.recordRewardEvent({
  eventKey: `${dateToday}_maths_60m`,
  date: dateToday,
  points: 2,
  reason: 'Completed 60m Mathematics session duplicate attempt',
  category: 'maths_60m',
  source: 'verified_timer',
});
assert.strictEqual(duplicateEvent, null, 'Duplicate event with same eventKey MUST return null and be ignored');

const allEvents = repo.getRewardEvents();
const mathsEvents = allEvents.filter(e => e.eventKey === `${dateToday}_maths_60m`);
assert.strictEqual(mathsEvents.length, 1, 'Event ledger must strictly contain exactly 1 event for this key');
console.log('✓ Anti-cheat duplicate prevention and eventKey idempotency verified.');

// --- TEST 3: Action Triggers Award Correct Points ---
console.log('\n--- TEST 3: Automatic Action Triggers (Workouts, Reading, Skills) ---');
// Record a 5-page reading log
repo.createReadingLog({
  date: dateToday,
  bookTitle: 'Atomic Habits',
  author: 'James Clear',
  pagesRead: 10,
  targetMet: true,
  keyIdea: 'Make cue obvious, craving attractive, response easy, reward satisfying.',
});

// Record workout session
repo.createWorkoutSession({
  date: dateToday,
  type: 'Calisthenics',
  durationMinutes: 30,
  exercises: [{ name: 'Push-ups', sets: 3, reps: 15 }],
  notes: 'Clean standard push-ups and bodyweight squats',
  safeHabitVerified: true,
});

// Record skill session with output evidence
repo.createSkillSession({
  trackId: 'track_python',
  date: dateToday,
  minutes: 45,
  summary: 'Built Selina problem solver script',
  evidenceType: 'working_code',
  evidenceOutput: 'def solve(): return True',
});

// Record sleep target
repo.updateDisciplineCheck(dateToday, {
  sleepActualHours: 8.0,
});

const eventsAfterActions = repo.getRewardEvents();
const readingEvent = eventsAfterActions.find(e => e.eventKey === `${dateToday}_reading_5p`);
const workoutEvent = eventsAfterActions.find(e => e.eventKey === `${dateToday}_workout`);
const skillEvent = eventsAfterActions.find(e => e.eventKey === `${dateToday}_skill_lab`);
const sleepEvent = eventsAfterActions.find(e => e.eventKey === `${dateToday}_sleep_target`);

assert(readingEvent, 'Reading 5+ pages must trigger reward event');
assert.strictEqual(readingEvent.points, 1);
assert.strictEqual(readingEvent.source, 'self_reported');

assert(workoutEvent, 'Workout must trigger reward event');
assert.strictEqual(workoutEvent.points, 1);

assert(skillEvent, 'Skill lab evidence must trigger reward event');
assert.strictEqual(skillEvent.points, 1);

assert(sleepEvent, 'Sleep target met must trigger reward event');
assert.strictEqual(sleepEvent.points, 1);
console.log('✓ Action triggers verified with accurate points and honest source labeling.');

// --- TEST 4: Personal Reward Store & Parent Approval Disclaimer ---
console.log('\n--- TEST 4: Personal Reward Store & Redemption Ledger ---');
const rewardsList = repo.getPersonalRewards();
assert(rewardsList.length >= 4, 'Default reward store should have at least 4 items');

const gamingReward = rewardsList.find(r => r.category === 'Gaming');
const weekendPrivilege = rewardsList.find(r => r.category === 'Privilege');
assert(gamingReward, 'Gaming reward item must exist');
assert(weekendPrivilege, 'Weekend privilege reward item must exist');
assert.strictEqual(weekendPrivilege.requiresParentApproval, true, 'Privilege item must require parent approval');

// Check initial points balance
const currentPoints = repo.recomputeAllPoints();
assert(currentPoints >= 6, `Expected at least 6 points, got ${currentPoints}`);

// Redeem gaming reward
const redemption = repo.redeemPersonalReward(gamingReward.id, 'Claimed after completing morning Maths and study target');
assert.strictEqual(redemption.rewardId, gamingReward.id);
assert.strictEqual(redemption.pointsSpent, gamingReward.costPoints);
assert.strictEqual(redemption.requiresParentApproval, false);
assert.strictEqual(redemption.parentApprovalStatus, 'not_required');

// Verify points deducted cleanly in recompute
const pointsAfterRedeem = repo.recomputeAllPoints();
assert.strictEqual(pointsAfterRedeem, currentPoints - gamingReward.costPoints, 'Points must be cleanly deducted');

// Attempt to redeem when points are insufficient
assert.throws(() => {
  repo.redeemPersonalReward(weekendPrivilege.id); // 15 pts required, currently should have < 15
}, /Insufficient points/, 'Should reject redemption when points balance is insufficient');

console.log('✓ Personal reward store, redemption ledger, and parent approval flag verified.');

// --- TEST 5: Streaks & Resilient Rolling 7-Day Consistency ---
console.log('\n--- TEST 5: Streaks & Rolling 7-Day Consistency ---');
// Seed 3 consecutive days of maths sessions
const dates = ['2026-09-07', '2026-09-08', '2026-09-09'];
dates.forEach(d => {
  repo.createStudySession({
    date: d,
    subject: 'Mathematics',
    chapter: 'Selina Maths',
    topic: 'Rational numbers',
    plannedDurationMinutes: 60,
    actualDurationMinutes: 60,
    startTime: `${d}T06:00:00.000Z`,
    endTime: `${d}T07:00:00.000Z`,
    sessionType: 'morning_maths',
    confidenceBefore: 3,
    confidenceAfter: 5,
    questionsAttempted: 15,
    correct: 14,
    incorrect: 1,
    notes: 'Morning block',
    doubtsCreatedIds: [],
    mistakesCreatedIds: [],
    isMathsSession: true,
    isCompleted: true,
  });
});

const streaks = repo.getStreaksSummary();
assert(streaks.mathsStreak >= 3, `Maths streak should be >= 3, got ${streaks.mathsStreak}`);
assert(streaks.bestMathsStreak >= streaks.mathsStreak, 'Best streak should be >= current streak');
assert(streaks.rolling7DayConsistency > 0, 'Rolling 7-day consistency should be positive');
console.log('✓ Streaks calculation and rolling 7-day consistency verified.');

// --- TEST 6: Restrained Achievements ---
console.log('\n--- TEST 6: Meaningful & Restrained Achievements ---');
const achievements = repo.getAchievements();
assert.strictEqual(achievements.length, 6, 'There must be exactly 6 restrained achievements');

const expectedIds = [
  'ach-maths-7',
  'ach-study-10h',
  'ach-reading-7',
  'ach-questions-100',
  'ach-weekly-review-1',
  'ach-revisions-10',
];
expectedIds.forEach(id => {
  const found = achievements.find(a => a.id === id);
  assert(found, `Achievement ${id} must exist in achievements list`);
  assert(typeof found.unlocked === 'boolean', `Achievement ${id} unlocked must be boolean`);
  assert(typeof found.progress === 'number', `Achievement ${id} progress must be a number`);
  assert(found.maxProgress > 0, `Achievement ${id} maxProgress must be > 0`);
});
console.log('✓ All 6 restrained achievements verified without bloat or gambling mechanics.');

console.log('\n====================================================');
console.log(' ALL 6 REWARDS ECONOMY TESTS PASSED!               ');
console.log('====================================================\n');
