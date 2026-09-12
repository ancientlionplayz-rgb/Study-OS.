'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Brain,
  ShieldCheck,
  Zap,
  HelpCircle,
  AlertOctagon,
  Calendar,
  Clock,
  RotateCcw,
  Target,
  ArrowRight,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  RefreshCw,
  BookOpen,
  HelpCircle as QuestionIcon,
  ChevronDown,
  Layers,
  Award,
  Flame,
  Check,
  PlusCircle,
  X,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { Header } from './components/Header';
import { CoachCapability, CoachApiResponse, AnswerMode, ConversationMessage, StructuredCoachExplanation } from '../../lib/coach/types';
import { ICSE_SUBJECTS } from '../../lib/constants';
import { SubjectName } from '../../types';
import { HelpButton } from '../../components/help/HelpButton';
import { FeatureMiniTip } from '../../components/tutorial/FeatureMiniTip';
import { MarkdownRenderer } from '../../components/ai/MarkdownRenderer';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  capability?: CoachCapability;
  mode?: AnswerMode;
  question?: string;
  subject?: string;
  topic?: string;
  response?: CoachApiResponse;
  timestamp: string;
}

export default function AICoachPage() {
  const {
    dailyPlan,
    sessions,
    revisionsDue,
    doubts,
    mistakes,
    selectedDate,
    createMistake,
  } = useStudyOS();

  // Active state
  const [activeCapability, setActiveCapability] = useState<CoachCapability>('explain_topic');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('standard');
  const [selectedSubject, setSelectedSubject] = useState<SubjectName | ''>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [selectedDoubtId, setSelectedDoubtId] = useState<string>('');
  const [selectedMistakeId, setSelectedMistakeId] = useState<string>('');

  // Available chapters based on selectedSubject
  const activeSubjectObj = ICSE_SUBJECTS.find((s) => s.name === selectedSubject);
  const availableChapters = activeSubjectObj ? activeSubjectObj.chapters : [];

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Understanding your question...');
  const [errorMessage, setErrorMessage] = useState<{ category: string; text: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  // API Status & Ping
  const [apiStatus, setApiStatus] = useState<{
    configured: boolean;
    model: string;
    mode?: string;
    health?: {
      status: 'online' | 'rate_limited' | 'quota_exhausted' | 'unauthorized' | 'offline' | 'fallback_mode';
      latencyMs?: number;
      model: string;
      message: string;
    };
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch coach engine status on mount
  useEffect(() => {
    fetch('/api/ai/coach')
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => {
        setApiStatus({ configured: false, model: 'deterministic_engine', mode: 'offline' });
      });
  }, []);

  // Pre-select first doubt / mistake if available
  useEffect(() => {
    if (doubts[0]?.id && !selectedDoubtId) {
      setSelectedDoubtId(doubts[0].id);
    }
  }, [doubts, selectedDoubtId]);

  useEffect(() => {
    if (mistakes[0]?.id && !selectedMistakeId) {
      setSelectedMistakeId(mistakes[0].id);
    }
  }, [mistakes, selectedMistakeId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Execute request to Central AI service
  const handleAsk = async (
    queryOverride?: string,
    modeOverride?: AnswerMode,
    capabilityOverride?: CoachCapability,
    topicOverride?: string,
    subjectOverride?: SubjectName | '',
    chapterOverride?: string
  ) => {
    if (loading) return; // Prevent duplicate submission

    const query = (queryOverride !== undefined ? queryOverride : inputText).trim();
    const cap = capabilityOverride || activeCapability;
    const mode = modeOverride || answerMode;
    const effectiveSubject = subjectOverride !== undefined ? subjectOverride : selectedSubject;
    const effectiveChapter = chapterOverride !== undefined ? chapterOverride : selectedChapter;
    const effectiveTopic = topicOverride !== undefined ? topicOverride : (selectedTopic || effectiveChapter);

    if (!query && cap === 'explain_topic' && !effectiveTopic) return;

    setLoading(true);
    setErrorMessage(null);
    setLoadingStep('Understanding your question...');

    const promptText = query || (effectiveTopic
      ? `Explain ${effectiveTopic}${effectiveSubject ? ` in ${effectiveSubject}` : ''} thoroughly.`
      : 'Explain this concept thoroughly.');

    // Add user message to conversation list
    const userMsgId = 'user_' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      question: promptText,
      mode,
      subject: effectiveSubject || undefined,
      topic: effectiveTopic || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!queryOverride) setInputText('');

    // Dynamic loading steps
    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Synthesizing ICSE conceptual foundation...');
    }, 900);
    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Structuring step-by-step working, diagrams & worked examples...');
    }, 2200);

    // Build bounded conversation history for follow-ups
    const boundedHistory: ConversationMessage[] = messages
      .slice(-4)
      .map((m) => ({
        role: m.role,
        content: m.role === 'user' ? (m.question || '') : formatResponseSummary(m.response),
      }));

    const rawContext = {
      todayPlan: dailyPlan,
      recentSessions: sessions.slice(0, 10),
      revisionsDue,
      doubts,
      mistakes,
      targetSubject: effectiveSubject || undefined,
      targetChapter: effectiveChapter || undefined,
      targetTopic: effectiveTopic || undefined,
      userPrompt: promptText,
      selectedDoubtId,
      selectedMistakeId,
      answerMode: mode,
      history: boundedHistory,
    };

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability: cap,
          mode,
          prompt: promptText,
          subject: effectiveSubject || undefined,
          chapter: effectiveChapter || undefined,
          topic: effectiveTopic || undefined,
          history: boundedHistory,
          rawContext,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        let category = 'network';
        if (res.status === 429) category = 'quota';
        else if (res.status === 401 || res.status === 403) category = 'unauthorized';
        else if (res.status === 503) category = 'model unavailable';

        setErrorMessage({
          category,
          text: `Server returned HTTP ${res.status}. Your question has been preserved below so you can try again.`,
        });
        setInputText(promptText); // Preserve question
        return;
      }

      const data: CoachApiResponse = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'asst_' + Date.now(),
        role: 'assistant',
        capability: cap,
        mode: data.answerMode || mode,
        response: data,
        subject: effectiveSubject || undefined,
        topic: effectiveTopic || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const msg = err instanceof Error ? err.message : 'Network error';
      setErrorMessage({
        category: 'timeout',
        text: `Failed to communicate with AI Coach (${msg}). Your question has been preserved.`,
      });
      setInputText(promptText); // Preserve question
    } finally {
      setLoading(false);
    }
  };

  // Helper to format assistant summary for history
  const formatResponseSummary = (res?: CoachApiResponse): string => {
    if (!res || !res.result) return '';
    const r = res.result as any;
    return r.directAnswer || r.explanation || r.overallAssessment || r.title || 'Guidance';
  };

  // Follow-up quick buttons
  const handleFollowUpSimpler = (prevQuestion?: string) => {
    handleAsk(
      `Please explain "${prevQuestion || selectedTopic}" in a simpler way using an everyday analogy and an intuitive example.`,
      'quick',
      'explain_topic'
    );
  };

  const handleFollowUpDeeper = (prevQuestion?: string) => {
    setAnswerMode('deep');
    handleAsk(
      `Provide a deep conceptual explanation for "${prevQuestion || selectedTopic}" including underlying reasoning, derivations, edge cases, and exam insights.`,
      'deep',
      'explain_topic'
    );
  };

  const handleFollowUpAnotherExample = (prevQuestion?: string) => {
    handleAsk(
      `Give me another realistic worked example with step-by-step numbers for "${prevQuestion || selectedTopic}".`,
      'standard',
      'explain_topic'
    );
  };

  const handleFollowUpQuizMe = (topic?: string) => {
    setActiveCapability('generate_quiz');
    handleAsk(
      `Quiz me on ${topic || selectedTopic} with 3 retrieval questions.`,
      'standard',
      'generate_quiz',
      topic || selectedTopic
    );
  };

  const handleAddToRevision = (title?: string, question?: string) => {
    createMistake({
      subject: (selectedSubject || 'Mathematics') as SubjectName,
      chapterTopic: selectedTopic || selectedChapter || title || 'Conceptual Review',
      errorCategory: 'Concept Error',
      originalQuestionContext: `[AI Coach Saved Review] ${title || selectedTopic || 'AI Review'}: ${question || ''}`,
      wrongApproach: 'Needs reinforcement on concept steps and application.',
      reason: 'Spaced retrieval reinforcement from AI Coach.',
      correctMethod: 'Master standard definition, steps, and worked examples.',
      createdDate: new Date().toISOString().slice(0, 10),
      isRepeated: false,
    });
    setStatusMsg('Added to +1d, +3d, +7d spaced revision queue!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const capabilitiesList: { id: CoachCapability; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'explain_topic', name: 'Explain Concept', icon: BookOpen },
    { id: 'explain_doubt', name: 'Solve a Doubt', icon: HelpCircle },
    { id: 'generate_quiz', name: 'Retrieval Quiz', icon: Brain },
    { id: 'analyze_mistake', name: 'Analyze Mistake', icon: AlertOctagon },
    { id: 'recommend_priorities', name: "Today's Priorities", icon: Target },
    { id: 'weak_topic_plan', name: 'Weak Topic Plan', icon: RotateCcw },
    { id: 'weekly_review', name: 'Weekly Audit', icon: Calendar },
    { id: 'skill_lab_plan', name: 'Skill Lab Plan', icon: Cpu },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personalized Learning Mentor
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Verified Real Gemini Tutor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            StudyOS AI Coach
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Deep conceptual explanations, worked examples, ASCII diagrams, and active retrieval for Class 9-10 ICSE.
          </p>
        </div>

        {/* Engine Status Badge & Help Button */}
        <div className="flex items-center gap-2">
          <HelpButton topicKey="ai_coach" />
          <div className="flex items-center gap-2 text-xs font-mono">
            {apiStatus?.health?.status === 'online' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">Gemini Online</span>
                {apiStatus.health.latencyMs && (
                  <span className="text-[11px] opacity-80">({apiStatus.health.latencyMs}ms)</span>
                )}
              </div>
            ) : apiStatus?.health?.status === 'rate_limited' || apiStatus?.health?.status === 'quota_exhausted' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Quota Limited (Fallback Active)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border-default text-text-secondary shadow-sm">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Deterministic Mode (Offline)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Dismissible Feature Mini-Tip */}
      <FeatureMiniTip
        featureId="ai_coach_intro"
        title="Real Teaching Mentorship"
        badge="Concept First"
        description="The AI Coach is built to teach until you truly understand. Select Quick, Standard, or Deep mode depending on how much detail you want."
        quickTips={[
          'Answers the direct question first, then explains the underlying concept and why it works',
          'Includes numerical worked examples and clean ASCII diagrams',
          'Highlights common student mistakes and ICSE board marking criteria',
          'Use interactive buttons below answers to ask for simpler analogies or deeper proofs',
        ]}
      />

      {/* Header – new component */}
      <Header answerMode={answerMode} setAnswerMode={setAnswerMode} />

      {/* Academic Context Selector: Subject -> Chapter -> Topic (Optional / Cascading) */}
      <div className="p-3.5 rounded-2xl bg-surface border border-border-default shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Academic Context Focus (Optional)
            </span>
            <span className="text-[11px] text-text-muted hidden sm:inline">
              — Leave unselected for general queries or pick to focus on a syllabus chapter
            </span>
          </div>
          {(selectedSubject || selectedChapter || selectedTopic) && (
            <button
              type="button"
              onClick={() => {
                setSelectedSubject('');
                setSelectedChapter('');
                setSelectedTopic('');
              }}
              className="text-xs font-semibold text-text-muted hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Context</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Subject Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                const sub = e.target.value as SubjectName | '';
                setSelectedSubject(sub);
                setSelectedChapter('');
                setSelectedTopic('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-default text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">✨ All Subjects (Auto-Detect)</option>
              {ICSE_SUBJECTS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Selector (Cascading) */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
              Chapter
            </label>
            <select
              value={selectedChapter}
              disabled={!selectedSubject}
              onChange={(e) => {
                const ch = e.target.value;
                setSelectedChapter(ch);
                setSelectedTopic('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-default text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedSubject ? '✨ All Chapters in ' + selectedSubject : 'Select Subject First'}
              </option>
              {availableChapters.map((ch) => (
                <option key={ch.id} value={ch.name}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Input / Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
              Topic / Sub-Concept
            </label>
            <input
              type="text"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              placeholder={selectedChapter ? `e.g. Core definition / formula` : 'Optional topic name'}
              className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-default text-xs font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Active Context Indicator */}
        <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-text-muted">
          <span>Active Context:</span>
          {selectedSubject ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-soft text-primary font-bold border border-primary-border">
              <span>{selectedSubject}</span>
              {selectedChapter && <span>→ {selectedChapter}</span>}
              {selectedTopic && <span>→ {selectedTopic}</span>}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-border-default">
              ✨ General Mode (Auto-infers from question)
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions – render a limited set of primary capabilities */}
      <div className="flex flex-wrap gap-2 mb-4">
        {capabilitiesList.slice(0, 5).map((cap) => {
          const Icon = cap.icon;
          const isSelected = activeCapability === cap.id;
          return (
            <button
              key={cap.id}
              onClick={() => setActiveCapability(cap.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                isSelected ? 'bg-primary text-primary-foreground shadow-md' : 'bg-surface-muted text-text-muted hover:bg-surface-muted/80'}
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{cap.name}</span>
            </button>
          );
        })}
        {/* More actions dropdown placeholder */}
        <div className="relative">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-muted text-text-muted hover:bg-surface-muted/80 text-sm font-medium">
            More ▾
          </button>
          {/* TODO: implement overflow menu */}
        </div>
      </div>

      {/* Quick Questions Starter Row */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedSubject('Physics');
            setSelectedChapter('Motion in One Dimension');
            setSelectedTopic('Velocity vs Acceleration');
            handleAsk(
              `Why is acceleration different from velocity?`,
              'standard',
              'explain_topic',
              'Velocity vs Acceleration',
              'Physics',
              'Motion in One Dimension'
            );
          }}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-muted border border-border-default text-xs font-semibold text-text-secondary flex items-center gap-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Physics: Velocity vs Acceleration</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedSubject('Mathematics');
            setSelectedChapter('Simultaneous Linear Equations');
            setSelectedTopic('Elimination Method');
            handleAsk(
              `Explain the elimination method for simultaneous linear equations with a complete worked example.`,
              'standard',
              'explain_topic',
              'Elimination Method',
              'Mathematics',
              'Simultaneous Linear Equations'
            );
          }}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-muted border border-border-default text-xs font-semibold text-text-secondary flex items-center gap-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Maths: Simultaneous Equations</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedSubject('Biology');
            setSelectedChapter('Plant and Animal Tissues');
            setSelectedTopic('Photosynthesis');
            handleAsk(
              `Explain photosynthesis and light vs dark reactions with an ASCII diagram.`,
              'deep',
              'explain_topic',
              'Photosynthesis',
              'Biology',
              'Plant and Animal Tissues'
            );
          }}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-muted border border-border-default text-xs font-semibold text-text-secondary flex items-center gap-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Biology: Photosynthesis with Diagram</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedSubject('Computer Applications');
            setSelectedChapter('Iterative Constructs (Loops)');
            setSelectedTopic('Python for loop');
            handleAsk(
              `Explain how a for loop with range(5) works in Python line-by-line.`,
              'standard',
              'explain_topic',
              'Python for loop',
              'Computer Applications',
              'Iterative Constructs (Loops)'
            );
          }}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-muted border border-border-default text-xs font-semibold text-text-secondary flex items-center gap-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Python: for i in range(5)</span>
        </button>
      </div>

      {/* Main Conversation Thread */}
      <div className="space-y-6">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border-default bg-surface p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-text-primary">
              Ready to teach. What concept would you like to master?
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
              Ask any physics, chemistry, biology, mathematics, history, or coding question. You will receive a direct answer, core concept derivation, worked examples, and an ASCII diagram.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3 animate-in fade-in duration-200">
            {msg.role === 'user' ? (
              <div className="flex items-start justify-end gap-2.5">
                <div className="max-w-2xl p-4 rounded-2xl bg-primary text-primary-foreground text-xs sm:text-sm font-medium shadow-sm">
                  <div className="flex items-center gap-2 mb-1 text-[10px] text-white/70">
                    <span className="font-bold">{msg.subject || 'General'}</span>
                    {msg.topic && (
                      <>
                        <span>•</span>
                        <span>{msg.topic}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="uppercase font-mono">{msg.mode}</span>
                  </div>
                  <div className="leading-relaxed font-semibold">{msg.question}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border-default bg-surface p-5 sm:p-7 shadow-sm space-y-5">
                {/* Assistant Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border-default">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-black">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-text-primary tracking-tight">
                        {(msg.response?.result as any)?.title || (msg.subject ? `${msg.subject}${msg.topic ? `: ${msg.topic}` : ''}` : (msg.topic || 'ICSE Explanation'))}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          msg.response?.source === 'gemini'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60'
                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/60'
                        }`}>
                          {msg.response?.source === 'gemini' ? 'Gemini AI Verified' : 'Deterministic StudyOS Engine'}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-muted text-text-muted border border-border-default">
                          {msg.mode} Mode
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-text-muted">{msg.timestamp}</span>
                </div>

                {/* Render Full Structured Response */}
                {renderStructuredAnswer(msg.response, msg.question)}

                {/* Interactive Follow-up Action Buttons */}
                <div className="pt-3 border-t border-border-default flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-text-muted mr-1">Follow up:</span>
                  <button
                    type="button"
                    onClick={() => handleFollowUpSimpler(msg.question)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-primary font-bold border border-border-default transition-all flex items-center gap-1.5"
                  >
                    <span>🌱</span>
                    <span>Explain Simpler</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFollowUpDeeper(msg.question)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-primary font-bold border border-border-default transition-all flex items-center gap-1.5"
                  >
                    <span>🔬</span>
                    <span>Explain Deeper</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFollowUpAnotherExample(msg.question)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-primary font-bold border border-border-default transition-all flex items-center gap-1.5"
                  >
                    <span>💡</span>
                    <span>Another Example</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFollowUpQuizMe(msg.topic)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-primary font-bold border border-border-default transition-all flex items-center gap-1.5"
                  >
                    <span>📝</span>
                    <span>Quiz Me</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToRevision((msg.response?.result as any)?.title, msg.question)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1.5 ml-auto"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add to Revision Queue</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner with Authentic Status Steps */}
        {loading && (
          <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary mb-0.5">
                {loadingStep}
              </div>
              <p className="text-[11px] text-text-muted">
                Generating direct answer, foundational concepts, step-by-step working, and diagrams.
              </p>
            </div>
          </div>
        )}

        {/* Safe Error Box with Try Again */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="uppercase">Error Category: {errorMessage.category}</span>
              </span>
              <button
                type="button"
                onClick={() => handleAsk()}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
            <p className="leading-relaxed">{errorMessage.text}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-4 z-20 rounded-2xl border border-border-default bg-surface/95 backdrop-blur-md p-3 shadow-xl space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask a question (e.g. 'Why is acceleration different from velocity?' or 'Explain photosynthesis')..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-muted border border-border-default text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none font-medium"
          />

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-surface-muted text-primary-foreground disabled:text-text-muted text-xs font-bold transition-all shadow-md shadow-primary/20 shrink-0 self-stretch flex items-center justify-center"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
          <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line</span>
          <span>Mode: <strong>{answerMode.toUpperCase()}</strong></span>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders structured sections:
 * - Direct Answer (Highlighted card)
 * - Concept & Why It Works (Markdown rendered)
 * - Steps & Derivations
 * - Worked Example (Formatted amber/gold card)
 * - Text/ASCII Diagram (Monospaced blueprint container)
 * - Common Student Mistakes (Rose alert card)
 * - ICSE Board Exam Tips (Indigo badge)
 * - Check-Yourself Question
 */
function renderStructuredAnswer(response?: CoachApiResponse, originalQuery?: string) {
  if (!response || !response.result) return null;
  const res = response.result as any;

  // If response is raw markdown fallback
  if (res.rawMarkdown && !res.concept) {
    return <MarkdownRenderer content={res.rawMarkdown} />;
  }

  return (
    <div className="space-y-4">
      {/* 1. DIRECT ANSWER */}
      {res.directAnswer && (
        <div className="p-4 rounded-xl bg-primary-soft/40 border border-primary-border space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary block">
            Direct Answer
          </span>
          <div className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
            <MarkdownRenderer content={res.directAnswer} />
          </div>
        </div>
      )}

      {/* 2. CONCEPT & WHY IT WORKS */}
      {(res.concept || res.explanation || res.whyItWorks) && (
        <div className="space-y-2">
          {res.concept && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Underlying Concept
              </h4>
              <div className="text-xs sm:text-sm leading-relaxed text-text-secondary">
                <MarkdownRenderer content={res.concept} />
              </div>
            </div>
          )}

          {res.explanation && (
            <div className="text-xs sm:text-sm leading-relaxed text-text-secondary">
              <MarkdownRenderer content={res.explanation} />
            </div>
          )}

          {res.whyItWorks && (
            <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-default space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-primary block">
                Why It Works (Scientific / Mathematical Reasoning)
              </span>
              <div className="text-xs leading-relaxed text-text-secondary">
                <MarkdownRenderer content={res.whyItWorks} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. STEP-BY-STEP PROCEDURE */}
      {Array.isArray(res.steps) && res.steps.length > 0 && (
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Step-by-Step Procedure
          </h4>
          <ol className="space-y-1.5 pl-2">
            {res.steps.map((step: string, sIdx: number) => (
              <li key={sIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary">
                <span className="font-mono text-xs font-bold text-primary shrink-0 w-5">
                  {sIdx + 1}.
                </span>
                <span className="flex-1 leading-relaxed">
                  <MarkdownRenderer content={step} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 4. WORKED EXAMPLE CARD */}
      {res.workedExample && (
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-800 dark:text-amber-300 block flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Worked Example
          </span>
          <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
            <MarkdownRenderer content={res.workedExample} />
          </div>
        </div>
      )}

      {/* 5. TEXT / ASCII DIAGRAM */}
      {res.diagram && typeof res.diagram === 'string' && res.diagram.trim().length > 0 && (
        <div className="rounded-xl border border-emerald-900/40 bg-slate-950 p-4 shadow-lg space-y-2">
          <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Structured Concept Diagram</span>
          </div>
          <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed p-1">
            {res.diagram.trim()}
          </pre>
        </div>
      )}

      {/* 6. CODE SNIPPET (IF ANY) */}
      {res.codeSnippet && res.codeSnippet.code && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden space-y-2">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono font-bold text-indigo-400">
            {res.codeSnippet.language || 'Python'} Execution
          </div>
          <pre className="p-4 font-mono text-xs text-slate-100 overflow-x-auto">
            <code>{res.codeSnippet.code}</code>
          </pre>
          {res.codeSnippet.explanation && (
            <div className="px-4 pb-3 text-xs text-slate-300 leading-relaxed">
              <MarkdownRenderer content={res.codeSnippet.explanation} />
            </div>
          )}
        </div>
      )}

      {/* 7. COMMON MISTAKES */}
      {Array.isArray(res.commonMistakes) && res.commonMistakes.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-rose-800 dark:text-rose-300 block flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Common Student Mistakes to Avoid
          </span>
          <ul className="space-y-1 text-xs text-rose-950 dark:text-rose-200 list-disc list-inside">
            {res.commonMistakes.map((mistake: string, mIdx: number) => (
              <li key={mIdx} className="leading-relaxed">
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 8. ICSE BOARD EXAM TIPS */}
      {Array.isArray(res.examTips) && res.examTips.length > 0 && (
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-indigo-800 dark:text-indigo-300 block flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            ICSE Exam & Marking Criteria
          </span>
          <ul className="space-y-1 text-xs text-indigo-950 dark:text-indigo-200 list-disc list-inside">
            {res.examTips.map((tip: string, tIdx: number) => (
              <li key={tIdx} className="leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 9. CHECK YOURSELF QUESTION */}
      {Array.isArray(res.checkYourself) && res.checkYourself.length > 0 && (
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 dark:text-emerald-300 block flex items-center gap-1.5">
            <QuestionIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Check-Yourself Question
          </span>
          <div className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
            {res.checkYourself.join(' ')}
          </div>
        </div>
      )}

      {/* 10. SUMMARY */}
      {res.summary && (
        <div className="text-xs text-text-muted italic border-l-2 border-primary pl-3">
          Summary: {res.summary}
        </div>
      )}

      {/* Render Planning Priorities if active */}
      {Array.isArray(res.priorities) && (
        <div className="space-y-3 pt-2">
          {res.priorities.map((p: any, pIdx: number) => (
            <div key={pIdx} className="p-4 rounded-xl bg-surface-muted border border-border-default space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-text-primary">
                <span>{p.priority}</span>
                <span className="font-mono text-primary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {p.duration}
                </span>
              </div>
              <p className="text-text-secondary">{p.reason}</p>
              <div className="p-2.5 rounded-lg bg-surface border border-border-default font-medium text-text-primary">
                Action: {p.action}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Proof: {p.proofOfCompletion}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Quiz Questions if active */}
      {Array.isArray(res.questions) && (
        <div className="space-y-3 pt-2">
          {res.questions.map((q: any, qIdx: number) => (
            <div key={qIdx} className="p-4 rounded-xl bg-surface-muted border border-border-default space-y-2 text-xs">
              <div className="font-bold text-text-primary text-sm">
                Question {qIdx + 1}: {q.question}
              </div>
              {q.hint && (
                <div className="text-text-muted italic">Hint: {q.hint}</div>
              )}
              <div className="p-3 rounded-lg bg-surface border border-border-default space-y-1">
                <strong className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold block">
                  Standard Solution
                </strong>
                <div className="text-text-primary">{q.standardSolution}</div>
                {Array.isArray(q.icseMarkingPoints) && (
                  <div className="text-[10px] text-text-muted font-mono mt-1">
                    Marks: {q.icseMarkingPoints.join(' • ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
