'use client';

import React, { useState, useMemo } from 'react';
import { HelpCircle, Calendar, AlertCircle, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useStudyOS } from '@/lib/storage/context';
import { StudyBlockPlan, SubjectName } from '@/types';

interface WhyAmISeeingThisProps {
  task?: StudyBlockPlan;
  subject?: SubjectName | 'Recall/Error Review' | 'Backlog/Review';
  topic?: string;
  className?: string;
}

export function WhyAmISeeingThis({ task, subject, topic, className = '' }: WhyAmISeeingThisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, dailyPlan, doubts, revisionsDue, sessions } = useStudyOS();

  const targetSubject = task?.subject || subject || 'Mathematics';

  // Compute authentic explanations grounded purely in stored records
  const reasons = useMemo(() => {
    const list: { icon: React.ElementType; color: string; title: string; detail: string }[] = [];

    // 1. Check for upcoming exam overrides from dailyPlan.examOverrides
    const todayStr = dailyPlan?.date || new Date().toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    if (dailyPlan?.examOverrides && dailyPlan.examOverrides.length > 0) {
      const activeExam = dailyPlan.examOverrides.find((e) => e.subject === targetSubject && e.active);
      if (activeExam) {
        const examDate = new Date(activeExam.examDate);
        const diffDays = Math.ceil((examDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          list.push({
            icon: Calendar,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            title: `Target Exam in ${diffDays} Day${diffDays === 1 ? '' : 's'}`,
            detail: `You have an exam scheduled for ${targetSubject} on ${activeExam.examDate}. StudyOS has elevated this block to prioritize syllabus coverage and past papers.`,
          });
        }
      }
    }

    // 2. Check for unresolved doubts in this subject
    const subjectDoubts = doubts.filter(
      (d) => d.subject === targetSubject && d.status !== 'Solved'
    );
    if (subjectDoubts.length > 0) {
      list.push({
        icon: AlertCircle,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        title: `${subjectDoubts.length} Unresolved Doubt${subjectDoubts.length === 1 ? '' : 's'}`,
        detail: `You have ${subjectDoubts.length} pending question${subjectDoubts.length === 1 ? '' : 's'} waiting for resolution in ${targetSubject} (e.g., "${subjectDoubts[0].chapter || subjectDoubts[0].question}").`,
      });
    }

    // 3. Check for spaced revision tasks due today
    const subjectRevisions = revisionsDue.filter(
      (r) => r.subject === targetSubject && r.status === 'pending'
    );
    if (subjectRevisions.length > 0) {
      list.push({
        icon: Sparkles,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        title: `${subjectRevisions.length} Spaced Revision${subjectRevisions.length === 1 ? '' : 's'} Due`,
        detail: `You have errors from previous sessions ready for re-testing (+1d/+3d/+7d interval) to lock formulas and concepts into long-term memory.`,
      });
    }

    // 4. Check historical accuracy from completed sessions
    const subjectSessions = sessions.filter((s) => s.subject === targetSubject);
    let totalQuestions = 0;
    let correctQuestions = 0;
    subjectSessions.forEach((s) => {
      if (s.questionsAttempted) {
        totalQuestions += s.questionsAttempted;
        correctQuestions += s.correct || 0;
      }
    });

    if (totalQuestions >= 5) {
      const accuracyPct = Math.round((correctQuestions / totalQuestions) * 100);
      if (accuracyPct < 75) {
        list.push({
          icon: AlertCircle,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          title: `Current Accuracy: ${accuracyPct}%`,
          detail: `Based on ${totalQuestions} recorded questions, accuracy in ${targetSubject} is currently ${accuracyPct}%. More deliberate practice is scheduled to reach the 80%+ mastery threshold.`,
        });
      } else {
        list.push({
          icon: CheckCircle2,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          title: `High Accuracy: ${accuracyPct}%`,
          detail: `You are performing strongly in ${targetSubject} (${correctQuestions}/${totalQuestions} correct). This block maintains momentum and covers advanced problems.`,
        });
      }
    }

    // 5. Mandatory Maths or Core Schedule Rule
    if (targetSubject === 'Mathematics') {
      list.push({
        icon: CheckCircle2,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        title: 'Mandatory Daily Mathematics Routine',
        detail: `Your profile sets a non-negotiable minimum of ${profile.mathsMandatoryMinutes} daily minutes for problem-solving in Mathematics.`,
      });
    } else if (list.length === 0) {
      // Default rule if no exams or errors triggered
      list.push({
        icon: CheckCircle2,
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        title: 'Balanced Weekly Subject Rotation',
        detail: `Scheduled as part of your balanced Class 9 ICSE study rotation to ensure even progress across Science and Humanities.`,
      });
    }

    return list;
  }, [dailyPlan, profile, doubts, revisionsDue, sessions, targetSubject]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors ${className}`}
        title="Why am I seeing this task?"
        aria-label="Why am I seeing this task?"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span className="underline decoration-dotted underline-offset-2">Why this?</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="why-seeing-title"
            className="relative z-50 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                  Transparent Scheduling
                </span>
                <h3 id="why-seeing-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Why {targetSubject}?
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanations grounded in authentic stored metrics */}
            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                StudyOS schedules your daily blocks using verifiable academic evidence rather than random presets:
              </p>

              {reasons.map((reason, idx) => {
                const Icon = reason.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${reason.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{reason.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">{reason.detail}</p>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
