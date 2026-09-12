'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/supabase/AuthContext';
import { AuthService } from '@/lib/auth/authService';
import { UserAccountProfile, InviteCode, AccountStatus } from '@/lib/auth/types';
import {
  ShieldCheck,
  Users,
  Key,
  CheckCircle2,
  Ban,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Search,
  Clock,
} from 'lucide-react';

export default function AdminPortalPage() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<UserAccountProfile[]>([]);
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Invite Form State
  const [newCode, setNewCode] = useState('');
  const [newMaxUses, setNewMaxUses] = useState(5);
  const [showCreateInvite, setShowCreateInvite] = useState(false);

  const loadData = () => {
    setUsers(AuthService.getRegisteredUsers());
    setInvites(AuthService.getInviteCodes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (userId: string, status: AccountStatus) => {
    AuthService.updateAccountStatus(userId, status, user?.email || profile?.email || 'admin');
    loadData();
  };

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    AuthService.createInviteCode(newCode.trim(), Number(newMaxUses), null, profile?.username || 'admin');
    setNewCode('');
    setNewMaxUses(5);
    setShowCreateInvite(false);
    loadData();
  };

  const handleRevokeInvite = (id: string) => {
    AuthService.revokeInviteCode(id);
    loadData();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.inviteCodeUsed && u.inviteCodeUsed.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || u.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = users.filter((u) => u.accountStatus === 'pending').length;
  const approvedCount = users.filter((u) => u.accountStatus === 'approved').length;
  const activeInvitesCount = invites.filter((i) => i.status === 'active').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                StudyOS Access Control & Admin
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold font-mono uppercase rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                Staff Only
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage student signups, friend invite codes, and account permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Approvals
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{pendingCount}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">waiting for review</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Approved Students
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{approvedCount}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">active members</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Invites
            </span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              <Key className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{activeInvitesCount}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">codes valid</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Users & Approvals */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Student Account Requests & Members</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Only approved students can access StudyOS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white bg-white dark:bg-slate-800"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter students by approval status"
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Invite Used</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No student accounts found matching filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isPending = u.accountStatus === 'pending';
                  const isApproved = u.accountStatus === 'approved';
                  const isBlocked = u.accountStatus === 'blocked';
                  const isRejected = u.accountStatus === 'rejected';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{u.displayName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          @{u.username} • {u.email || 'no email'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {u.inviteCodeUsed ? (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                            {u.inviteCodeUsed}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                              : isBlocked
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isBlocked && <Ban className="w-3 h-3" />}
                          {u.accountStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleStatusChange(u.id, 'approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(u.id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-300 font-semibold text-[11px] transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isApproved && u.role !== 'admin' && (
                            <button
                              onClick={() => handleStatusChange(u.id, 'blocked')}
                              className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                              title="Block user access"
                            >
                              <Ban className="w-3 h-3" />
                              Block
                            </button>
                          )}

                          {(isBlocked || isRejected) && (
                            <button
                              onClick={() => handleStatusChange(u.id, 'approved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700 font-semibold text-[11px] transition-colors"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Invite Codes Manager */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Friends Invite Codes</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Only students with a valid code can register. Protects StudyOS from random signups.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateInvite(!showCreateInvite)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Code</span>
          </button>
        </div>

        {/* Create Code Form */}
        {showCreateInvite && (
          <form
            onSubmit={handleCreateInvite}
            className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900 flex flex-wrap items-center gap-3"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Code Text
              </label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. BATCH2027"
                className="px-3 py-1.5 text-xs font-mono uppercase rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Max Usages
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(Number(e.target.value))}
                className="w-24 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-end gap-2 pt-4">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                Create Code
              </button>
              <button
                type="button"
                onClick={() => setShowCreateInvite(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Invites Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Usages</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invites.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-xs">
                        {inv.code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(inv.code, inv.id)}
                        className="text-slate-400 hover:text-indigo-600 p-1"
                        title="Copy invite code"
                      >
                        {copiedId === inv.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {inv.timesUsed} / {inv.maxUses}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase font-mono ${
                        inv.status === 'active' && inv.timesUsed < inv.maxUses
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    @{inv.createdBy}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {inv.status === 'active' && (
                      <button
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 text-[11px] font-semibold hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}