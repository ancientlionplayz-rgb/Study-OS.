'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { SubjectName, SessionType, LearningLoopStep } from '../../types';
import { ICSE_SUBJECTS, LEARNING_LOOP_STEPS } from '../../lib/constants';

interface FocusTimerProps {
  onCompleteSession: (data: {
    subject: SubjectName;
    chapter: string;
    topic: string;
    plannedMinutes: number;
    actualMinutes: number;
    sessionType: SessionType;
  }) => void;
}

export function FocusTimer({ onCompleteSession }: FocusTimerProps) {
  const { timerState, saveTimerState, clearTimerState } = useStudyOS();

  // Selected parameters
  const [selectedSubject, setSelectedSubject] = useState<SubjectName>(
    timerState.subject || 'Mathematics'
  );
  const [chapter, setChapter] = useState(timerState.chapter || 'Simultaneous Linear Equations');
  const [topic, setTopic] = useState(timerState.topic || 'Independent Problem Solving');
  const [sessionType, setSessionType] = useState<SessionType>(
    timerState.sessionType || 'morning_maths'
  );
  const [plannedMinutes, setPlannedMinutes] = useState(timerState.plannedMinutes || 60);
  const [remainingSeconds, setRemainingSeconds] = useState(timerState.remainingSeconds || 3600);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>(timerState.status || 'idle');
  const [currentStep, setCurrentStep] = useState<LearningLoopStep>(
    timerState.currentLoopStep || 'retrieve'
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore timer state on mount & handle elapsed time if it was running
  useEffect(() => {
    if (timerState.status === 'running' && timerState.updatedAtTimestamp) {
      const elapsedSinceSave = Math.floor((Date.now() - timerState.updatedAtTimestamp) / 1000);
      const newRemaining = Math.max(0, timerState.remainingSeconds - elapsedSinceSave);
      setRemainingSeconds(newRemaining);
      setStatus(newRemaining === 0 ? 'idle' : 'running');
      if (timerState.subject) setSelectedSubject(timerState.subject);
      if (timerState.chapter) setChapter(timerState.chapter);
      if (timerState.topic) setTopic(timerState.topic);
      if (timerState.sessionType) setSessionType(timerState.sessionType);
      if (timerState.currentLoopStep) setCurrentStep(timerState.currentLoopStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main countdown loop
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setStatus('idle');
            return 0;
          }
          const nextSec = prev - 1;
          // Sync state to local storage every 5 seconds or on minute tick silently
          if (nextSec % 5 === 0) {
            saveTimerState(
              {
                subject: selectedSubject,
                chapter,
                topic,
                sessionType,
                plannedMinutes,
                remainingSeconds: nextSec,
                status: 'running',
                currentLoopStep: currentStep,
                updatedAtTimestamp: Date.now(),
              },
              false
            );
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, selectedSubject, chapter, topic, sessionType, plannedMinutes, currentStep, saveTimerState]);

  const handleStart = () => {
    setStatus('running');
    saveTimerState({
      subject: selectedSubject,
      chapter,
      topic,
      sessionType,
      plannedMinutes,
      remainingSeconds,
      status: 'running',
      currentLoopStep: currentStep,
      updatedAtTimestamp: Date.now(),
    });
  };

  const handlePause = () => {
    setStatus('paused');
    saveTimerState({
      subject: selectedSubject,
      chapter,
      topic,
      sessionType,
      plannedMinutes,
      remainingSeconds,
      status: 'paused',
      currentLoopStep: currentStep,
      updatedAtTimestamp: Date.now(),
    });
  };

  const handleReset = () => {
    setStatus('idle');
    const totalSec = plannedMinutes * 60;
    setRemainingSeconds(totalSec);
    clearTimerState();
  };

  const handleFinish = () => {
    const totalSec = plannedMinutes * 60;
    const elapsedSec = Math.max(0, totalSec - remainingSeconds);
    const actualMinutes = Math.max(1, Math.round(elapsedSec / 60));

    handleReset();

    onCompleteSession({
      subject: selectedSubject,
      chapter,
      topic,
      plannedMinutes,
      actualMinutes,
      sessionType,
    });
  };

  // Minutes and seconds formatting
  const displayMinutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const displaySeconds = String(remainingSeconds % 60).padStart(2, '0');

  const totalDurationSec = plannedMinutes * 60;
  const progressPercent = Math.min(
    100,
    Math.round(((totalDurationSec - remainingSeconds) / totalDurationSec) * 100)
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Strict Posture & Discipline Alert */}
      <div className="mb-6 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-brand-blue shrink-0" />
          <span>
            <strong className="text-slate-200">StudyOS Performance Rule: </strong>
            Study upright at a study desk with notebook and pen. Studying in bed or passive video bingeing is strictly prohibited.
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-center">
        {/* Left: Timer Display & Controls */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-64 h-64 flex items-center justify-center mb-6">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-brand-blue transition-all duration-300 ease-linear"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Clock */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black font-mono tracking-tight text-white">
                {displayMinutes}:{displaySeconds}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                {status === 'running' ? 'Focused Work' : status === 'paused' ? 'Paused' : 'Ready'}
              </span>
              <span className="text-[11px] font-mono text-brand-blue mt-1">
                {progressPercent}% Complete
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {status === 'running' ? (
              <button
                onClick={handlePause}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{status === 'paused' ? 'Resume' : 'Start Focus'}</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Session</span>
            </button>
          </div>
        </div>

        {/* Right: Session Configuration */}
        <div className="lg:col-span-6 space-y-4 rounded-xl bg-slate-850/70 border border-slate-800 p-5 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Session Configuration
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-brand-blue border border-blue-500/20">
              Strict Local-First
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Subject
              </label>
              <select
                disabled={status === 'running'}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as SubjectName)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
              >
                {ICSE_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Session Type
              </label>
              <select
                disabled={status === 'running'}
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Chapter
            </label>
            <input
              type="text"
              disabled={status === 'running'}
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
              placeholder="e.g. Simultaneous Linear Equations"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Specific Topic / Goal
            </label>
            <input
              type="text"
              disabled={status === 'running'}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-blue disabled:opacity-60"
              placeholder="e.g. Solve 10 problem sums without looking at answer key"
            />
          </div>

          {/* Quick Duration Buttons */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Duration Preset
            </label>
            <div className="flex items-center gap-2">
              {[30, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  disabled={status === 'running'}
                  onClick={() => {
                    setPlannedMinutes(mins);
                    setRemainingSeconds(mins * 60);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    plannedMinutes === mins
                      ? 'bg-brand-blue border-brand-blue text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  } disabled:opacity-60`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Current Learning Loop Step Selector */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Current Learning Loop Phase
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {LEARNING_LOOP_STEPS.map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step)}
                  className={`py-1 px-1.5 rounded text-[10px] font-medium border truncate transition-all ${
                    currentStep === s.step
                      ? 'bg-brand-blue/20 border-brand-blue text-brand-blue font-bold'
                      : 'bg-slate-800 border-slate-750 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
