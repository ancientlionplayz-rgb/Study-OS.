const assert = require('assert');
const path = require('path');
const { execFileSync } = require('child_process');

// Compile storage bundle
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
const { DEFAULT_SKILL_TRACKS } = require('./.storage-dist/src/lib/constants.js');

console.log('====================================================');
console.log(' RUNNING STUDYOS PERSONAL GROWTH MODULES TEST SUITE ');
console.log('====================================================\n');

const repo = new LocalStorageRepository();

// TEST 1: SKILL LAB TRACKS
console.log('--- TEST 1: 10 Skill Lab Tracks & Evidence Requirements ---');
const tracks = repo.getSkillTracks();
assert.strictEqual(tracks.length, 10, 'Should have exactly 10 innovation tracks');

const expectedTitles = [
  'Python',
  'AI Fundamentals',
  'AI Agents',
  'Robotics Theory',
  'Electronics',
  'AI Business',
  'AI Agency Building',
  'AI Product Building',
  'Quantum Physics',
  'Quantum Mechanics',
];

expectedTitles.forEach((title) => {
  const t = tracks.find((track) => track.title === title);
  assert(t, `Track "${title}" must exist`);
  assert(t.level, `Track "${title}" must have current level`);
  assert(t.currentTopic, `Track "${title}" must have current topic`);
  assert(Array.isArray(t.resourceList) && t.resourceList.length > 0, `Track "${title}" must have resources`);
  assert(t.practiceTask, `Track "${title}" must have practice task`);
  assert(t.miniProject, `Track "${title}" must have mini-project`);
  assert(t.expectedEvidenceType, `Track "${title}" must have expected evidence type`);
});
console.log('✓ All 10 Skill Lab tracks verified with topics, tasks, and mini-projects.');

// TEST 2: SKILL SESSION LOGGING & HOURS ACCUMULATION
console.log('\n--- TEST 2: Skill Session Logging & Output Evidence ---');
const pythonTrack = tracks.find((t) => t.id === 'sk-python');
const initialHours = pythonTrack.totalHoursInvested;

const session = repo.createSkillSession({
  trackId: 'sk-python',
  date: '2026-09-09',
  minutes: 60,
  summary: 'Built automated past paper question scraper',
  topicCovered: 'OOP & File I/O',
  evidenceType: 'Working Code',
  evidenceOutput: 'def parse_questions(): return [{"q": 1, "topic": "Matrices"}]',
  deliverable: 'github.com/student/scraper.py',
});

assert(session.id, 'Session must have unique ID');
assert.strictEqual(session.evidenceType, 'Working Code');
assert(session.evidenceOutput.includes('def parse_questions'), 'Evidence output must be stored');

const updatedTracks = repo.getSkillTracks();
const updatedPython = updatedTracks.find((t) => t.id === 'sk-python');
assert.strictEqual(updatedPython.totalHoursInvested, initialHours + 1.0, 'Track total hours must increase by 1 hour');
console.log('✓ Skill session logged with working code evidence and hours accumulated.');

// TEST 3: FOOTBALL LIGHTWEIGHT TRACKING & ACADEMY ATTENDANCE
console.log('\n--- TEST 3: Football Academy Attendance & Drill Mastery ---');
const football = repo.createFootballSession({
  date: '2026-09-12', // Saturday
  durationMinutes: 120,
  type: 'academy_training',
  isAcademyAttendance: true,
  drillsDone: ['Dribbling', 'Passing', 'Weak Foot', 'Stamina'],
  performanceRating: 5,
  staminaConditioningNotes: 'High aerobic work rate during match scrimmage',
  matchNotes: 'Scored 1 with left foot after half-space penetration',
});

assert.strictEqual(football.isAcademyAttendance, true, 'Academy attendance flag must be true');
assert(football.drillsDone.includes('Weak Foot'), 'Weak foot drill must be recorded');
assert(football.matchNotes, 'Match notes must be preserved');
console.log('✓ Football academy attendance, drills, and match notes verified.');

