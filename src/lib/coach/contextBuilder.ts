import {
  CoachCapability,
} from './types';
import {
  DailyPlan,
  StudySession,
  RevisionTask,
  Doubt,
  Mistake,
  SubjectName,
} from '../../types';

export interface RawStudyContext {
  todayPlan?: Partial<DailyPlan>;
  recentSessions?: Partial<StudySession>[];
  revisionsDue?: Partial<RevisionTask>[];
  doubts?: Partial<Doubt>[];
  mistakes?: Partial<Mistake>[];
  targetSubject?: SubjectName | string;
  targetChapter?: string;
  targetTopic?: string;
  userPrompt?: string;
  selectedDoubtId?: string;
  selectedMistakeId?: string;
  answerMode?: 'quick' | 'standard' | 'deep';
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface SanitizedContext {
  capability: CoachCapability;
  targetSubject?: string;
  targetChapter?: string;
  targetTopic?: string;
  data: Record<string, unknown>;
}

/**
 * Strips personal notes, identifiers, or extraneous state.
 * Selects strictly the minimal data fields required for the active capability.
 */
export function buildMinimalContext(
  capability: CoachCapability,
  raw: RawStudyContext
): SanitizedContext {
  switch (capability) {
    case 'explain_topic': {
      const subjectStr = raw.targetSubject ? String(raw.targetSubject).trim() : undefined;
      const chapterStr = (raw.targetChapter || raw.targetTopic) ? String(raw.targetChapter || raw.targetTopic).trim() : undefined;
      return {
        capability,
        targetSubject: subjectStr,
        targetChapter: chapterStr,
        targetTopic: raw.targetTopic ? String(raw.targetTopic).trim() : undefined,
        data: {
          question: raw.userPrompt || raw.targetTopic || 'Conceptual query',
          subject: subjectStr,
          chapter: chapterStr,
          answerMode: raw.answerMode || 'standard',
          history: raw.history || [],
        },
      };
    }

    case 'explain_doubt': {
      let targetDoubt: Partial<Doubt> | undefined;
      if (raw.selectedDoubtId && raw.doubts) {
        targetDoubt = raw.doubts.find((d) => d.id === raw.selectedDoubtId);
      } else if (raw.doubts && raw.doubts.length > 0) {
        targetDoubt = raw.doubts[0];
      }

      const doubtSubject = targetDoubt?.subject || (raw.targetSubject ? String(raw.targetSubject) : undefined);
      const doubtChapter = targetDoubt?.chapter || raw.targetChapter;

      return {
        capability,
        targetSubject: doubtSubject,
        targetChapter: doubtChapter,
        data: {
          question: targetDoubt?.question || raw.userPrompt || 'Conceptual question',
          subject: doubtSubject,
          chapter: doubtChapter,
          priority: targetDoubt?.priority || 'Medium',
          status: targetDoubt?.status || 'Unsolved',
          answerMode: raw.answerMode || 'standard',
          history: raw.history || [],
          // Private user journal/notes explicitly stripped
        },
      };
    }

    case 'analyze_mistake': {
      let targetMistake: Partial<Mistake> | undefined;
      if (raw.selectedMistakeId && raw.mistakes) {
        targetMistake = raw.mistakes.find((m) => m.id === raw.selectedMistakeId);
      } else if (raw.mistakes && raw.mistakes.length > 0) {
        targetMistake = raw.mistakes[0];
      }

      return {
        capability,
        targetSubject: targetMistake?.subject || raw.targetSubject,
        data: {
          subject: targetMistake?.subject || raw.targetSubject || 'Mathematics',
          chapterTopic: targetMistake?.chapterTopic || raw.targetTopic || 'ICSE Derivations',
          errorCategory: targetMistake?.errorCategory || 'Calculation Error',
          originalQuestion: targetMistake?.originalQuestionContext || raw.userPrompt || '',
          wrongApproach: targetMistake?.wrongApproach || '',
          correctMethod: targetMistake?.correctMethod || '',
          isRepeated: !!targetMistake?.isRepeated,
          // Internal storage keys and personal diaries stripped
        },
      };
    }

    case 'generate_quiz': {
      return {
        capability,
        targetSubject: raw.targetSubject || 'Mathematics',
        targetTopic: raw.targetTopic || raw.targetChapter || 'Class 9 Standard Topics',
        data: {
          subject: raw.targetSubject || 'Mathematics',
          chapter: raw.targetChapter || 'Core Syllabus Chapter',
          topic: raw.targetTopic || 'Independent Practice',
          recentErrorCategories: (raw.mistakes || [])
            .slice(0, 3)
            .map((m) => m.errorCategory)
            .filter(Boolean),
        },
      };
    }

    case 'recommend_priorities': {
      const todayBlocks = (raw.todayPlan?.blocks || []).map((b) => ({
        type: b.type,
        subject: b.subject,
        plannedMinutes: b.plannedMinutes,
        completedMinutes: b.completedMinutes,
        isCompleted: b.isCompleted,
      }));

      const mathsCompleted = (raw.todayPlan?.blocks || [])
        .filter((b) => b.type === 'morning_maths' || b.subject === 'Mathematics')
        .reduce((sum, b) => sum + (b.completedMinutes || 0), 0);

      const totalMinutesCompleted = (raw.todayPlan?.blocks || []).reduce(
        (sum, b) => sum + (b.completedMinutes || 0),
        0
      );

      const overdueRevisions = (raw.revisionsDue || []).slice(0, 5).map((r) => ({
        subject: r.subject,
        topic: r.topic,
        intervalDay: r.intervalDay,
      }));

      const urgentDoubts = (raw.doubts || [])
        .filter((d) => d.status === 'Unsolved' && (d.priority === 'High' || d.priority === 'Urgent'))
        .slice(0, 3)
        .map((d) => ({ subject: d.subject, question: d.question }));

      const examOverrides = (raw.todayPlan?.examOverrides || []).map((e) => ({
        subject: e.subject,
        examName: e.examName,
        examDate: e.examDate,
      }));

      return {
        capability,
        data: {
          targetMinutesTotal: raw.todayPlan?.targetMinutesTotal || 210,
          totalMinutesCompleted,
          mathsCompleted,
          isWeekendAcademyDay: !!raw.todayPlan?.isWeekendAcademyDay,
          overdueRevisionsCount: overdueRevisions.length,
          overdueRevisions,
          urgentDoubtsCount: urgentDoubts.length,
          urgentDoubts,
          examOverrides,
          todayBlocks,
        },
      };
    }

    case 'weekly_review': {
      const sessions = raw.recentSessions || [];
      const totalMinutes = sessions.reduce((acc, s) => acc + (s.actualDurationMinutes || 0), 0);
      const mathsSessions = sessions.filter(
        (s) => s.isMathsSession || s.subject === 'Mathematics'
      );
      const mathsDates = new Set(
        mathsSessions.filter((s) => (s.actualDurationMinutes || 0) >= 60).map((s) => s.date)
      );

      const totalQuestions = sessions.reduce((acc, s) => acc + (s.questionsAttempted || 0), 0);
      const totalCorrect = sessions.reduce((acc, s) => acc + (s.correct || 0), 0);
      const accuracy =
        totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      return {
        capability,
        data: {
          totalStudyHours: Math.round((totalMinutes / 60) * 10) / 10,
          mathsDaysCompleted: mathsDates.size,
          accuracyAverage: accuracy,
          repeatedMistakesCount: (raw.mistakes || []).filter((m) => m.isRepeated).length,
          unresolvedDoubtsCount: (raw.doubts || []).filter(
            (d) => d.status === 'Unsolved' || d.status === 'Learning'
          ).length,
          revisionsDueCount: (raw.revisionsDue || []).length,
        },
      };
    }

    case 'socratic_question': {
      return {
        capability,
        targetSubject: raw.targetSubject,
        data: {
          subject: raw.targetSubject || 'Mathematics',
          conceptOrDoubt: raw.userPrompt || raw.targetTopic || 'Physics laws of motion or geometry',
        },
      };
    }

    case 'weak_topic_plan': {
      return {
        capability,
        targetSubject: raw.targetSubject,
        targetTopic: raw.targetTopic,
        data: {
          subject: raw.targetSubject || 'Mathematics',
          weakTopic: raw.targetTopic || raw.targetChapter || 'Expansions / Laws of Motion',
          associatedMistakeCount: (raw.mistakes || []).filter(
            (m) => m.subject === raw.targetSubject
          ).length,
        },
      };
    }

    case 'skill_lab_plan': {
      return {
        capability,
        data: {
          targetTrack: raw.targetTopic || 'Python Programming & AI Agents',
          weeklyGoalHours: 4,
          focusAreas: [
            'Python syntax & algorithms',
            'Autonomous AI Agents logic',
            'Robotics microcontrollers',
            'Quantum physics basics',
          ],
        },
      };
    }

    default:
      return {
        capability,
        data: { userPrompt: raw.userPrompt || '' },
      };
  }
}
