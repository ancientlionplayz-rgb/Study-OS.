/**
 * StudyOS Sports & Athletics Engine
 *
 * Expands athletics beyond football to cover all major sports and custom disciplines.
 * Supports custom sport metrics, academy tracking, match logs, and full-day routine integration.
 */

import {
  SportDefinition,
  UserSport,
  SportSessionLog,
} from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const BUILTIN_SPORTS: SportDefinition[] = [
  {
    id: 'sport-football',
    name: 'Football',
    category: 'team',
    icon: 'Trophy',
    isBuiltin: true,
    defaultMetrics: ['Dribbling', 'Passing', 'Shooting', 'Weak Foot', 'Stamina', 'Pace'],
  },
  {
    id: 'sport-cricket',
    name: 'Cricket',
    category: 'team',
    icon: 'Trophy',
    isBuiltin: true,
    defaultMetrics: ['Batting', 'Bowling', 'Fielding', 'Catches', 'Fitness', 'Practice Balls'],
  },
  {
    id: 'sport-badminton',
    name: 'Badminton',
    category: 'racquet',
    icon: 'Flame',
    isBuiltin: true,
    defaultMetrics: ['Serve', 'Footwork', 'Smash', 'Drop Shot', 'Clear', 'Rallies'],
  },
  {
    id: 'sport-table-tennis',
    name: 'Table Tennis',
    category: 'racquet',
    icon: 'Flame',
    isBuiltin: true,
    defaultMetrics: ['Serve', 'Forehand Topspin', 'Backhand Push', 'Spin Variation', 'Rally Consistency'],
  },
  {
    id: 'sport-basketball',
    name: 'Basketball',
    category: 'team',
    icon: 'Trophy',
    isBuiltin: true,
    defaultMetrics: ['Shooting %', 'Dribbling', 'Rebounds', 'Defense', 'Free Throws', 'Stamina'],
  },
  {
    id: 'sport-volleyball',
    name: 'Volleyball',
    category: 'team',
    icon: 'Trophy',
    isBuiltin: true,
    defaultMetrics: ['Spike', 'Block', 'Serve', 'Dig', 'Setting', 'Jump Reach'],
  },
  {
    id: 'sport-tennis',
    name: 'Tennis',
    category: 'racquet',
    icon: 'Flame',
    isBuiltin: true,
    defaultMetrics: ['First Serve %', 'Forehand', 'Backhand', 'Volley', 'Movement', 'Return'],
  },
  {
    id: 'sport-swimming',
    name: 'Swimming',
    category: 'individual',
    icon: 'Waves',
    isBuiltin: true,
    defaultMetrics: ['50m Split', 'Stroke Rate', 'Distance (Laps)', 'Breath Control', 'Aerobic Pace'],
  },
  {
    id: 'sport-athletics',
    name: 'Athletics & Track',
    category: 'individual',
    icon: 'Footprints',
    isBuiltin: true,
    defaultMetrics: ['100m Sprint', '400m Pace', 'Starting Block Reaction', 'Stride Length', 'Endurance'],
  },
  {
    id: 'sport-running',
    name: 'Running / Cross-Country',
    category: 'individual',
    icon: 'Footprints',
    isBuiltin: true,
    defaultMetrics: ['Distance (km)', 'Pace (min/km)', 'Cadence (spm)', 'Heart Rate', 'Elevation'],
  },
  {
    id: 'sport-cycling',
    name: 'Cycling',
    category: 'individual',
    icon: 'Zap',
    isBuiltin: true,
    defaultMetrics: ['Distance (km)', 'Average Speed (km/h)', 'Cadence (rpm)', 'Power / Effort', 'Climbs'],
  },
  {
    id: 'sport-martial-arts',
    name: 'Martial Arts',
    category: 'combat',
    icon: 'Shield',
    isBuiltin: true,
    defaultMetrics: ['Forms / Kata', 'Sparring', 'Flexibility', 'Reaction Speed', 'Discipline'],
  },
  {
    id: 'sport-gym',
    name: 'Gym / Conditioning',
    category: 'fitness',
    icon: 'Dumbbell',
    isBuiltin: true,
    defaultMetrics: ['Core Strength', 'Pull-ups', 'Push-ups', 'Mobility', 'Recovery Rate'],
  },
];

const LOCAL_STORAGE_USER_SPORTS_KEY = 'studyos_user_sports';
const LOCAL_STORAGE_SPORT_SESSIONS_KEY = 'studyos_sport_sessions';

export class SportsService {
  public static getAllBuiltinSports(): SportDefinition[] {
    return BUILTIN_SPORTS;
  }

  public static getUserSports(): UserSport[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_USER_SPORTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    // Default initial football sport profile
    return [
      {
        id: 'us_default_football',
        userId: 'default_user',
        sportId: 'sport-football',
        name: 'Football',
        rolePosition: 'Midfield / Winger',
        level: 'Academy',
        academyClub: 'Weekend Football Academy',
        goals: 'Sharpen weak foot passing accuracy, improve sprint stamina for 90 minutes',
        trainingDays: ['Saturday', 'Sunday'],
        trainingTime: '16:00',
        skillsTracked: ['Dribbling', 'Passing', 'Shooting', 'Weak Foot', 'Stamina'],
        createdAt: new Date().toISOString(),
      },
    ];
  }

  public static async saveUserSport(sport: UserSport): Promise<UserSport> {
    const list = this.getUserSports();
    const idx = list.findIndex((s) => s.id === sport.id);
    if (idx >= 0) list[idx] = sport;
    else list.push(sport);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_SPORTS_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to save user sport', e);
      }
    }

    if (isSupabaseConfigured && supabase && sport.userId) {
      try {
        await supabase.from('user_sports').upsert({
          id: sport.id,
          user_id: sport.userId,
          sport_id: sport.sportId,
          name: sport.name,
          role_position: sport.rolePosition,
          level: sport.level,
          academy_club: sport.academyClub,
          goals: sport.goals,
          training_days: sport.trainingDays,
          training_time: sport.trainingTime,
          competitions: sport.competitions || [],
          skills_tracked: sport.skillsTracked,
          notes: sport.notes,
          created_at: sport.createdAt,
        });
      } catch (e) {
        console.warn('Supabase user_sports upsert fallback:', e);
      }
    }

    return sport;
  }

  public static getSportSessions(): SportSessionLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SPORT_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async logSportSession(session: SportSessionLog): Promise<SportSessionLog> {
    const all = this.getSportSessions();
    all.unshift(session);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_SPORT_SESSIONS_KEY, JSON.stringify(all));
      } catch (e) {
        console.error('Failed to save sport session', e);
      }
    }

    if (isSupabaseConfigured && supabase && session.userId) {
      try {
        await supabase.from('sport_sessions').insert({
          id: session.id,
          user_id: session.userId,
          sport_id: session.sportId,
          sport_name: session.sportName,
          date: session.date,
          start_time: session.startTime,
          end_time: session.endTime,
          duration_minutes: session.durationMinutes,
          training_type: session.trainingType,
          activities: session.activities,
          intensity: session.intensity,
          performance_rating: session.performanceRating,
          metrics: session.metrics || {},
          notes: session.notes,
          improvement: session.improvement,
          next_target: session.nextTarget,
          created_at: session.createdAt,
        });
      } catch (e) {
        console.warn('Supabase sport_sessions insert fallback:', e);
      }
    }

    return session;
  }
}
