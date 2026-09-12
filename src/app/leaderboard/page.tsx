'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/AuthContext';
import { AuthService } from '@/lib/auth/authService';
import {
  Trophy,
  Flame,
  Zap,
  Shield,
  Users,
  Award,
  Flag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { HelpButton } from '@/components/help/HelpButton';
import { FeatureMiniTip } from '@/components/tutorial/FeatureMiniTip';

type LeaderboardTab = 'global' | 'friends' | 'teams' | 'challenges';

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');

  const students = useMemo(() => AuthService.getPublicStudents(profile?.id), [profile]);
  const teams = useMemo(() => AuthService.getTeams(), []);
  const friendships = useMemo(() => (profile ? AuthService.getFriendships(profile.id) : []), [profile]);

  // Normalized scoring formula:
  // Normalized Score = (Weekly Consistency % * 4) + (Task Completion % * 4) + (Streak * 10) + Capped Challenge Points
  const rankedStudents = useMemo(() => {
    return [...students]
      .map((s) => {
        const normalizedDisciplineScore = Math.round(
          s.weeklyConsistency * 4 + s.taskCompletionPercent * 4 + s.currentStreak * 10 + Math.min(s.challengePoints, 350)
        );
        return {
          ...s,
          normalizedScore: normalizedDisciplineScore,
        };
      })
      .sort((a, b) => b.normalizedScore - a.normalizedScore);
  }, [students]);

  const rankedFriends = useMemo(() => {
    const friendUsernames = new Set(
      friendships.filter((f) => f.status === 'accepted').map((f) => f.friendUsername)
    );
    return rankedStudents.filter((s) => s.id === profile?.id || friendUsernames.has(s.username));
  }, [rankedStudents, friendships, profile]);

  const rankedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.weeklyScore - a.weeklyScore);
  }, [teams]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Normalized Fair Play
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              Anti-Gaming Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Discipline Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Rankings based on schedule completion percentage, 7-day consistency, and solved revisions.
          </p>
        </div>
        <HelpButton topicKey="scores" />
      </div>

      <FeatureMiniTip
        featureId="leaderboard_normalized_fairness"
        title="Why Raw Hours Do Not Determine Winner"
        badge="Healthy Habit Principle"
        description="A student with 3.5h of focused work who completed 100% of their plan and daily Maths beats someone claiming 14 continuous hours without problem verification. Fair metrics reward daily consistency and error resolution."
        quickTips={[
          'Formula weights: 40% Plan Completion, 40% Habit Consistency, 20% Revision Streak',
          'Challenge points are capped daily to protect healthy sleep schedules',
          'Teams compete collectively for the weekly Dragon Egg trophy rotating every Sunday',
        ]}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'global'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Global Students</span>
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'friends'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Friends ({rankedFriends.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'teams'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Squads & Dragon Egg</span>
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'challenges'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Active Challenges</span>
        </button>
      </div>

      {/* TAB 1: Global Registered Students */}
      {activeTab === 'global' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span>Rank & Student</span>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline">Consistency</span>
              <span className="hidden sm:inline">Completion</span>
              <span className="font-bold text-slate-300">Normalized Score</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {rankedStudents.map((student, idx) => {
              const isSelf = profile && profile.id === student.id;
              const rank = idx + 1;

              return (
                <div
                  key={student.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isSelf
                      ? 'bg-indigo-950/30 border-indigo-500/40 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center font-mono shrink-0 ${
                        rank === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                          : rank === 2
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                          : rank === 3
                          ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rank}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{student.displayName}</span>
                        {isSelf && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            You
                          </span>
                        )}
                        {student.teamName && (
                          <span className="hidden md:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                            {student.teamEmblem} {student.teamName}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-indigo-400 block">@{student.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 text-xs shrink-0">
                    <div className="hidden sm:flex items-center gap-1 text-emerald-400 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{student.weeklyConsistency}%</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-indigo-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{student.taskCompletionPercent}%</span>
                    </div>
                    <div className="font-mono font-black text-sm text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                      {student.normalizedScore} pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Friends Leaderboard */}
      {activeTab === 'friends' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Friends Discipline Standings</span>
            </h3>
            <Link
              href="/friends"
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Friends</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {rankedFriends.length <= 1 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-3">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p>You haven’t added any study peers yet.</p>
              <Link
                href="/community"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                <span>Discover Students in Community</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {rankedFriends.map((friend, idx) => (
                <div
                  key={friend.id}
                  className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-400 w-5">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{friend.displayName}</div>
                      <span className="font-mono text-indigo-400 text-xs">@{friend.username}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs">{friend.weeklyConsistency}% consistency</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-xl">
                      {friend.normalizedScore} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Squads / Teams & Dragon Egg Standings */}
      {activeTab === 'teams' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Squad Dragon Egg Standings</span>
            </h3>
            <Link
              href="/teams"
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Squad Hub & Invites</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedTeams.map((team, idx) => (
              <div
                key={team.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{team.emblem}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{team.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        #{idx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{team.description}</p>
                    <div className="text-[11px] text-slate-500 font-mono mt-2">
                      {team.members.length} Active Members • Capt. {team.captainName}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Squad Score</div>
                  <div className="text-lg font-black text-amber-400 font-mono">{team.weeklyScore}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Active Challenges */}
      {activeTab === 'challenges' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-400" />
              <span>Weekly Academic Recovery Challenges</span>
            </h3>
            <Link
              href="/challenges"
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>All Challenges</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">7-Day Mathematics Sprint</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-slate-400">Complete 60m mandatory Mathematics every day for 7 consecutive days.</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Reward: +50 Honest Points</span>
                <span className="font-mono text-indigo-400">24 Students Active</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Zero Unresolved Mistakes</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Active
                </span>
              </div>
              <p className="text-slate-400">Reattempt and resolve all due +1, +3, +7 revisions in your mistake journal.</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Reward: +35 Honest Points</span>
                <span className="font-mono text-indigo-400">18 Students Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
