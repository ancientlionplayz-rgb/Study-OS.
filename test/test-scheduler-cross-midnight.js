/**
 * Test Suite: Scheduler Cross-Midnight & Circadian Chronology Repair
 */

const assert = require('assert');

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  const parts = clean.replace(/[APM\s]/g, '').split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function calculateIntervalDuration(startTime, endTime, allowCrossMidnight = true) {
  if (!startTime || !endTime) return 0;
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end > start) {
    return end - start;
  }
  if (end < start && allowCrossMidnight) {
    return (1440 - start) + end;
  }
  if (end === start) {
    return 0;
  }
  return 0;
}

function isCrossMidnight(startTime, endTime) {
  if (!startTime || !endTime) return false;
  return timeToMinutes(endTime) < timeToMinutes(startTime);
}

function getCircadianSortKey(timeStr, wakeTimeStr = '06:00', dayOffset) {
  const t = timeToMinutes(timeStr);
  const w = timeToMinutes(wakeTimeStr || '06:00');

  if (dayOffset === 1) {
    return 1440 + t;
  }
  if (dayOffset === -1) {
    return -1440 + t;
  }
  if (t < w) {
    return 1440 + t;
  }
  return t;
}

function sortBlocksCircadian(blocks, wakeTime = '06:00') {
  return [...blocks].sort((a, b) => {
    const keyA = getCircadianSortKey(a.startTime, wakeTime, a.dayOffset);
    const keyB = getCircadianSortKey(b.startTime, wakeTime, b.dayOffset);
    return keyA - keyB;
  });
}

console.log('--- TEST 1: Cross-Midnight Duration Calculation ---');
const dur1 = calculateIntervalDuration('23:50', '00:35');
console.log('23:50 -> 00:35 duration: ' + dur1 + ' minutes');
assert.strictEqual(dur1, 45, '23:50 to 00:35 must equal exactly 45 minutes');
assert.strictEqual(isCrossMidnight('23:50', '00:35'), true, 'Must detect cross-midnight');
console.log('✓ Cross-midnight duration calculation passed.');

console.log('--- TEST 2: Circadian Day Chronology Sorting ---');
const testBlocks = [
  { id: '1', title: 'Late Wind-down', startTime: '00:35', endTime: '01:05', durationMinutes: 30 },
  { id: '2', title: 'Wake Up', startTime: '05:30', endTime: '05:45', durationMinutes: 15 },
  { id: '3', title: 'School', startTime: '08:00', endTime: '14:00', durationMinutes: 360 },
  { id: '4', title: 'Dinner & Family Time', startTime: '23:50', endTime: '00:35', durationMinutes: 45 },
];

const sorted = sortBlocksCircadian(testBlocks, '05:30');
console.log('Circadian sequence:');
sorted.forEach((b) => console.log('  ' + b.startTime + ' - ' + b.endTime + ': ' + b.title));

assert.strictEqual(sorted[0].title, 'Wake Up', 'Wake Up (05:30) must be first');
assert.strictEqual(sorted[1].title, 'School', 'School (08:00) must be second');
assert.strictEqual(sorted[2].title, 'Dinner & Family Time', 'Dinner (23:50) must be third');
assert.strictEqual(sorted[3].title, 'Late Wind-down', 'Late Wind-down (00:35) must be fourth (past midnight overflow)');
console.log('✓ Circadian chronology sorting passed.');

console.log('--- TEST 3: Conflict Detector Zero False-Positive on Cross-Midnight ---');
function detectMockConflicts(blocks, wakeTime = '05:30') {
  const issues = [];
  const sorted = sortBlocksCircadian(blocks, wakeTime);

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    const start = timeToMinutes(curr.startTime);
    const end = timeToMinutes(curr.endTime);
    const duration = calculateIntervalDuration(curr.startTime, curr.endTime, true);

    if (start === end || duration <= 0) {
      issues.push({
        severity: 'critical',
        title: 'Invalid Block Duration: ' + curr.title,
      });
    }

    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      const currSortStart = getCircadianSortKey(curr.startTime, wakeTime, curr.dayOffset);
      const currSortEnd = currSortStart + duration;
      const nextSortStart = getCircadianSortKey(next.startTime, wakeTime, next.dayOffset);

      if (currSortEnd > nextSortStart) {
        issues.push({
          severity: 'warning',
          title: 'Schedule Overlap',
        });
      }
    }
  }
  return issues;
}

const conflicts = detectMockConflicts(testBlocks, '05:30');
console.log('Detected conflicts count: ' + conflicts.length);
assert.strictEqual(conflicts.length, 0, 'Must have zero conflict errors for non-overlapping sequential blocks');
console.log('✓ Conflict detector zero false-positive on cross-midnight passed.');

console.log('\n=============================================');
console.log(' ALL SCHEDULER CROSS-MIDNIGHT TESTS PASSED! ');
console.log('=============================================\n');
