'use client';

import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-6 h-6 text-brand-blue" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-blue hover:bg-brand-blue-dark text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
