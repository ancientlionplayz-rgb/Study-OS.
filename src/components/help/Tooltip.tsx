'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  term: string;
  content: string;
  example?: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const COMMON_TERMS: Record<string, { term: string; content: string; example?: string }> = {
  consistency: {
    term: 'Consistency Score',
    content:
      'A transparent rolling metric measuring how regularly you adhere to your selected core habits and daily targets over the past 7 to 14 days.',
    example: '6 out of 7 days completed on schedule = 86% consistency.',
  },
  accuracy: {
    term: 'Academic Accuracy',
    content:
      'Calculated strictly from actual questions attempted and correct in completed sessions, tests, or quizzes. Never inferred from study hours.',
    example: '24 correct out of 30 questions = 80% accuracy.',
  },
  revision_due: {
    term: 'Spaced Revision Due',
    content:
      'Scheduled reviews (+1d, +3d, +7d) derived from past logged mistakes to reinforce concepts at optimal forgetting curve intervals.',
    example: 'A mistake made on Monday is tested on Tuesday (+1d), Thursday (+3d), and next Monday (+7d).',
  },
  streak: {
    term: 'Streak Count',
    content:
      'Consecutive days with at least one verified study session or completed daily plan. Protects habit momentum.',
  },
  challenge_points: {
    term: 'Competition Points',
    content:
      'Fair, transparent points earned via verified study blocks, active revision, and core habits. Subject to daily anti-grind caps so students with different schedules compete equally.',
  },
  stimulus_control: {
    term: 'Stimulus Control',
    content:
      'Behavioral psychology technique: separating high-stimulation distractions from study zones and scheduling rewards strictly after deep work is finished.',
  },
  dragon_egg: {
    term: 'The Dragon Egg',
    content:
      'A symbolic, non-monetary weekly trophy awarded to the study team with the highest normalized discipline. Rotates every Sunday.',
  },
};

export function Tooltip({
  term,
  content,
  example,
  children,
  position = 'top',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on tap outside (crucial for mobile)
  useEffect(() => {
    if (!isVisible) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible]);

  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Trigger: can be custom children or a dotted underline term */}
      {children ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible((v) => !v);
          }}
          className="cursor-help"
        >
          {children}
        </span>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible((v) => !v);
          }}
          className="inline-flex items-center gap-1 border-b border-dotted border-slate-500 hover:border-indigo-400 text-slate-300 hover:text-white transition-colors cursor-help text-xs"
        >
          <span>{term}</span>
          <Info className="w-3 h-3 text-slate-400 inline" />
        </button>
      )}

      {/* Floating Tooltip Card */}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl shadow-slate-950/80 text-left text-xs pointer-events-auto animate-in fade-in zoom-in-95 duration-100 ${positionClasses}`}
        >
          <div className="font-semibold text-white mb-1 flex items-center justify-between">
            <span>{term}</span>
            <span className="text-[10px] text-indigo-400 font-normal">Definition</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{content}</p>
          {example && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="font-medium text-slate-300">Example: </span>
              {example}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
