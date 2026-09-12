'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import {
  SubjectName,
  SessionType,
  MathsErrorCategory,
  PriorityLevel,
} from '../../types';
import { ICSE_SUBJECTS, ERROR_CATEGORIES } from '../../lib/constants';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    subject?: SubjectName;
    chapter?: string;
    topic?: string;
    plannedMinutes?: number;
    actualMinutes?: number;
    sessionType?: SessionType;
  };
}

export function NewSessionModal({ isOpen, onClose, initialData }: NewSessionModalProps) {
  const { createSession, createDoubt, createMistake, selectedDate } = useStudyOS();

  const [subject, setSubject] = useState<SubjectName>(initialData?.subject || 'Mathematics');
  const [chapter, setChapter] = useState(initialData?.chapter || 'Simultaneous Linear Equations');
  const [topic, setTopic] = useState(initialData?.topic || 'Problem Solving & Derivations');
  const [sessionType, setSessionType] = useState<SessionType>(
    initialData?.sessionType || 'morning_maths'
  );
  const [plannedDuration, setPlannedDuration] = useState(initialData?.plannedMinutes || 60);
  const [actualDuration, setActualDuration] = useState(initialData?.actualMinutes || 60);
  const [confidenceBefore, setConfidenceBefore] = useState(3);
  const [confidenceAfter, setConfidenceAfter] = useState(4);
  const [questionsAttempted, setQuestionsAttempted] = useState(10);
  const [correct, setCorrect] = useState(8);
  const [incorrect, setIncorrect] = useState(2);
  const [unattempted, setUnattempted] = useState(0);
  const [notes, setNotes] = useState('');

  // Inline doubt toggle & state
  const [addDoubtNow, setAddDoubtNow] = useState(false);
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtPriority, setDoubtPriority] = useState<PriorityLevel>('Medium');

  // Inline mistake toggle & state
  const [addMistakeNow, setAddMistakeNow] = useState(false);
  const [mistakeQuestion, setMistakeQuestion] = useState('');
  const [wrongApproach, setWrongApproach] = useState('');
  const [correctMethod, setCorrectMethod] = useState('');
  const [errorCategory, setErrorCategory] = useState<MathsErrorCategory>('Calculation Error');

  if (!isOpen) return null;

  const isMaths = subject === 'Mathematics' || sessionType === 'morning_maths';
  const calculatedAccuracy =
    questionsAttempted > 0 ? Math.round((correct / questionsAttempted) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const doubtsCreatedIds: string[] = [];
    const mistakesCreatedIds: string[] = [];

    // Optional inline doubt creation
    if (addDoubtNow && doubtQuestion.trim()) {
      const created = createDoubt({
        subject,
        chapter,
        question: doubtQuestion.trim(),
        description: `Logged during study session on ${topic}`,
        priority: doubtPriority,
        date: selectedDate,
        status: 'Unsolved',
      });
      doubtsCreatedIds.push(created.id);
    }

    // Optional inline mistake creation (+1/+3/+7 automatic revisions!)
    if (addMistakeNow && mistakeQuestion.trim()) {
      const created = createMistake({
        subject,
        chapterTopic: `${chapter} - ${topic}`,
        originalQuestionContext: mistakeQuestion.trim(),
        wrongApproach: wrongApproach.trim() || 'Incorrect step in derivation or calculation',
        correctMethod: correctMethod.trim() || 'Standard ICSE textbook method applied',
        reason: `Root cause: ${errorCategory}`,
        errorCategory,
        isRepeated: false,
        createdDate: selectedDate,
      });
      mistakesCreatedIds.push(created.id);
    }

    // Create the session
    createSession({
      date: selectedDate,
      subject,
      chapter,
      topic,
      plannedDurationMinutes: plannedDuration,
      actualDurationMinutes: actualDuration,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      sessionType,
      confidenceBefore,
      confidenceAfter,
      questionsAttempted,
      correct,
      incorrect,
      unattempted,
      notes,
      doubtsCreatedIds,
      mistakesCreatedIds,
      errorCategories: addMistakeNow ? [errorCategory] : undefined,
      isMathsSession: isMaths,
      isCompleted: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-2xl w-full my-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-blue" />
              <span>Record Study Session</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly evidence-based logging — questions, accuracy, doubts & mistakes
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
          {/* Row 1: Subject and Session Type */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectName)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
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
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
              >
                <option value="morning_maths">Morning Maths (Mandatory 60m)</option>
                <option value="core_subject">Core Subject (60m)</option>
                <option value="second_subject">Second Subject (60m)</option>
                <option value="recall_error_review">Recall & Error Review (30m)</option>
                <option value="mixed_test">Mixed Practice / Test</option>
                <option value="custom_study">Custom Focus</option>
              </select>
            </div>
          </div>

          {/* Row 2: Chapter & Topic */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chapter</label>
              <input
                type="text"
                required
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                placeholder="Chapter name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Topic / Specific Focus
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
                placeholder="Topic or exercise number"
              />
            </div>
          </div>

          {/* Row 3: Durations & Confidence */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Planned (min)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={plannedDuration}
                onChange={(e) => setPlannedDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Actual (min)
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={actualDuration}
                onChange={(e) => setActualDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Conf. Before (1-5)
              </label>
              <select
                value={confidenceBefore}
                onChange={(e) => setConfidenceBefore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? '(Low)' : n === 5 ? '(Mastery)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Conf. After (1-5)
              </label>
              <select
                value={confidenceAfter}
                onChange={(e) => setConfidenceAfter(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? '(Weak)' : n === 5 ? '(Solid)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Evidence of Independent Production (Questions & Accuracy) */}
          <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Production Evidence (Questions Attempted)
              </span>
              <span className="text-xs font-mono font-bold text-brand-blue">
                Accuracy: {calculatedAccuracy}%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Attempted</label>
                <input
                  type="number"
                  min="0"
                  value={questionsAttempted}
                  onChange={(e) => setQuestionsAttempted(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white text-center font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-emerald-400 mb-1">Correct</label>
                <input
                  type="number"
                  min="0"
                  value={correct}
                  onChange={(e) => setCorrect(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-emerald-400 text-center font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-rose-400 mb-1">Incorrect</label>
                <input
                  type="number"
                  min="0"
                  value={incorrect}
                  onChange={(e) => setIncorrect(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-rose-400 text-center font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Unattempted</label>
                <input
                  type="number"
                  min="0"
                  value={unattempted}
                  onChange={(e) => setUnattempted(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-400 text-center font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Session Notes & Retrieval Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue"
              placeholder="What went well? Where did speed drop? Derivation steps mastered..."
            />
          </div>

          {/* Quick Add Doubt / Add Mistake expandable checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-purple-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addDoubtNow}
                  onChange={(e) => setAddDoubtNow(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-500"
                />
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Log a Doubt from this session</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-rose-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addMistakeNow}
                  onChange={(e) => setAddMistakeNow(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-rose-500"
                />
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Log a Mistake (+1/+3/+7 queue)</span>
              </label>
            </div>

            {/* Inline Doubt fields */}
            {addDoubtNow && (
              <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-2">
                <input
                  type="text"
                  value={doubtQuestion}
                  onChange={(e) => setDoubtQuestion(e.target.value)}
                  placeholder="What is the exact doubt or concept confusion?"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                />
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Priority:</span>
                  {(['Low', 'Medium', 'High', 'Urgent'] as PriorityLevel[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDoubtPriority(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        doubtPriority === p
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Mistake fields */}
            {addMistakeNow && (
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-2">
                <input
                  type="text"
                  value={mistakeQuestion}
                  onChange={(e) => setMistakeQuestion(e.target.value)}
                  placeholder="Original problem or question context"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                />
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={wrongApproach}
                    onChange={(e) => setWrongApproach(e.target.value)}
                    placeholder="Wrong approach taken"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={correctMethod}
                    onChange={(e) => setCorrectMethod(e.target.value)}
                    placeholder="Correct method / derivation rule"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Error Category
                  </label>
                  <select
                    value={errorCategory}
                    onChange={(e) => setErrorCategory(e.target.value as MathsErrorCategory)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {ERROR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold bg-brand-blue hover:bg-brand-blue-dark text-white shadow-lg shadow-blue-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Complete Session</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
