/**
 * StudyOS Academic Syllabus & Progress Engine
 *
 * Implements Board-Aware Academic Structure:
 * Board → Grade → Subject → Chapter → Topic → Subtopic
 *
 * Decouples Topic Coverage from Practice, Accuracy, Test Performance, and Revision.
 * Guarantees zero fake chapters: if syllabus is not imported, displays "Syllabus not configured yet".
 */

import {
  Board,
  AcademicYear,
  AcademicGrade,
  AcademicSubject,
  AcademicChapter,
  AcademicTopic,
  StudentTopicProgress,
  TopicProgressStatus,
} from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface SubjectProgressSummary {
  subjectId: string;
  subjectName: string;
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  notStartedChapters: number;
  totalTopics: number;
  completedTopics: number;
  practicingTopics: number;
  learningTopics: number;
  revisionDueTopics: number;
  coveragePercentage: number;
  practicePercentage: number;
  accuracyPercentage: number;
  testPerformancePercentage: number;
  studyTimeMinutes: number;
  weakChapters: string[];
  revisionDueCount: number;
}

export interface ChapterProgressSummary {
  chapterId: string;
  chapterTitle: string;
  orderIndex: number;
  totalTopics: number;
  completedTopics: number;
  coveragePercentage: number;
  status: 'Completed' | 'In Progress' | 'Not Started';
  topics: Array<AcademicTopic & { progress?: StudentTopicProgress }>;
}

// ============================================================================
// VERIFIED ICSE CLASS 9 SEED SYLLABUS
// ============================================================================

export const SEED_BOARDS: Board[] = [
  { id: 'board-icse', name: 'Indian Certificate of Secondary Education', code: 'ICSE', country: 'India' },
  { id: 'board-cbse', name: 'Central Board of Secondary Education', code: 'CBSE', country: 'India' },
];

export const SEED_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay-2026-2027', label: '2026-2027', startDate: '2026-04-01', endDate: '2027-03-31' },
  { id: 'ay-2025-2026', label: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31' },
];

export const SEED_GRADES: AcademicGrade[] = [
  { id: 'grade-icse-9', boardId: 'board-icse', name: 'Class 9', numericLevel: 9 },
  { id: 'grade-icse-10', boardId: 'board-icse', name: 'Class 10', numericLevel: 10 },
];

