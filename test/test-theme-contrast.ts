import assert from 'assert';
import { calculateContrastRatio, validateContrast } from '../src/lib/theme/contrast';
import { THEME_CONFIGS } from '../src/lib/theme/ThemeContext';

console.log('\n======================================================');
console.log('STUDYOS THEME & WCAG CONTRAST VERIFICATION SUITE');
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

test('1. Pure Black (#000000) on Pure White (#FFFFFF) yields 21:1 ratio (AAA)', () => {
  const ratio = calculateContrastRatio('#000000', '#FFFFFF');
  assert.strictEqual(ratio, 21);
  const val = validateContrast('#000000', '#FFFFFF');
  assert.strictEqual(val.rating, 'AAA');
  assert.strictEqual(val.isNormalTextAA, true);
});

test('2. Unreadable yellow on white is detected as Fail and auto-corrected', () => {
  const val = validateContrast('#FFEA00', '#FFFFFF');
  assert.strictEqual(val.isNormalTextAA, false);
  assert.strictEqual(val.rating, 'Fail');
  assert(val.autoCorrectedText, 'Should provide auto-corrected readable text color');
});

test('3. Built-in Theme 1 (Focus Light) meets WCAG AA on text-to-card', () => {
  const theme = THEME_CONFIGS['focus-light'];
  const val = validateContrast(theme.previewColors.text, theme.previewColors.card);
  assert(val.isNormalTextAA, `Focus Light text contrast should pass AA (got ${val.ratio}:1)`);
});

test('4. Built-in Theme 2 (Athletic Performance) meets WCAG AA on text-to-card', () => {
  const theme = THEME_CONFIGS['athletic'];
  const val = validateContrast(theme.previewColors.text, theme.previewColors.card);
  assert(val.isNormalTextAA, `Athletic text contrast should pass AA (got ${val.ratio}:1)`);
});

test('5. Built-in Theme 3 (Tech / AI) meets WCAG AA on text-to-card', () => {
  const theme = THEME_CONFIGS['tech-ai'];
  const val = validateContrast(theme.previewColors.text, theme.previewColors.card);
  assert(val.isNormalTextAA, `Tech/AI text contrast should pass AA (got ${val.ratio}:1)`);
});

test('6. Built-in Theme 4 (Calm Study) meets WCAG AA on text-to-card', () => {
  const theme = THEME_CONFIGS['calm-study'];
  const val = validateContrast(theme.previewColors.text, theme.previewColors.card);
  assert(val.isNormalTextAA, `Calm Study text contrast should pass AA (got ${val.ratio}:1)`);
});

console.log('\n------------------------------------------------------');
console.log(`Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log('------------------------------------------------------\n');

if (passed !== total) process.exit(1);
