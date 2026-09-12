const assert = require('assert');
const path = require('path');
const { execFileSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const tscPath = require.resolve('typescript/bin/tsc');

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

function makeSession(date, duration = 30) {
  return {
    date,
    subject: 'Mathematics',
    chapter: 'Algebra',
    topic: 'Linear equations',
    plannedDurationMinutes: 60,
    actualDurationMinutes: duration,
    startTime: `${date}T06:00:00.000Z`,
    endTime: `${date}T06:30:00.000Z`,
    sessionType: 'morning_maths',
    confidenceBefore: 2,
    confidenceAfter: 4,
    questionsAttempted: 10,
    correct: 8,
    incorrect: 2,
    notes: 'Source-backed repository test',
    doubtsCreatedIds: [],
    mistakesCreatedIds: [],
    isMathsSession: true,
    isCompleted: true,
  };
}

console.log('--- STORAGE TEST 1: Session progress remains consistent after edits and deletes ---');
const repo = new LocalStorageRepository();
const date = '2026-09-11';
const session = repo.createStudySession(makeSession(date));
assert.strictEqual(repo.getDailyPlan(date).blocks[0].completedMinutes, 30);
repo.updateStudySession(session.id, { actualDurationMinutes: 60 });
assert.strictEqual(repo.getDailyPlan(date).blocks[0].completedMinutes, 60);
assert.strictEqual(repo.getDailyPlan(date).blocks[0].isCompleted, true);
repo.deleteStudySession(session.id);
assert.strictEqual(repo.getDailyPlan(date).blocks[0].completedMinutes, 0);
assert.strictEqual(repo.getDailyPlan(date).blocks[0].isCompleted, false);
console.log('✓ Session progress edit/delete synchronization passed.');

console.log('--- STORAGE TEST 2: Exam override restores the exact original block ---');
const originalBlock = { ...repo.getDailyPlan(date).blocks[2] };
repo.addExamOverride(date, {
  examName: 'Chemistry Unit Test',
  subject: 'Chemistry',
  examDate: '2026-09-12',
  active: true,
});
const overriddenPlan = repo.getDailyPlan(date);
const override = overriddenPlan.examOverrides[0];
assert.strictEqual(overriddenPlan.blocks[2].subject, 'Chemistry');
repo.removeExamOverride(date, override.id);
const restoredBlock = repo.getDailyPlan(date).blocks[2];
assert.strictEqual(restoredBlock.subject, originalBlock.subject);
assert.strictEqual(restoredBlock.name, originalBlock.name);
console.log('✓ Exact exam override restoration passed.');

console.log('--- STORAGE TEST 3: Revision completion is idempotent ---');
repo.createMistake({
  subject: 'Mathematics',
  chapterTopic: 'Algebra',
  originalQuestionContext: 'Solve x + 2 = 5',
  wrongApproach: 'Subtracted incorrectly',
  correctMethod: 'Subtract 2 from both sides',
  reason: 'Rushed',
  errorCategory: 'Careless Mistake',
  isRepeated: false,
  createdDate: '2026-09-08',
});
const revision = repo.getRevisionsDue('2026-09-09')[0];
assert.ok(revision, 'Expected a due revision');
const pointsBefore = repo.getUserProfile().earnedPoints;
repo.completeRevision(revision.id);
repo.completeRevision(revision.id);
assert.strictEqual(repo.getUserProfile().earnedPoints, pointsBefore + 15);
console.log('✓ Revision idempotency passed.');

console.log('--- STORAGE TEST 4: Backup import rejects malformed top-level data ---');
assert.strictEqual(repo.importBackup('[]'), false);
assert.strictEqual(repo.importBackup('null'), false);
assert.strictEqual(repo.importBackup('{bad json'), false);
const backup = repo.exportBackup();
repo.resetToDefaults();
assert.strictEqual(repo.importBackup(backup), true);
assert.ok(repo.getMistakes().length > 0, 'Expected backup data to be restored');
console.log('✓ Backup validation and restore passed.');

console.log('\nALL 4 SOURCE-BACKED STORAGE REPOSITORY TESTS PASSED\n');
