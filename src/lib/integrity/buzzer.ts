/**
 * StudyOS Fair Test Integrity Audio Alert
 *
 * Emits a polite, non-shaming audio cue using the Web Audio API
 * when a student leaves or blurs the active test window.
 *
 * Principles:
 * - Local-only audio signal (never broadcasts to others).
 * - Gentle reminder frequency (480Hz → 440Hz soft decay).
 * - Safe fallback if AudioContext is blocked by browser autoplay policy.
 */

export class IntegrityBuzzer {
  private static audioCtx: AudioContext | null = null;

  private static getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Plays a polite 250ms dual-tone warning chime.
   */
  public static playWarningChime(volume = 0.2): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Smooth frequency glide from 520Hz down to 440Hz
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(Math.min(volume, 0.3), ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // Audio not supported or blocked by user gesture policy - fails gracefully
    }
  }
}
