'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/supabase/AuthContext';
import { AuthService } from '@/lib/auth/authService';
import { PublicStudentCard, Team } from '@/lib/auth/types';
import {
  Users,
  Search,
  Flame,
  Zap,
  Trophy,
  ShieldCheck,
  UserPlus,
  Check,
  UserCheck,
  Clock,
  Sparkles,
  Send,
  X,
  Lock,
  Code,
  Eye,
  Award,
} from 'lucide-react';
import { HelpButton } from '@/components/help/HelpButton';
import { FeatureMiniTip } from '@/components/tutorial/FeatureMiniTip';

export default function CommunityPage() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<PublicStudentCard[]>(() =>
    AuthService.getPublicStudents(profile?.id)
  );
  const [teams, setTeams] = useState<Team[]>(() => AuthService.getTeams());
  const [selectedStudent, setSelectedStudent] = useState<PublicStudentCard | null>(null);

  // Team invitation modal state
  const [invitingStudent, setInvitingStudent] = useState<PublicStudentCard | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Teams where current user is captain
  const userCaptainTeams = useMemo(() => {
    if (!profile) return [];
    return teams.filter((t) => t.captainId === profile.id);
  }, [teams, profile]);

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.username.toLowerCase().includes(q) ||
        s.displayName.toLowerCase().includes(q) ||
        (s.teamName && s.teamName.toLowerCase().includes(q)) ||
        (s.skillLabTrack && s.skillLabTrack.toLowerCase().includes(q))
    );
  }, [students, searchTerm]);

  const handleSendFriendRequest = (targetStudent: PublicStudentCard) => {
    if (!profile) return;
    const res = AuthService.sendFriendRequest(profile, targetStudent.username);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setStudents(AuthService.getPublicStudents(profile.id));
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleOpenInviteModal = (student: PublicStudentCard) => {
    if (userCaptainTeams.length === 0) {
      setFeedback({
        type: 'error',
        message: 'You must be a team captain to invite members. Create a team first in Teams section.',
      });
      return;
    }
    setInvitingStudent(student);
    setSelectedTeamId(userCaptainTeams[0].id);
  };

  const handleSendTeamInvite = () => {
    if (!profile || !invitingStudent || !selectedTeamId) return;
    const res = AuthService.createTeamInvitation(selectedTeamId, profile, {
      id: invitingStudent.id,
      username: invitingStudent.username,
    });
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setInvitingStudent(null);
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
              Open Student Community
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Verified Peers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Student Progress Directory
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Discover fellow Class 9 ICSE peers, track shared consistency metrics, and recruit teammates.
          </p>
        </div>
        <HelpButton topicKey="social_competition" />
      </div>

      <FeatureMiniTip
        featureId="community_directory_intro"
        title="Privacy-Preserving Public Directory"
        badge="Community Safety Guarantee"
        description="Every student card displays verified consistency and squad metrics. Your exact desk routine, private mistake notes, doubt texts, and AI conversations are strictly confidential."
        quickTips={[
          'Search by @username or display name (emails are never public)',
          'Send friend requests to collaborate and compare revision cadence',
          'Team captains can invite active students to join their squad',
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by username, display name, team, or skill track..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400 font-mono">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>{filteredStudents.length} Students Listed</span>
        </div>
      </div>

      {/* Student Cards Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((student) => {
          const isSelf = profile && profile.id === student.id;

          return (
            <div
              key={student.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-indigo-600/20">
                      {student.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-white">{student.displayName}</h3>
                        {isSelf && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            You
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-indigo-400 font-semibold">
                        @{student.username}
                      </span>
                    </div>
                  </div>

                  {student.teamName && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 flex items-center gap-1">
                      <span>{student.teamEmblem || '⚡'}</span>
                      <span>{student.teamName}</span>
                    </span>
                  )}
                </div>

                {/* Badges / Grade */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {student.grade || 'Class 9 ICSE'}
                  </span>
                  {student.skillLabTrack && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-brand-blue border border-blue-500/20 flex items-center gap-1">
                      <Code className="w-2.5 h-2.5" />
                      <span>{student.skillLabTrack}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Verified Metrics Row */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-400">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{student.currentStreak}d</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium mt-0.5">Streak</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{student.weeklyConsistency}%</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium mt-0.5">Consistency</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-400">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{student.challengePoints}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium mt-0.5">Points</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(student)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Stats</span>
                </button>

                {!isSelf && (
                  <>
                    {student.friendStatus === 'friends' ? (
                      <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Friend</span>
                      </span>
                    ) : student.friendStatus === 'pending' ? (
                      <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Pending</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendFriendRequest(student)}
                        title="Send Friend Request"
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-md shadow-indigo-600/20"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {userCaptainTeams.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleOpenInviteModal(student)}
                        title="Invite to Squad"
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Public Student Stats Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
                  {selectedStudent.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedStudent.displayName}</h3>
                  <span className="font-mono text-xs text-indigo-400 font-semibold">
                    @{selectedStudent.username}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Allowed Public Progress Summary</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Weekly Consistency</span>
                    <span className="font-bold text-emerald-400 text-sm">{selectedStudent.weeklyConsistency}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Schedule Completion</span>
                    <span className="font-bold text-indigo-400 text-sm">{selectedStudent.taskCompletionPercent}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Current Streak</span>
                    <span className="font-bold text-amber-400 text-sm">{selectedStudent.currentStreak} Days</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Honest Points</span>
                    <span className="font-bold text-white text-sm">{selectedStudent.challengePoints}</span>
                  </div>
                </div>
              </div>

              {selectedStudent.skillLabTrack && (
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Skill Lab Focus</span>
                    <span className="font-bold text-white">{selectedStudent.skillLabTrack}</span>
                  </div>
                  <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                    {selectedStudent.skillLabHours || 10}h Logged
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-slate-300">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Confidential information (private study blocks, exact timetable, mistake logs, doubt entries, and AI coaching dialogues) are protected and omitted from public display.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Invitation Modal */}
      {invitingStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Invite to Squad</h3>
              </div>
              <button
                onClick={() => setInvitingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Invite <strong className="text-white">@{invitingStudent.username}</strong> ({invitingStudent.displayName}) to collaborate in your squad for weekly Dragon Egg challenges.
              </p>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Squad:</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {userCaptainTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emblem} {t.name} (Weekly Score: {t.weeklyScore})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInvitingStudent(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTeamInvite}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-colors"
              >
                Dispatch Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
