'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  Search,
  Plus,
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { Mistake } from '../../types';
import { ERROR_CATEGORIES } from '../../lib/constants';
import { EmptyState } from '../shared/EmptyState';
import { RevisionQueue } from './RevisionQueue';
import { NewMistakeModal } from './NewMistakeModal';

export function MistakeLog() {
  const { mistakes } = useStudyOS();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredMistakes = mistakes.filter((m) => {
    const matchesCategory = filterCategory === 'all' || m.errorCategory === filterCategory;
    const matchesSearch =
      m.chapterTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.originalQuestionContext.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top: Active Spaced Retrieval Queue */}
      <RevisionQueue />

      {/* Mistake Logbook Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mistakes by question, topic, or subject..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Mistake</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
            filterCategory === 'all'
              ? 'bg-slate-800 text-white border-slate-700 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
          }`}
        >
          All Categories ({mistakes.length})
        </button>
        {ERROR_CATEGORIES.map((cat) => {
          const count = mistakes.filter((m) => m.errorCategory === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium border whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? 'bg-slate-800 text-white border-slate-700 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
              }`}
            >
              {cat}
              <span className="ml-1 text-[10px] font-mono text-slate-500">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Mistakes List or Empty State */}
      {filteredMistakes.length === 0 ? (
        <EmptyState
          icon={AlertOctagon}
          title="Mistake Logbook Is Clear"
          description="Logging mistakes is the fastest academic recovery tool. When you lose marks on a question, log it here immediately to generate spaced retrieval reminders (+1, +3, +7 days)."
          actionLabel="Log a Mistake"
          onAction={() => setShowNewModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredMistakes.map((mistake) => {
            const isExpanded = expandedId === mistake.id;
            return (
              <div
                key={mistake.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-brand-blue">{mistake.subject}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-300 font-semibold truncate">
                        {mistake.chapterTopic}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {mistake.createdDate}
                      </span>
                    </div>

                    <div className="text-xs text-slate-200 font-medium line-clamp-2 mb-2">
                      <strong className="text-slate-400">Context: </strong>
                      {mistake.originalQuestionContext}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300">
                        <span className="font-bold text-rose-400 block text-[10px] uppercase">
                          Wrong Approach
                        </span>
                        <span className="line-clamp-2">{mistake.wrongApproach}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                        <span className="font-bold text-emerald-400 block text-[10px] uppercase">
                          Correct Method
                        </span>
                        <span className="line-clamp-2">{mistake.correctMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {mistake.isRepeated && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Repeated Error
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {mistake.errorCategory}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : mistake.id)}
                      className="text-xs text-brand-blue hover:text-blue-300 font-medium flex items-center gap-1 mt-1"
                    >
                      <span>{isExpanded ? 'Hide History' : 'Revision History'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Revision History Stepper */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Spaced Retrieval Milestones
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {mistake.revisionHistory.map((rev) => {
                        const isDone = rev.status === 'completed';
                        return (
                          <div
                            key={rev.intervalDay}
                            className={`p-2.5 rounded-lg border ${
                              isDone
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-850 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="text-[10px] font-mono font-bold">
                              +{rev.intervalDay} Day
                            </div>
                            <div className="font-semibold mt-0.5">
                              {isDone ? 'Completed' : 'Pending'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {rev.completedDate || rev.scheduledDate}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <NewMistakeModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} />
    </div>
  );
}
