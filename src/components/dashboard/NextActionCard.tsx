'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, AlertOctagon, HelpCircle, BookOpen } from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';

export function NextActionCard() {
  const { dailyPlan, sessions, revisionsDue, doubts, selectedDate } = useStudyOS();

  const todaySessions = sessions.filter((s) => s.date === selectedDate);
  const mathsSessions = todaySessions.filter(
    (s) => s.isMathsSession || s.subject === 'Mathematics'
  );
  const actualMathsMinutes = mathsSessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);
  const totalActualMinutes = todaySessions.reduce((acc, s) => acc + s.actualDurationMinutes, 0);

  // Determine Most Important Next Action strictly from reality
  let actionTitle = '';
  let actionDescription = '';
  let actionHref = '/study';
  let actionButtonText = 'Launch Session';
  let badgeText = 'High Priority';
  let badgeColor = 'text-brand-blue bg-blue-500/10 border-blue-500/20';
  let Icon = BookOpen;

  if (actualMathsMinutes < 60) {
    actionTitle = 'Execute Mandatory 60m Mathematics Block';
    actionDescription = `Only ${actualMathsMinutes} of 60 mandatory minutes completed today. Prioritize active problem solving or derivations.`;
    actionHref = '/study';
    actionButtonText = 'Start 60m Maths Timer';
    badgeText = 'Mandatory Maths';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    Icon = AlertOctagon;
  } else if (revisionsDue.length > 0) {
    const nextRev = revisionsDue[0];
    actionTitle = `Revisit +${nextRev.intervalDay}d Error: ${nextRev.topic}`;
    actionDescription = `Scheduled deterministic recall for ${nextRev.subject}. Test without looking at notes to fix the neural pathway.`;
    actionHref = '/mistakes';
    actionButtonText = 'Open Revision Queue';
    badgeText = `+${nextRev.intervalDay}d Retrieval Due`;
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    Icon = AlertOctagon;
  } else if (doubts.some((d) => d.status === 'Unsolved' && (d.priority === 'Urgent' || d.priority === 'High'))) {
    const highDoubt = doubts.find(
      (d) => d.status === 'Unsolved' && (d.priority === 'Urgent' || d.priority === 'High')
    )!;
    actionTitle = `Clear High-Priority Doubt: ${highDoubt.subject}`;
    actionDescription = highDoubt.question;
    actionHref = '/doubts';
    actionButtonText = 'Resolve in Doubt Inbox';
    badgeText = 'Unsolved Doubt';
    badgeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    Icon = HelpCircle;
  } else if (totalActualMinutes < dailyPlan.targetMinutesTotal) {
    const pendingBlock = dailyPlan.blocks.find(
      (b) => !b.isCompleted && b.completedMinutes < b.plannedMinutes
    ) || dailyPlan.blocks[1];
    actionTitle = `Focus on ${pendingBlock.name}`;
    actionDescription = `Continue deep work on ${pendingBlock.subject} for ${
      pendingBlock.plannedMinutes - pendingBlock.completedMinutes
    } minutes to hit your 3.5-hour target.`;
    actionHref = '/study';
    actionButtonText = 'Start Study Block';
    badgeText = 'Next Study Block';
    badgeColor = 'text-brand-blue bg-blue-500/10 border-blue-500/20';
    Icon = BookOpen;
  } else {
    actionTitle = 'All Daily Academic Targets Met!';
    actionDescription = 'Core 3.5h study fulfilled. Proceed to 5+ pages reading, skill lab, or physical recovery.';
    actionHref = '/reading';
    actionButtonText = 'Log Reading / Skills';
    badgeText = 'Targets Achieved';
    badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    Icon = CheckCircle2;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 p-5 md:p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Most Important Next Action
          </span>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-bold text-white mb-1">{actionTitle}</h3>
          <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl">{actionDescription}</p>
        </div>

        <Link
          href={actionHref}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 shrink-0"
        >
          <span>{actionButtonText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
