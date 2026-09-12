'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStudyOS } from '@/lib/storage/context';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Brain,
  Award,
  Flame,
  Users,
  ShieldCheck,
  Shield,
  HelpCircle,
  Trophy,
  RotateCcw,
} from 'lucide-react';

interface TourStepDefinition {
  step: number;
  title: string;
  subtitle: string;
  targetSelector?: string;
  route?: string;
  icon: React.ElementType;
  color: string;
  content: string;
  keyPoints: string[];
  ctaText?: string;
}

export const TOUR_STEPS: TourStepDefinition[] = [
  {
    step: 1,
    title: 'Welcome to StudyOS',
    subtitle: 'The deliberate learning operating system for serious students',
    icon: Compass,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    content:
      'StudyOS helps you organize your study, track mistakes, master high-leverage skills, build lasting discipline, and compete fairly with friends. Everything is built around deliberate practice—not endless passive watching.',
    keyPoints: [
      'Personalized to your unique routine, tuition, school, and sports',
      'Spaced revision and error analysis prevent repeated mistakes',
      'Separated scores: completion, consistency, performance, and points',
    ],
    ctaText: 'Start Tour',
  },
  {
    step: 2,
    title: 'Your Personalized Schedule',
    subtitle: 'Built around your life, not a generic rigid template',
    targetSelector: '#tour-schedule-section',
    route: '/',
    icon: Calendar,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    content:
      'Every student has different school timings, tuition batches, academies, or football practice. StudyOS adapts your daily study plan so your obligations never collide with intense revision.',
    keyPoints: [
      'Morning study, evening tuition, and weekend academies respected',
      'Daily 210-minute target balanced with mandatory core subjects',
      'AI proposes recovery slots if you ever fall behind—never silently deletes work',
    ],
  },
  {
    step: 3,
    title: 'Today Dashboard',
    subtitle: 'Your immediate battleground for the next 24 hours',
    targetSelector: '#tour-today-progress',
    route: '/',
    icon: Clock,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    content:
      'The Today view shows your active queue: mandatory mathematics, core sciences, spaced revision due today, reading, and personal workouts. You always know exactly what to do next.',
    keyPoints: [
      'Visual progress ring shows completed vs planned minutes',
      'Instant access to the active study session timer',
      'Displays streak count and daily discipline checklist status',
    ],
  },
  {
    step: 4,
    title: 'Task States & Integrity',
    subtitle: 'Pending, In Progress, Completed, Skipped, Rescheduled',
    targetSelector: '#tour-tasks-grid',
    route: '/',
    icon: CheckCircle2,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    content:
      'Tasks reflect reality. If you miss a task, StudyOS does not guilt-trip you or fake completion. You can mark it Completed with authentic session data, Skip with an honest reason, or Reschedule to a future open slot.',
    keyPoints: [
      'Completed tasks record real minutes and questions solved',
      'Skipped tasks record root causes (illness, school homework, fatigue)',
      'Rescheduling checks your future free slots and preserves history',
    ],
  },
  {
    step: 5,
    title: 'Study Sessions & The 6-Step Loop',
    subtitle: 'Active retrieval over passive reading',
    route: '/study',
    icon: RotateCcw,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    content:
      'High-scoring students do not passively re-read textbooks. StudyOS guides every deep session through a 6-step loop: Retrieve -> Repair -> Produce -> Check -> Error Log -> Reattempt.',
    keyPoints: [
      'Pre-testing: attempt before reading theory to prime recall',
      'Timed production: solve questions under exam-like conditions',
      'Immediate verification: log errors into the mistake logbook',
    ],
  },
  {
    step: 6,
    title: 'Mistake Logbook & Spaced Retrieval',
    subtitle: 'Where actual grade improvement happens',
    route: '/mistakes',
    icon: AlertCircle,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    content:
      'Every error belongs to one of 6 categories: Concept Gap, Misread Question, Calculation/Sign, Formula Recall, Incomplete Step, or Time Pressure. StudyOS automatically schedules spaced reviews at +1, +3, and +7 days.',
    keyPoints: [
      'Tagged by category and subject for focused diagnostics',
      'Spaced repetition ensures forgotten concepts are systematically retrieved',
      'You cannot mark a mistake solved without a clean reattempt',
    ],
  },
  {
    step: 7,
    title: 'Doubt Inbox & Resolution Workflow',
    subtitle: 'Zero questions left behind before exam week',
    route: '/doubts',
    icon: HelpCircle,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    content:
      'When stuck, log the exact blocker with textbook page or problem number. Track it through Unsolved -> Learning -> Solved -> Recheck. Doubts factor directly into your upcoming schedule priorities.',
    keyPoints: [
      'Teacher / tutor resolution notes stored for quick reference',
      'Scheduled review prompt ensures you can solve it independently later',
      'High unresolved doubt count triggers AI focus recommendations',
    ],
  },
  {
    step: 8,
    title: 'AI Coach Safeguards & Socratic Guidance',
    subtitle: 'Truthful mentorship grounded strictly in your evidence',
    route: '/ai-coach',
    icon: Brain,
    color: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    content:
      'The AI Coach helps diagnose repeated errors, suggests lighter plans after overload, and proposes recovery slots. It NEVER invents school hours, silently rewrites schedules, or claims mastery without test evidence.',
    keyPoints: [
      'Mastery claims require actual quiz and question scores',
      'Socratic hints: explains the principle instead of giving away answers',
      'Strict student privacy: never leaks notes or personal doubts',
    ],
  },
  {
    step: 9,
    title: 'Four Separated Progress Scores',
    subtitle: 'Never conflate hours with actual mastery',
    route: '/review',
    icon: Award,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    content:
      'StudyOS deliberately separates 4 distinct scores: 1. Task Completion (tasks finished / planned), 2. Consistency (habit streak), 3. Academic Performance (actual question accuracy), and 4. Competition Points.',
    keyPoints: [
      'No misleading single "IQ" or "mastery" vanity number',
      'Consistency rewards regular showing up without promoting sleep deprivation',
      'Academic score is purely calculated from entered test results',
    ],
  },
  {
    step: 10,
    title: 'Skill Lab: Code, Football & Craft',
    subtitle: 'Proof-of-work outside standard school academics',
    route: '/skills',
    icon: Flame,
    color: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    content:
      '10 specialized tracks: Coding, Hardware, AI, Game Dev, Football Academy, Calisthenics, Writing, and more. A skill session requires tangible proof—such as a working code commit, circuit sketch, or drill rating.',
    keyPoints: [
      'Video watching alone does NOT count as skill completion',
      'Weekend football academy attendance and solo drills tracked separately',
      'Bodyweight progression ensures safe fitness habits without dangerous targets',
    ],
  },
  {
    step: 11,
    title: 'Stimulus Control Rewards',
    subtitle: 'Work first, planned guilt-free enjoyment second',
    route: '/rewards',
    icon: Sparkles,
    color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    content:
      'Points earned from completed sessions can be exchanged for parent-approved personal privileges (e.g. 45 min gaming, new football socks, weekend movie). This aligns dopamine with deliberate effort.',
    keyPoints: [
      'Transparent RewardEvents prevent duplicate point exploits',
      'Anti-cheat rules: points are capped productively each day',
      'Encourages real-world parent collaboration and healthy offline rest',
    ],
  },
  {
    step: 12,
    title: 'Community Directory & Friends',
    subtitle: 'Open student network with ironclad privacy',
    route: '/community',
    icon: Users,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    content:
      'Anyone can create a free StudyOS account. Discover fellow Class 9 ICSE peers in the Community Directory and connect as friends. Peers see only your allowed public consistency, streaks, and challenge scores—your private schedule, doubts, mistakes, and AI dialogues remain strictly confidential.',
    keyPoints: [
      'Open registration: anyone can sign up freely without admin approval gating',
      'Strict privacy: personal emails, timetable routines, and mistake entries are never shared',
      'Search peers by @username or display name in the Community Directory',
    ],
  },
  {
    step: 13,
    title: 'Squads & Direct Team Invites',
    subtitle: 'Form teams and recruit peers for the Dragon Egg race',
    route: '/teams',
    icon: Shield,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    content:
      'Create or join squads with classmates. Team captains can directly invite registered students from the Community Directory or with @username invites. Squads earn points collectively through completed revisions and habit consistency.',
    keyPoints: [
      'Direct team invitation system with instant notification and accept/decline flows',
      'Normalized scoring gives equal weight to morning and evening study routines',
      'Squad captains manage member rosters and rally members for weekly challenges',
    ],
  },
  {
    step: 14,
    title: 'The Dragon Egg Trophy',
    subtitle: 'Legendary weekly trophy for deliberate consistency',
    route: '/teams',
    icon: Trophy,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    content:
      'Inspired by the ultimate milestone in Minecraft, our Dragon Egg is an original dark-fantasy geometric artifact awarded to the squad with the highest normalized discipline each week. It is symbolic, non-monetary, and non-purchasable.',
    keyPoints: [
      'Rotates every Sunday at midnight to the winning team',
      'Fair tie-handling ensures balanced recognition for equal dedication',
      'Cannot be bought with real money or artificial points',
    ],
  },
  {
    step: 15,
    title: 'Weekly Retrospective & Review',
    subtitle: 'Calibrate your pace and plan the upcoming week',
    route: '/review',
    icon: ShieldCheck,
    color: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    content:
      'Every Sunday, inspect your actual study minutes, top mistake categories, unresolved doubts, and exam deadlines. Rebalance your schedule if you experienced burnout or missed targets.',
    keyPoints: [
      'Planned vs actual minutes comparison highlights hidden time leaks',
      'Mistake trend analysis reveals whether errors are shifting toward mastery',
      'Write weekly takeaways to refine your study habits continuously',
    ],
  },
  {
    step: 16,
    title: "You're Ready to Launch!",
    subtitle: 'Build consistency, master your subjects, and enjoy the craft',
    route: '/',
    icon: Sparkles,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    content:
      'You have complete command over StudyOS. Whenever you need a refresher, click the "?" icon on any section or visit the Help Center. Let us begin with today’s next scheduled study block!',
    keyPoints: [
      'Access the full Help Center anytime from the sidebar or header',
      'Replay this guided tour whenever you want from Settings',
      'Stay honest with your logs and the results will speak for themselves',
    ],
    ctaText: 'Go to Today',
  },
];

