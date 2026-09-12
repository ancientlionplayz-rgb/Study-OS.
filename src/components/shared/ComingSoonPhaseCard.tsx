'use client';

import React from 'react';
import { LucideIcon, Lock, Sparkles, ShieldCheck } from 'lucide-react';

interface ComingSoonPhaseCardProps {
  title: string;
  category: string;
  phase: 'Phase 2' | 'Phase 3';
  icon: LucideIcon;
  description: string;
  roadmapItems: string[];
}

export function ComingSoonPhaseCard({
  title,
  category,
  phase,
  icon: Icon,
  description,
  roadmapItems,
}: ComingSoonPhaseCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 backdrop-blur-sm max-w-2xl mx-auto shadow-xl">
      <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-brand-blue">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/30">
                {phase}
              </span>
              <span className="text-xs text-slate-400">{category}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-400">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Locked</span>
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-6">{description}</p>

      <div className="space-y-4 mb-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
          Upcoming Architecture
        </h4>
        <div className="grid gap-2 sm:grid-cols-1">
          {roadmapItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800/80 text-xs text-slate-300"
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-400">
                0{idx + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-brand-emerald mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-slate-300">Strict Integrity Constraint: </span>
          Zero fake scores or simulated users will ever be displayed. This module will activate once local academic recovery habits and verifiable peer sync are established.
        </div>
      </div>
    </div>
  );
}
