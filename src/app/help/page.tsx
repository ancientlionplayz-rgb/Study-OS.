'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  BookOpen,
  Calendar,
  RotateCcw,
  AlertCircle,
  Brain,
  Award,
  Users,
  Shield,
  Trophy,
  ArrowRight,
  Search,
  CheckCircle2,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useStudyOS } from '@/lib/storage/context';

interface GuideCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  articles: {
    title: string;
    description: string;
    details: string[];
    actionLabel?: string;
    actionHref?: string;
  }[];
}

const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: 'getting_started',
    name: 'Getting Started',
    icon: BookOpen,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    articles: [
      {
        title: 'How your personalized schedule is built',
        description:
          'StudyOS respects that different students have morning study sessions, evening tuition batches, sports academies, or imminent exams.',
        details: [
          'Calculates free study windows between school and tuition.',
          'Mandates daily problem-solving in Mathematics (default 60 mins) and Science.',
          'Distributes your weekly study target (default 210 mins/day) realistically.',
          'Never silently erases or overwrites active schedule blocks without your review.',
        ],
        actionLabel: 'View Today Schedule',
        actionHref: '/',
      },
      {
        title: 'Task states and honest logging',
        description:
          'Tasks can be Pending, In Progress, Completed, Skipped, or Rescheduled. Honesty is built directly into the scoring mechanics.',
        details: [
          'Completed: Records verified study minutes and question accuracy.',
          'Skipped: Logs the honest root cause (fatigue, heavy school homework, illness).',
          'Rescheduled: Identifies upcoming free slots and moves the block without losing data.',
        ],
      },
    ],
  },
  {
    id: 'study_engine',
    name: 'Study Sessions & Error Analysis',
    icon: RotateCcw,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    articles: [
      {
        title: 'The 6-Step Learning Loop',
        description:
          'Ditch passive re-reading. StudyOS guides every deep session through deliberate active retrieval.',
        details: [
          'Step 1 (Retrieve): Attempt recall or test questions before opening notes.',
          'Step 2 (Repair): Consult formulas or theory to bridge specific gaps.',
          'Step 3 (Produce): Solve exam-standard questions under time constraints.',
          'Step 4 (Check): Mark answers with rigorous scoring criteria.',
          'Step 5 (Error Log): Record missed problems into the mistake logbook.',
          'Step 6 (Reattempt): Solve the exact question cleanly without looking.',
        ],
        actionLabel: 'Start a Study Session',
        actionHref: '/study',
      },
      {
        title: 'The Mistake Logbook & Spaced Repetition',
        description:
          'Every error is categorized into 6 diagnostic tags: Concept Gap, Misread Question, Calculation/Sign, Formula Recall, Incomplete Step, or Time Pressure.',
        details: [
          'Scheduled reviews appear at +1, +3, and +7 day intervals.',
          'Failing a revision resets it back to +1 day for rapid repair.',
          'You cannot mark a mistake as mastered without solving a fresh problem.',
        ],
        actionLabel: 'View Mistake Log',
        actionHref: '/mistakes',
      },
      {
        title: 'Doubt Inbox Workflow',
        description:
          'Never leave an unresolved question lingering before exams. Track doubts from Unsolved -> Learning -> Solved -> Recheck.',
        details: [
          'Record the exact problem, textbook page, and specific point of confusion.',
          'Bring it to your teacher, tuition tutor, or the AI coach.',
          'Attach resolution notes and recheck within 7 days to verify independence.',
        ],
        actionLabel: 'Open Doubt Inbox',
        actionHref: '/doubts',
      },
    ],
  },
  {
    id: 'ai_coach',
    name: 'AI Coach & Mentorship Safeguards',
    icon: Brain,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    articles: [
      {
        title: 'What the AI Coach can and cannot do',
        description:
          'A study companion with strict safety boundaries and grounded, evidence-backed advice.',
        details: [
          'CAN recommend today’s top priority based on upcoming exams and weak areas.',
          'CAN identify repeated mistake categories across sessions.',
          'CAN suggest recovery slots if you miss study blocks.',
          'CANNOT silently edit your schedule without explicit approval.',
          'CANNOT invent tuition or school hours.',
          'CANNOT claim mastery unless you entered actual test/question scores.',
          'CANNOT expose another student’s private notes or doubt texts.',
        ],
        actionLabel: 'Talk to AI Coach',
        actionHref: '/ai-coach',
      },
    ],
  },
  {
    id: 'scores',
    name: 'Transparent Scores & Fair Progress',
    icon: Award,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    articles: [
      {
        title: 'Why StudyOS separates the 4 scores',
        description:
          'A single combined "smartness" score is misleading. StudyOS disentangles your effort, habit, and exam ability.',
        details: [
          '1. Task Completion: (Completed planned tasks) / (Eligible planned tasks).',
          '2. Consistency Score: Rolling habit adherence over the past 7-14 days.',
          '3. Academic Performance: Pure accuracy from entered tests and quizzes—never inferred from minutes.',
          '4. Competition Points: Honest RewardEvents with anti-cheat duplicate protection.',
        ],
        actionLabel: 'Review Your Scores',
        actionHref: '/review',
      },
    ],
  },
  {
    id: 'social',
    name: 'Friends, Teams & The Dragon Egg Trophy',
    icon: Users,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    articles: [
      {
        title: 'Fair competition across different routines',
        description:
          'Students are never ranked solely by raw study hours, preventing sleep-deprivation contests between students with different schedules.',
        details: [
          'Leaderboards prioritize percentage of personal planned tasks completed.',
          'Consistency and due revisions completed carry heavy ranking weight.',
          'Daily points are capped productively so a healthy routine is rewarded.',
        ],
        actionLabel: 'View Friends & Teams',
        actionHref: '/teams',
      },
      {
        title: 'The Dragon Egg Trophy',
        description:
          'An original dark-fantasy geometric artifact awarded to the squad with the highest normalized discipline each week.',
        details: [
          'Symbolic, non-monetary, and non-purchasable.',
          'Rotates every Sunday at midnight to the winning team.',
          'Fair tie-handling ensures equal recognition for tied consistency.',
        ],
      },
    ],
  },
  {
    id: 'privacy',
    name: 'Privacy Vault & Security Guarantees',
    icon: Shield,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    articles: [
      {
        title: 'Private by default: what others see vs what is locked',
        description:
          'StudyOS is built with strict multi-user privacy architecture and server-side verification.',
        details: [
          'PUBLIC TO FRIENDS: Username, avatar, weekly points, consistency %, challenge progress, team name.',
          'PRIVATE VAULT (NEVER SHARED): Doubt texts, mistake notes, private reflections, AI chats, detailed schedule blocks, email addresses, and school details.',
          'No hardcoded owner bypass or client-side role inspection.',
        ],
      },
    ],
  },
];