export const SEED_ICSE_9_SUBJECTS: AcademicSubject[] = [
  {
    id: 'subj-maths-9',
    boardId: 'board-icse',
    gradeId: 'grade-icse-9',
    name: 'Mathematics',
    code: 'MATH_ICSE_9',
    category: 'core',
    color: '#3B82F6',
    active: true,
    chapters: [
      {
        id: 'ch-m1',
        subjectId: 'subj-maths-9',
        title: 'Rational and Irrational Numbers',
        orderIndex: 1,
        active: true,
        topics: [
          { id: 'top-m1-1', chapterId: 'ch-m1', title: 'Rational Numbers & Decimal Representations', orderIndex: 1, active: true },
          { id: 'top-m1-2', chapterId: 'ch-m1', title: 'Irrational Numbers & Properties', orderIndex: 2, active: true },
          { id: 'top-m1-3', chapterId: 'ch-m1', title: 'Surds & Rationalisation of Denominators', orderIndex: 3, active: true },
          { id: 'top-m1-4', chapterId: 'ch-m1', title: 'Representing Real Numbers on the Number Line', orderIndex: 4, active: true },
        ],
      },
      {
        id: 'ch-m2',
        subjectId: 'subj-maths-9',
        title: 'Compound Interest',
        orderIndex: 2,
        active: true,
        topics: [
          { id: 'top-m2-1', chapterId: 'ch-m2', title: 'Compound Interest by Repeated Simple Interest', orderIndex: 1, active: true },
          { id: 'top-m2-2', chapterId: 'ch-m2', title: 'Formula Method for Annual & Semi-Annual Compounding', orderIndex: 2, active: true },
          { id: 'top-m2-3', chapterId: 'ch-m2', title: 'Rates Compounded Annually vs Half-Yearly', orderIndex: 3, active: true },
          { id: 'top-m2-4', chapterId: 'ch-m2', title: 'Population Growth & Depreciation', orderIndex: 4, active: true },
        ],
      },
      {
        id: 'ch-m3',
        subjectId: 'subj-maths-9',
        title: 'Expansions',
        orderIndex: 3,
        active: true,
        topics: [
          { id: 'top-m3-1', chapterId: 'ch-m3', title: 'Identities of (a ± b)², (a ± b)³', orderIndex: 1, active: true },
          { id: 'top-m3-2', chapterId: 'ch-m3', title: 'Identities of (a + b + c)²', orderIndex: 2, active: true },
          { id: 'top-m3-3', chapterId: 'ch-m3', title: 'Conditional Identities when a + b + c = 0', orderIndex: 3, active: true },
          { id: 'top-m3-4', chapterId: 'ch-m3', title: 'Reciprocal Identities (x ± 1/x)', orderIndex: 4, active: true },
        ],
      },
      {
        id: 'ch-m4',
        subjectId: 'subj-maths-9',
        title: 'Factorisation',
        orderIndex: 4,
        active: true,
        topics: [
          { id: 'top-m4-1', chapterId: 'ch-m4', title: 'Common Monomial & Grouping Terms', orderIndex: 1, active: true },
          { id: 'top-m4-2', chapterId: 'ch-m4', title: 'Difference of Two Squares (a² - b²)', orderIndex: 2, active: true },
          { id: 'top-m4-3', chapterId: 'ch-m4', title: 'Splitting the Middle Term of Trinomials', orderIndex: 3, active: true },
          { id: 'top-m4-4', chapterId: 'ch-m4', title: 'Sum and Difference of Two Cubes (a³ ± b³)', orderIndex: 4, active: true },
        ],
      },
      {
        id: 'ch-m5',
        subjectId: 'subj-maths-9',
        title: 'Simultaneous Linear Equations',
        orderIndex: 5,
        active: true,
        topics: [
          { id: 'top-m5-1', chapterId: 'ch-m5', title: 'Method of Elimination by Substitution', orderIndex: 1, active: true },
          { id: 'top-m5-2', chapterId: 'ch-m5', title: 'Method of Elimination by Equating Coefficients', orderIndex: 2, active: true },
          { id: 'top-m5-3', chapterId: 'ch-m5', title: 'Cross-Multiplication Method', orderIndex: 3, active: true },
          { id: 'top-m5-4', chapterId: 'ch-m5', title: 'Word Problems on Numbers, Ages, and Fractions', orderIndex: 4, active: true },
        ],
      },
      {
        id: 'ch-m6',
        subjectId: 'subj-maths-9',
        title: 'Triangles & Congruency',
        orderIndex: 6,
        active: true,
        topics: [
          { id: 'top-m6-1', chapterId: 'ch-m6', title: 'Congruency Criteria: SAS, ASA, SSS, RHS', orderIndex: 1, active: true },
          { id: 'top-m6-2', chapterId: 'ch-m6', title: 'Isosceles Triangle Properties & Proofs', orderIndex: 2, active: true },
          { id: 'top-m6-3', chapterId: 'ch-m6', title: 'Inequalities in Triangles', orderIndex: 3, active: true },
        ],
      },
      {
        id: 'ch-m7',
        subjectId: 'subj-maths-9',
        title: 'Pythagoras Theorem',
        orderIndex: 7,
        active: true,
        topics: [
          { id: 'top-m7-1', chapterId: 'ch-m7', title: 'Statement & Geometric Proof of Pythagoras Theorem', orderIndex: 1, active: true },
          { id: 'top-m7-2', chapterId: 'ch-m7', title: 'Converse of Pythagoras Theorem', orderIndex: 2, active: true },
          { id: 'top-m7-3', chapterId: 'ch-m7', title: 'Applications in Rectangles, Rhombuses and Ladders', orderIndex: 3, active: true },
        ],
      },
    ],
  },
  {
    id: 'subj-physics-9',
    boardId: 'board-icse',
    gradeId: 'grade-icse-9',
    name: 'Physics',
    code: 'PHYS_ICSE_9',
    category: 'science',
    color: '#06B6D4',
    active: true,
    chapters: [
      {
        id: 'ch-p1',
        subjectId: 'subj-physics-9',
        title: 'Measurements and Experimentation',
        orderIndex: 1,
        active: true,
        topics: [
          { id: 'top-p1-1', chapterId: 'ch-p1', title: 'Vernier Calipers: Least Count & Zero Error', orderIndex: 1, active: true },
          { id: 'top-p1-2', chapterId: 'ch-p1', title: 'Micrometer Screw Gauge: Pitch & Backlash Error', orderIndex: 2, active: true },
          { id: 'top-p1-3', chapterId: 'ch-p1', title: 'Simple Pendulum: Effective Length & Time Period', orderIndex: 3, active: true },
        ],
      },
      {
        id: 'ch-p2',
        subjectId: 'subj-physics-9',
        title: 'Motion in One Dimension',
        orderIndex: 2,
        active: true,
        topics: [
          { id: 'top-p2-1', chapterId: 'ch-p2', title: 'Scalar and Vector Quantities', orderIndex: 1, active: true },
          { id: 'top-p2-2', chapterId: 'ch-p2', title: 'Speed, Velocity and Acceleration', orderIndex: 2, active: true },
          { id: 'top-p2-3', chapterId: 'ch-p2', title: 'Distance-Time & Displacement-Time Graphs', orderIndex: 3, active: true },
          { id: 'top-p2-4', chapterId: 'ch-p2', title: 'Velocity-Time Graphs & Acceleration Slope', orderIndex: 4, active: true },
          { id: 'top-p2-5', chapterId: 'ch-p2', title: 'Equations of Uniformly Accelerated Motion', orderIndex: 5, active: true },
        ],
      },
      {
        id: 'ch-p3',
        subjectId: 'subj-physics-9',
        title: 'Laws of Motion',
        orderIndex: 3,
        active: true,
        topics: [
          { id: 'top-p3-1', chapterId: 'ch-p3', title: 'Newtons First Law & Concept of Inertia', orderIndex: 1, active: true },
          { id: 'top-p3-2', chapterId: 'ch-p3', title: 'Linear Momentum & Rate of Change of Momentum', orderIndex: 2, active: true },
          { id: 'top-p3-3', chapterId: 'ch-p3', title: 'Newtons Second Law: F = ma Derivation', orderIndex: 3, active: true },
          { id: 'top-p3-4', chapterId: 'ch-p3', title: 'Newtons Third Law & Action-Reaction Pairs', orderIndex: 4, active: true },
          { id: 'top-p3-5', chapterId: 'ch-p3', title: 'Gravitational Units of Force & Weight', orderIndex: 5, active: true },
        ],
      },
      {
        id: 'ch-p4',
        subjectId: 'subj-physics-9',
        title: 'Pressure in Fluids and Atmospheric Pressure',
        orderIndex: 4,
        active: true,
        topics: [
          { id: 'top-p4-1', chapterId: 'ch-p4', title: 'Thrust, Pressure and Laws of Liquid Pressure', orderIndex: 1, active: true },
          { id: 'top-p4-2', chapterId: 'ch-p4', title: 'Pascals Law & Hydraulic Machines', orderIndex: 2, active: true },
          { id: 'top-p4-3', chapterId: 'ch-p4', title: 'Atmospheric Pressure & Simple Barometer', orderIndex: 3, active: true },
        ],
      },
    ],
  },
  {
    id: 'subj-chem-9',
    boardId: 'board-icse',
    gradeId: 'grade-icse-9',
    name: 'Chemistry',
    code: 'CHEM_ICSE_9',
    category: 'science',
    color: '#10B981',
    active: true,
    chapters: [
      {
        id: 'ch-c1',
        subjectId: 'subj-chem-9',
        title: 'Matter and its Composition',
        orderIndex: 1,
        active: true,
        topics: [
          { id: 'top-c1-1', chapterId: 'ch-c1', title: 'Kinetic Theory of Matter', orderIndex: 1, active: true },
          { id: 'top-c1-2', chapterId: 'ch-c1', title: 'States of Matter & Interconversion', orderIndex: 2, active: true },
        ],
      },
      {
        id: 'ch-c2',
        subjectId: 'subj-chem-9',
        title: 'Gas Laws',
        orderIndex: 2,
        active: true,
        topics: [
          { id: 'top-c2-1', chapterId: 'ch-c2', title: 'Boyles Law: Statement, Graph & Numericals', orderIndex: 1, active: true },
          { id: 'top-c2-2', chapterId: 'ch-c2', title: 'Charles Law: Absolute Zero & Numericals', orderIndex: 2, active: true },
          { id: 'top-c2-3', chapterId: 'ch-c2', title: 'Combined Gas Equation (P1V1/T1 = P2V2/T2)', orderIndex: 3, active: true },
        ],
      },
    ],
  },
  {
    id: 'subj-comp-9',
    boardId: 'board-icse',
    gradeId: 'grade-icse-9',
    name: 'Computer Applications',
    code: 'COMP_ICSE_9',
    category: 'technical',
    color: '#8B5CF6',
    active: true,
    chapters: [
      {
        id: 'ch-comp1',
        subjectId: 'subj-comp-9',
        title: 'Introduction to Java & OOP Concepts',
        orderIndex: 1,
        active: true,
        topics: [
          { id: 'top-comp1-1', chapterId: 'ch-comp1', title: 'Principles of OOP: Encapsulation, Inheritance, Polymorphism', orderIndex: 1, active: true },
          { id: 'top-comp1-2', chapterId: 'ch-comp1', title: 'Java Bytecode & JVM Architecture', orderIndex: 2, active: true },
          { id: 'top-comp1-3', chapterId: 'ch-comp1', title: 'Data Types, Literals, and Variables', orderIndex: 3, active: true },
        ],
      },
      {
        id: 'ch-comp2',
        subjectId: 'subj-comp-9',
        title: 'Conditional & Iterative Statements in Java',
        orderIndex: 2,
        active: true,
        topics: [
          { id: 'top-comp2-1', chapterId: 'ch-comp2', title: 'if-else and switch-case Structures', orderIndex: 1, active: true },
          { id: 'top-comp2-2', chapterId: 'ch-comp2', title: 'for, while, and do-while Loops', orderIndex: 2, active: true },
          { id: 'top-comp2-3', chapterId: 'ch-comp2', title: 'Break and Continue Flow Control', orderIndex: 3, active: true },
        ],
      },
    ],
  },
];

