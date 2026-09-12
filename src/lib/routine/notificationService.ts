/**
 * StudyOS Notifications & Tomorrow Brief Engine
 *
 * Implements:
 * - Evening "Tomorrow Brief" notification preparation (default 8:30–9:00 PM, configurable)
 * - Notification preferences (Tomorrow Schedule, Revision, Tasks, Exams, Teams, Challenges)
 * - In-app notification center persistence
 * - Web Push / PWA Notification API readiness
 */

import { NotificationSettings, TomorrowBrief, InAppNotification, StudentRoutineProfile } from '../../types';
import { RoutineEngine, minutesToFormattedTime, timeToMinutes } from './routineEngine';
import { HolidayService } from './holidayService';

const NOTIF_SETTINGS_KEY = 'studyos_notification_settings_v1';
const TOMORROW_BRIEF_KEY = 'studyos_tomorrow_brief_v1';
const IN_APP_NOTIFS_KEY = 'studyos_in_app_notifications_v1';

const DEFAULT_SETTINGS: NotificationSettings = {
  tomorrowScheduleEnabled: true,
  tomorrowScheduleTime: '20:45',
  revisionRemindersEnabled: true,
  taskRemindersEnabled: true,
  examRemindersEnabled: true,
  teamInvitationsEnabled: true,
  challengeUpdatesEnabled: true,
};

export class NotificationService {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  public static getSettings(): NotificationSettings {
    if (!this.isBrowser()) return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(NOTIF_SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static updateSettings(partial: Partial<NotificationSettings>): NotificationSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    if (this.isBrowser()) {
      localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(updated));
    }
    return updated;
  }

  public static getTomorrowBrief(): TomorrowBrief | null {
    if (!this.isBrowser()) return null;
    try {
      const raw = localStorage.getItem(TOMORROW_BRIEF_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public static saveTomorrowBrief(brief: TomorrowBrief): void {
    if (this.isBrowser()) {
      localStorage.setItem(TOMORROW_BRIEF_KEY, JSON.stringify(brief));
    }
  }

  /**
   * Generates or refreshes tomorrow's brief
   */
  public static prepareTomorrowBrief(profile: StudentRoutineProfile, pendingRevisionsCount: number = 0): TomorrowBrief {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const holiday = HolidayService.getHolidayForDate(tomorrowStr) || undefined;
    const tomorrowRoutine = RoutineEngine.generateFullDayRoutine(profile, tomorrowStr, { holiday });

    const brief = RoutineEngine.generateTomorrowBrief(
      tomorrowStr,
      profile,
      tomorrowRoutine,
      pendingRevisionsCount,
      holiday
    );

    this.saveTomorrowBrief(brief);

    // Also push into in-app notifications if tomorrow schedule notification is enabled
    const settings = this.getSettings();
    if (settings.tomorrowScheduleEnabled) {
      const holidayPrefix = brief.isHoliday ? `[Holiday: ${brief.holidayName}] ` : '';
      this.pushInAppNotification({
        title: `Tomorrow's Plan (${brief.dayOfWeek})`,
        message: `${holidayPrefix}Wake up at ${brief.wakeTime}. ${brief.keyBlocks.length} key blocks scheduled. Sleep target: ${brief.sleepTargetTime}.`,
        type: 'schedule',
        actionUrl: '/',
      });
    }

    return brief;
  }

  /**
   * In-App Notification Center
   */
  public static getInAppNotifications(): InAppNotification[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(IN_APP_NOTIFS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static pushInAppNotification(notif: {
    title: string;
    message: string;
    type: 'team_invite' | 'friend_request' | 'challenge' | 'schedule' | 'revision' | 'system';
    actionUrl?: string;
  }): InAppNotification {
    const all = this.getInAppNotifications();
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'current',
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: notif.actionUrl,
    };

    const updated = [newNotif, ...all.slice(0, 49)]; // keep 50 most recent
    if (this.isBrowser()) {
      localStorage.setItem(IN_APP_NOTIFS_KEY, JSON.stringify(updated));
    }
    return newNotif;
  }

  public static markAsRead(id: string): void {
    const all = this.getInAppNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    if (this.isBrowser()) {
      localStorage.setItem(IN_APP_NOTIFS_KEY, JSON.stringify(updated));
    }
  }

  public static markAllAsRead(): void {
    const all = this.getInAppNotifications();
    const updated = all.map((n) => ({ ...n, read: true }));
    if (this.isBrowser()) {
      localStorage.setItem(IN_APP_NOTIFS_KEY, JSON.stringify(updated));
    }
  }

  public static clearAll(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(IN_APP_NOTIFS_KEY);
    }
  }

  /**
   * Web Push / Browser Notification API Integration
   */
  public static async requestNotificationPermission(): Promise<boolean> {
    if (!this.isBrowser() || !('Notification' in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }

  public static sendBrowserNotification(title: string, options?: NotificationOptions): void {
    if (!this.isBrowser() || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } catch (e) {
        console.warn('Browser notification error', e);
      }
    }
  }
}