export default function HelpCenterPage() {
  const { startTour } = useStudyOS();
  const [selectedCategory, setSelectedCategory] = useState<string>('getting_started');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory =
    GUIDE_CATEGORIES.find((c) => c.id === selectedCategory) || GUIDE_CATEGORIES[0];

  // Filter articles across categories if user is searching
  const searchResults = searchQuery.trim()
    ? GUIDE_CATEGORIES.flatMap((c) =>
        c.articles
          .filter(
            (a) =>
              a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.details.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((a) => ({ ...a, categoryName: c.name, categoryIcon: c.icon }))
      )
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            StudyOS Knowledge Base
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How can we help you succeed?
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Everything you need to master your personalized schedule, active retrieval study loop,
            mistake logs, AI coach safeguards, and fair squad competitions.
          </p>

          {/* Quick Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={startTour}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Launch Interactive Tour (16 Steps)
            </button>
          </div>
        </div>

        {/* Decorative corner element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search guides, mistake categories, scoring rules..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search Results Mode */}
      {searchResults ? (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Found <span className="text-white font-bold">{searchResults.length}</span> result
            {searchResults.length === 1 ? '' : 's'} for &ldquo;{searchQuery}&rdquo;
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((article, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3"
              >
                <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                  {article.categoryName}
                </div>
                <h3 className="text-base font-bold text-white">{article.title}</h3>
                <p className="text-xs text-slate-300">{article.description}</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  {article.details.map((d, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                {article.actionHref && (
                  <Link
                    href={article.actionHref}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-2"
                  >
                    <span>{article.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Normal Category Tab Mode */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="space-y-1.5 lg:col-span-1">
            {GUIDE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg border ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Articles Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{activeCategory.name}</span>
              </h2>
              <span className="text-xs text-slate-400">
                {activeCategory.articles.length} Guides
              </span>
            </div>

            <div className="space-y-4">
              {activeCategory.articles.map((article, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3 hover:border-slate-700/80 transition-all"
                >
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {article.description}
                  </p>

                  <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Rules & Best Practices
                    </div>
                    <ul className="space-y-1.5">
                      {article.details.map((detail, dIdx) => (
                        <li
                          key={dIdx}
                          className="flex items-start gap-2 text-xs sm:text-sm text-slate-300"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {article.actionHref && (
                    <div className="pt-2">
                      <Link
                        href={article.actionHref}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        <span>{article.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
