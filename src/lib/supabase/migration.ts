import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { repo } from '@/lib/storage/localStorageRepo';

export interface MigrationResult {
  success: boolean;
  importedCounts: {
    sessions: number;
    doubts: number;
    mistakes: number;
    revisions: number;
    skills: number;
    reading: number;
    workouts: number;
    football: number;
  };
  error?: string;
}

export async function migrateLocalStorageToSupabase(): Promise<MigrationResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      importedCounts: {
        sessions: 0,
        doubts: 0,
        mistakes: 0,
        revisions: 0,
        skills: 0,
        reading: 0,
        workouts: 0,
        football: 0,
      },
      error: 'Supabase is not configured. Please set your credentials in .env.local',
    };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      importedCounts: {
        sessions: 0,
        doubts: 0,
        mistakes: 0,
        revisions: 0,
        skills: 0,
        reading: 0,
        workouts: 0,
        football: 0,
      },
      error: 'User not authenticated. Please sign in before migrating local data.',
    };
  }

  try {
    const sessions = repo.getStudySessions();
    const doubts = repo.getDoubts();
    const mistakes = repo.getMistakes();
    const skillSessions = repo.getSkillSessions();
    const reading = repo.getReadingLogs();
    const workouts = repo.getWorkoutSessions();
    const football = repo.getFootballSessions();

    // 1. Migrate sessions
    if (sessions.length > 0) {
      const payload = sessions.map((s) => ({
        user_id: user.id,
        date: s.date,
        subject: s.subject,
        chapter: s.chapter,
        topic: s.topic,
        planned_duration_minutes: s.plannedDurationMinutes,
        actual_duration_minutes: s.actualDurationMinutes,
        start_time: s.startTime,
        end_time: s.endTime,
        session_type: s.sessionType,
        confidence_before: s.confidenceBefore,
        confidence_after: s.confidenceAfter,
        questions_attempted: s.questionsAttempted || 0,
        correct: s.correct || 0,
        incorrect: s.incorrect || 0,
        accuracy: s.accuracy || 0,
        notes: s.notes || null,
        is_maths_session: s.isMathsSession || false,
        is_completed: s.isCompleted ?? true,
      }));
      await supabase.from('study_sessions').insert(payload);
    }

    // 2. Migrate doubts
    if (doubts.length > 0) {
      const payload = doubts.map((d) => ({
        user_id: user.id,
        subject: d.subject,
        chapter_topic: d.chapter,
        doubt_description: d.description || d.question,
        urgency: d.priority?.toLowerCase() || 'medium',
        status: d.status?.toLowerCase() || 'unresolved',
        created_date: d.date,
        resolved_date: d.status === 'Solved' ? d.date : null,
        resolution_notes: d.solution || null,
      }));
      await supabase.from('doubts').insert(payload);
    }

    // 3. Migrate mistakes
    if (mistakes.length > 0) {
      const payload = mistakes.map((m) => ({
        user_id: user.id,
        subject: m.subject,
        chapter_topic: m.chapterTopic,
        original_question_context: m.originalQuestionContext,
        wrong_approach: m.wrongApproach,
        correct_method: m.correctMethod,
        reason: m.reason,
        error_category: m.errorCategory,
        is_repeated: m.isRepeated || false,
        created_date: m.createdDate,
      }));
      await supabase.from('mistakes').insert(payload);
    }

    // 4. Reading logs
    if (reading.length > 0) {
      const payload = reading.map((r) => ({
        user_id: user.id,
        date: r.date,
        book_title: r.bookTitle,
        author: r.author || null,
        pages_read: r.pagesRead,
        key_insight: r.keyIdea,
      }));
      await supabase.from('reading_logs').insert(payload);
    }

    // 5. Workouts
    if (workouts.length > 0) {
      const payload = workouts.map((w) => ({
        user_id: user.id,
        date: w.date,
        exercise_type: w.type,
        sets: w.exercises?.[0]?.sets || w.calisthenics?.pushupsSets || 0,
        reps: w.exercises?.[0]?.reps || w.calisthenics?.pushupsReps || 0,
        duration_minutes: w.durationMinutes,
        notes: w.notes || null,
      }));
      await supabase.from('workout_sessions').insert(payload);
    }

    // 6. Football
    if (football.length > 0) {
      const payload = football.map((f) => ({
        user_id: user.id,
        date: f.date,
        session_type: f.type,
        duration_minutes: f.durationMinutes,
        drills_worked: f.drillsDone || [],
        energy_rating: f.performanceRating || 3,
        notes: f.staminaConditioningNotes || f.matchNotes || null,
      }));
      await supabase.from('football_sessions').insert(payload);
    }

    return {
      success: true,
      importedCounts: {
        sessions: sessions.length,
        doubts: doubts.length,
        mistakes: mistakes.length,
        revisions: 0,
        skills: skillSessions.length,
        reading: reading.length,
        workouts: workouts.length,
        football: football.length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      importedCounts: {
        sessions: 0,
        doubts: 0,
        mistakes: 0,
        revisions: 0,
        skills: 0,
        reading: 0,
        workouts: 0,
        football: 0,
      },
      error: err?.message || 'Migration encountered an error.',
    };
  }
}
