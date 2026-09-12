'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { Doubt, DoubtStatus, PriorityLevel } from '../../types';
import { EmptyState } from '../shared/EmptyState';
import { NewDoubtModal } from './NewDoubtModal';

export function DoubtInbox() {
  const { doubts, updateDoubt, deleteDoubt } = useStudyOS();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [solutionInput, setSolutionInput] = useState<Record<string, string>>({});

  const filteredDoubts = doubts.filter((d) => {
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchesSearch =
      d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (id: string, newStatus: DoubtStatus) => {
    updateDoubt(id, { status: newStatus });
  };

  const handleSaveSolution = (id: string) => {
    const sol = solutionInput[id];
    if (sol !== undefined) {
      updateDoubt(id, { solution: sol, status: 'Solved' });
    }
  };

  const priorityColors: Record<PriorityLevel, string> = {
    Low: 'text-slate-400 bg-slate-800 border-slate-700',
    Medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    High: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Urgent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const statusColors: Record<DoubtStatus, string> = {
    Unsolved: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Learning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Solved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Recheck: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doubts by question, chapter, or subject..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Doubt</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'Unsolved', 'Learning', 'Solved', 'Recheck'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
              filterStatus === st
                ? 'bg-slate-800 text-white border-slate-700 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
            }`}
          >
            {st.charAt(0).toUpperCase() + st.slice(1)}
            {st !== 'all' && (
              <span className="ml-1.5 text-[10px] font-mono text-slate-500">
                ({doubts.filter((d) => d.status === st).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Doubts List or Empty State */}
      {filteredDoubts.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No Academic Doubts In This View"
          description="Log difficult derivation steps, formula confusions, or ambiguous ICSE textbook points to keep your conceptual foundation crystal clear."
          actionLabel="Log a Doubt"
          onAction={() => setShowNewModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredDoubts.map((doubt) => {
            const isExpanded = expandedId === doubt.id;
            return (
              <div
                key={doubt.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-brand-blue">{doubt.subject}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 font-medium">{doubt.chapter}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] font-mono text-slate-500">{doubt.date}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 mb-1">{doubt.question}</h4>
                    {doubt.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {doubt.description}
                      </p>
                    )}
                  </div>

                  {/* Status & Priority tags */}
                  <div className="flex items-center gap-2 self-start shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        priorityColors[doubt.priority]
                      }`}
                    >
                      {doubt.priority}
                    </span>

                    <select
                      value={doubt.status}
                      onChange={(e) => handleStatusChange(doubt.id, e.target.value as DoubtStatus)}
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded border bg-slate-950 focus:outline-none cursor-pointer ${
                        statusColors[doubt.status]
                      }`}
                    >
                      <option value="Unsolved">Unsolved</option>
                      <option value="Learning">Learning</option>
                      <option value="Solved">Solved</option>
                      <option value="Recheck">Recheck</option>
                    </select>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : doubt.id)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Solution Notes */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Solution / Resolution Notes
                      </label>
                      <textarea
                        rows={2}
                        defaultValue={doubt.solution || ''}
                        onChange={(e) =>
                          setSolutionInput({ ...solutionInput, [doubt.id]: e.target.value })
                        }
                        placeholder="Explain the correct derivation or textbook explanation..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => deleteDoubt(doubt.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        onClick={() => handleSaveSolution(doubt.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                      >
                        Save Solution & Mark Solved
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <NewDoubtModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} />
    </div>
  );
}