// TEST 4: SAFE CALISTHENICS & HABIT TRACKING (NO EXTREME DIETS)
console.log('\n--- TEST 4: Safe Calisthenics & Equipment-Gated Pulling ---');
const workout = repo.createWorkoutSession({
  date: '2026-09-09',
  type: 'Calisthenics',
  durationMinutes: 35,
  calisthenics: {
    pushupsProgression: 'Standard Push-ups',
    pushupsSets: 3,
    pushupsReps: 15,
    squatsSets: 3,
    squatsReps: 20,
    plankSets: 3,
    plankDurationSeconds: 60,
    mobilityRoutine: 'Thoracic rotations & hip flexors',
    mobilityMinutes: 10,
    safePulling: {
      equipmentAvailable: true,
      exerciseName: 'Dead Hang & Pull-ups',
      sets: 3,
      reps: 6,
    },
  },
  exercises: [
    { name: 'Standard Push-ups', sets: 3, reps: 15 },
    { name: 'Squats', sets: 3, reps: 20 },
    { name: 'Plank (60s)', sets: 3, reps: 1 },
    { name: 'Mobility', sets: 1, reps: 10 },
    { name: 'Safe Pulling: Dead Hang & Pull-ups', sets: 3, reps: 6, notes: 'Verified bar' },
  ],
  notes: 'Strict posture, zero neck strain.',
  safeHabitVerified: true,
});

assert.strictEqual(workout.safeHabitVerified, true);
assert.strictEqual(workout.calisthenics.pushupsProgression, 'Standard Push-ups');
assert.strictEqual(workout.calisthenics.safePulling.equipmentAvailable, true);
console.log('✓ Calisthenics verified with progression, mobility, and safety constraints.');

// TEST 5: READING 5-PAGE MINIMUM & ONE KEY IDEA
console.log('\n--- TEST 5: Reading 5+ Pages Minimum & Key Idea Distillation ---');
const read1 = repo.createReadingLog({
  date: '2026-09-09',
  bookTitle: 'Deep Work',
  author: 'Cal Newport',
  pagesRead: 12,
  targetMet: true,
  keyIdea: 'Attention residue decreases productivity when shifting between fragmented tasks.',
  takeaways: 'Protect uninterrupted morning blocks.',
});

assert(read1.pagesRead >= 5, 'Must meet 5 page minimum');
assert.strictEqual(read1.targetMet, true);
assert(read1.keyIdea.length > 10, 'One key idea must be captured');
console.log('✓ Reading log verified with 5-page minimum and key idea.');

// TEST 6: PROJECT BLOCK (DEFINED OUTCOME & STRICT TIME CAP)
console.log('\n--- TEST 6: Project Work Block (Defined Outcome & Time Cap) ---');
const projectItem = repo.createProjectWorkItem({
  title: 'Mistake Log JSON Exporter Script',
  category: 'LMS',
  definedOutcome: 'Clean CLI script exporting error logs in valid Selina format',
  timeCapMinutes: 45,
  actualMinutesSpent: 40,
  status: 'completed',
  dateCreated: '2026-09-09',
  completedDate: '2026-09-09',
  notes: 'Strictly capped at 45m; did not interfere with 3.5h study minimum.',
});

assert(projectItem.timeCapMinutes <= 60, 'Time cap must be strictly constrained to protect study time');
assert(projectItem.definedOutcome.length > 5, 'Must specify concrete deliverable outcome');
console.log('✓ Project block verified with defined outcome and strict time cap.');

// TEST 7: DAILY DISCIPLINE & IMMEDIATE RESTART PRINCIPLE
console.log('\n--- TEST 7: Daily Discipline Cadence & Anti-Shame Principle ---');
const discipline = repo.getDisciplineCheck('2026-09-09');
assert(discipline.sleepTargetHours >= 7, 'Healthy sleep target protected');
assert(discipline.immediateRestartNote.includes('Next block is the restart point'), 'Must have zero-shaming immediate restart principle');
console.log('✓ Discipline cadence verified with immediate recovery restart principle.');

console.log('\n====================================================');
console.log(' ALL 7 PERSONAL GROWTH MODULE TESTS PASSED!          ');
console.log('====================================================\n');