export function GuidedTour() {
  const router = useRouter();
  const pathname = usePathname();
  const { tutorialState, nextTourStep, prevTourStep, skipTour, completeTour, closeTour } = useStudyOS();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const isTourActive = tutorialState?.isTourActive && !tutorialState?.tutorialCompleted;
  const currentStepNumber = tutorialState?.currentTutorialStep || 1;
  const stepData = useMemo(() => {
    return TOUR_STEPS.find((s) => s.step === currentStepNumber) || TOUR_STEPS[0];
  }, [currentStepNumber]);

  // Navigate to route if step specifies one and we are not currently there
  useEffect(() => {
    if (!isTourActive || !stepData.route) return;
    if (pathname !== stepData.route) {
      router.push(stepData.route);
    }
  }, [isTourActive, stepData.route, pathname, router]);

  // Measure target bounding rect
  const updateTargetRect = useCallback(() => {
    if (!isTourActive || !stepData.targetSelector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(stepData.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isTourActive, stepData.targetSelector]);

  useEffect(() => {
    updateTargetRect();
    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    const timer = setTimeout(updateTargetRect, 200);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      clearTimeout(timer);
    };
  }, [updateTargetRect, pathname, currentStepNumber]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTour();
      } else if (e.key === 'ArrowRight') {
        if (currentStepNumber < 16) {
          nextTourStep();
        } else {
          completeTour();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepNumber > 1) {
          prevTourStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, currentStepNumber, closeTour, nextTourStep, prevTourStep, completeTour]);

  if (!isTourActive) return null;

  const Icon = stepData.icon;
  const isFirstStep = currentStepNumber === 1;
  const isLastStep = currentStepNumber === 16;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-auto">
      {/* Dimmed backdrop with cut-out / spotlight effect */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeTour}
        aria-hidden="true"
      />

      {/* Target Focus Ring if element found */}
      {targetRect && (
        <div
          className="fixed pointer-events-none transition-all duration-300 rounded-xl border-2 border-indigo-400/80 shadow-[0_0_25px_rgba(99,102,241,0.5)] z-50 animate-pulse"
          style={{
            top: Math.max(8, targetRect.top - 6),
            left: Math.max(8, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Floating Tour Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tutorial step ${currentStepNumber}: ${stepData.title}`}
        className="relative z-50 w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${(currentStepNumber / 16) * 100}%` }}
          />
        </div>

        {/* Card Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${stepData.color}`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                  Step {currentStepNumber} of 16
                </span>
                {stepData.route && (
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
                    {stepData.route}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {stepData.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stepData.subtitle}</p>
            </div>
          </div>

          <button
            onClick={closeTour}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close tour (Esc)"
            aria-label="Close tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-600 dark:text-slate-300 text-sm">
          <p className="leading-relaxed text-slate-800 dark:text-slate-200">{stepData.content}</p>

          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Core Takeaways
            </div>
            <ul className="space-y-1.5">
              {stepData.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card Footer with Full Traversal Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={skipTour}
            className="text-xs sm:text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors font-semibold"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={prevTourStep}
                className="flex items-center gap-1.5 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              onClick={() => {
                if (isLastStep) {
                  completeTour();
                  router.push('/');
                } else {
                  nextTourStep();
                }
              }}
              className="flex items-center gap-1.5 text-xs sm:text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            >
              <span>{stepData.ctaText || (isLastStep ? 'Finish Tour' : 'Next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
