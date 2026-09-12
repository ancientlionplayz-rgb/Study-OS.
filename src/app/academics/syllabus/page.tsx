'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  RotateCcw,
  Target,
  FileQuestion,
  TrendingUp,
} from 'lucide-react';
import { useStudyOS } from '@/lib/storage/context';
import {
  SyllabusService,
  SubjectProgressSummary,
} from '@/lib/academics/syllabusService';
import {
  Board,
  AcademicGrade,
  AcademicYear,
  AcademicSubject,
  StudentTopicProgress,
} from '@/types';

export default function SyllabusDashboardPage() {
  const { profile, sessions } = useStudyOS();

  // Filter States
  const [boards, setBoards] = useState<Board[]>([]);
  const [grades, setGrades] = useState<AcademicGrade[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState('board-icse');
  const [selectedGradeId, setSelectedGradeId] = useState('grade-icse-9');
  const [selectedYearId, setSelectedYearId] = useState('ay-2026-2027');

  // Syllabus Data
  const [syllabusStatus, setSyllabusStatus] = useState<'configured' | 'not_configured'>('configured');
  const [syllabusMessage, setSyllabusMessage] = useState<string>('');
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [topicProgress, setTopicProgress] = useState<Record<string, StudentTopicProgress>>({});
  const [subjectSummaries, setSubjectSummaries] = useState<SubjectProgressSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load
  useEffect(() => {
    async function loadMeta() {
      const bList = await SyllabusService.getBoards();
      setBoards(bList);
      if (bList.length > 0) {
        const gList = await SyllabusService.getGrades(bList[0].id);
        setGrades(gList);
      }
      setYears([
        { id: 'ay-2026-2027', label: '2026-2027', startDate: '2026-04-01', endDate: '2027-03-31' },
        { id: 'ay-2025-2026', label: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31' },
      ]);
    }
    loadMeta();
  }, []);

  // Reload subjects when Board/Grade change
  useEffect(() => {
    async function loadSubjects() {
      const res = await SyllabusService.getSubjects(selectedBoardId, selectedGradeId);
      setSyllabusStatus(res.status);
      setSyllabusMessage(res.message || '');
      setSubjects(res.subjects);

      const prog = SyllabusService.getStoredTopicProgress();
      setTopicProgress(prog);

      // Compute summaries
      const summaries = res.subjects.map((s) => {
        const subjSessions = (sessions || []).filter((sess: any) => sess.subject?.toLowerCase() === s.name.toLowerCase());
        const avgAcc = subjSessions.length > 0
          ? Math.round(subjSessions.reduce((acc: number, sess: any) => acc + (sess.accuracy || 0), 0) / subjSessions.length)
          : 75;
        const totalMins = subjSessions.reduce((acc: number, sess: any) => acc + (sess.actualDurationMinutes || 0), 0);

        return SyllabusService.calculateSubjectProgress(s, prog, {
          testAccuracy: avgAcc,
          studyMinutes: totalMins,
        });
      });
      setSubjectSummaries(summaries);
    }

    loadSubjects();
  }, [selectedBoardId, selectedGradeId, sessions]);

  // Overall calculations across all configured subjects
  const totalSubjects = subjects.length;
  const totalChapters = subjectSummaries.reduce((acc, s) => acc + s.totalChapters, 0);
  const completedChapters = subjectSummaries.reduce((acc, s) => acc + s.completedChapters, 0);
  const totalTopics = subjectSummaries.reduce((acc, s) => acc + s.totalTopics, 0);
  const completedTopics = subjectSummaries.reduce((acc, s) => acc + s.completedTopics, 0);
  const totalRevisionDue = subjectSummaries.reduce((acc, s) => acc + s.revisionDueCount, 0);
  const weakTopicsCount = subjectSummaries.reduce((acc, s) => acc + s.weakChapters.length, 0);
  const overallCoverage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const filteredSummaries = subjectSummaries.filter((s) =>
    s.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Academic Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-soft text-primary-text border border-primary-border">
              Board-Aware Hierarchy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Syllabus & Curriculum Tracker
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Decoupled topic coverage, practice metrics, and verified chapter progression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/academics/tests"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all shrink-0"
          >
            <FileQuestion className="w-4 h-4" />
            <span>Create Test</span>
          </Link>
        </div>
      </div>

      {/* Top Academic Selector Bar */}
      <div className="p-4 rounded-2xl border border-border-default bg-surface shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Board Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Board
            </label>
            <select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-background border border-border-default text-xs font-bold text-text-primary focus:ring-2 focus:ring-primary/30"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} ({b.name})
                </option>
              ))}
            </select>
          </div>

          {/* Grade Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Class / Grade
            </label>
            <select
              value={selectedGradeId}
              onChange={(e) => setSelectedGradeId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-background border border-border-default text-xs font-bold text-text-primary focus:ring-2 focus:ring-primary/30"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Academic Year
            </label>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-background border border-border-default text-xs font-bold text-text-primary focus:ring-2 focus:ring-primary/30"
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Filter Subjects
          </label>
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-background border border-border-default text-xs text-text-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* SYLLABUS NOT CONFIGURED STATE */}
      {syllabusStatus === 'not_configured' ? (
        <div className="p-8 rounded-3xl border border-dashed border-border-strong bg-surface text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-text-primary">
            Syllabus Not Configured Yet
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {syllabusMessage || 'No verified syllabus has been imported for this specific board and class.'}
          </p>
          <div className="pt-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
            >
              <span>Import Syllabus in Settings</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="p-3.5 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Subjects</span>
              <div className="text-xl font-black text-text-primary mt-0.5">{totalSubjects}</div>
              <span className="text-[10px] text-text-muted">Enrolled</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Chapters</span>
              <div className="text-xl font-black text-text-primary mt-0.5">{totalChapters}</div>
              <span className="text-[10px] text-text-muted">{completedChapters} Completed</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Topic Coverage</span>
              <div className="text-xl font-black text-primary mt-0.5">{overallCoverage}%</div>
              <span className="text-[10px] text-text-muted">{completedTopics} of {totalTopics} Topics</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Completed</span>
              <div className="text-xl font-black text-success mt-0.5">{completedChapters}</div>
              <span className="text-[10px] text-text-muted">Full Chapters</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Revision Due</span>
              <div className="text-xl font-black text-amber-600 mt-0.5">{totalRevisionDue}</div>
              <span className="text-[10px] text-text-muted">+1, +3, +7 Cadence</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border-default bg-surface shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Weak Chapters</span>
              <div className="text-xl font-black text-rose-600 mt-0.5">{weakTopicsCount}</div>
              <span className="text-[10px] text-text-muted">Needs Attention</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border-default bg-surface shadow-xs col-span-2 sm:col-span-4 lg:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Target Exam</span>
              <div className="text-xl font-black text-text-primary mt-0.5">{profile.targetExamYear || 2027}</div>
              <span className="text-[10px] text-text-muted">{profile.grade || 'Class 9'}</span>
            </div>
          </div>

          {/* Subject Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSummaries.map((summary) => {
              const subj = subjects.find((s) => s.id === summary.subjectId);
              const color = subj?.color || '#3B82F6';

              return (
                <div
                  key={summary.subjectId}
                  className="rounded-2xl border border-border-default bg-surface p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-xs"
                          style={{ backgroundColor: color }}
                        >
                          {summary.subjectName.slice(0, 1)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-text-primary">
                            {summary.subjectName}
                          </h3>
                          <span className="text-[11px] font-mono text-text-muted">
                            {summary.totalChapters} Chapters • {summary.totalTopics} Topics
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-background border border-border-default text-text-secondary">
                        {summary.coveragePercentage}% Covered
                      </span>
                    </div>

                    {/* Dual Metrics: Coverage vs Test Accuracy */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-text-muted font-medium">Syllabus Coverage:</span>
                          <span className="font-mono font-bold text-text-primary">
                            {summary.completedTopics} / {summary.totalTopics} Topics ({summary.coveragePercentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border-default">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${summary.coveragePercentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-text-muted font-medium">Practice & Accuracy:</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {summary.accuracyPercentage}% Verified
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border-default">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${summary.accuracyPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Chapter Breakdown Tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-success-soft text-success font-bold">
                        {summary.completedChapters} Completed
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-primary-soft text-primary font-bold">
                        {summary.inProgressChapters} In Progress
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-background border border-border-default text-text-muted font-medium">
                        {summary.notStartedChapters} Not Started
                      </span>
                    </div>

                    {/* Weak Chapters Warning */}
                    {summary.weakChapters.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                        <strong>Review Needed:</strong> {summary.weakChapters.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Card Action Bar */}
                  <div className="pt-3 border-t border-border-default flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {summary.studyTimeMinutes > 0 ? `${Math.round(summary.studyTimeMinutes / 60)}h logged` : '0h logged'}
                    </span>

                    <Link
                      href={`/academics/subject/${summary.subjectId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                    >
                      <span>Explore Chapters</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
