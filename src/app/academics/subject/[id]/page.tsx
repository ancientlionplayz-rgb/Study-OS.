'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  FileQuestion,
  Sparkles,
  Layers,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useStudyOS } from '@/lib/storage/context';
import {
  SyllabusService,
  SubjectProgressSummary,
  ChapterProgressSummary,
} from '@/lib/academics/syllabusService';
import { AcademicSubject, StudentTopicProgress } from '@/types';

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = (params?.id as string) || 'subj-maths-9';
  const { sessions } = useStudyOS();

  const [subject, setSubject] = useState<AcademicSubject | null>(null);
  const [topicProgress, setTopicProgress] = useState<Record<string, StudentTopicProgress>>({});
  const [summary, setSummary] = useState<SubjectProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const subj = await SyllabusService.getSubjectById(subjectId);
      setSubject(subj);

      if (subj) {
        const prog = SyllabusService.getStoredTopicProgress();
        setTopicProgress(prog);

        const subjSessions = (sessions || []).filter((sess: any) => sess.subject?.toLowerCase() === subj.name.toLowerCase());
        const avgAcc = subjSessions.length > 0
          ? Math.round(subjSessions.reduce((acc: number, sess: any) => acc + (sess.accuracy || 0), 0) / subjSessions.length)
          : 80;
        const totalMins = subjSessions.reduce((acc: number, sess: any) => acc + (sess.actualDurationMinutes || 0), 0);

        const s = SyllabusService.calculateSubjectProgress(subj, prog, {
          testAccuracy: avgAcc,
          studyMinutes: totalMins,
        });
        setSummary(s);
      }
      setLoading(false);
    }
    loadData();
  }, [subjectId, sessions]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-text-muted">
        Loading subject syllabus...
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="p-8 rounded-3xl border border-dashed border-border-strong bg-surface text-center space-y-3">
        <h3 className="text-base font-bold text-text-primary">Subject Not Found</h3>
        <p className="text-xs text-text-secondary">
          The requested subject does not exist in the configured syllabus.
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

  const chapters = subject.chapters || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/academics/syllabus"
          className="inline-flex items-center gap-1 text-xs font-bold text-text-muted hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Syllabus Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xs"
              style={{ backgroundColor: subject.color || '#3B82F6' }}
            >
              {subject.name.slice(0, 1)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                {subject.name}
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                {chapters.length} Chapters • Code: {subject.code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/academics/tests?subjectId=${subject.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all shrink-0"
            >
              <FileQuestion className="w-4 h-4" />
              <span>Create Subject Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Cards Strip */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Topic Coverage</span>
            <div className="text-2xl font-black text-primary mt-1">{summary.coveragePercentage}%</div>
            <span className="text-[11px] text-text-muted">{summary.completedTopics} of {summary.totalTopics} Topics Complete</span>
          </div>

          <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Test Accuracy</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.accuracyPercentage}%
            </div>
            <span className="text-[11px] text-text-muted">Problem-Solving Score</span>
          </div>

          <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Revision Queue</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{summary.revisionDueCount}</div>
            <span className="text-[11px] text-text-muted">Topics Scheduled for Review</span>
          </div>

          <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Study Hours</span>
            <div className="text-2xl font-black text-text-primary mt-1">
              {Math.round((summary.studyTimeMinutes / 60) * 10) / 10}h
            </div>
            <span className="text-[11px] text-text-muted">Verified Deep Work</span>
          </div>
        </div>
      )}

      {/* Chapter List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>Curriculum Chapters ({chapters.length})</span>
          </h2>
          <span className="text-xs text-text-muted">Select any chapter to track subtopics</span>
        </div>

        <div className="space-y-2">
          {chapters.map((ch, idx) => {
            const chTopics = ch.topics || [];
            let chCompleted = 0;
            chTopics.forEach((tp) => {
              const prog = topicProgress[tp.id];
              if (prog && (prog.status === 'Completed' || prog.status === 'Strong')) {
                chCompleted++;
              }
            });

            const coverage = chTopics.length > 0 ? Math.round((chCompleted / chTopics.length) * 100) : 0;
            const isFinished = coverage === 100 && chTopics.length > 0;

            return (
              <Link
                key={ch.id}
                href={`/academics/chapter/${ch.id}`}
                className="p-4 rounded-2xl border border-border-default bg-surface hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 block group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isFinished
                      ? 'bg-success-soft text-success'
                      : 'bg-background text-text-secondary border border-border-default'
                  }`}>
                    {idx + 1}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                      {ch.title}
                    </h3>
                    <span className="text-[11px] font-mono text-text-muted">
                      {chTopics.length} Topics • {chCompleted} Completed
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="w-24 sm:w-32 text-right">
                    <div className="text-[10px] font-mono font-bold text-text-secondary">
                      {coverage}% Covered
                    </div>
                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border-default mt-1">
                      <div
                        className={`h-full rounded-full transition-all ${isFinished ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${coverage}%` }}
                      />
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
