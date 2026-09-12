'use client';

import React, { useState } from 'react';
import { X, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { SubjectName, PriorityLevel, DoubtStatus } from '../../types';
import { ICSE_SUBJECTS } from '../../lib/constants';

interface NewDoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewDoubtModal({ isOpen, onClose }: NewDoubtModalProps) {
  const { createDoubt, selectedDate } = useStudyOS();

  const [subject, setSubject] = useState<SubjectName>('Mathematics');
  const [chapter, setChapter] = useState('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [status, setStatus] = useState<DoubtStatus>('Unsolved');
  const [solution, setSolution] = useState('');
  const [recheckDate, setRecheckDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDoubt({
      subject,
      chapter: chapter.trim() || 'General Subject Doubt',
      question: question.trim(),
      description: description.trim(),
      priority,
      date: selectedDate,
      status,
      solution: solution.trim() || undefined,
      recheckDate: recheckDate || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-lg w-full my-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <span>Log New Academic Doubt</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Never leave conceptual ambiguities unresolved before tests
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectName)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {ICSE_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chapter</label>
              <input
                type="text"
                required
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Pythagoras Theorem"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Exact Question / Confusion
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why does pressure in fluids not depend on surface area?"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Context & Where You Got Stuck
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What step in the textbook derivation did not make sense? What answer did you get?"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent (Exam Blocker)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DoubtStatus)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="Unsolved">Unsolved</option>
                <option value="Learning">Learning / In Progress</option>
                <option value="Solved">Solved</option>
                <option value="Recheck">Recheck Needed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
            >
              Save Doubt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
