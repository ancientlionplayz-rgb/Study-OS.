const assert = require('assert');
const path = require('path');
const { execFileSync } = require('child_process');

console.log('--- Starting Tutorial & Help System Verification Tests ---');

const projectRoot = path.resolve(__dirname, '..');
const tscPath = require.resolve('typescript/bin/tsc');

// Compile storage code for node runtime
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

const repo = new LocalStorageRepository();

// Test 1: Fresh user has clean default tutorial state
console.log('Test 1: Default tutorial state initialization...');
const defaultState = repo.getTutorialState();
assert.strictEqual(defaultState.tutorialStarted, false, 'Default tutorialStarted should be false');
assert.strictEqual(defaultState.tutorialCompleted, false, 'Default tutorialCompleted should be false');
assert.strictEqual(defaultState.currentTutorialStep, 1, 'Default currentTutorialStep should be 1');
assert.strictEqual(defaultState.isTourActive, false, 'Default isTourActive should be false');
assert.deepStrictEqual(defaultState.dismissedFeatureHints, {}, 'Default dismissedFeatureHints should be empty');
console.log('✓ Test 1 passed: Default tutorial state is clean.');

// Test 2: Starting tour updates state
console.log('Test 2: Starting tour...');
const startedState = repo.updateTutorialState({
  tutorialStarted: true,
  isTourActive: true,
  currentTutorialStep: 1,
});
assert.strictEqual(startedState.tutorialStarted, true);
assert.strictEqual(startedState.isTourActive, true);
assert.strictEqual(startedState.currentTutorialStep, 1);
console.log('✓ Test 2 passed: Tour started correctly.');

// Test 3: Stepping sequentially through all 16 tour steps
console.log('Test 3: Stepping through steps 1 to 16...');
for (let step = 2; step <= 16; step++) {
  const updated = repo.updateTutorialState({ currentTutorialStep: step, isTourActive: true });
  assert.strictEqual(updated.currentTutorialStep, step, `Step should be ${step}`);
  assert.strictEqual(updated.isTourActive, true);
}
console.log('✓ Test 3 passed: Reached step 16 sequentially.');

// Test 4: Completing tour marks tutorialCompleted = true and isTourActive = false
console.log('Test 4: Completing tour...');
const completedState = repo.updateTutorialState({
  tutorialCompleted: true,
  isTourActive: false,
  currentTutorialStep: 16,
  lastDismissedAt: new Date().toISOString(),
});
assert.strictEqual(completedState.tutorialCompleted, true);
assert.strictEqual(completedState.isTourActive, false);
assert.ok(completedState.lastDismissedAt);
console.log('✓ Test 4 passed: Tour completed successfully.');

// Test 5: Replay / Reset tour from Settings resets progress
console.log('Test 5: Resetting tour from Settings...');
const resetState = repo.resetTutorialProgress();
assert.strictEqual(resetState.tutorialStarted, false);
assert.strictEqual(resetState.tutorialCompleted, false);
assert.strictEqual(resetState.currentTutorialStep, 1);
assert.strictEqual(resetState.isTourActive, false);
assert.deepStrictEqual(resetState.dismissedFeatureHints, {});
console.log('✓ Test 5 passed: Reset tour restored fresh defaults.');

// Test 6: Feature mini-tip dismissals
console.log('Test 6: Feature mini-tip dismissal persistence...');
repo.updateTutorialState({
  dismissedFeatureHints: { mistakes_intro: true, teams_intro: true },
});
const withHints = repo.getTutorialState();
assert.strictEqual(withHints.dismissedFeatureHints.mistakes_intro, true);
assert.strictEqual(withHints.dismissedFeatureHints.teams_intro, true);
assert.strictEqual(withHints.dismissedFeatureHints.ai_coach_intro, undefined);

// Adding another hint does not erase existing hints
repo.updateTutorialState({
  dismissedFeatureHints: { ai_coach_intro: true },
});
const combinedHints = repo.getTutorialState();
assert.strictEqual(combinedHints.dismissedFeatureHints.mistakes_intro, true);
assert.strictEqual(combinedHints.dismissedFeatureHints.teams_intro, true);
assert.strictEqual(combinedHints.dismissedFeatureHints.ai_coach_intro, true);
console.log('✓ Test 6 passed: Feature mini-tips persist and merge seamlessly.');

// Test 7: Skipping tour halfway
console.log('Test 7: Skipping tour halfway (e.g. from step 4)...');
repo.updateTutorialState({ currentTutorialStep: 4, isTourActive: true });
const skippedState = repo.updateTutorialState({
  tutorialCompleted: true,
  isTourActive: false,
  lastDismissedAt: new Date().toISOString(),
});
assert.strictEqual(skippedState.tutorialCompleted, true);
assert.strictEqual(skippedState.isTourActive, false);
console.log('✓ Test 7 passed: Skipping tour never traps user.');

console.log('\n--- ALL TUTORIAL & HELP SYSTEM TESTS PASSED SUCCESSFULLY ---');
