'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/supabase/AuthContext';
import { AuthService } from '@/lib/auth/authService';
import {
  Users,
  UserPlus,
  Check,
  X,
  Flame,
  Zap,
  ShieldCheck,
  AlertCircle,
  Clock,
  UserCheck,
} from 'lucide-react';

interface PeerFriend {
  id: string;
  username: string;
  displayName: string;
  status: 'pending' | 'accepted';
  isIncoming?: boolean;
  weeklyPoints: number;
  consistencyScore: number;
  currentStreak: number;
  targetExamYear: number;
}

const STORAGE_KEY_FRIENDS = 'studyos_peer_friends';

export default function FriendsPage() {
  const { profile } = useAuth();
  const [friends, setFriends] = useState<PeerFriend[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadFriends = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FRIENDS);
      if (raw) {
        setFriends(JSON.parse(raw));
      } else {
        const defaultPeers: PeerFriend[] = [
          {
            id: 'peer_1',
            username: 'aarav_icse',
            displayName: 'Aarav Patel',
            status: 'accepted',
            weeklyPoints: 240,
            consistencyScore: 92,
            currentStreak: 6,
            targetExamYear: 2027,
          },
          {
            id: 'peer_2',
            username: 'ananya_maths',
            displayName: 'Ananya Sen',
            status: 'pending',
            isIncoming: true,
            weeklyPoints: 190,
            consistencyScore: 88,
            currentStreak: 4,
            targetExamYear: 2027,
          },
        ];
        localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(defaultPeers));
        setFriends(defaultPeers);
      }
    } catch {
      setFriends([]);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const saveFriends = (updated: PeerFriend[]) => {
    setFriends(updated);
    localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(updated));
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const clean = searchUsername.trim().toLowerCase().replace('@', '');
    if (!clean) return;

    if (profile && profile.username.toLowerCase() === clean) {
      setStatusMessage({ type: 'error', text: 'You cannot add yourself as a peer.' });
      return;
    }

    if (friends.some((f) => f.username.toLowerCase() === clean)) {
      setStatusMessage({ type: 'error', text: 'Friend request or friendship already exists.' });
      return;
    }

    const allUsers = AuthService.getRegisteredUsers();
    const targetUser = allUsers.find(
      (u) => u.username.toLowerCase() === clean && u.accountStatus !== 'blocked' && u.accountStatus !== 'rejected'
    );

    const newFriend: PeerFriend = {
      id: targetUser ? targetUser.id : 'peer_' + Date.now(),
      username: clean,
      displayName: targetUser ? targetUser.displayName : clean,
      status: 'pending',
      isIncoming: false,
      weeklyPoints: 120,
      consistencyScore: 85,
      currentStreak: 2,
      targetExamYear: 2027,
    };

    const updated = [newFriend, ...friends];
    saveFriends(updated);
    setSearchUsername('');
    setStatusMessage({ type: 'success', text: `Friend request sent to @${clean}!` });

    // In-app notification
    if (targetUser && profile) {
      AuthService.createNotification({
        userId: targetUser.id,
        type: 'friend_request',
        title: 'New Friend Request',
        message: `${profile.displayName} (@${profile.username}) sent you a friend request.`,
        actionUrl: '/friends',
      });
    }
  };

  const handleAcceptRequest = (id: string) => {
    const updated = friends.map((f) => (f.id === id ? { ...f, status: 'accepted' as const } : f));
    saveFriends(updated);
    setStatusMessage({ type: 'success', text: 'Friend request accepted!' });
  };

  const handleRemoveFriend = (id: string) => {
    const updated = friends.filter((f) => f.id !== id);
    saveFriends(updated);
    setStatusMessage({ type: 'success', text: 'Friend removed.' });
  };

  const acceptedFriends = friends.filter((f) => f.status === 'accepted');
  const pendingRequests = friends.filter((f) => f.status === 'pending');

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Study Peers & Accountability
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold font-mono uppercase rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Connect with trusted ICSE classmates for mutual discipline without algorithmic feeds or distractions.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Private Notes & Doubts Are Never Shared</span>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Add Friend Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Add a Study Partner</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Enter your friend username to send an accountability invite.
        </p>

        <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">@</span>
            <input
              type="text"
              required
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="e.g. rohan_icse or aarav_icse"
              className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white bg-white dark:bg-slate-800"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Send Request</span>
          </button>
        </form>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending Peer Requests ({pendingRequests.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{req.displayName}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">@{req.username}</div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-1">
                    {req.isIncoming ? 'Sent you a peer invite' : 'Waiting for their confirmation'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {req.isIncoming ? (
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                      Pending
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveFriend(req.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Cancel request"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Friends Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Active Accountability Peers ({acceptedFriends.length})</span>
        </h3>

        {acceptedFriends.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No peers added yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Add your school friends or tuition partners to hold each other accountable to your daily study targets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {acceptedFriends.map((friend) => (
              <div
                key={friend.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {friend.displayName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {friend.displayName}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">@{friend.username}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="text-slate-400 hover:text-rose-600 text-[11px] hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{friend.currentStreak}d</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Streak</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                      <Zap className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400" />
                      <span>{friend.weeklyPoints}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Points</div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {friend.consistencyScore}%
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Consistency</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>Class 9 ICSE ({friend.targetExamYear})</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Verified Peer</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
