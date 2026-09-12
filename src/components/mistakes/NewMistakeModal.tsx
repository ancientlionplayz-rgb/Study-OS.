'use client';

import React, { useState } from 'react';
import { X, AlertOctagon, Sparkles } from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { SubjectName, MathsErrorCategory } from '../../types';
import { ICSE_SUBJECTS, ERROR_CATEGORIES } from '../../lib/constants';

interface NewMistakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewMistakeModal({ isOpen, onClose }: NewMistakeModalProps) {
  const { createMistake, selectedDate } = useStudyOS();

  const [subject, setSubject] = useState<SubjectName>('Mathematics');
  const [chapterTopic, setChapterTopic] = useState('');
  const [originalQuestion, setOriginalQuestion] = useState('');
  const [wrongApproach, setWrongApproach] = useState('');
  const [correctMethod, setCorrectMethod] = useState('');
  const [reason, setReason] = useState('');
  const [errorCategory, setErrorCategory] = useState<MathsErrorCategory>('Calculation Error');
  const [isRepeated, setIsRepeated] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMistake({
      subject,
      chapterTopic: chapterTopic.trim(),
      originalQuestionContext: originalQuestion.trim(),
      wrongApproach: wrongApproach.trim(),
      correctMethod: correctMethod.trim(),
      reason: reason.trim(),
      errorCategory,
      isRepeated,
      createdDate: selectedDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-xl w-full my-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              <span>Log Academic Mistake / Error</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically schedules +1, +3, and +7 day retrieval sessions in your revision queue
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
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                {ICSE_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chapter & Topic
              </label>
              <input
                type="text"
                required
                value={chapterTopic}
                onChange={(e) => setChapterTopic(e.target.value)}
                placeholder="e.g. Expansions - (a+b+c)^2"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Original Question / Context
            </label>
            <textarea
              rows={2}
              required
              value={originalQuestion}
              onChange={(e) => setOriginalQuestion(e.target.value)}
              placeholder="Paste or type the problem where marks were lost..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                Wrong Approach Taken
              </label>
              <textarea
                rows={2}
                required
                value={wrongApproach}
                onChange={(e) => setWrongApproach(e.target.value)}
                placeholder="What false step or wrong formula did you use?"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Correct Method / Standard Rule
              </label>
              <textarea
                rows={2}
                required
                value={correctMethod}
                onChange={(e) => setCorrectMethod(e.target.value)}
                placeholder="What is the exact ICSE textbook step or identity?"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Root Cause Error Category
              </label>
              <select
                value={errorCategory}
                onChange={(e) => setErrorCategory(e.target.value as MathsErrorCategory)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                {ERROR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-amber-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRepeated}
                  onChange={(e) => setIsRepeated(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500"
                />
                <span>Repeated Mistake (happened before)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Personal Psychological or Technical Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Rushed steps without writing bracket signs; formula not memorized"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
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
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
            >
              Log Mistake & Generate +1/+3/+7 Revisions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
