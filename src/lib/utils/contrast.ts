/**
 * WCAG 2.1 Contrast & Color Utilities
 * Calculates luminance, contrast ratio, and validates accessibility thresholds (AA >= 4.5:1, AAA >= 7:1).
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return Number(((brighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export interface ContrastValidationResult {
  ratio: number;
  isNormalTextAA: boolean;
  isLargeTextAA: boolean;
  isAAA: boolean;
  grade: 'AAA' | 'AA' | 'Fail';
}

export function validateContrast(foregroundHex: string, backgroundHex: string): ContrastValidationResult {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);
  const isNormalTextAA = ratio >= 4.5;
  const isLargeTextAA = ratio >= 3.0;
  const isAAA = ratio >= 7.0;

  let grade: 'AAA' | 'AA' | 'Fail' = 'Fail';
  if (isAAA) grade = 'AAA';
  else if (isNormalTextAA) grade = 'AA';

  return {
    ratio,
    isNormalTextAA,
    isLargeTextAA,
    isAAA,
    grade,
  };
}
