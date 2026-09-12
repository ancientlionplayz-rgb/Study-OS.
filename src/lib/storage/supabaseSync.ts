/**
 * StudyOS Cloud Sync & Storage Engine
 * Dual-Mode: Local-First with Supabase Cloud Sync
 * Automatically caches locally in LocalStorage and pushes to Supabase when authenticated.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncedAt: string | null;
  pendingSyncCount: number;
  syncInProgress: boolean;
}

const SYNC_META_KEY = 'studyos_sync_meta';

export class CloudSyncService {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  public static getSyncStatus(): SyncStatus {
    if (!this.isBrowser()) {
      return {
        isOnline: false,
        lastSyncedAt: null,
        pendingSyncCount: 0,
        syncInProgress: false,
      };
    }

    try {
      const raw = localStorage.getItem(SYNC_META_KEY);
      const meta = raw ? JSON.parse(raw) : {};
      return {
        isOnline: navigator.onLine && isSupabaseConfigured,
        lastSyncedAt: meta.lastSyncedAt || null,
        pendingSyncCount: meta.pendingSyncCount || 0,
        syncInProgress: false,
      };
    } catch {
      return {
        isOnline: false,
        lastSyncedAt: null,
        pendingSyncCount: 0,
        syncInProgress: false,
      };
    }
  }

  /**
   * Sync a local record to Supabase if connected
   */
  public static async pushRecord(
    table: string,
    record: Record<string, any>,
    userId?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
      this.incrementPendingSync();
      return false;
    }

    try {
      const payload = userId ? { ...record, user_id: userId } : record;
      const { error } = await supabase.from(table).upsert(payload);
      if (error) {
        console.warn('[CloudSync] Upsert error on ' + table + ':', error.message);
        this.incrementPendingSync();
        return false;
      }
      this.markSynced();
      return true;
    } catch (e) {
      console.warn('[CloudSync] Failed to sync ' + table + ':', e);
      this.incrementPendingSync();
      return false;
    }
  }

  /**
   * Pull user records from Supabase
   */
  public static async pullRecords<T>(table: string, userId: string): Promise<T[] | null> {
    if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('[CloudSync] Pull error on ' + table + ':', error.message);
        return null;
      }
      return data as T[];
    } catch (e) {
      console.warn('[CloudSync] Failed to pull ' + table + ':', e);
      return null;
    }
  }

  private static incrementPendingSync(): void {
    if (!this.isBrowser()) return;
    try {
      const raw = localStorage.getItem(SYNC_META_KEY);
      const meta = raw ? JSON.parse(raw) : {};
      meta.pendingSyncCount = (meta.pendingSyncCount || 0) + 1;
      localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
    } catch {}
  }

  private static markSynced(): void {
    if (!this.isBrowser()) return;
    try {
      const meta = {
        lastSyncedAt: new Date().toISOString(),
        pendingSyncCount: 0,
      };
      localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
    } catch {}
  }
}
