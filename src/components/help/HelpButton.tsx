'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, CheckCircle, Info, Sparkles, BookOpen } from 'lucide-react';

export interface HelpSectionContent {
  title: string;
  whatIsThis: string;
  whyItMatters: string;
  howToUse: string[];
  whatHappensWhenComplete: string;
  proTip?: string;
}

export const HELP_TOPICS_REGISTRY: Record<string, HelpSectionContent> = {
  schedule: {
    title: 'Personalized Daily Schedule',
    whatIsThis:
      'A dynamic 24-hour routine balancing your school hours, evening tuition, football training, and core study quotas.',
    whyItMatters:
      'Rigid timetables fail because real life is volatile. This schedule dynamically adapts so missed work is intentionally rescheduled rather than ignored.',
    howToUse: [
      'Check your daily study targets (default 210 mins)',
      'Follow the chronological study blocks throughout your day',
      'If you have upcoming exams, study blocks automatically prioritize that subject',
    ],
    whatHappensWhenComplete:
      'You fulfill your daily study quota, progress your 7-day consistency streak, and earn competition points.',
    proTip: 'Never delete a missed block. Use the reschedule option to find an open recovery slot.',
  },
  today: {
    title: 'Today Dashboard & Daily Focus',
    whatIsThis:
      'Your immediate command center displaying today’s tasks, current streak, active timer state, and discipline checklist.',
    whyItMatters:
      'Eliminates decision fatigue. When you open StudyOS, you do not waste time wondering what to study—your exact priority is primed and ready.',
    howToUse: [
      'Click "Start Session" on the top priority task to launch the guided timer',
      'Check off your daily discipline habits (bedtime, hydration, deep work)',
      'Review pending revisions due before they become overdue',
    ],
    whatHappensWhenComplete:
      'Marks the day as disciplined, saves your study minutes to analytics, and keeps your consistency streak intact.',
    proTip: 'Complete your mandatory Maths block early in the day when cognitive fatigue is lowest.',
  },
  study_loop: {
    title: 'The 6-Step Learning Loop',
    whatIsThis:
      'A deliberate practice framework: Retrieve -> Repair -> Produce -> Check -> Error Log -> Reattempt.',
    whyItMatters:
      'Passive reading creates an illusion of competence. Active retrieval under timed conditions builds durable memory for exams.',
    howToUse: [
      'Step 1 (Retrieve): Attempt recall or pre-test before looking at notes',
      'Step 2 (Repair): Fill gaps using your textbook or notes',
      'Step 3 (Produce): Solve exam-style problems independently',
      'Step 4 (Check): Verify answers with strict marking',
      'Step 5 (Error Log): Record every mistake into the logbook',
      'Step 6 (Reattempt): Solve the exact question cleanly without assistance',
    ],
    whatHappensWhenComplete:
      'Converts temporary memory into permanent conceptual understanding and feeds your spaced revision schedule.',
    proTip: 'Spend at least 60% of your session in Steps 3 (Produce) and 5 (Error Log).',
  },
  mistakes: {
    title: 'Mistake Logbook & Spaced Retrieval',
    whatIsThis:
      'A clinical registry of every academic error, classified into 6 diagnostic categories with spaced revision intervals (+1d, +3d, +7d).',
    whyItMatters:
      'Re-doing questions you already know provides comfort; analyzing where you failed provides actual grade jumps.',
    howToUse: [
      'Log the subject, topic, and root cause when an error occurs',
      'Categorize: Concept Gap, Misread Question, Calculation/Sign, Formula, Incomplete Step, or Time Pressure',
      'When revisions become due on your dashboard, reattempt the problem',
    ],
    whatHappensWhenComplete:
      'Eliminates repeated errors on exams and improves your subject accuracy score.',
    proTip: 'If you fail the +3d revision, the question automatically resets back to +1d for immediate re-learning.',
  },
  doubts: {
    title: 'Doubt Inbox & Resolution Pipeline',
    whatIsThis:
      'A structured question tracker transitioning from Unsolved -> Learning -> Solved -> Recheck.',
    whyItMatters:
      'Prevents unaddressed questions from accumulating into pre-exam panic. Every doubt is tagged with source, page number, and resolution notes.',
    howToUse: [
      'Log doubts immediately while studying so you do not break deep flow',
      'Take them to your school teacher, tuition tutor, or AI coach',
      'Enter the resolution notes and verify with an independent test problem',
    ],
    whatHappensWhenComplete:
      'Clears academic blockers, lowers exam anxiety, and updates your AI Coach focus profile.',
    proTip: 'Schedule a weekly 30-minute block specifically to review and recheck recently solved doubts.',
  },
  ai_coach: {
    title: 'AI Coach & Socratic Mentor',
    whatIsThis:
      'A truthful, grounded study mentor that understands your real schedule, test accuracy, mistake history, and fatigue levels.',
    whyItMatters:
      'Provides actionable recovery advice without ever hallucinating school hours, claiming fake mastery, or leaking private data.',
    howToUse: [
      'Ask for daily study priorities based on upcoming tests',
      'Request Socratic hints on difficult concepts rather than outright answers',
      'Ask for schedule rebalancing if you have had a consecutive string of missed days',
    ],
    whatHappensWhenComplete:
      'Provides clarity on study bottlenecks and proposes realistic recovery slots with transparent tradeoffs.',
    proTip: 'The AI Coach only acknowledges mastery when backed by actual entered test or question scores.',
  },
  scores: {
    title: 'Separated Score Architecture',
    whatIsThis:
      'Four strictly disentangled metrics: Task Completion, Consistency, Academic Performance, and Competition Points.',
    whyItMatters:
      'A single combined "score" hides weaknesses. High study hours with low test scores is different from high test scores with zero discipline.',
    howToUse: [
      'Task Completion: Monitor % of planned tasks finished',
      'Consistency: Track rolling habit adherence across core routines',
      'Academic Performance: View raw quiz and exam percentages',
      'Competition Points: Compare fair normalized discipline with friends',
    ],
    whatHappensWhenComplete:
      'Gives you an honest, transparent diagnostic of your learning system.',
    proTip: 'Never chase points at the expense of sleep or actual comprehension.',
  },
  skills: {
    title: 'Skill Lab: Proof of Work',
    whatIsThis:
      '10 specialized vocational and athletic tracks outside the school curriculum (Coding, Hardware, AI, Football, Fitness, etc.).',
    whyItMatters:
      'True capability requires tangible proof. Watching videos without building projects leads to zero retention.',
    howToUse: [
      'Select your active skill track (e.g. Python & Algorithms, Football Academy)',
      'Log deliberate practice minutes with an attached deliverable or drill rating',
      'Review your cumulative evidence portfolio over time',
    ],
    whatHappensWhenComplete:
      'Levels up your skill track, logs verified evidence, and earns skill achievement badges.',
    proTip: 'A skill session requires deliverable evidence: working code, circuit diagram, or physical drill score.',
  },
  rewards: {
    title: 'Stimulus Control Reward Store',
    whatIsThis:
      'A non-monetary privilege exchange where earned points unlock parent-agreed leisure (gaming, movies, sports gear).',
    whyItMatters:
      'Binds dopamine to deliberate effort. By scheduling rewards *after* deep work, you prevent revenge bedtime procrastination.',
    howToUse: [
      'Earn points through verified study blocks and revision tasks',
      'Redeem custom privileges agreed upon with parents or guardians',
      'Enjoy leisure guilt-free knowing your daily obligations are finished',
    ],
    whatHappensWhenComplete:
      'Records a transparent redemption event and deducts points from your spendable balance.',
    proTip: 'Discuss custom reward items with your family at the start of each month.',
  },
  teams: {
    title: 'Study Groups & The Dragon Egg Trophy',
    whatIsThis:
      'Private invite-only study circles and competitive squads competing for the weekly symbolic Dragon Egg trophy.',
    whyItMatters:
      'Accountability with trusted peers boosts discipline without toxic toxicity. Rankings are normalized so all schedules compete fairly.',
    howToUse: [
      'Join or create a private study group with your classmates',
      'Form or join a team squad within the group',
      'Contribute points by completing planned tasks and spaced revisions',
    ],
    whatHappensWhenComplete:
      'The team with the highest normalized discipline holds the rotating Dragon Egg trophy for the upcoming week.',
    proTip: 'The Dragon Egg is purely symbolic, non-monetary, and cannot be bought or traded.',
  },
};

