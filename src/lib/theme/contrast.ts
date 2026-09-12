/**
 * WCAG 2.1 Contrast Ratio Calculator & Theme Accessibility Validator
 * Enforces accessibility standards across StudyOS themes:
 * - AA Normal Text: 4.5:1 minimum ratio
 * - AA Large Text / UI Components: 3.0:1 minimum ratio
 * - AAA Enhanced Contrast: 7.0:1 minimum ratio
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const intVal = parseInt(clean, 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

function getChannelLuminance(channel: number): number {
  const norm = channel / 255;
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(hex: string): number {
  try {
    const { r, g, b } = hexToRgb(hex);
    return (
      0.2126 * getChannelLuminance(r) +
      0.7152 * getChannelLuminance(g) +
      0.0722 * getChannelLuminance(b)
    );
  } catch {
    return 0.5;
  }
}

export function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

export interface ContrastValidationResult {
  ratio: number;
  isNormalTextAA: boolean; // >= 4.5
  isLargeTextAA: boolean;  // >= 3.0
  isAAA: boolean;          // >= 7.0
  rating: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  autoCorrectedText?: string;
  feedback: string;
}

export function validateContrast(
  foregroundHex: string,
  backgroundHex: string
): ContrastValidationResult {
  const ratio = calculateContrastRatio(foregroundHex, backgroundHex);
  const isAAA = ratio >= 7.0;
  const isNormalTextAA = ratio >= 4.5;
  const isLargeTextAA = ratio >= 3.0;

  let rating: 'AAA' | 'AA' | 'AA Large' | 'Fail' = 'Fail';
  if (isAAA) rating = 'AAA';
  else if (isNormalTextAA) rating = 'AA';
  else if (isLargeTextAA) rating = 'AA Large';

  const bgLum = getRelativeLuminance(backgroundHex);
  const autoCorrectedText = bgLum > 0.5 ? '#0F172A' : '#F8FAFC';

  let feedback = `Contrast ratio is ${ratio}:1. Meets WCAG ${rating} standard.`;
  if (!isNormalTextAA) {
    feedback = `Contrast ratio is ${ratio}:1 (below 4.5:1). This text may be hard to read on this background.`;
  }

  return {
    ratio,
    isNormalTextAA,
    isLargeTextAA,
    isAAA,
    rating,
    autoCorrectedText: !isNormalTextAA ? autoCorrectedText : undefined,
    feedback,
  };
}
