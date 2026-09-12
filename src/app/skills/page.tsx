'use client';

import React, { useState } from 'react';
import {
  Code,
  Sparkles,
  Bot,
  Cpu,
  Zap,
  TrendingUp,
  Briefcase,
  Layers,
  Atom,
  Binary,
  Clock,
  Plus,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Edit3,
  History,
  X,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { SkillTrack } from '../../types';

export default function SkillsPage() {
  const {
    skillTracks,
    skillSessions,
    createSkillSession,
    updateSkillTrack,
    selectedDate,
    customSkills,
    customSkillSessions,
    createCustomSkill,
    deleteCustomSkill,
    logCustomSkillSession,
    profile,
  } = useStudyOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSessionTrackId, setActiveSessionTrackId] = useState<string | null>(null);
  const [editingTrack, setEditingTrack] = useState<SkillTrack | null>(null);
  const [historyTrackId, setHistoryTrackId] = useState<string | null>(null);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);

  // Create custom skill modal state
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Programming');
  const [customCurrentLevel, setCustomCurrentLevel] = useState<'Beginner' | 'Foundational' | 'Intermediate' | 'Practitioner' | 'Advanced'>('Beginner');
  const [customTargetLevel, setCustomTargetLevel] = useState<'Beginner' | 'Foundational' | 'Intermediate' | 'Practitioner' | 'Advanced'>('Intermediate');
  const [customWhyLearn, setCustomWhyLearn] = useState('');
  const [customLearningGoal, setCustomLearningGoal] = useState('');
  const [customHoursPerWeek, setCustomHoursPerWeek] = useState(3);
  const [customResources, setCustomResources] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customSkillError, setCustomSkillError] = useState<string | null>(null);

  // Session form state
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [topicCovered, setTopicCovered] = useState('');
  const [summary, setSummary] = useState('');
  const [evidenceType, setEvidenceType] = useState('Working Code');
  const [evidenceOutput, setEvidenceOutput] = useState('');
  const [deliverable, setDeliverable] = useState('');

  // Edit track form state
  const [editLevel, setEditLevel] = useState('');
  const [editCurrentTopic, setEditCurrentTopic] = useState('');
  const [editResources, setEditResources] = useState('');
  const [editPracticeTask, setEditPracticeTask] = useState('');
  const [editMiniProject, setEditMiniProject] = useState('');

  const categories = [
    'All',
    'Programming & Automation',
    'Artificial Intelligence',
    'Hardware & Robotics',
    'Entrepreneurship & Strategy',
    'Product Development',
    'Advanced Science',
  ];

  const filteredTracks = selectedCategory === 'All'
    ? skillTracks
    : skillTracks.filter((t) => t.category === selectedCategory);

  const getTrackIcon = (id: string) => {
    switch (id) {
      case 'sk-python':
        return <Code className="w-5 h-5 text-blue-400" />;
      case 'sk-ai-fundamentals':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'sk-ai-agents':
        return <Bot className="w-5 h-5 text-emerald-400" />;
      case 'sk-robotics-theory':
        return <Cpu className="w-5 h-5 text-amber-400" />;
      case 'sk-electronics':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'sk-ai-business':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'sk-ai-agency-building':
        return <Briefcase className="w-5 h-5 text-cyan-400" />;
      case 'sk-ai-product-building':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'sk-quantum-physics':
        return <Atom className="w-5 h-5 text-pink-400" />;
      case 'sk-quantum-mechanics':
        return <Binary className="w-5 h-5 text-violet-400" />;
      default:
        return <Code className="w-5 h-5 text-brand-blue" />;
    }
  };

  const openLogSession = (track: SkillTrack) => {
    setActiveSessionTrackId(track.id);
    setTopicCovered(track.currentTopic);
    setSummary('');
    setDeliverable('');
    setEvidenceOutput('');

    // Pre-fill appropriate evidence type according to track specifications
    if (track.id.includes('python')) {
      setEvidenceType('Working Code');
    } else if (track.id.includes('agent')) {
      setEvidenceType('Working Feature / Spec / Test');
    } else if (track.id.includes('robotics') || track.id.includes('electronics')) {
      setEvidenceType('Circuit / Logic Sketch or Safe Simulation');
    } else if (track.id.includes('business') || track.id.includes('agency') || track.id.includes('product')) {
      setEvidenceType('Offer, Outreach Draft, Landing Page, Proposal or Validated Idea');
    } else if (track.id.includes('quantum')) {
      setEvidenceType('Explanation, Derivation appropriate to level, or Solved Problem');
    } else {
      setEvidenceType('Explanation / Implementation');
    }
  };

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionTrackId) return;

    createSkillSession({
      trackId: activeSessionTrackId,
      date: selectedDate,
      minutes: sessionMinutes,
      topicCovered: topicCovered.trim() || undefined,
      summary: summary.trim(),
      evidenceType,
      evidenceOutput: evidenceOutput.trim(),
      deliverable: deliverable.trim() || undefined,
    });

    setActiveSessionTrackId(null);
    setSummary('');
    setEvidenceOutput('');
    setDeliverable('');
  };

  const openEditTrack = (track: SkillTrack) => {
    setEditingTrack(track);
    setEditLevel(track.level);
    setEditCurrentTopic(track.currentTopic);
    setEditResources(track.resourceList.join('\n'));
    setEditPracticeTask(track.practiceTask);
    setEditMiniProject(track.miniProject);
  };

  const handleSaveTrackEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;

    updateSkillTrack(editingTrack.id, {
      level: editLevel.trim(),
      currentTopic: editCurrentTopic.trim(),
      resourceList: editResources.split('\n').map((r) => r.trim()).filter(Boolean),
      practiceTask: editPracticeTask.trim(),
      miniProject: editMiniProject.trim(),
    });

    setEditingTrack(null);
  };

  const totalSkillHours = skillTracks.reduce((acc, t) => acc + t.totalHoursInvested, 0);
  const activeTrack = skillTracks.find((t) => t.id === activeSessionTrackId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Holistic Growth Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              10 Specialized Tracks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Skill Lab & Innovation Tracks
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Deliberate practice with verifiable outputs. Watching videos is never counted as completion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCustomSkillError(null);
              setShowAddSkillModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all btn-interactive"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Skill</span>
          </button>
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right">
            <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">Invested Hours</div>
            <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">{totalSkillHours.toFixed(1)}h</div>
          </div>
        </div>
      </div>

      {/* Principle Banner: Evidence Requirement */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/60 dark:bg-indigo-950/20 p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-indigo-200 text-sm">
              The Evidence Standard: Video Alone Is Not Completion
            </h3>
            <p className="text-slate-600 dark:text-indigo-300 leading-relaxed">
              Every logged session requires tangible output evidence:
              <strong className="text-slate-900 dark:text-white"> Python</strong> → working code;
              <strong className="text-slate-900 dark:text-white"> AI</strong> → explanation/implementation;
              <strong className="text-slate-900 dark:text-white"> Agents</strong> → working feature/spec/test;
              <strong className="text-slate-900 dark:text-white"> Robotics/Electronics</strong> → circuit/logic sketch or safe simulation;
              <strong className="text-slate-900 dark:text-white"> Business</strong> → offer, outreach draft, landing page or validated idea;
              <strong className="text-slate-900 dark:text-white"> Quantum</strong> → explanation, derivation, or solved problem.
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skill Tracks Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredTracks.map((track) => {
          const trackSessions = skillSessions.filter((s) => s.trackId === track.id);
          const isExpanded = expandedTrackId === track.id;

          return (
            <div
              key={track.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      {getTrackIcon(track.id)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{track.title}</h3>
                      <div className="text-[11px] text-slate-400">{track.category}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-brand-blue border border-blue-500/20">
                      {track.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {track.totalHoursInvested}h logged
                    </span>
                  </div>
                </div>

                {/* Current Topic */}
                <div className="mb-3 p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-0.5">
                    Current Topic
                  </div>
                  <div className="text-xs font-semibold text-white leading-snug">
                    {track.currentTopic}
                  </div>
                </div>

                {/* Practice Task & Mini-Project Preview */}
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex items-start gap-2 text-slate-300">
                    <strong className="text-brand-blue shrink-0">Practice Task:</strong>
                    <span className="text-slate-300 leading-relaxed line-clamp-2">{track.practiceTask}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <strong className="text-emerald-400 shrink-0">Mini-Project:</strong>
                    <span className="text-slate-300 leading-relaxed line-clamp-2">{track.miniProject}</span>
                  </div>
                </div>

                {/* Expandable Resources and Guidelines */}
                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-slate-800 mb-4 animate-in fade-in duration-150">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-blue" />
                        Resource List
                      </div>
                      <ul className="space-y-1">
                        {track.resourceList.map((res, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-slate-500">•</span>
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                      <strong className="text-amber-300">Evidence Required: </strong>
                      {track.expectedEvidenceType}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedTrackId(isExpanded ? null : track.id)}
                  className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <span>Less details</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Resources & Plan</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditTrack(track)}
                    title="Edit level, topic, or resources"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistoryTrackId(track.id)}
                    title={`View ${trackSessions.length} session history logs`}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{trackSessions.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openLogSession(track)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-blue hover:bg-brand-blue-dark text-white transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Session</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Skill Session Modal */}
      {activeSessionTrackId && activeTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-brand-blue">
                  Evidence-Based Skill Session
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{activeTrack.title}</h3>
              </div>
              <button
                onClick={() => setActiveSessionTrackId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
              <strong>Requirement: </strong>
              {activeTrack.expectedEvidenceType}
            </div>

            <form onSubmit={handleLogSession} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Minutes Practiced
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    required
                    value={sessionMinutes}
                    onChange={(e) => setSessionMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Evidence Domain
                  </label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Working Code">Working Code</option>
                    <option value="Explanation / Implementation">Explanation / Implementation</option>
                    <option value="Working Feature / Spec / Test">Working Feature / Spec / Test</option>
                    <option value="Circuit / Logic Sketch or Safe Simulation">Circuit / Logic Sketch / Simulation</option>
                    <option value="Offer, Outreach Draft, Landing Page, Proposal or Validated Idea">Offer / Proposal / Business Draft</option>
                    <option value="Explanation, Derivation appropriate to level, or Solved Problem">Derivation / Solved Problem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Topic or Subtopic Covered
                </label>
                <input
                  type="text"
                  required
                  value={topicCovered}
                  onChange={(e) => setTopicCovered(e.target.value)}
                  placeholder="e.g. Inverted pendulum PID control"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Summary of Deliberate Practice
                </label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="What concepts were tested, built, or derived?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Verifiable Evidence / Working Code / Derivation Output
                </label>
                <textarea
                  rows={4}
                  required
                  value={evidenceOutput}
                  onChange={(e) => setEvidenceOutput(e.target.value)}
                  placeholder="Paste the working code snippet, derivation steps, circuit schematic notes, cold outreach copy, or spec breakdown..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-brand-blue text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Deliverable URL / Git Commit / Simulation Link (Optional)
                </label>
                <input
                  type="text"
                  value={deliverable}
                  onChange={(e) => setDeliverable(e.target.value)}
                  placeholder="e.g. github.com/user/project or falstad.com/circuit/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveSessionTrackId(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-lg shadow-blue-500/20"
                >
                  Save Verifiable Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Track Modal */}
      {editingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-brand-blue">
                  Configure Track
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{editingTrack.title}</h3>
              </div>
              <button
                onClick={() => setEditingTrack(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTrackEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current Level
                </label>
                <input
                  type="text"
                  required
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  placeholder="e.g. Beginner, Intermediate, Practitioner"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current Topic
                </label>
                <input
                  type="text"
                  required
                  value={editCurrentTopic}
                  onChange={(e) => setEditCurrentTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Resource List (one per line)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editResources}
                  onChange={(e) => setEditResources(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Practice Task
                </label>
                <textarea
                  rows={2}
                  required
                  value={editPracticeTask}
                  onChange={(e) => setEditPracticeTask(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mini-Project
                </label>
                <textarea
                  rows={2}
                  required
                  value={editMiniProject}
                  onChange={(e) => setEditMiniProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold"
                >
                  Update Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session History Modal */}
      {historyTrackId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-brand-blue">
                  Session History
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {skillTracks.find((t) => t.id === historyTrackId)?.title}
                </h3>
              </div>
              <button
                onClick={() => setHistoryTrackId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {skillSessions.filter((s) => s.trackId === historyTrackId).length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-slate-850/50 border border-slate-800 text-xs text-slate-400">
                No sessions recorded yet for this track. Use &quot;Log Session&quot; to register working code or derivations.
              </div>
            ) : (
              <div className="space-y-3">
                {skillSessions
                  .filter((s) => s.trackId === historyTrackId)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-slate-800 bg-slate-850/80 p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">{session.date}</span>
                          {session.topicCovered && (
                            <span className="font-semibold text-white">
                              {session.topicCovered}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-brand-blue">
                          {session.minutes} mins
                        </span>
                      </div>

                      <p className="text-slate-300 leading-relaxed">{session.summary}</p>

                      {session.evidenceOutput && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">
                            Evidence Output ({session.evidenceType})
                          </div>
                          <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-36">
                            {session.evidenceOutput}
                          </pre>
                        </div>
                      )}

                      {session.deliverable && (
                        <div className="flex items-center gap-1.5 text-[11px] text-blue-400">
                          <ExternalLink className="w-3 h-3" />
                          <span className="font-mono">{session.deliverable}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE CUSTOM SKILL MODAL */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                  Custom Skill Lab
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Create Your Own Skill Track
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track self-directed learning in any topic with honest output evidence.
                </p>
              </div>
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {customSkillError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {customSkillError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customName.trim()) {
                  setCustomSkillError('Please provide a descriptive skill name.');
                  return;
                }
                if (!customLearningGoal.trim()) {
                  setCustomSkillError('Please provide your concrete learning goal.');
                  return;
                }

                createCustomSkill({
                  userId: profile.id,
                  name: customName.trim(),
                  category: customCategory,
                  currentLevel: customCurrentLevel,
                  targetLevel: customTargetLevel,
                  whyLearn: customWhyLearn.trim(),
                  learningGoal: customLearningGoal.trim(),
                  estimatedHoursPerWeek: Number(customHoursPerWeek) || 3,
                  preferredDays: ['Monday', 'Wednesday', 'Saturday'],
                  resourceLinks: customResources ? customResources.split('\n').filter(Boolean) : [],
                  notes: customNotes.trim(),
                });

                setShowAddSkillModal(false);
                setCustomName('');
                setCustomWhyLearn('');
                setCustomLearningGoal('');
                setCustomResources('');
                setCustomNotes('');
                setCustomSkillError(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Flutter Mobile Development, Rust Systems, Chess Tactics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Programming">Programming</option>
                    <option value="AI">Artificial Intelligence</option>
                    <option value="Robotics">Robotics & Hardware</option>
                    <option value="Business">Business & Economics</option>
                    <option value="Science">Advanced Science</option>
                    <option value="Creative">Creative & Writing</option>
                    <option value="Sport">Sport & Physical</option>
                    <option value="Other">Other Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weekly Target Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={customHoursPerWeek}
                    onChange={(e) => setCustomHoursPerWeek(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Concrete Learning Goal *
                </label>
                <input
                  type="text"
                  required
                  value={customLearningGoal}
                  onChange={(e) => setCustomLearningGoal(e.target.value)}
                  placeholder="e.g. Build an offline cross-platform Pomodoro mobile app"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Why I Want to Learn This
                </label>
                <textarea
                  rows={2}
                  value={customWhyLearn}
                  onChange={(e) => setCustomWhyLearn(e.target.value)}
                  placeholder="Explain the intrinsic motivation behind learning this skill..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all btn-interactive"
                >
                  Create Skill Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