interface HelpButtonProps {
  topicKey: string;
  buttonLabel?: string;
  size?: 'sm' | 'md';
  variant?: 'subtle' | 'primary' | 'badge';
  className?: string;
}

export function HelpButton({
  topicKey,
  buttonLabel,
  size = 'sm',
  variant = 'subtle',
  className = '',
}: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const topic = HELP_TOPICS_REGISTRY[topicKey] || {
    title: 'Help & Context',
    whatIsThis: 'This feature helps you manage your deliberate practice and study habits.',
    whyItMatters: 'Every module in StudyOS is designed to prevent burnout and maximize long-term retention.',
    howToUse: ['Follow the steps shown on this screen', 'Keep your logs honest and consistent'],
    whatHappensWhenComplete: 'Updates your personal analytics and keeps your routine on track.',
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const buttonStyle = {
    subtle:
      'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 p-1.5 rounded-xl transition-all',
    primary:
      'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/30 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold',
    badge:
      'text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/50 flex items-center gap-1',
  }[variant];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${buttonStyle} ${className}`}
        title={`What does this do? (${topic.title})`}
        aria-label={`Help: ${topic.title}`}
      >
        <HelpCircle className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
        {buttonLabel && <span>{buttonLabel}</span>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`help-modal-title-${topicKey}`}
            className="relative z-50 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                    What Does This Do?
                  </span>
                  <h3 id={`help-modal-title-${topicKey}`} className="text-lg font-bold text-slate-900 dark:text-white">
                    {topic.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close help"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4 text-slate-600 dark:text-slate-300 text-sm max-h-[70vh] overflow-y-auto">
              {/* What is this? */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-blue-400" />
                  What is this?
                </h4>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{topic.whatIsThis}</p>
              </div>

              {/* Why does it matter? */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Why does it matter?
                </h4>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{topic.whyItMatters}</p>
              </div>

              {/* How do I use it? */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  How do I use it?
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {topic.howToUse.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What happens when completed? */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  What happens when I complete it?
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{topic.whatHappensWhenComplete}</p>
              </div>

              {/* Pro Tip */}
              {topic.proTip && (
                <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">Pro Tip: </span>
                    {topic.proTip}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
