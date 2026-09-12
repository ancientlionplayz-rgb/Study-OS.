'use client';

import React, { useState } from 'react';
import {
  Award,
  Zap,
  Flame,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  History,
  Lock,
  Clock,
  BookOpen,
  Calculator,
  Calendar,
  Gift,
  HelpCircle,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { PointRulesConfig, PersonalRewardItem } from '../../types';

export default function RewardsPage() {
  const {
    profile,
    pointRules,
    rewardEvents,
    personalRewards,
    redemptions,
    streaksSummary,
    achievements,
    updatePointRules,
    createPersonalReward,
    deletePersonalReward,
    redeemPersonalReward,
    recomputeAllPoints,
  } = useStudyOS();

  // Modal / drawer states
  const [showConfigRules, setShowConfigRules] = useState(false);
  const [showNewRewardModal, setShowNewRewardModal] = useState(false);
  const [redeemNotice, setRedeemNotice] = useState<string | null>(null);
  const [recomputeNotice, setRecomputeNotice] = useState<string | null>(null);

  // Form states for point rules
  const [rulesForm, setRulesForm] = useState<PointRulesConfig>(pointRules);

  // Form state for creating custom reward
  const [newRewardForm, setNewRewardForm] = useState<{
    title: string;
    category: 'Gaming' | 'Video' | 'Activity' | 'Privilege' | 'Other';
    costPoints: number;
    description: string;
    requiresParentApproval: boolean;
  }>({
    title: '',
    category: 'Gaming',
    costPoints: 5,
    description: '',
    requiresParentApproval: false,
  });

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    updatePointRules(rulesForm);
    setShowConfigRules(false);
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardForm.title.trim()) return;
    createPersonalReward({
      title: newRewardForm.title.trim(),
      category: newRewardForm.category,
      costPoints: Math.max(1, Number(newRewardForm.costPoints)),
      description: newRewardForm.description.trim(),
      requiresParentApproval: newRewardForm.requiresParentApproval,
    });
    setNewRewardForm({
      title: '',
      category: 'Gaming',
      costPoints: 5,
      description: '',
      requiresParentApproval: false,
    });
    setShowNewRewardModal(false);
  };

  const handleRedeem = (reward: PersonalRewardItem) => {
    try {
      redeemPersonalReward(reward.id);
      setRedeemNotice(
        reward.requiresParentApproval
          ? `Eligibility unlocked for "${reward.title}"! Remember: actual execution is subject to family schedule and parent approval.`
          : `Claimed "${reward.title}"! Enjoy your planned reward guilt-free.`
      );
      setTimeout(() => setRedeemNotice(null), 6000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Redemption failed');
    }
  };

  const handleRecompute = () => {
    const net = recomputeAllPoints();
    setRecomputeNotice(`Audited all local events. Accurate balance: ${net} pts`);
    setTimeout(() => setRecomputeNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Philosophy Banner */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Stimulus Control & Positive Reinforcement
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Action-Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              Transparent Reward Economy
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRulesForm(pointRules);
                setShowConfigRules(true);
              }}
              className="px-3 py-1.5 rounded-xl border border-border-default bg-surface text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-soft flex items-center gap-1.5 transition-colors shadow-sm btn-interactive"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Configure Points
            </button>
            <button
              onClick={handleRecompute}
              title="Audit and recompute all points from event ledger"
              className="px-3 py-1.5 rounded-xl border border-border-default bg-surface text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-soft flex items-center gap-1.5 transition-colors shadow-sm btn-interactive"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Audit Ledger
            </button>
          </div>
        </div>

        {/* Behavioral Psychology Grounding Box */}
        <div className="p-4 rounded-2xl border border-border-default bg-surface text-xs text-text-secondary space-y-1.5 leading-relaxed shadow-sm">
          <div className="font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Core Principle: Important Work First, Planned Reward Second
          </div>
          <p className="text-text-secondary">
            This economy is not a magical &ldquo;dopamine detox.&rdquo; Instead, it uses evidence-based behavioral psychology:
            clear stimulus control, unbloated honest tracking, and earned rest. Complete your high-leverage ICSE priorities
            first; enjoy intentional recreation without lingering guilt.
          </p>
        </div>

        {redeemNotice && (
          <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-emerald-900 dark:text-emerald-300">Reward Unlocked!</div>
              <div>{redeemNotice}</div>
            </div>
          </div>
        )}

        {recomputeNotice && (
          <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 text-xs flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{recomputeNotice}</span>
          </div>
        )}
      </div>

      {/* Points & Rolling Consistency Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Zap className="w-6 h-6 fill-indigo-600 dark:fill-indigo-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Spendable Honest Points
            </div>
            <div className="text-3xl font-black text-text-primary font-mono">{profile.earnedPoints} pts</div>
            <div className="text-[10px] text-text-muted mt-0.5">Idempotent local ledger</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Core Study Streak
            </div>
            <div className="text-3xl font-black text-text-primary font-mono">
              {streaksSummary.studyStreak}d
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              Personal Best: <span className="text-text-primary font-semibold">{streaksSummary.bestStudyStreak}d</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Rolling 7-Day Consistency
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {streaksSummary.rolling7DayConsistency}%
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Missed 1 day doesn&apos;t zero out</div>
          </div>
        </div>
      </div>

      {/* Habit Streaks Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Habit Streaks &amp; Resilient Consistency
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Streaks measure uninterrupted commitment. If life interrupts, your rolling 7-day consistency and personal best preserve momentum.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Maths Streak */}
          <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-blue-400" /> Maths 60m
              </span>
              <span className="font-mono text-amber-400 font-bold">{streaksSummary.mathsStreak}d</span>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between pt-1">
              <span>Best Streak:</span>
              <span className="font-mono font-medium text-slate-300">{streaksSummary.bestMathsStreak}d</span>
            </div>
          </div>

          {/* 3.5h Daily Target Streak */}
          <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> 3.5h Study Target
              </span>
              <span className="font-mono text-amber-400 font-bold">{streaksSummary.studyStreak}d</span>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between pt-1">
              <span>Best Streak:</span>
              <span className="font-mono font-medium text-slate-300">{streaksSummary.bestStudyStreak}d</span>
            </div>
          </div>

          {/* Reading Streak */}
          <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Reading 5+ Pages
              </span>
              <span className="font-mono text-amber-400 font-bold">{streaksSummary.readingStreak}d</span>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between pt-1">
              <span>Best Streak:</span>
              <span className="font-mono font-medium text-slate-300">{streaksSummary.bestReadingStreak}d</span>
            </div>
          </div>

          {/* Workout Streak */}
          <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-red-400" /> Safe Calisthenics
              </span>
              <span className="font-mono text-amber-400 font-bold">{streaksSummary.workoutStreak}d</span>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between pt-1">
              <span>Best Streak:</span>
              <span className="font-mono font-medium text-slate-300">{streaksSummary.bestWorkoutStreak}d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meaningful & Restrained Achievements */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Restrained Achievements
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Milestones tied only to genuine academic and physical discipline. Strictly zero loot boxes, spins, or gimmicks.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievements.map((ach) => {
            const pct = Math.round((ach.progress / ach.maxProgress) * 100);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all ${
                  ach.unlocked
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-md'
                    : 'bg-slate-850/60 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        ach.unlocked
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{ach.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {ach.description}
                      </div>
                    </div>
                  </div>
                  {ach.unlocked ? (
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 shrink-0 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {ach.metricLabel}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        ach.unlocked ? 'bg-amber-400' : 'bg-brand-blue'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>{ach.description}</span>
                    <span className="font-mono">{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Reward Store */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Gift className="w-4 h-4 text-brand-blue" />
              Personal Reward Store (Non-Monetary)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exchange honest points for planned personal privileges. Important work first, reward second.
            </p>
          </div>

          <button
            onClick={() => setShowNewRewardModal(true)}
            className="px-3 py-1.5 rounded-lg border border-brand-blue/30 bg-brand-blue/20 text-xs font-semibold text-blue-300 hover:bg-brand-blue/30 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Reward
          </button>
        </div>

        {/* Parent Authority Disclaimer */}
        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-950/20 text-[11px] text-amber-300/90 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">Parent Authority Disclaimer: </span>
            For family privileges (e.g. weekend outings, extended console time), unlocking with honest points verifies academic completion inside StudyOS.
            Actual execution is always subject to parent agreement and family schedule. The app never overrides parental decisions.
          </div>
        </div>

        {/* Rewards List */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          {personalRewards.map((reward) => {
            const canAfford = profile.earnedPoints >= reward.costPoints;
            return (
              <div
                key={reward.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-850/80 hover:border-slate-750 transition-all flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {reward.category}
                        </span>
                        {reward.requiresParentApproval && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            Parent Approval Required
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{reward.title}</h4>
                    </div>
                    <span className="text-xs font-black font-mono px-2 py-1 rounded bg-blue-500/20 text-brand-blue border border-blue-500/30 shrink-0">
                      {reward.costPoints} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{reward.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    Redeemed: <span className="font-mono text-slate-300">{reward.timesRedeemed}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deletePersonalReward(reward.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Delete custom reward"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                        canAfford
                          ? 'bg-brand-blue text-white hover:bg-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                      }`}
                    >
                      {canAfford ? 'Redeem Reward' : `Need ${reward.costPoints - profile.earnedPoints} more pts`}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History of Redemptions & Event Log */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Redemptions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            Redemption History
          </h3>
          {redemptions.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 italic">
              No rewards redeemed yet. Complete study blocks to earn honest points!
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {redemptions.slice(0, 8).map((red) => (
                <div
                  key={red.id}
                  className="p-2.5 rounded-lg bg-slate-850/90 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{red.rewardTitle}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{red.date}</span>
                      {red.requiresParentApproval && (
                        <span className="text-amber-400 font-mono">
                          [{red.parentApprovalStatus === 'approved' ? 'Parent Approved' : 'Awaiting Family Discussion'}]
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-red-400">-{red.pointsSpent} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reward Event Ledger */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            Audit Ledger (Source Verification)
          </h3>
          {rewardEvents.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 italic">
              No points awarded yet. Finish tasks, reading, or workouts to log verified points.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {rewardEvents.slice(0, 8).map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-lg bg-slate-850/90 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{ev.reason}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{ev.date}</span>
                      <span
                        className={`font-mono px-1 py-0.2 rounded border ${
                          ev.source === 'verified_timer'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ev.source === 'verified_timer' ? 'Verified Timer' : 'Self-Reported'}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">+{ev.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configure Point Rules Modal */}
      {showConfigRules && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Configure Point Values</h3>
                <p className="text-xs text-slate-400">Adjust the weight of each in-app discipline trigger.</p>
              </div>
              <button
                onClick={() => setShowConfigRules(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRules} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Maths 60m Block Completed (Default: 2)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={rulesForm.maths60mPoints}
                  onChange={(e) =>
                    setRulesForm({ ...rulesForm, maths60mPoints: Number(e.target.value) })
                  }
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Full 3.5h Study Target Completed (Default: 5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={rulesForm.study35hPoints}
                  onChange={(e) =>
                    setRulesForm({ ...rulesForm, study35hPoints: Number(e.target.value) })
                  }
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  5+ Pages Non-Fiction Reading (Default: 1)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rulesForm.reading5pPoints}
                  onChange={(e) =>
                    setRulesForm({ ...rulesForm, reading5pPoints: Number(e.target.value) })
                  }
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Safe Workout Completed (Default: 1)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rulesForm.workoutPoints}
                  onChange={(e) =>
                    setRulesForm({ ...rulesForm, workoutPoints: Number(e.target.value) })
                  }
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Skill Lab Output / Code Submitted (Default: 1)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rulesForm.skillLabPoints}
                  onChange={(e) =>
                    setRulesForm({ ...rulesForm, skillLabPoints: Number(e.target.value) })
                  }
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Sleep Target Met 7.5h+ (Default: 1)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rulesForm.sleepTargetPoints}
                  onChange={(e) =>
                    setRulesForm({ ...rulesForm, sleepTargetPoints: Number(e.target.value) })
                  }
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigRules(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-blue text-white font-bold hover:bg-blue-600 shadow"
                >
                  Save Point Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Reward Modal */}
      {showNewRewardModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Create Personal Reward</h3>
                <p className="text-xs text-slate-400">Add an intentional, guilt-free reward for yourself.</p>
              </div>
              <button
                onClick={() => setShowNewRewardModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Reward Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45m Football Match Highlights"
                  value={newRewardForm.title}
                  onChange={(e) => setNewRewardForm({ ...newRewardForm, title: e.target.value })}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newRewardForm.category}
                    onChange={(e) =>
                      setNewRewardForm({
                        ...newRewardForm,
                        category: e.target.value as PersonalRewardItem['category'],
                      })
                    }
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Gaming">Gaming</option>
                    <option value="Video">Video</option>
                    <option value="Activity">Activity</option>
                    <option value="Privilege">Privilege</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Points Cost *</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={newRewardForm.costPoints}
                    onChange={(e) =>
                      setNewRewardForm({ ...newRewardForm, costPoints: Number(e.target.value) })
                    }
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description / Rules</label>
                <textarea
                  rows={2}
                  placeholder="When can this be claimed? e.g. After evening study block is complete."
                  value={newRewardForm.description}
                  onChange={(e) =>
                    setNewRewardForm({ ...newRewardForm, description: e.target.value })
                  }
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="parentApprovalCheck"
                  checked={newRewardForm.requiresParentApproval}
                  onChange={(e) =>
                    setNewRewardForm({ ...newRewardForm, requiresParentApproval: e.target.checked })
                  }
                  className="mt-0.5 rounded border-slate-700 text-brand-blue focus:ring-0"
                />
                <label htmlFor="parentApprovalCheck" className="text-[11px] text-slate-300 leading-snug cursor-pointer">
                  <span className="font-semibold text-white">Requires Parent Approval</span>
                  <p className="text-slate-400 mt-0.5">
                    Check if this is a family privilege or schedule change (e.g. outing, late movie).
                  </p>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewRewardModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-blue text-white font-bold hover:bg-blue-600 shadow"
                >
                  Create Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
