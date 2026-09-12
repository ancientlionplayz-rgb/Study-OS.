/**
 * StudyOS Holiday & Calendar Service
 *
 * Tracks school holidays, national holidays, vacations, exam preparatory holidays,
 * and teacher-announced holidays to dynamically alter the student routine.
 */

import { HolidayRecord, HolidayType } from '../../types';

const HOLIDAYS_STORAGE_KEY = 'studyos_holidays_v1';

const DEFAULT_HOLIDAYS_SEED: HolidayRecord[] = [
  {
    id: 'hol_rep_day_2026',
    holidayName: 'Republic Day',
    date: '2026-01-26',
    type: 'national_holiday',
    schoolClosed: true,
    notes: 'National holiday. No school classes.',
    createdBy: 'system',
  },
  {
    id: 'hol_holi_2026',
    holidayName: 'Holi Festival',
    date: '2026-03-04',
    type: 'school_holiday',
    schoolClosed: true,
    notes: 'Spring festival break.',
    createdBy: 'system',
  },
  {
    id: 'hol_good_friday_2026',
    holidayName: 'Good Friday',
    date: '2026-04-03',
    type: 'school_holiday',
    schoolClosed: true,
    notes: 'Christian observance / school closed.',
    createdBy: 'system',
  },
  {
    id: 'hol_ind_day_2026',
    holidayName: 'Independence Day',
    date: '2026-08-15',
    type: 'national_holiday',
    schoolClosed: true,
    notes: 'National holiday celebration.',
    createdBy: 'system',
  },
  {
    id: 'hol_gandhi_2026',
    holidayName: 'Gandhi Jayanti',
    date: '2026-10-02',
    type: 'national_holiday',
    schoolClosed: true,
    notes: 'National holiday.',
    createdBy: 'system',
  },
  {
    id: 'hol_dussehra_2026',
    holidayName: 'Vijayadashami / Dussehra',
    date: '2026-10-20',
    type: 'school_holiday',
    schoolClosed: true,
    notes: 'Autumn festive break.',
    createdBy: 'system',
  },
  {
    id: 'hol_diwali_2026',
    holidayName: 'Diwali Break',
    date: '2026-11-08',
    endDate: '2026-11-10',
    type: 'vacation',
    schoolClosed: true,
    notes: 'Deepavali vacation.',
    createdBy: 'system',
  },
  {
    id: 'hol_xmas_2026',
    holidayName: 'Christmas Day',
    date: '2026-12-25',
    type: 'school_holiday',
    schoolClosed: true,
    notes: 'Winter holiday.',
    createdBy: 'system',
  },
];

export class HolidayService {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  public static getHolidays(): HolidayRecord[] {
    if (!this.isBrowser()) return DEFAULT_HOLIDAYS_SEED;
    try {
      const raw = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(DEFAULT_HOLIDAYS_SEED));
        return DEFAULT_HOLIDAYS_SEED;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_HOLIDAYS_SEED;
    }
  }

  public static addHoliday(holiday: Omit<HolidayRecord, 'id'>): HolidayRecord {
    const all = this.getHolidays();
    const newHol: HolidayRecord = {
      ...holiday,
      id: `hol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newHol, ...all];
    if (this.isBrowser()) {
      localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(updated));
    }
    return newHol;
  }

  public static deleteHoliday(id: string): boolean {
    const all = this.getHolidays();
    const filtered = all.filter((h) => h.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered.length !== all.length;
  }

  public static getHolidayForDate(dateStr: string): HolidayRecord | null {
    const all = this.getHolidays();
    return all.find((h) => {
      if (h.date === dateStr) return true;
      if (h.endDate && dateStr >= h.date && dateStr <= h.endDate) return true;
      return false;
    }) || null;
  }

  public static getUpcomingHolidays(limit: number = 5): HolidayRecord[] {
    const today = new Date().toISOString().split('T')[0];
    const all = this.getHolidays();
    return all
      .filter((h) => (h.endDate ? h.endDate >= today : h.date >= today))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  }
}
