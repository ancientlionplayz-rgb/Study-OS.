'use client';

import React from 'react';
import { Sparkles, X, Check } from 'lucide-react';
import { useStudyOS } from '@/lib/storage/context';

interface FeatureMiniTipProps {
  featureId: string;
  title: string;
  badge?: string;
  description: string;
  quickTips: string[];
  className?: string;
}

export function FeatureMiniTip({
  featureId,
  title,
  badge = 'Feature Guide',
  description,
  quickTips,
  className = '',
}: FeatureMiniTipProps) {
  const { tutorialState, dismissFeatureHint } = useStudyOS();

  // If already dismissed for this user, do not render
  if (tutorialState?.dismissedFeatureHints?.[featureId]) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-blue-950/40 p-4 sm:p-5 shadow-lg shadow-indigo-950/20 animate-in fade-in slide-in-from-top-2 duration-200 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {badge}
            </span>
            <span className="text-xs text-slate-400">First-time walkthrough</span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {quickTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => dismissFeatureHint(featureId)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
            title="Dismiss tip"
            aria-label="Dismiss tip"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => dismissFeatureHint(featureId)}
            className="px-3 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
