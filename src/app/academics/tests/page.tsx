'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileQuestion,
  Sparkles,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Filter,
  BarChart2,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { useStudyOS } from '@/lib/storage/context';
import { SyllabusService } from '@/lib/academics/syllabusService';
import { TestGeneratorService } from '@/lib/tests/testGeneratorService';
import {
  AcademicSubject,
  AcademicChapter,
  AcademicTopic,
  GeneratedTest,
  TestAttempt,
  TestMode,
  TestDifficulty,
  TestQuestionType,
} from '@/types';

const TEST_MODES: { mode: TestMode; title: string; desc: string }[] = [
  { mode: 'chapter', title: 'Chapter Mastery', desc: 'Focus strictly on all topics in a chosen chapter' },
  { mode: 'topic', title: 'Focused Topic', desc: 'Drill down into specific topics requiring practice' },
  { mode: 'subject', title: 'Subject Benchmark', desc: 'Balanced assessment across multiple chapters' },
  { mode: 'revision', title: 'Targeted Spaced Revision', desc: 'Automatically pulls topics currently due for review' },
  { mode: 'mock', title: 'Full Mock Exam', desc: 'Timed simulated board examination with full weighting' },
  { mode: 'adaptive', title: 'AI Adaptive Diagnostic', desc: 'Prioritizes weak chapters and common mistake patterns' },
];

const QUESTION_TYPE_OPTIONS: TestQuestionType[] = [
  'MCQ',
  'Short Answer',
  'Long Answer',
  'Numerical',
  'Reasoning',
  'Diagram-based',
  'True/False',
  'Programming',
];

