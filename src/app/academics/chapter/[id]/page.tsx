'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertCircle,
  FileQuestion,
  Sparkles,
  Flame,
  Star,
  Layers,
  ChevronRight,
  Plus,
  Bookmark,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useStudyOS } from '@/lib/storage/context';
import {
  SyllabusService,
  SubjectProgressSummary,
} from '@/lib/academics/syllabusService';
import {
  AcademicChapter,
  AcademicSubject,
  AcademicTopic,
  StudentTopicProgress,
  TopicProgressStatus,
} from '@/types';

const STATUS_OPTIONS: { status: TopicProgressStatus; label: string; color: string }[] = [
  { status: 'Not Started', label: 'Not Started', color: 'bg-surface text-text-muted border-border-default' },
  { status: 'Learning', label: 'Learning', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { status: 'Practicing', label: 'Practicing', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { status: 'Revision Due', label: 'Revision Due', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { status: 'Strong', label: 'Strong', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { status: 'Completed', label: 'Completed', color: 'bg-emerald-600 text-white border-emerald-600' },
];

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = (params?.id as string) || 'ch-m1';
  const { profile, createDoubt, createMistake } = useStudyOS();

  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<AcademicChapter | null>(null);
  const [subject, setSubject] = useState<AcademicSubject | null>(null);
  const [topicProgress, setTopicProgress] = useState<Record<string, StudentTopicProgress>>({});

  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState<'doubt' | 'mistake' | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<AcademicTopic | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDetails, setModalDetails] = useState('');

  useEffect(() => {
    async function loadChapterData() {
      setLoading(true);
      const res = await SyllabusService.getChapterById(chapterId);
      if (res) {
        setChapter(res.chapter);
        setSubject(res.subject);
      }
      const prog = SyllabusService.getStoredTopicProgress();
      setTopicProgress(prog);
      setLoading(false);
    }
    loadChapterData();
  }, [chapterId]);

  const handleUpdateStatus = async (topicId: string, newStatus: TopicProgressStatus) => {
    const updated = await SyllabusService.updateTopicProgress(profile.id || 'default_user', topicId, {
      status: newStatus,
    });
    setTopicProgress((prev) => ({
      ...prev,
      [topicId]: updated,
    }));
  };

  const handleUpdateConfidence = async (topicId: string, confidence: number) => {
    const updated = await SyllabusService.updateTopicProgress(profile.id || 'default_user', topicId, {
      confidence,
    });
    setTopicProgress((prev) => ({
      ...prev,
      [topicId]: updated,
    }));
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !modalTitle.trim() || !subject || !chapter) return;

    const today = new Date().toISOString().split('T')[0];

    if (activeModal === 'doubt') {
      createDoubt({
        subject: subject.name as any,
        chapter: chapter.title,
        question: modalTitle.trim(),
        description: modalDetails.trim() || `Topic: ${selectedTopic.title}`,
        priority: 'High',
        status: 'Unsolved',
        date: today,
      });
    } else if (activeModal === 'mistake') {
      createMistake({
        subject: subject.name as any,
        chapterTopic: `${chapter.title} - ${selectedTopic.title}`,
        originalQuestionContext: modalTitle.trim(),
        wrongApproach: modalDetails.trim() || 'Conceptual misconception during revision',
        correctMethod: 'Reviewed and aligned with textbook rules',
        reason: 'Conceptual misunderstanding or calculation error',
        errorCategory: 'Concept Error',
        isRepeated: false,
        createdDate: today,
      });
    }

    setActiveModal(null);
    setSelectedTopic(null);
    setModalTitle('');
    setModalDetails('');
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-text-muted">
        Loading chapter details...
      </div>
    );
  }

  if (!chapter || !subject) {
    return (
      <div className="p-8 rounded-3xl border border-dashed border-border-strong bg-surface text-center space-y-3">
        <h3 className="text-base font-bold text-text-primary">Chapter Not Found</h3>
        <p className="text-xs text-text-secondary">
          The requested chapter does not exist in the active syllabus.
        </p>
        <Link
          href="/academics/syllabus"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Syllabus</span>
        </Link>
      </div>
    );
  }

  const topics = chapter.topics || [];
  let completedTopicsCount = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;

  topics.forEach((t) => {
    const prog = topicProgress[t.id];
    if (prog) {
      if (prog.status === 'Completed' || prog.status === 'Strong') {
        completedTopicsCount++;
      }
      if (prog.confidence) {
        totalConfidence += prog.confidence;
        confidenceCount++;
      }
    }
  });

  const coveragePercent = topics.length > 0 ? Math.round((completedTopicsCount / topics.length) * 100) : 0;
  const avgConfidence = confidenceCount > 0 ? (totalConfidence / confidenceCount).toFixed(1) : '3.0';

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-text-muted mb-2">
          <Link href="/academics/syllabus" className="hover:text-primary transition-colors">
            Syllabus
          </Link>
          <span>/</span>
          <Link href={`/academics/subject/${subject.id}`} className="hover:text-primary transition-colors">
            {subject.name}
          </Link>
          <span>/</span>
          <span className="text-text-primary truncate">Chapter {chapter.orderIndex}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-surface border border-border-default text-[10px] font-mono font-bold text-primary">
                CH {chapter.orderIndex}
              </span>
              <span className="text-xs font-semibold text-text-muted">
                {subject.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1">
              {chapter.title}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {topics.length} Syllabus Topics • Decoupled Mastery Tracking
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/academics/tests?subjectId=${subject.id}&chapterId=${chapter.id}&mode=chapter`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all shrink-0"
            >
              <FileQuestion className="w-4 h-4" />
              <span>Generate Chapter Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Chapter Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Topic Coverage</span>
          <div className="text-2xl font-black text-primary mt-1">{coveragePercent}%</div>
          <span className="text-[11px] text-text-muted">{completedTopicsCount} of {topics.length} Complete</span>
        </div>

        <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Average Confidence</span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <span>{avgConfidence}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <span className="text-[11px] text-text-muted">Scale of 1 to 5</span>
        </div>

        <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Topics</span>
          <div className="text-2xl font-black text-text-primary mt-1">{topics.length}</div>
          <span className="text-[11px] text-text-muted">Curriculum Units</span>
        </div>

        <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Readiness</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {coveragePercent >= 80 ? 'Exam Ready' : coveragePercent >= 40 ? 'In Progress' : 'Early Phase'}
          </div>
          <span className="text-[11px] text-text-muted">Subject to test verification</span>
        </div>
      </div>

      {/* Topic List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Topics & Mastery Progression</span>
          </h2>
          <span className="text-xs text-text-muted">Click status chips to update learning cycle</span>
        </div>

        <div className="space-y-3">
          {topics.map((topic, idx) => {
            const prog = topicProgress[topic.id] || {
              status: 'Not Started',
              confidence: 3,
            };
            const currentStatus = prog.status || 'Not Started';
            const currentConfidence = prog.confidence || 3;

            return (
              <div
                key={topic.id}
                className="p-4 sm:p-5 rounded-2xl border border-border-default bg-surface hover:border-primary/30 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-surface border border-border-default text-text-secondary font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-text-primary leading-tight">
                        {topic.title}
                      </h3>
                      {prog.notes && (
                        <p className="text-xs text-text-muted mt-1 bg-background/50 p-2 rounded-lg border border-border-default/50">
                          {prog.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Confidence Rating 1-5 */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-background/60 px-2.5 py-1 rounded-xl border border-border-default">
                    <span className="text-[10px] font-bold text-text-muted mr-1">Confidence:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleUpdateConfidence(topic.id, star)}
                        title={`Set confidence to ${star}/5`}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            star <= currentConfidence
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-text-muted/40'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Chips Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-default/60">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mr-1">Status:</span>
                    {STATUS_OPTIONS.map((opt) => {
                      const isSelected = currentStatus === opt.status;
                      return (
                        <button
                          key={opt.status}
                          type="button"
                          onClick={() => handleUpdateStatus(topic.id, opt.status)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            isSelected
                              ? opt.color + ' shadow-xs ring-1 ring-primary/40'
                              : 'bg-background text-text-muted border-border-default hover:text-text-primary'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline-block mr-1 -mt-0.5" />}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Action Buttons for Topic */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTopic(topic);
                        setActiveModal('doubt');
                        setModalTitle(`Doubt regarding ${topic.title}`);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-background"
                      title="Add a doubt for this topic"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                      <span>Add Doubt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTopic(topic);
                        setActiveModal('mistake');
                        setModalTitle(`Mistake in ${topic.title}`);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-background"
                      title="Log a mistake for this topic"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <span>Add Mistake</span>
                    </button>

                    <Link
                      href={`/academics/tests?subjectId=${subject.id}&chapterId=${chapter.id}&topicId=${topic.id}&mode=topic`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary hover:text-emerald-500 transition-colors px-2 py-1 rounded-lg hover:bg-background"
                      title="Generate test exclusively on this topic"
                    >
                      <FileQuestion className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Test Topic</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Doubt / Mistake Modal */}
      {activeModal && selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border-default rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                {activeModal === 'doubt' ? (
                  <>
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    <span>Log Subject Doubt</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span>Log Concept Mistake</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-text-muted hover:text-text-primary text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedTopic.title}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-medium text-text-muted"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {activeModal === 'doubt' ? 'Doubt Question / Statement' : 'Mistake Description'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeModal === 'doubt'
                      ? 'e.g., Why does the sign invert when dividing by a negative?'
                      : 'e.g., Forgot to square the denominator in formula'
                  }
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-medium text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  {activeModal === 'doubt' ? 'Context / Question Details' : 'Misconception / Correct Approach'}
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional details or context..."
                  value={modalDetails}
                  onChange={(e) => setModalDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border-default text-xs font-medium text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-border-default text-xs font-bold text-text-secondary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm"
                >
                  Save {activeModal === 'doubt' ? 'Doubt' : 'Mistake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
