/**
 * StudyOS Creative & Performing Arts Engine
 *
 * Supports comprehensive tracking of artistic, musical, movement, and literary skills:
 * - Drawing, Painting, Digital Art, Photography, Design
 * - Dance (styles, choreography, flexibility, rhythm)
 * - Music / Instruments / Singing (pieces, techniques, rhythm, theory, performance)
 * - Acting, Theatre, Creative Writing, Public Speaking
 * - Session logging with proof-of-work output URL and full-day routine integration
 */

import {
  CreativeCategory,
  CreativeSkill,
  CreativeSessionLog,
} from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const CREATIVE_CATEGORIES: { id: CreativeCategory; label: string; icon: string; description: string }[] = [
  { id: 'Drawing', label: 'Drawing & Sketching', icon: 'PenTool', description: 'Pencil, charcoal, ink line work, proportions, and perspective.' },
  { id: 'Painting', label: 'Painting (Acrylic / Oil / Watercolor)', icon: 'Palette', description: 'Color theory, brushwork, glazing, and composition.' },
  { id: 'Digital Art', label: 'Digital Art & Illustration', icon: 'Sparkles', description: 'Tablet illustration, concept art, lighting, and rendering.' },
  { id: 'Photography', label: 'Photography & Visual Media', icon: 'Camera', description: 'Composition, exposure triangle, framing, and color grading.' },
  { id: 'Design', label: 'Graphic & UI Design', icon: 'Layout', description: 'Typography, visual hierarchy, branding, and interface layouts.' },
  { id: 'Dance', label: 'Dance & Movement', icon: 'Activity', description: 'Choreography, musicality, flexibility, footwork, and execution.' },
  { id: 'Instrument', label: 'Musical Instrument (Guitar / Piano / Drums)', icon: 'Music', description: 'Scales, chord progressions, timing, rhythm, and pieces.' },
  { id: 'Singing', label: 'Vocal / Singing Practice', icon: 'Mic', description: 'Pitch accuracy, breath support, vocal range, and performance.' },
  { id: 'Music Production', label: 'Music Production & Audio Engineering', icon: 'Sliders', description: 'DAW sequencing, mixing, synth sound design, and arrangement.' },
  { id: 'Acting', label: 'Acting & Dramatic Arts', icon: 'Smile', description: 'Monologues, character voice, emotional expression, and staging.' },
  { id: 'Theatre', label: 'Theatre & Stagecraft', icon: 'Film', description: 'Stage blocking, script analysis, and collaborative performance.' },
  { id: 'Writing', label: 'Creative & Longform Writing', icon: 'BookOpen', description: 'Story structure, essay composition, prose rhythm, and editing.' },
  { id: 'Public Speaking', label: 'Public Speaking & Debate', icon: 'Volume2', description: 'Rhetoric, vocal projection, pacing, and persuasive argumentation.' },
  { id: 'Other', label: 'Other Creative Discipline', icon: 'Plus', description: 'Custom artistic or expressive craft.' },
];

const LOCAL_STORAGE_CREATIVE_SKILLS_KEY = 'studyos_creative_skills';
const LOCAL_STORAGE_CREATIVE_SESSIONS_KEY = 'studyos_creative_sessions';

export class CreativeService {
  public static getCategories() {
    return CREATIVE_CATEGORIES;
  }

  public static getCreativeSkills(): CreativeSkill[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CREATIVE_SKILLS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    // Default initial creative skill
    return [
      {
        id: 'cskill_default_music',
        userId: 'default_user',
        category: 'Instrument',
        skillName: 'Acoustic & Classical Guitar',
        currentLevel: 'Intermediate',
        goal: 'Master fingerpicking arpeggios and fluid transition between 7th chords',
        weeklyTargetMinutes: 90,
        notes: 'Practice with a 60-80 bpm metronome before increasing speed.',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  public static async saveCreativeSkill(skill: CreativeSkill): Promise<CreativeSkill> {
    const list = this.getCreativeSkills();
    const idx = list.findIndex((s) => s.id === skill.id);
    if (idx >= 0) list[idx] = skill;
    else list.push(skill);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_CREATIVE_SKILLS_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to save creative skill', e);
      }
    }

    if (isSupabaseConfigured && supabase && skill.userId) {
      try {
        await supabase.from('creative_skills').upsert({
          id: skill.id,
          user_id: skill.userId,
          category: skill.category,
          skill_name: skill.skillName,
          current_level: skill.currentLevel,
          goal: skill.goal,
          weekly_target_minutes: skill.weeklyTargetMinutes,
          notes: skill.notes,
          created_at: skill.createdAt,
        });
      } catch (e) {
        console.warn('Supabase creative_skills upsert fallback:', e);
      }
    }

    return skill;
  }

  public static getCreativeSessions(): CreativeSessionLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CREATIVE_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async logCreativeSession(session: CreativeSessionLog): Promise<CreativeSessionLog> {
    const all = this.getCreativeSessions();
    all.unshift(session);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_CREATIVE_SESSIONS_KEY, JSON.stringify(all));
      } catch (e) {
        console.error('Failed to save creative session', e);
      }
    }

    if (isSupabaseConfigured && supabase && session.userId) {
      try {
        await supabase.from('creative_sessions').insert({
          id: session.id,
          user_id: session.userId,
          creative_skill_id: session.creativeSkillId,
          skill_name: session.skillName,
          category: session.category,
          date: session.date,
          duration_minutes: session.durationMinutes,
          piece_or_project: session.pieceOrProject,
          technique_practiced: session.techniquePracticed,
          rhythm_or_tempo: session.rhythmOrTempo,
          theory_notes: session.theoryNotes,
          completed_output_url: session.completedOutputUrl,
          notes: session.notes,
          next_target: session.nextTarget,
          created_at: session.createdAt,
        });
      } catch (e) {
        console.warn('Supabase creative_sessions insert fallback:', e);
      }
    }

    return session;
  }
}