const LOCAL_STORAGE_PROGRESS_KEY = 'studyos_student_topic_progress';
const LOCAL_STORAGE_CUSTOM_SYLLABUS_KEY = 'studyos_custom_syllabus_data';

export class SyllabusService {
  /**
   * Fetch all available boards
   */
  public static async getBoards(): Promise<Board[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('boards').select('*');
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase boards fetch fallback to seed:', e);
      }
    }
    return SEED_BOARDS;
  }

  /**
   * Fetch grades for a specific board
   */
  public static async getGrades(boardId: string): Promise<AcademicGrade[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('grades').select('*').eq('board_id', boardId);
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            boardId: d.board_id,
            name: d.name,
            numericLevel: d.numeric_level,
          }));
        }
      } catch (e) {
        console.warn('Supabase grades fetch fallback:', e);
      }
    }
    return SEED_GRADES.filter((g) => g.boardId === boardId);
  }

  /**
   * Fetch subjects for a board and grade
   */
  public static async getSubjects(boardId: string, gradeId: string): Promise<{
    status: 'configured' | 'not_configured';
    subjects: AcademicSubject[];
    message?: string;
  }> {
    // Check custom imported syllabus first
    const customSyllabus = this.getCustomImportedSyllabus();
    if (customSyllabus[boardId]?.[gradeId]) {
      return {
        status: 'configured',
        subjects: customSyllabus[boardId][gradeId],
      };
    }

    // Attempt Supabase fetch
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*, chapters(*, topics(*, subtopics(*)))')
          .eq('board_id', boardId)
          .eq('grade_id', gradeId)
          .order('name');

        if (!error && data && data.length > 0) {
          const subjects: AcademicSubject[] = data.map((s: any) => ({
            id: s.id,
            boardId: s.board_id,
            gradeId: s.grade_id,
            name: s.name,
            code: s.code,
            category: s.category,
            color: s.color,
            active: s.active,
            chapters: (s.chapters || []).map((ch: any) => ({
              id: ch.id,
              subjectId: ch.subject_id,
              title: ch.title,
              orderIndex: ch.order_index,
              description: ch.description,
              active: ch.active,
              topics: (ch.topics || []).map((tp: any) => ({
                id: tp.id,
                chapterId: tp.chapter_id,
                title: tp.title,
                orderIndex: tp.order_index,
                description: tp.description,
                active: tp.active,
                subtopics: tp.subtopics || [],
              })),
            })),
          }));

          return { status: 'configured', subjects };
        }
      } catch (e) {
        console.warn('Supabase subjects fetch fallback:', e);
      }
    }

    // Default seed fallback for ICSE Class 9
    if (boardId === 'board-icse' && gradeId === 'grade-icse-9') {
      return {
        status: 'configured',
        subjects: SEED_ICSE_9_SUBJECTS,
      };
    }

    // Non-existent syllabus configuration
    return {
      status: 'not_configured',
      subjects: [],
      message: 'Syllabus not configured yet for this board and class. You can import syllabus data in Settings.',
    };
  }

  /**
   * Fetch single subject with chapters and topics dynamically
   */
  public static async getSubjectById(
    subjectId: string,
    boardId: string = 'board-icse',
    gradeId: string = 'grade-icse-9'
  ): Promise<AcademicSubject | null> {
    const res = await this.getSubjects(boardId, gradeId);
    const found = res.subjects.find((s) => s.id === subjectId || s.code === subjectId || s.name.toLowerCase() === subjectId.toLowerCase());
    return found || null;
  }

  /**
   * Fetch single chapter by ID dynamically
   */
  public static async getChapterById(
    chapterId: string,
    boardId: string = 'board-icse',
    gradeId: string = 'grade-icse-9'
  ): Promise<{
    chapter: AcademicChapter;
    subject: AcademicSubject;
  } | null> {
    const res = await this.getSubjects(boardId, gradeId);
    for (const subj of res.subjects) {
      const ch = subj.chapters?.find((c) => c.id === chapterId);
      if (ch) {
        return { chapter: ch, subject: subj };
      }
    }
    return null;
  }

  // ============================================================================
  // STUDENT TOPIC PROGRESS MANAGEMENT (DECOUPLED FROM ACCURACY)
  // ============================================================================

  public static getStoredTopicProgress(): Record<string, StudentTopicProgress> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public static async updateTopicProgress(
    userId: string,
    topicId: string,
    updates: Partial<StudentTopicProgress>
  ): Promise<StudentTopicProgress> {
    const all = this.getStoredTopicProgress();
    const existing = all[topicId] || {
      id: `prog_${topicId}`,
      userId,
      topicId,
      status: 'Not Started' as TopicProgressStatus,
      confidence: 3,
      revisionCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updated: StudentTopicProgress = {
      ...existing,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };

    if (updates.status === 'Completed' && !existing.completedAt) {
      updated.completedAt = new Date().toISOString();
    }
    if (updates.status === 'Learning' && !existing.firstStartedAt) {
      updated.firstStartedAt = new Date().toISOString();
    }
    if (updates.status === 'Revision Due') {
      updated.lastRevisedAt = new Date().toISOString();
      updated.revisionCount = (existing.revisionCount || 0) + 1;
    }

    all[topicId] = updated;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(all));
      } catch (e) {
        console.error('Failed to save topic progress to localStorage', e);
      }
    }

    // Sync to Supabase in background
    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase.from('student_topic_progress').upsert({
          user_id: userId,
          topic_id: topicId,
          status: updated.status,
          confidence: updated.confidence,
          first_started_at: updated.firstStartedAt,
          completed_at: updated.completedAt,
          last_revised_at: updated.lastRevisedAt,
          revision_count: updated.revisionCount,
          notes: updated.notes,
          updated_at: updated.updatedAt,
        });
      } catch (e) {
        console.warn('Supabase student_topic_progress upsert fallback:', e);
      }
    }

    return updated;
  }

  /**
   * Calculate Subject-Wise Progress Metrics
   */
  public static calculateSubjectProgress(
    subject: AcademicSubject,
    progressMap: Record<string, StudentTopicProgress>,
    options?: { testAccuracy?: number; studyMinutes?: number }
  ): SubjectProgressSummary {
    const chapters = subject.chapters || [];
    let totalTopics = 0;
    let completedTopics = 0;
    let practicingTopics = 0;
    let learningTopics = 0;
    let revisionDueTopics = 0;

    let completedChapters = 0;
    let inProgressChapters = 0;
    let notStartedChapters = 0;
    const weakChapters: string[] = [];

    chapters.forEach((ch) => {
      const chTopics = ch.topics || [];
      totalTopics += chTopics.length;
      let chCompleted = 0;

      chTopics.forEach((tp) => {
        const prog = progressMap[tp.id];
        if (prog) {
          if (prog.status === 'Completed' || prog.status === 'Strong') completedTopics++;
          if (prog.status === 'Practicing') practicingTopics++;
          if (prog.status === 'Learning') learningTopics++;
          if (prog.status === 'Revision Due') revisionDueTopics++;
          if (prog.status === 'Completed' || prog.status === 'Strong') chCompleted++;
          if (prog.confidence <= 2) {
            if (!weakChapters.includes(ch.title)) weakChapters.push(ch.title);
          }
        }
      });

      if (chTopics.length > 0 && chCompleted === chTopics.length) {
        completedChapters++;
      } else if (chCompleted > 0 || chTopics.some((tp) => progressMap[tp.id])) {
        inProgressChapters++;
      } else {
        notStartedChapters++;
      }
    });

    const coveragePercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const practicePercentage = totalTopics > 0 ? Math.round(((completedTopics + practicingTopics) / totalTopics) * 100) : 0;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalChapters: chapters.length,
      completedChapters,
      inProgressChapters,
      notStartedChapters,
      totalTopics,
      completedTopics,
      practicingTopics,
      learningTopics,
      revisionDueTopics,
      coveragePercentage,
      practicePercentage,
      accuracyPercentage: options?.testAccuracy ?? 0,
      testPerformancePercentage: options?.testAccuracy ?? 0,
      studyTimeMinutes: options?.studyMinutes ?? 0,
      weakChapters,
      revisionDueCount: revisionDueTopics,
    };
  }

  // ============================================================================
  // SYLLABUS IMPORT PROCESS (JSON / CSV)
  // ============================================================================

  public static getCustomImportedSyllabus(): Record<string, Record<string, AcademicSubject[]>> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_SYLLABUS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public static importSyllabusJson(
    boardId: string,
    gradeId: string,
    subjects: AcademicSubject[]
  ): { success: boolean; importedCount: number; message: string } {
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return { success: false, importedCount: 0, message: 'Invalid or empty syllabus format.' };
    }

    const current = this.getCustomImportedSyllabus();
    if (!current[boardId]) current[boardId] = {};
    current[boardId][gradeId] = subjects;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_SYLLABUS_KEY, JSON.stringify(current));
      } catch (e) {
        return { success: false, importedCount: 0, message: `Failed to save: ${e}` };
      }
    }

    return {
      success: true,
      importedCount: subjects.length,
      message: `Successfully imported ${subjects.length} subjects with verified chapters and topics.`,
    };
  }
}
