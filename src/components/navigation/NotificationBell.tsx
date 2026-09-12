'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, UserPlus, Shield, Trophy, Sparkles, X, CheckCheck } from 'lucide-react';
import { useAuth } from '@/lib/supabase/AuthContext';
import { AuthService } from '@/lib/auth/authService';
import { InAppNotification } from '@/lib/auth/types';

export function NotificationBell() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = React.useCallback(() => {
    if (!profile) return;
    const notifs = AuthService.getNotifications(profile.id);
    setNotifications(notifs);
  }, [profile]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    AuthService.markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    if (!profile) return;
    AuthService.markAllNotificationsAsRead(profile.id);
    loadNotifications();
  };

  const getIconForType = (type: InAppNotification['type']) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return <UserPlus className="w-3.5 h-3.5 text-indigo-400" />;
      case 'team_invitation':
      case 'team_accepted':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      case 'challenge_started':
      case 'team_milestone':
      case 'weekly_result':
      default:
        return <Trophy className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          loadNotifications();
        }}
        className="relative p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-xs text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                <Sparkles className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                <p>No new notifications.</p>
                <p className="text-[10px] text-slate-600">Friend requests & squad alerts will appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 text-xs flex items-start justify-between gap-2.5 transition-colors ${
                    notif.read ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-800/30 text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="p-1.5 rounded-xl bg-slate-800 border border-slate-700/80 mt-0.5 shrink-0">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-xs truncate">{notif.title}</div>
                      <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{notif.message}</p>
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          onClick={() => {
                            handleMarkAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="inline-block mt-1.5 text-[10px] text-indigo-400 hover:underline font-semibold"
                        >
                          View & Respond →
                        </Link>
                      )}
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notif.id)}
                      title="Mark as read"
                      className="p-1 rounded text-slate-500 hover:text-slate-300 shrink-0"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
