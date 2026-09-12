'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { FocusTimer } from '../../components/study/FocusTimer';
import { LearningLoopGuide } from '../../components/study/LearningLoopGuide';
import { MathsEngineCard } from '../../components/study/MathsEngineCard';
import { NewSessionModal } from '../../components/study/NewSessionModal';
import { SubjectName, SessionType } from '../../types';

export default function StudyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialData, setInitialData] = useState<{
    subject?: SubjectName;
    chapter?: string;
    topic?: string;
    plannedMinutes?: number;
    actualMinutes?: number;
    sessionType?: SessionType;
  }>({});

  const handleCompleteTimerSession = (data: {
    subject: SubjectName;
    chapter: string;
    topic: string;
    plannedMinutes: number;
    actualMinutes: number;
    sessionType: SessionType;
  }) => {
    setInitialData(data);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Academic Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Deep Work Focus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Study Session & Focus Timer
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Persisted timer state, active 6-step retrieval loop, and anti-distraction architecture.
          </p>
        </div>

        <button
          onClick={() => {
            setInitialData({});
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-brand-blue" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Main Focus Timer */}
      <FocusTimer onCompleteSession={handleCompleteTimerSession} />

      {/* 6-Step Learning Loop Guide */}
      <LearningLoopGuide />

      {/* Mathematics Engine Card */}
      <MathsEngineCard />

      <NewSessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={initialData}
      />
    </div>
  );
}
