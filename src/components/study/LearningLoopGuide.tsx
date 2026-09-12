'use client';

import React from 'react';
import {
  Brain,
  Wrench,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { LEARNING_LOOP_STEPS } from '../../lib/constants';
import { LearningLoopStep } from '../../types';

interface LearningLoopGuideProps {
  currentStep?: LearningLoopStep;
  onSelectStep?: (step: LearningLoopStep) => void;
}

const STEP_ICONS = {
  retrieve: Brain,
  repair: Wrench,
  produce: PenTool,
  check: CheckCircle2,
  error_log: AlertTriangle,
  reattempt: RotateCcw,
};

export function LearningLoopGuide({ currentStep, onSelectStep }: LearningLoopGuideProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-brand-blue">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">StudyOS 6-Step Learning Loop</h3>
            <p className="text-[11px] text-slate-400">
              Active recovery framework — no passive reading or bedtime video bingeing
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {LEARNING_LOOP_STEPS.map((item) => {
          const Icon = STEP_ICONS[item.step];
          const isSelected = currentStep === item.step;

          return (
            <div
              key={item.step}
              onClick={() => onSelectStep?.(item.step)}
              className={`rounded-xl border p-3.5 transition-all text-left cursor-pointer ${
                isSelected
                  ? 'border-brand-blue bg-blue-950/30 shadow-md shadow-blue-500/10'
                  : 'border-slate-800/80 bg-slate-850/60 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      isSelected ? 'bg-brand-blue text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{item.title}</span>
                </div>
                {isSelected && (
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-brand-blue text-white">
                    Current
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-brand-blue mb-1">{item.subtitle}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