export default function TestsDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSubjectId = searchParams?.get('subjectId') || '';
  const preselectedChapterId = searchParams?.get('chapterId') || '';
  const preselectedTopicId = searchParams?.get('topicId') || '';
  const preselectedMode = (searchParams?.get('mode') as TestMode) || 'chapter';

  const { profile } = useStudyOS();

  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [tests, setTests] = useState<GeneratedTest[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Generator Modal state
  const [isModalOpen, setIsModalOpen] = useState(
    Boolean(preselectedSubjectId || preselectedChapterId)
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState(preselectedSubjectId || 'subj-maths-9');
  const [selectedMode, setSelectedMode] = useState<TestMode>(preselectedMode);
  const [selectedChapterId, setSelectedChapterId] = useState(preselectedChapterId);
  const [selectedTopicId, setSelectedTopicId] = useState(preselectedTopicId);
  const [totalMarks, setTotalMarks] = useState<number>(40);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [difficulty, setDifficulty] = useState<TestDifficulty>('Standard Board Level');
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<TestQuestionType[]>([
    'MCQ',
    'Short Answer',
    'Numerical',
    'Reasoning',
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await SyllabusService.getSubjects('board-icse', 'grade-icse-9');
      setSubjects(res.subjects);

      if (!preselectedSubjectId && res.subjects.length > 0) {
        setSelectedSubjectId(res.subjects[0].id);
      }

      const storedTests = TestGeneratorService.getStoredTests();
      setTests(storedTests);

      const storedAttempts = TestGeneratorService.getStoredAttempts();
      setAttempts(storedAttempts);

      setLoading(false);
    }
    loadData();
  }, [preselectedSubjectId]);

  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  }, [subjects, selectedSubjectId]);

  const chapters = currentSubject?.chapters || [];

  const handleToggleQuestionType = (qt: TestQuestionType) => {
    setSelectedQuestionTypes((prev) =>
      prev.includes(qt) ? prev.filter((t) => t !== qt) : [...prev, qt]
    );
  };

  const handleGenerateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject) return;
    setIsGenerating(true);

    try {
      const prog = SyllabusService.getStoredTopicProgress();
      const weakTopicTitles = Object.values(prog)
        .filter((p) => p.confidence <= 2 || p.status === 'Revision Due')
        .map((p) => p.topicId);

      const config = {
        board: 'ICSE',
        grade: 'Class 9',
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        chapterIds: selectedChapterId ? [selectedChapterId] : chapters.map((c) => c.id),
        topicIds: selectedTopicId ? [selectedTopicId] : [],
        difficulty,
        totalMarks: Number(totalMarks) || 40,
        durationMinutes: Number(durationMinutes) || 45,
        questionTypes: selectedQuestionTypes.length > 0 ? selectedQuestionTypes : (['MCQ', 'Short Answer'] as TestQuestionType[]),
        mode: selectedMode,
        isPracticeMode: false,
      };

      const generated = await TestGeneratorService.generateTest(
        config,
        profile.id || 'default_user',
        {
          subject: currentSubject,
          weakTopics: weakTopicTitles,
        }
      );

      setIsGenerating(false);
      setIsModalOpen(false);
      router.push(`/academics/tests/${generated.id}`);
    } catch (err) {
      console.error('Error generating test:', err);
      setIsGenerating(false);
    }
  };

  // Metrics
  const totalCompletedAttempts = attempts.length;
  const avgAccuracy = totalCompletedAttempts > 0
    ? Math.round(attempts.reduce((acc, a) => acc + (a.accuracyPercentage || 0), 0) / totalCompletedAttempts)
    : 0;
  const cleanIntegrityAttempts = attempts.filter((a) => a.integrityStatus === 'clear').length;
  const fairPlayRate = totalCompletedAttempts > 0
    ? Math.round((cleanIntegrityAttempts / totalCompletedAttempts) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted mb-1">
            <Link href="/academics/syllabus" className="hover:text-primary transition-colors">
              Academics
            </Link>
            <span>/</span>
            <span className="text-text-primary">Test Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Curriculum Test Generator & Integrity Engine
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Board-standard test generator with strict marks validation and fair, non-shaming integrity monitoring.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Test</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Generated Papers</span>
          <div className="text-2xl font-black text-text-primary mt-1">{tests.length}</div>
          <span className="text-[11px] text-text-muted">Saved curriculum papers</span>
        </div>

        <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Completed Attempts</span>
          <div className="text-2xl font-black text-primary mt-1">{totalCompletedAttempts}</div>
          <span className="text-[11px] text-text-muted">Submitted under exam rules</span>
        </div>

        <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Average Accuracy</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{avgAccuracy}%</div>
          <span className="text-[11px] text-text-muted">Across all evaluated tests</span>
        </div>

        <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Fair Play Rate</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span>{fairPlayRate}%</span>
          </div>
          <span className="text-[11px] text-text-muted">Uninterrupted focus rate</span>
        </div>
      </div>

      {/* Tests & Recent Attempts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active & Past Tests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-primary" />
              <span>Available Test Papers ({tests.length})</span>
            </h2>
            <span className="text-xs text-text-muted">Instant launch with strict timer</span>
          </div>

          {tests.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-border-strong bg-surface text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary">No Test Papers Yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Generate your first chapter or revision test paper. Tests automatically validate question marks and simulate board examination pacing.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Configure New Test</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => {
                const pastAttempt = attempts.find((a) => a.testId === test.id);
                return (
                  <div
                    key={test.id}
                    className="p-4 sm:p-5 rounded-2xl border border-border-default bg-surface hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                          {test.mode}
                        </span>
                        <span className="text-xs font-bold text-text-muted">
                          {test.subjectName}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-text-primary">
                        {test.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary pt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-text-muted" />
                          {test.durationMinutes} mins
                        </span>
                        <span>•</span>
                        <span className="font-mono font-bold text-text-primary">
                          {test.totalMarks} Marks
                        </span>
                        <span>•</span>
                        <span>{test.questions.length} Questions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pastAttempt ? (
                        <Link
                          href={`/academics/tests/${test.id}/results`}
                          className="px-3.5 py-2 rounded-xl border border-border-default hover:bg-background text-xs font-bold text-text-primary transition-colors flex items-center gap-1.5"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-primary" />
                          <span>Results ({pastAttempt.accuracyPercentage}%)</span>
                        </Link>
                      ) : null}

                      <Link
                        href={`/academics/tests/${test.id}`}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{pastAttempt ? 'Retake Test' : 'Start Test'}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Recent Test Submissions & Integrity Status */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            <span>Recent Attempts</span>
          </h2>

          {attempts.length === 0 ? (
            <div className="p-6 rounded-2xl border border-border-default bg-surface text-center text-xs text-text-muted">
              No test attempts submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.slice(0, 5).map((att) => {
                const targetTest = tests.find((t) => t.id === att.testId);
                return (
                  <Link
                    key={att.id}
                    href={`/academics/tests/${att.testId}/results`}
                    className="p-4 rounded-2xl border border-border-default bg-surface hover:border-primary/40 transition-all block group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
                        {targetTest?.title || 'Evaluated Paper'}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {att.score} / {att.totalMarks} ({att.accuracyPercentage}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted pt-1 border-t border-border-default/50">
                      <span>{new Date(att.startedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        {att.integrityStatus === 'clear' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Clean
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {att.integrityFlagsCount} flags
                          </span>
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface border border-border-default rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div>
                <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Configure Test Paper</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Exact curriculum questions with marks sum verification
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateTest} className="space-y-5">
              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Academic Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {subjects.map((s) => {
                    const isSelected = s.id === selectedSubjectId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(s.id);
                          setSelectedChapterId('');
                        }}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                            : 'border-border-default bg-background text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Assessment Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TEST_MODES.map((m) => {
                    const isSelected = m.mode === selectedMode;
                    return (
                      <button
                        key={m.mode}
                        type="button"
                        onClick={() => setSelectedMode(m.mode)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border-default bg-background hover:border-border-strong'
                        }`}
                      >
                        <div className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                          {m.title}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5 leading-snug">
                          {m.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chapter Selector (if chapter mode) */}
              {(selectedMode === 'chapter' || selectedMode === 'topic') && chapters.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Target Chapter
                  </label>
                  <select
                    value={selectedChapterId || (chapters[0]?.id || '')}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-default text-xs font-medium text-text-primary focus:outline-hidden focus:border-primary"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Chapter {ch.orderIndex}: {ch.title} ({ch.topics?.length || 0} topics)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Marks & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Total Marks
                  </label>
                  <select
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-medium text-text-primary focus:outline-hidden focus:border-primary"
                  >
                    <option value={20}>20 Marks (Quick Quiz)</option>
                    <option value={25}>25 Marks (Unit Test)</option>
                    <option value={40}>40 Marks (Term Standard)</option>
                    <option value={50}>50 Marks (Midterm)</option>
                    <option value={80}>80 Marks (Full Board Paper)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Duration (Minutes)
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-medium text-text-primary focus:outline-hidden focus:border-primary"
                  >
                    <option value={25}>25 Minutes</option>
                    <option value={40}>40 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (1 hour)</option>
                    <option value={90}>90 Minutes (1.5 hours)</option>
                    <option value={120}>120 Minutes (2 hours)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Rigour Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as TestDifficulty)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-medium text-text-primary focus:outline-hidden focus:border-primary"
                  >
                    <option value="Foundation">Foundation</option>
                    <option value="Standard">Standard</option>
                    <option value="Board Exam Standard">Board Exam Standard</option>
                    <option value="Advanced">Advanced Challenge</option>
                  </select>
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Allowed Question Formats
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUESTION_TYPE_OPTIONS.map((qt) => {
                    const isSelected = selectedQuestionTypes.includes(qt);
                    return (
                      <button
                        key={qt}
                        type="button"
                        onClick={() => handleToggleQuestionType(qt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-border-default bg-background text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {qt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-default text-xs font-bold text-text-secondary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span>Generating Questions...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate & Begin Test</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
