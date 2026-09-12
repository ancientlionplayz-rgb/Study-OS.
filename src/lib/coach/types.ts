import { SubjectName, MathsErrorCategory, PriorityLevel, DoubtStatus } from '../../types';

export type CoachCapability =
  | 'explain_doubt'
  | 'explain_topic'
  | 'analyze_mistake'
  | 'generate_quiz'
  | 'recommend_priorities'
  | 'weekly_review'
  | 'socratic_question'
  | 'weak_topic_plan'
  | 'skill_lab_plan';

export type AnswerMode = 'quick' | 'standard' | 'deep';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  mode?: AnswerMode;
  timestamp?: string;
}

export interface StructuredCoachExplanation {
  title: string;
  mode: AnswerMode;
  directAnswer: string;
  concept?: string;
  explanation?: string;
  whyItWorks?: string;
  steps?: string[];
  workedExample?: string;
  diagram?: string;
  codeSnippet?: {
    language: string;
    code: string;
    explanation: string;
    expectedOutput?: string;
    commonError?: string;
    smallChallenge?: string;
  };
  commonMistakes?: string[];
  examTips?: string[];
  checkYourself?: string[];
  summary?: string;
  nextAction?: string;
  rawMarkdown?: string;
}

export interface StructuredPriorityItem {
  priority: string;
  reason: string;
  duration: string;
  action: string;
  proofOfCompletion: string;
}

export interface StructuredPriorityResponse {
  title: string;
  overallAssessment: string;
  priorities: StructuredPriorityItem[];
  cautionNote?: string;
}

export interface StructuredDoubtResponse {
  whatQuestionIsTesting: string;
  hint: string;
  stepByStepExplanation: string;
  checkYourselfQuestion: string;
  whetherToAddToRevision: boolean;
  revisionAdvice?: string;
  socraticQuestions: string[];
}

export interface StructuredMistakeAnalysisResponse {
  rootCauseCategory: MathsErrorCategory | string;
  whyMarksLost: string;
  keyMisconception: string;
  correctProcedure: string;
  retrievalTriggerQuestion: string;
  scheduleRevisionRecommendation: string;
  preventiveHabit: string;
}

export interface StructuredQuizQuestion {
  id: string;
  question: string;
  options?: string[];
  hint: string;
  standardSolution: string;
  icseMarkingPoints: string[];
}

export interface StructuredQuizResponse {
  subject: string;
  topic: string;
  title: string;
  questions: StructuredQuizQuestion[];
  evidenceNotice: string;
}

export interface StructuredWeakTopicPlanResponse {
  subject: string;
  topic: string;
  diagnosis: string;
  targetProof: string;
  threeDayPlan: {
    dayNumber: number;
    phase: 'Retrieve' | 'Repair & Produce' | 'Timed Retest';
    focus: string;
    durationMinutes: number;
    action: string;
    proof: string;
  }[];
}

export interface StructuredSkillPlanResponse {
  skillTrack: string;
  weeklyTargetHours: number;
  roadmapLevel: string;
  milestones: {
    title: string;
    actionableDrillOrCode: string;
    timeMinutes: number;
    tangibleDeliverable: string;
  }[];
}

export interface CoachApiResponse {
  success: boolean;
  capability: CoachCapability;
  source: 'gemini' | 'rule_based_engine';
  isFallback: boolean;
  modelUsed: string;
  fallbackReason?: string;
  answerMode?: AnswerMode;
  result:
    | StructuredCoachExplanation
    | StructuredPriorityResponse
    | StructuredDoubtResponse
    | StructuredMistakeAnalysisResponse
    | StructuredQuizResponse
    | StructuredWeakTopicPlanResponse
    | StructuredSkillPlanResponse
    | Record<string, unknown>;
  timestamp: string;
}

