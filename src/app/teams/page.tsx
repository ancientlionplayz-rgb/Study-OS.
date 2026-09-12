'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/AuthContext';
import { AuthService } from '@/lib/auth/authService';
import { Team, TeamInvitation } from '@/lib/auth/types';
import {
  Shield,
  Trophy,
  Sparkles,
  Award,
  Plus,
  Users,
  Send,
  Check,
  X,
  UserMinus,
  LogOut,
  Flame,
  ArrowRight,
  Clock,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { HelpButton } from '@/components/help/HelpButton';
import { FeatureMiniTip } from '@/components/tutorial/FeatureMiniTip';

export default function TeamsPage() {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>(() => AuthService.getTeams());
  const [invitations, setInvitations] = useState<TeamInvitation[]>(() =>
    AuthService.getTeamInvitations(profile?.id)
  );

  // Modals & form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmblem, setNewTeamEmblem] = useState('⚡');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newTeamMotto, setNewTeamMotto] = useState('');
  const [newTeamCategory, setNewTeamCategory] = useState<'Academic Excellence' | 'STEM & Coding' | 'Consistency & Habit' | 'Sports & Balance' | 'General'>('Academic Excellence');
  const [newTeamGoal, setNewTeamGoal] = useState('');
  const [newTeamTargetHours, setNewTeamTargetHours] = useState(25);
  const [newTeamMaxMembers, setNewTeamMaxMembers] = useState(8);
  const [newTeamJoinType, setNewTeamJoinType] = useState<'open' | 'request' | 'invite_only'>('open');
  const [newTeamPrivacy, setNewTeamPrivacy] = useState<'public' | 'registered_only'>('public');
  const [newTeamLogoUrl, setNewTeamLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [teamFormErrors, setTeamFormErrors] = useState<Record<string, string>>({});

  // Quick direct invite modal state
  const [inviteTeamId, setInviteTeamId] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshData = () => {
    setTeams(AuthService.getTeams());
    if (profile) {
      setInvitations(AuthService.getTeamInvitations(profile.id));
    }
  };

  // Find user's current joined team
  const myTeam = useMemo(() => {
    if (!profile) return null;
    return teams.find((t) => t.members.some((m) => m.userId === profile.id)) || null;
  }, [teams, profile]);

  // Pending invitations received by the current user
  const incomingInvitations = useMemo(() => {
    if (!profile) return [];
    return invitations.filter((inv) => inv.invitedUserId === profile.id && inv.status === 'pending');
  }, [invitations, profile]);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const errors: Record<string, string> = {};
    if (!newTeamName.trim() || newTeamName.trim().length < 3) {
      errors.name = 'Team name must be at least 3 characters.';
    } else if (newTeamName.trim().length > 40) {
      errors.name = 'Team name cannot exceed 40 characters.';
    }

    if (newTeamMotto.trim() && newTeamMotto.trim().length > 60) {
      errors.motto = 'Motto cannot exceed 60 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setTeamFormErrors(errors);
      return;
    }
    setTeamFormErrors({});

    if (myTeam) {
      setFeedback({
        type: 'error',
        message: `You are already a member of ${myTeam.name}. Leave your current squad before forming a new one.`,
      });
      return;
    }

    const created = AuthService.createTeam(
      newTeamName,
      newTeamEmblem || '⚡',
      newTeamDescription || 'Class 9 ICSE Academic Discipline Squad',
      profile,
      {
        motto: newTeamMotto,
        category: newTeamCategory,
        teamGoal: newTeamGoal,
        weeklyTargetHours: Number(newTeamTargetHours) || 25,
        maxMembers: Number(newTeamMaxMembers) || 8,
        joinType: newTeamJoinType,
        privacy: newTeamPrivacy,
        logoUrl: newTeamLogoUrl || undefined,
      }
    );

    setFeedback({ type: 'success', message: `Squad ${created.name} formed successfully!` });
    setShowCreateModal(false);
    setNewTeamName('');
    setNewTeamMotto('');
    setNewTeamDescription('');
    setNewTeamGoal('');
    setNewTeamLogoUrl('');
    refreshData();
  };

  const handleLeaveTeam = (teamId: string) => {
    if (!profile) return;
    if (confirm('Are you sure you want to depart this squad?')) {
      AuthService.leaveTeam(teamId, profile.id);
      setFeedback({ type: 'success', message: 'You left the squad.' });
      refreshData();
    }
  };

  const handleRemoveMember = (teamId: string, memberId: string, memberName: string) => {
    if (!profile) return;
    if (confirm(`Remove ${memberName} from this squad?`)) {
      const res = AuthService.removeTeamMember(teamId, profile.id, memberId);
      if (res) {
        setFeedback({ type: 'success', message: `Removed ${memberName} from squad.` });
        refreshData();
      } else {
        setFeedback({ type: 'error', message: 'Only squad captain can remove members.' });
      }
    }
  };

  const handleRespondInvitation = (invitationId: string, accept: boolean) => {
    if (!profile) return;
    if (accept && myTeam) {
      setFeedback({
        type: 'error',
        message: 'You are already in a team. Please leave your current team first.',
      });
      return;
    }

    const res = AuthService.respondToTeamInvitation(invitationId, accept, profile);
    if (res) {
      setFeedback({
        type: 'success',
        message: accept ? 'You joined the squad!' : 'Invitation declined.',
      });
      refreshData();
    }
  };

  const handleSendDirectInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !inviteTeamId || !inviteUsername.trim()) return;

    const clean = inviteUsername.trim().toLowerCase().replace('@', '');
    const allUsers = AuthService.getRegisteredUsers();
    const target = allUsers.find((u) => u.username.toLowerCase() === clean);

    if (!target) {
      setFeedback({ type: 'error', message: `Student @${clean} not found. Check Community directory.` });
      return;
    }

    const res = AuthService.createTeamInvitation(inviteTeamId, profile, {
      id: target.id,
      username: target.username,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setInviteTeamId(null);
      setInviteUsername('');
      refreshData();
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Squad Operations & Competitions
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Live Squads
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Teams & Dragon Egg Trophy
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Collaborative academic squads competing on task percentage, revision consistency, and habits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!myTeam && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Squad</span>
            </button>
          )}
          <HelpButton topicKey="teams" />
        </div>
      </div>

      <FeatureMiniTip
        featureId="teams_intro"
        title="Squad Competitions & Normalized Fair Play"
        badge="Fair Multi-Student Teams"
        description="Students with different morning, tuition, or football schedules compete fairly against their own agreed quotas. Teams earn points through completed revisions and habit consistency."
        quickTips={[
          'Teams compete on percentage of planned tasks completed—never raw sleepless hours',
          'The Dragon Egg rotates every Sunday at midnight to the most disciplined team',
          'Private by default: teammates cannot see your private notes, doubts, or school details',
          'Invite peers easily from the Community Directory or with direct @username invites',
        ]}
      />

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Incoming Invitations Notice */}
      {incomingInvitations.length > 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/20 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Send className="w-4 h-4" />
            <span>Incoming Squad Invitations ({incomingInvitations.length})</span>
          </div>

          <div className="space-y-2">
            {incomingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{inv.teamEmblem}</span>
                    <span>{inv.teamName}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Invited by <strong className="text-slate-200">{inv.inviterName}</strong> on{' '}
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespondInvitation(inv.id, true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleRespondInvitation(inv.id, false)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symbolic Dragon Egg Trophy Spotlight */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-indigo-950/20 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0 flex items-center justify-center w-28 h-36 rounded-2xl bg-slate-950/80 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] p-2">
            <svg
              viewBox="0 0 100 130"
              className="w-24 h-32 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]"
            >
              <defs>
                <linearGradient id="eggGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="40%" stopColor="#311042" />
                  <stop offset="70%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <linearGradient id="facetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M 50 10 C 20 10, 8 60, 8 95 C 8 115, 25 125, 50 125 C 75 125, 92 115, 92 95 C 92 60, 80 10, 50 10 Z"
                fill="url(#eggGrad)"
                stroke="#d97706"
                strokeWidth="1.5"
              />
              <polygon points="50,22 64,42 50,55 36,42" fill="url(#facetGrad)" stroke="#c084fc" strokeWidth="0.8" />
              <polygon points="36,42 50,55 38,76 22,58" fill="#581c87" opacity="0.6" stroke="#c084fc" strokeWidth="0.5" />
              <polygon points="64,42 78,58 62,76 50,55" fill="#581c87" opacity="0.6" stroke="#c084fc" strokeWidth="0.5" />
              <polygon points="50,55 62,76 50,96 38,76" fill="url(#facetGrad)" stroke="#fbbf24" strokeWidth="0.8" />
              <polygon points="38,76 50,96 42,116 26,98" fill="#3b0764" opacity="0.7" stroke="#c084fc" strokeWidth="0.5" />
              <polygon points="62,76 74,98 58,116 50,96" fill="#3b0764" opacity="0.7" stroke="#c084fc" strokeWidth="0.5" />
              <polygon points="50,96 58,116 50,122 42,116" fill="#fbbf24" opacity="0.8" />
              <circle cx="50" cy="55" r="2" fill="#38bdf8" />
            </svg>
            <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono text-amber-300 uppercase font-bold tracking-wider">
              Weekly Trophy
            </div>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              The Legendary Dragon Egg
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Awarded to the Most Disciplined Squad
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Symbol of ultimate desk discipline. Calculated from your squad’s average plan completion, due revisions resolved, and core habits. Rotates automatically every Sunday at 11:59 PM.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Non-monetary & Purely Disciplinary
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3 text-indigo-400" />
                Normalized Scoring Fairness
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User's Squad Hub if Joined */}
      {myTeam && (
        <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{myTeam.emblem}</span>
                <h2 className="text-xl font-black text-white">{myTeam.name}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Your Squad
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{myTeam.description}</p>
            </div>

            <div className="flex items-center gap-2">
              {myTeam.captainId === profile?.id && (
                <button
                  onClick={() => setInviteTeamId(myTeam.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Student</span>
                </button>
              )}
              <button
                onClick={() => handleLeaveTeam(myTeam.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Squad</span>
              </button>
            </div>
          </div>

          {/* Squad Roster */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Squad Roster ({myTeam.members.length} Members)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myTeam.members.map((member) => (
                <div
                  key={member.userId}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                      {member.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>{member.displayName}</span>
                        {member.role === 'captain' && (
                          <span className="text-[9px] text-amber-400 font-mono font-bold">★ Capt</span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">@{member.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {member.weeklyContribution} pts
                    </span>
                    {myTeam.captainId === profile?.id && member.userId !== profile?.id && (
                      <button
                        onClick={() => handleRemoveMember(myTeam.id, member.userId, member.displayName)}
                        title="Remove member"
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Active Squads Leaderboard & Discovery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Weekly Squad Standings</span>
          </h3>
          <Link
            href="/community"
            className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Browse Community Directory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{team.emblem}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{team.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                        #{idx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{team.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Captain</span>
                  <span className="font-bold text-white text-xs truncate block">{team.captainName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Members</span>
                  <span className="font-bold text-indigo-400 text-xs">{team.members.length}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Score</span>
                  <span className="font-bold text-amber-400 text-xs">{team.weeklyScore}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{team.achievements.join(' • ')}</span>
                </div>

                {!myTeam && (
                  <button
                    onClick={() => {
                      if (!profile) return;
                      const res = AuthService.createTeamInvitation(team.id, team.members[0] as any, profile);
                      if (res.success) {
                        setFeedback({ type: 'success', message: `Join request sent to ${team.name}!` });
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                  >
                    <span>Request to Join</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Squad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Form a New Squad</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Squad Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Apex Scholars"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {teamFormErrors.name && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{teamFormErrors.name}</span>
                )}
                <span className="text-[10px] text-slate-500 mt-1 block">Between 3 and 40 characters. Identifies your squad on the community leaderboard.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Squad Category
                  </label>
                  <select
                    value={newTeamCategory}
                    onChange={(e) => setNewTeamCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Academic Excellence">Academic Excellence</option>
                    <option value="STEM & Coding">STEM & Coding</option>
                    <option value="Consistency & Habit">Consistency & Habit</option>
                    <option value="Sports & Balance">Sports & Balance</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Weekly Target Hours
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={newTeamTargetHours}
                    onChange={(e) => setNewTeamTargetHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Collective weekly study hours.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motto
                </label>
                <input
                  type="text"
                  value={newTeamMotto}
                  onChange={(e) => setNewTeamMotto(e.target.value)}
                  placeholder="e.g. Mastered through daily arithmetic"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Join Access
                  </label>
                  <select
                    value={newTeamJoinType}
                    onChange={(e) => setNewTeamJoinType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="open">Open for Anyone</option>
                    <option value="request">Request to Join</option>
                    <option value="invite_only">Invite Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Max Members
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="16"
                    value={newTeamMaxMembers}
                    onChange={(e) => setNewTeamMaxMembers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Squad Emblem / Icon
                </label>
                <div className="flex items-center gap-2">
                  {['⚡', '🚀', '🔥', '🛡️', '🎯', '🦅', '⚔️'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewTeamEmblem(em)}
                      className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all ${
                        newTeamEmblem === em
                          ? 'border-indigo-500 bg-indigo-500/20 shadow-md shadow-indigo-500/20'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Rules
                </label>
                <textarea
                  rows={2}
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Daily maths focus, zero uncompleted revisions, and weekend stamina."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-colors btn-interactive"
                >
                  Confirm Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Invite Modal */}
      {inviteTeamId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Direct Squad Invitation</h3>
              </div>
              <button
                onClick={() => setInviteTeamId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendDirectInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student @Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-indigo-400">@</span>
                  <input
                    type="text"
                    required
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder="aarav_icse"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  You can find registered student usernames on the{' '}
                  <Link href="/community" className="text-indigo-400 hover:underline">
                    Community page
                  </Link>
                  .
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteTeamId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
