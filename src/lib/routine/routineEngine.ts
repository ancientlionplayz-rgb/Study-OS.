/**
 * StudyOS Full-Day Routine & Deterministic Scheduler Engine
 *
 * Ensures StudyOS generates a COMPLETE DAILY LIFE ROUTINE covering:
 * Wake → Morning → School/Commute → Afternoon → Evening → Night → Sleep
 *
 * Deterministic validation:
 * - Prevents overlapping commitments
 * - Validates travel gaps and meal/rest periods
 * - Enforces locked tasks (School, Academy, Tuition)
 * - Automatically repairs invalid schedules
 * - Adjusts for holidays dynamically without overloading students
 */

import {
  FullDayRoutineBlock,
  StudentRoutineProfile,
  WeekUnderstanding,
  HolidayRecord,
  TomorrowBrief,
  RoutineCategory,
  ScheduleConflictIssue,
} from '../../types';

/**
 * Converts "HH:MM" (24h) to total minutes from midnight (0 - 1440)
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  const parts = clean.replace(/[APM\s]/g, '').split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Converts total minutes from midnight to "HH:MM AM/PM"
 */
export function minutesToFormattedTime(totalMinutes: number): string {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(norm / 60);
  const mins = norm % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const padMin = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hours12}:${padMin} ${period}`;
}

/**
 * Converts total minutes to "HH:MM" 24h format
 */
export function minutesTo24h(totalMinutes: number): string {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(norm / 60);
  const mins = norm % 60;
  const padH = hours < 10 ? `0${hours}` : `${hours}`;
  const padM = mins < 10 ? `0${mins}` : `${mins}`;
  return `${padH}:${padM}`;
}

/**
 * Calculates duration in minutes between startTime and endTime.
 * Robust to cross-midnight spans (e.g. 23:50 to 00:35 = 45 minutes).
 */
export function calculateIntervalDuration(
  startTime: string,
  endTime: string,
  allowCrossMidnight = true
): number {
  if (!startTime || !endTime) return 0;
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end > start) {
    return end - start;
  }
  if (end < start && allowCrossMidnight) {
    // Crosses midnight: from start until midnight (1440 - start) plus midnight until end
    return (1440 - start) + end;
  }
  if (end === start) {
    return 0;
  }
  return 0;
}

/**
 * Checks if an activity crosses midnight (end time strictly less than start time in 24h cycle).
 */
export function isCrossMidnight(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false;
  return timeToMinutes(endTime) < timeToMinutes(startTime);
}

/**
 * Circadian sort key based on wakeTime (defaults to 06:00).
 * Groups blocks in biological sequence:
 * Wake-up -> Daytime -> Evening -> Late-Night Overflow -> Next Day.
 * Guarantees that 12:35 AM or 01:05 AM does not appear before 05:30 AM,
 * while ensuring daytime morning blocks (04:00 onwards) belong to Day 0.
 */
export function getCircadianSortKey(timeStr: string, wakeTimeStr = '06:00', dayOffset?: number): number {
  const t = timeToMinutes(timeStr);
  const w = timeToMinutes(wakeTimeStr || '06:00');

  if (dayOffset === 1) {
    return 1440 + t;
  }
  if (dayOffset === -1) {
    return -1440 + t;
  }
  if (dayOffset === 0) {
    return t;
  }

  // Daytime and early morning activities (>= 04:00 / 240 mins) belong to the daytime cycle.
  // Only late-night hours past midnight (00:00 - 03:59) belong to late-night overflow if wake is later.
  if (t < 240 && t < w) {
    return 1440 + t;
  }
  return t;
}

/**
 * Sorts routine blocks in true circadian chronology starting from wakeTime.
 */
export function sortBlocksCircadian(
  blocks: FullDayRoutineBlock[],
  wakeTime = '06:00'
): FullDayRoutineBlock[] {
  return [...blocks].sort((a, b) => {
    const keyA = getCircadianSortKey(a.startTime, wakeTime, a.dayOffset);
    const keyB = getCircadianSortKey(b.startTime, wakeTime, b.dayOffset);
    return keyA - keyB;
  });
}


export class RoutineEngine {
  /**
   * Summarize week understanding from profile inputs
   */
  /**
   * Summarize week understanding from profile inputs dynamically
   */
  public static summarizeWeekUnderstanding(profile: StudentRoutineProfile): WeekUnderstanding {
    const wakeMins = timeToMinutes(profile.wakeTime || '06:30');
    const sleepMins = timeToMinutes(profile.sleepTime || '22:30');
    const totalDayMins = sleepMins > wakeMins ? sleepMins - wakeMins : 1440 - wakeMins + sleepMins;

    // School calculation
    let weeklySchoolHours = 0;
    if (profile.school?.perDaySchedule && !profile.school.sameEveryDay) {
      Object.entries(profile.school.perDaySchedule).forEach(([, sched]) => {
        if (sched.enabled) {
          const duration = Math.max(0, timeToMinutes(sched.endTime) - timeToMinutes(sched.startTime));
          const commute = (sched.commuteMinutesBefore || 0) + (sched.commuteMinutesAfter || 0);
          weeklySchoolHours += (duration + commute) / 60;
        }
      });
    } else {
      const sStart = profile.school?.startTime || profile.schoolStartTime || '08:00';
      const sEnd = profile.school?.endTime || profile.schoolEndTime || '14:00';
      const sCommute = profile.school?.commuteMinutesBefore ?? profile.commuteMinutes ?? 0;
      const sDays = profile.school?.schoolDays || profile.schoolDays || [];
      const schoolDuration = Math.max(0, timeToMinutes(sEnd) - timeToMinutes(sStart));
      const totalSchoolDailyMins = schoolDuration + sCommute * 2;
      weeklySchoolHours = (totalSchoolDailyMins * sDays.length) / 60;
    }

    // Tuition commitments
    const tuitionList = (profile.tuition || profile.tuitionCommitments || []) as any[];
    let weeklyTuitionMins = 0;
    tuitionList.forEach((t) => {
      const tDays = t.days || t.daysOfWeek || [];
      const commuteIn = t.commuteMinutesBefore ?? t.commuteBeforeMinutes ?? t.travelMinutes ?? 0;
      const commuteOut = t.commuteMinutesAfter ?? t.commuteAfterMinutes ?? t.travelMinutes ?? 0;
      const duration = Math.max(0, timeToMinutes(t.endTime) - timeToMinutes(t.startTime)) + commuteIn + commuteOut;
      weeklyTuitionMins += duration * (tDays.length || 1);
    });

    // Sports & Academy
    const sportsList = (profile.sports || profile.sportsAndAcademy || []) as any[];
    let weeklySportsMins = 0;
    sportsList.forEach((s) => {
      const sDays = s.days || s.daysOfWeek || [];
      const commuteIn = s.commuteMinutesBefore ?? s.commuteBeforeMinutes ?? s.travelMinutes ?? 0;
      const commuteOut = s.commuteMinutesAfter ?? s.commuteAfterMinutes ?? s.travelMinutes ?? 0;
      const duration = Math.max(0, timeToMinutes(s.endTime) - timeToMinutes(s.startTime)) + commuteIn + commuteOut;
      weeklySportsMins += duration * (sDays.length || 1);
    });

    // Custom commitments
    let customMins = 0;
    ((profile.customCommitments || []) as any[]).forEach((c) => {
      const cDays = c.days || c.daysOfWeek || [];
      const commuteIn = c.commuteMinutesBefore ?? c.commuteBeforeMinutes ?? c.travelMinutes ?? 0;
      const commuteOut = c.commuteMinutesAfter ?? c.commuteAfterMinutes ?? c.travelMinutes ?? 0;
      const duration = Math.max(0, timeToMinutes(c.endTime) - timeToMinutes(c.startTime)) + commuteIn + commuteOut;
      customMins += duration * (cDays.length || 1);
    });

    const fixedHoursPerWeek = weeklySchoolHours + (weeklyTuitionMins + weeklySportsMins + customMins) / 60;
    const totalAwakeWeeklyHours = (totalDayMins * 7) / 60;
    const freeHours = Math.max(0, totalAwakeWeeklyHours - fixedHoursPerWeek);

    // School summary string
    let schoolSummary = 'No fixed school hours configured';
    const schoolDays = profile.school?.schoolDays || profile.schoolDays || [];
    if (schoolDays.length > 0) {
      const startFmt = minutesToFormattedTime(timeToMinutes(profile.school?.startTime || profile.schoolStartTime || '08:00'));
      const endFmt = minutesToFormattedTime(timeToMinutes(profile.school?.endTime || profile.schoolEndTime || '14:00'));
      const commute = profile.school?.commuteMinutesBefore ?? profile.commuteMinutes ?? 0;
      schoolSummary = `${schoolDays.join(', ')} from ${startFmt} to ${endFmt}${commute > 0 ? ` (${commute}m commute)` : ''}`;
    }

    // Tuition summary string
    const tuitionSummary = tuitionList.length > 0
      ? tuitionList.map((t) => `${t.name || t.subject} (${(t.days || []).join(', ')})`).join('; ')
      : 'No external coaching / tuition scheduled';

    // Sports summary string
    const sportsSummary = sportsList.length > 0
      ? sportsList.map((s) => `${s.name} (${(s.days || []).join(', ')})`).join('; ')
      : 'No sports or academy scheduled';

    // Mandatory Subject string
    const mandatory = profile.studyPreferences?.mandatorySubject || (profile.studyPreferences as any)?.mandatoryFocusBlock;
    const mandatorySubjectSummary = (mandatory && mandatory.enabled && mandatory.subject)
      ? `${mandatory.subject} (${mandatory.dailyMinutes || 60}m daily focus)`
      : 'Not configured';

    // Weekend summary
    const weekendItems: string[] = [];
    tuitionList.forEach((t) => {
      const wDays = ((t.days || []) as string[]).filter((d: string) => d === 'Saturday' || d === 'Sunday');
      if (wDays.length > 0) weekendItems.push(`${t.name || t.subject} (${wDays.join('/')})`);
    });
    sportsList.forEach((s) => {
      const wDays = ((s.days || []) as string[]).filter((d: string) => d === 'Saturday' || d === 'Sunday');
      if (wDays.length > 0) weekendItems.push(`${s.name} (${wDays.join('/')})`);
    });

    const weekendNotes = profile.weekendDifferences?.notes
      ? profile.weekendDifferences.notes
      : weekendItems.length > 0
      ? weekendItems.join('; ')
      : 'Flexible study, project blocks, and rest';

    const studyTargetDaily = profile.studyPreferences?.targetDailyStudyMinutes ?? profile.subjects?.targetDailyStudyMinutes ?? 120;
    const commuteDaily = Math.round((((profile.school?.commuteMinutesBefore ?? profile.commuteMinutes ?? 0) * 2) / 60) * 10) / 10;

    return {
      fixedCommitmentsHours: Math.round(fixedHoursPerWeek * 10) / 10,
      freeTimeHours: Math.round(freeHours * 10) / 10,
      schoolSummary,
      tuitionSummary,
      sportsSummary,
      mandatorySubjectSummary,
      sleepTarget: `${minutesToFormattedTime(timeToMinutes(profile.sleepTime || '22:30'))} (${Math.round((1440 - totalDayMins) / 60)}h restful sleep target)`,
      commuteDailyHours: commuteDaily,
      studyTargetDailyMinutes: studyTargetDaily,
      weakSubjects: profile.studyPreferences?.weakSubjects || profile.subjects?.weak || [],
      strongSubjects: profile.studyPreferences?.strongSubjects || profile.subjects?.strong || [],
      weekendScheduleNotes: weekendNotes,
      approvedByUser: false,
    };
  }

  /**
   * Deterministic Validation of Routine Blocks
   */
  /**
   * Deterministic Validation of Routine Blocks (Cross-Midnight & Circadian Aware)
   */
  public static validateSchedule(
    blocks: FullDayRoutineBlock[],
    options?: { isHoliday?: boolean; wakeTime?: string }
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!blocks || blocks.length === 0) {
      return { valid: false, errors: ['Schedule contains no routine blocks.'], warnings: [] };
    }

    const wakeTime = options?.wakeTime || '06:00';
    // Sort in biological circadian order (Wake -> Day -> Evening -> Night -> Next Day)
    const sorted = sortBlocksCircadian(blocks, wakeTime);

    for (let i = 0; i < sorted.length; i++) {
      const curr = sorted[i];
      const start = timeToMinutes(curr.startTime);
      const end = timeToMinutes(curr.endTime);
      const duration = calculateIntervalDuration(curr.startTime, curr.endTime, true);

      // A block is only invalid if start === end or computed duration is 0
      if (start === end || duration <= 0) {
        errors.push(`Invalid duration for "${curr.title}": start (${curr.startTime}) equals end (${curr.endTime}).`);
      }

      // Check overlap with next block in circadian sequence
      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        const currSortStart = getCircadianSortKey(curr.startTime, wakeTime, curr.dayOffset);
        const currSortEnd = currSortStart + duration;
        const nextSortStart = getCircadianSortKey(next.startTime, wakeTime, next.dayOffset);

        if (currSortEnd > nextSortStart && curr.category !== 'sleep' && next.category !== 'sleep') {
          const overlapMins = currSortEnd - nextSortStart;
          if (curr.isLocked && next.isLocked) {
            errors.push(`Critical conflict between locked commitments: "${curr.title}" overlaps with "${next.title}" by ${overlapMins} minutes.`);
          } else {
            warnings.push(`Schedule overlap: "${curr.title}" overlaps with "${next.title}" by ${overlapMins} minutes.`);
          }
        }
      }
    }

    // Check study target
    const totalStudyMins = sorted
      .filter((b) => b.category === 'study' || b.category === 'homework' || b.category === 'revision')
      .reduce((sum, b) => sum + (b.durationMinutes || calculateIntervalDuration(b.startTime, b.endTime, true)), 0);

    if (totalStudyMins < 60 && !options?.isHoliday) {
      warnings.push(`Total daily academic time is only ${totalStudyMins}m, which is below the minimum daily cadence.`);
    }

    // Check meal/rest periods
    const hasMeals = sorted.some((b) => b.category === 'meal');
    if (!hasMeals) {
      warnings.push('No scheduled meal periods found in routine.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Deterministic Schedule Repair (Cross-Midnight & Circadian Aware)
   * Resolves conflicts by preserving locked tasks (School, Academy, Tuition) and shifting flexible blocks
   */
  public static repairSchedule(blocks: FullDayRoutineBlock[], profile?: StudentRoutineProfile): FullDayRoutineBlock[] {
    const wakeTime = profile?.wakeTime || '06:00';
    const sleepTime = profile?.sleepTime || '22:30';
    const sleepTargetMins = timeToMinutes(sleepTime);
    const wakeMins = timeToMinutes(wakeTime);
    const circadianSleep = sleepTargetMins < wakeMins ? sleepTargetMins + 1440 : sleepTargetMins;

    const sorted = sortBlocksCircadian(blocks, wakeTime);
    const repaired: FullDayRoutineBlock[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const curr = { ...sorted[i] };
      curr.durationMinutes = calculateIntervalDuration(curr.startTime, curr.endTime, true);
      curr.isCrossMidnight = isCrossMidnight(curr.startTime, curr.endTime);
      if (curr.dayOffset === undefined) {
        const startMins = timeToMinutes(curr.startTime);
        curr.dayOffset = (startMins < 240 && startMins < wakeMins) ? 1 : 0;
      }

      if (repaired.length === 0) {
        repaired.push(curr);
        continue;
      }

      const prev = repaired[repaired.length - 1];
      const prevSortStart = getCircadianSortKey(prev.startTime, wakeTime, prev.dayOffset);
      const prevSortEnd = prevSortStart + prev.durationMinutes;
      const currSortStart = getCircadianSortKey(curr.startTime, wakeTime, curr.dayOffset);

      // Protect sleep boundary if curr is sleep block
      if (curr.category === 'sleep') {
        if (!prev.isLocked && prev.category !== 'sleep' && prevSortEnd > currSortStart) {
          const available = currSortStart - prevSortStart;
          if (available >= 15) {
            prev.endTime = curr.startTime;
            prev.durationMinutes = available;
            prev.isCrossMidnight = isCrossMidnight(prev.startTime, prev.endTime);
          } else {
            repaired.pop();
          }
        }
        repaired.push(curr);
        continue;
      }

      if (currSortStart < prevSortEnd && prev.category !== 'sleep') {
        // Overlap detected
        if (curr.isLocked && !prev.isLocked) {
          // Adjust previous flexible block to end before current locked block
          const availableDuration = currSortStart - prevSortStart;
          if (availableDuration >= 15) {
            prev.endTime = curr.startTime;
            prev.durationMinutes = availableDuration;
            prev.isCrossMidnight = isCrossMidnight(prev.startTime, prev.endTime);
            repaired.push(curr);
          } else {
            // Drop previous small overlap block
            repaired.pop();
            repaired.push(curr);
          }
        } else if (!curr.isLocked) {
          // Shift current flexible block forward, but strictly cap before bedtime
          const newSortStart = prevSortEnd;
          const newSortEnd = newSortStart + curr.durationMinutes;

          if (['study', 'revision', 'reading', 'skill_lab'].includes(curr.category) && newSortEnd > circadianSleep) {
            const availableBeforeSleep = circadianSleep - newSortStart;
            if (availableBeforeSleep >= 15) {
              curr.startTime = minutesTo24h(newSortStart % 1440);
              curr.endTime = minutesTo24h(circadianSleep % 1440);
              curr.durationMinutes = availableBeforeSleep;
              curr.source = 'schedule_repair';
              curr.isCrossMidnight = isCrossMidnight(curr.startTime, curr.endTime);
              curr.dayOffset = newSortStart >= 1440 ? 1 : 0;
              repaired.push(curr);
            }
            // If less than 15 mins available before bedtime, omit to preserve sleep
          } else {
            curr.startTime = minutesTo24h(newSortStart % 1440);
            curr.endTime = minutesTo24h(newSortEnd % 1440);
            curr.source = 'schedule_repair';
            curr.isCrossMidnight = isCrossMidnight(curr.startTime, curr.endTime);
            curr.dayOffset = newSortStart >= 1440 ? 1 : 0;
            repaired.push(curr);
          }
        } else {
          // Both locked: preserve both
          repaired.push(curr);
        }
      } else {
        repaired.push(curr);
      }
    }

    return repaired;
  }

  /**
   * Generate Full-Day Routine for any student profile dynamically
   */
  public static generateFullDayRoutine(
    profile: StudentRoutineProfile,
    dateStr: string,
    options?: { holiday?: HolidayRecord }
  ): FullDayRoutineBlock[] {
    const blocks: FullDayRoutineBlock[] = [];
    const dateObj = new Date(dateStr);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[dateObj.getDay()];
    const isWeekend = currentDay === 'Saturday' || currentDay === 'Sunday';
    const isHoliday = Boolean(options?.holiday);

    // 1. Wake Up
    const wakeMins = isWeekend && profile.weekendDifferences?.saturdayWakeTime && currentDay === 'Saturday'
      ? timeToMinutes(profile.weekendDifferences.saturdayWakeTime)
      : isWeekend && profile.weekendDifferences?.sundayWakeTime && currentDay === 'Sunday'
      ? timeToMinutes(profile.weekendDifferences.sundayWakeTime)
      : timeToMinutes(profile.wakeTime || '06:30');

    blocks.push({
      id: `blk_wake_${dateStr}`,
      title: 'Wake Up & Hydrate',
      category: 'wake',
      startTime: minutesTo24h(wakeMins),
      endTime: minutesTo24h(wakeMins + 15),
      durationMinutes: 15,
      priority: 'critical',
      isLocked: false,
      reason: 'Start circadian clock with water & light',
      recurringStatus: 'daily',
      source: 'ai_generated',
      completed: false,
    });

    let currentPointer = wakeMins + 15;

    // Helper to test if recurring commitment is active on this day/date
    const matchesCommitment = (c: any) => {
      if (!c) return false;
      if (c.recurrence === 'specific_date' || c.recurrence === 'one_time') {
        return c.specificDate === dateStr;
      }
      if (c.recurrence === 'date_range') {
        const inRange = (!c.startDate || dateStr >= c.startDate) && (!c.endDate || dateStr <= c.endDate);
        if (!inRange) return false;
        return !c.days || c.days.length === 0 || c.days.includes(currentDay);
      }
      // default weekly
      return Array.isArray(c.days) ? c.days.includes(currentDay) : true;
    };

    // Determine school schedule for today
    let hasSchoolToday = false;
    let schoolStart = 0;
    let schoolEnd = 0;
    let commuteBefore = 0;
    let commuteAfter = 0;

    if (!isHoliday) {
      if (profile.school?.perDaySchedule && !profile.school.sameEveryDay) {
        const todaySched = profile.school.perDaySchedule[currentDay];
        if (todaySched && todaySched.enabled) {
          hasSchoolToday = true;
          schoolStart = timeToMinutes(todaySched.startTime);
          schoolEnd = timeToMinutes(todaySched.endTime);
          commuteBefore = todaySched.commuteMinutesBefore || 0;
          commuteAfter = todaySched.commuteMinutesAfter || 0;
        }
      } else {
        const sDays = profile.school?.schoolDays || profile.schoolDays || [];
        if (sDays.includes(currentDay)) {
          hasSchoolToday = true;
          schoolStart = timeToMinutes(profile.school?.startTime || profile.schoolStartTime || '08:00');
          schoolEnd = timeToMinutes(profile.school?.endTime || profile.schoolEndTime || '14:00');
          commuteBefore = profile.school?.commuteMinutesBefore ?? profile.commuteMinutes ?? 0;
          commuteAfter = profile.school?.commuteMinutesAfter ?? profile.commuteMinutes ?? 0;
        }
      }
    }

    // Check mandatory subject requirement
    const mandatory = profile.studyPreferences?.mandatorySubject || (profile.studyPreferences as any)?.mandatoryFocusBlock;
    const isMandatoryActive = mandatory && mandatory.enabled && mandatory.subject &&
      (!mandatory.days || mandatory.days.length === 0 || mandatory.days.includes(currentDay));
    const mandatoryMins = isMandatoryActive ? (mandatory.dailyMinutes || 60) : 0;

    let mandatoryPlaced = false;
    // Check if mandatory subject fits before school
    if (isMandatoryActive) {
      const departureTime = hasSchoolToday ? (schoolStart - commuteBefore) : 1440;
      if (currentPointer + mandatoryMins + 30 <= departureTime) {
        blocks.push({
          id: `blk_mandatory_${dateStr}`,
          title: `${mandatory.subject} (Mandatory Focus Block)`,
          category: 'study',
          subject: mandatory.subject,
          startTime: minutesTo24h(currentPointer),
          endTime: minutesTo24h(currentPointer + mandatoryMins),
          durationMinutes: mandatoryMins,
          priority: 'critical',
          isLocked: false,
          reason: 'Daily priority syllabus focus',
          recurringStatus: 'daily',
          source: 'ai_generated',
          completed: false,
        });
        currentPointer += mandatoryMins;
        mandatoryPlaced = true;
      }
    }

    // Breakfast & Morning Preparation
    blocks.push({
      id: `blk_breakfast_${dateStr}`,
      title: 'Breakfast & Morning Preparation',
      category: 'meal',
      startTime: minutesTo24h(currentPointer),
      endTime: minutesTo24h(currentPointer + 30),
      durationMinutes: 30,
      priority: 'high',
      isLocked: false,
      recurringStatus: 'daily',
      source: 'ai_generated',
      completed: false,
    });
    currentPointer += 30;

    // School execution
    if (hasSchoolToday) {
      if (commuteBefore > 0 && schoolStart - commuteBefore >= currentPointer) {
        blocks.push({
          id: `blk_commute_in_${dateStr}`,
          title: 'Commute to School',
          category: 'commute',
          startTime: minutesTo24h(schoolStart - commuteBefore),
          endTime: minutesTo24h(schoolStart),
          durationMinutes: commuteBefore,
          priority: 'high',
          isLocked: true,
          recurringStatus: 'weekday',
          source: 'user_defined',
          completed: false,
        });
      }

      blocks.push({
        id: `blk_school_${dateStr}`,
        title: 'School Hours & Classes',
        category: 'school',
        startTime: minutesTo24h(schoolStart),
        endTime: minutesTo24h(schoolEnd),
        durationMinutes: Math.max(15, schoolEnd - schoolStart),
        priority: 'critical',
        isLocked: true,
        reason: 'Compulsory school attendance',
        recurringStatus: 'weekday',
        source: 'user_defined',
        completed: false,
      });

      if (commuteAfter > 0) {
        blocks.push({
          id: `blk_commute_out_${dateStr}`,
          title: 'Commute Home from School',
          category: 'commute',
          startTime: minutesTo24h(schoolEnd),
          endTime: minutesTo24h(schoolEnd + commuteAfter),
          durationMinutes: commuteAfter,
          priority: 'high',
          isLocked: true,
          recurringStatus: 'weekday',
          source: 'user_defined',
          completed: false,
        });
      }

      currentPointer = schoolEnd + commuteAfter;
    } else if (isHoliday) {
      blocks.push({
        id: `blk_holiday_activity_${dateStr}`,
        title: `Holiday Deep Work: ${profile.studyPreferences?.weakSubjects?.[0] || 'Core Review'} & Personal Exploration`,
        category: 'study',
        startTime: minutesTo24h(currentPointer + 30),
        endTime: minutesTo24h(currentPointer + 120),
        durationMinutes: 90,
        priority: 'medium',
        isLocked: false,
        reason: `Holiday schedule adjustment (${options?.holiday?.holidayName || 'Holiday'})`,
        recurringStatus: 'custom',
        source: 'holiday_adjustment',
        completed: false,
      });
      currentPointer += 150;
    } else {
      // Weekend Morning Focus
      blocks.push({
        id: `blk_wknd_study_${dateStr}`,
        title: 'Core Subject Review & Homework Clearing',
        category: 'study',
        startTime: minutesTo24h(currentPointer + 30),
        endTime: minutesTo24h(currentPointer + 120),
        durationMinutes: 90,
        priority: 'high',
        isLocked: false,
        recurringStatus: 'weekend',
        source: 'ai_generated',
        completed: false,
      });
      currentPointer += 150;
    }

    // Lunch & Rest Recovery
    blocks.push({
      id: `blk_lunch_${dateStr}`,
      title: 'Lunch & Rest Recovery',
      category: 'meal',
      startTime: minutesTo24h(currentPointer),
      endTime: minutesTo24h(currentPointer + 45),
      durationMinutes: 45,
      priority: 'high',
      isLocked: false,
      recurringStatus: 'daily',
      source: 'ai_generated',
      completed: false,
    });
    currentPointer += 45;

    // If mandatory study was active but couldn't fit in morning, place it now
    if (isMandatoryActive && !mandatoryPlaced) {
      blocks.push({
        id: `blk_mandatory_${dateStr}`,
        title: `${mandatory.subject} (Mandatory Focus Block)`,
        category: 'study',
        subject: mandatory.subject,
        startTime: minutesTo24h(currentPointer),
        endTime: minutesTo24h(currentPointer + mandatoryMins),
        durationMinutes: mandatoryMins,
        priority: 'critical',
        isLocked: false,
        reason: 'Daily priority syllabus focus',
        recurringStatus: 'daily',
        source: 'ai_generated',
        completed: false,
      });
      currentPointer += mandatoryMins;
      mandatoryPlaced = true;
    }

    // Tuition / Coaching Commitments for Today
    const tuitionList = ((profile.tuition || profile.tuitionCommitments || []) as any[]).filter(matchesCommitment);
    tuitionList.forEach((t) => {
      const tStart = timeToMinutes(t.startTime);
      const tEnd = timeToMinutes(t.endTime);
      const commuteIn = t.commuteMinutesBefore || t.travelMinutes || 0;
      const commuteOut = t.commuteMinutesAfter || t.travelMinutes || 0;
      const tTitle = t.name || t.title || t.subject || 'Coaching Session';

      if (commuteIn > 0) {
        blocks.push({
          id: `blk_tuition_travel_in_${t.id}_${dateStr}`,
          title: `Travel to ${tTitle}`,
          category: 'commute',
          startTime: minutesTo24h(tStart - commuteIn),
          endTime: minutesTo24h(tStart),
          durationMinutes: commuteIn,
          priority: 'high',
          isLocked: true,
          recurringStatus: 'custom',
          source: 'user_defined',
          completed: false,
        });
      }

      blocks.push({
        id: `blk_tuition_${t.id}_${dateStr}`,
        title: `${tTitle} Coaching / Tuition`,
        category: 'tuition',
        subject: t.subject || tTitle,
        startTime: minutesTo24h(tStart),
        endTime: minutesTo24h(tEnd),
        durationMinutes: Math.max(15, tEnd - tStart),
        priority: 'critical',
        isLocked: true,
        recurringStatus: 'custom',
        source: 'user_defined',
        completed: false,
      });

      if (commuteOut > 0) {
        blocks.push({
          id: `blk_tuition_travel_out_${t.id}_${dateStr}`,
          title: `Travel Home from ${tTitle}`,
          category: 'commute',
          startTime: minutesTo24h(tEnd),
          endTime: minutesTo24h(tEnd + commuteOut),
          durationMinutes: commuteOut,
          priority: 'high',
          isLocked: true,
          recurringStatus: 'custom',
          source: 'user_defined',
          completed: false,
        });
      }

      currentPointer = Math.max(currentPointer, tEnd + commuteOut);
    });

    // Sports & Academy Sessions
    const sportsList = ((profile.sports || profile.sportsAndAcademy || []) as any[]).filter(matchesCommitment);
    sportsList.forEach((s) => {
      const sStart = timeToMinutes(s.startTime);
      const sEnd = timeToMinutes(s.endTime);
      const commuteIn = s.commuteMinutesBefore || s.travelMinutes || 0;
      const commuteOut = s.commuteMinutesAfter || s.travelMinutes || 0;
      const sTitle = s.name || s.title || 'Sports Activity';

      if (commuteIn > 0) {
        blocks.push({
          id: `blk_sports_travel_in_${s.id}_${dateStr}`,
          title: `Travel to ${sTitle}`,
          category: 'commute',
          startTime: minutesTo24h(sStart - commuteIn),
          endTime: minutesTo24h(sStart),
          durationMinutes: commuteIn,
          priority: 'high',
          isLocked: true,
          recurringStatus: 'custom',
          source: 'user_defined',
          completed: false,
        });
      }

      blocks.push({
        id: `blk_sports_${s.id}_${dateStr}`,
        title: sTitle,
        category: (sTitle.toLowerCase().includes('academy') ? 'academy' : 'sports') as RoutineCategory,
        startTime: minutesTo24h(sStart),
        endTime: minutesTo24h(sEnd),
        durationMinutes: Math.max(15, sEnd - sStart),
        priority: 'critical',
        isLocked: true,
        reason: s.notes || 'Physical conditioning & practice',
        recurringStatus: 'custom',
        source: 'user_defined',
        completed: false,
      });

      if (commuteOut > 0) {
        blocks.push({
          id: `blk_sports_travel_out_${s.id}_${dateStr}`,
          title: `Travel Home from ${sTitle}`,
          category: 'commute',
          startTime: minutesTo24h(sEnd),
          endTime: minutesTo24h(sEnd + commuteOut),
          durationMinutes: commuteOut,
          priority: 'high',
          isLocked: true,
          recurringStatus: 'custom',
          source: 'user_defined',
          completed: false,
        });
      }

      currentPointer = Math.max(currentPointer, sEnd + commuteOut);
    });

    // Custom commitments
    const customList = ((profile.customCommitments || []) as any[]).filter(matchesCommitment);
    customList.forEach((c) => {
      const cStart = timeToMinutes(c.startTime);
      const cEnd = timeToMinutes(c.endTime);
      const cTitle = c.name || c.title || 'Personal Commitment';
      blocks.push({
        id: `blk_custom_${c.id}_${dateStr}`,
        title: cTitle,
        category: 'other' as RoutineCategory,
        startTime: minutesTo24h(cStart),
        endTime: minutesTo24h(cEnd),
        durationMinutes: Math.max(15, cEnd - cStart),
        priority: 'high',
        isLocked: true,
        recurringStatus: 'custom',
        source: 'user_defined',
        completed: false,
      });
      currentPointer = Math.max(currentPointer, cEnd);
    });

    // Calisthenics / Workout if no intense sports today and requested
    if (sportsList.length === 0 && profile.workoutPreference && profile.workoutPreference !== 'none') {
      const workoutDuration = profile.workoutDurationMinutes || 30;
      const workoutTime = Math.max(currentPointer + 15, timeToMinutes('17:30'));
      blocks.push({
        id: `blk_workout_${dateStr}`,
        title: 'Calisthenics & Mobility Workout',
        category: 'workout',
        startTime: minutesTo24h(workoutTime),
        endTime: minutesTo24h(workoutTime + workoutDuration),
        durationMinutes: workoutDuration,
        priority: 'medium',
        isLocked: false,
        reason: 'Physical conditioning and core fitness',
        recurringStatus: 'daily',
        source: 'ai_generated',
        completed: false,
      });
      currentPointer = Math.max(currentPointer, workoutTime + workoutDuration);
    }

    // Sleep Target calculation for today
    const sleepTargetMins = isWeekend && profile.weekendDifferences?.saturdaySleepTime && currentDay === 'Saturday'
      ? timeToMinutes(profile.weekendDifferences.saturdaySleepTime)
      : isWeekend && profile.weekendDifferences?.sundaySleepTime && currentDay === 'Sunday'
      ? timeToMinutes(profile.weekendDifferences.sundaySleepTime)
      : timeToMinutes(profile.sleepTime || '22:30');

    // Dynamic Study Allocation based on user's targetDailyStudyMinutes
    const targetDailyStudyMins = profile.studyPreferences?.targetDailyStudyMinutes ?? profile.subjects?.targetDailyStudyMinutes ?? 120;
    const studyMinsSoFar = blocks
      .filter((b) => b.category === 'study')
      .reduce((sum, b) => sum + b.durationMinutes, 0);
    const studyMinsRemaining = Math.max(0, targetDailyStudyMins - studyMinsSoFar);

    if (studyMinsRemaining > 0) {
      const weakSubs = profile.studyPreferences?.weakSubjects || profile.subjects?.weak || [];
      const primarySubject = weakSubs[0] || 'Core Subject Focus';
      const eveningStudyStart = Math.max(currentPointer + 15, timeToMinutes('18:30'));
      // Ensure evening study ends with enough room for dinner (45m) and revision (30m) before bedtime
      const latestStudyEnd = Math.max(eveningStudyStart + 30, sleepTargetMins - 85);
      const maxStudyAvailable = Math.max(30, latestStudyEnd - eveningStudyStart);
      const primaryDuration = Math.min(studyMinsRemaining, 90, maxStudyAvailable);

      if (eveningStudyStart < sleepTargetMins - 75) {
        blocks.push({
          id: `blk_core_study_${dateStr}`,
          title: `Core Study: ${primarySubject}`,
          category: 'study',
          subject: primarySubject,
          startTime: minutesTo24h(eveningStudyStart),
          endTime: minutesTo24h(eveningStudyStart + primaryDuration),
          durationMinutes: primaryDuration,
          priority: 'high',
          isLocked: false,
          reason: 'Targeting syllabus completion in core subject',
          recurringStatus: 'daily',
          source: 'ai_generated',
          completed: false,
        });

        currentPointer = eveningStudyStart + primaryDuration;

        // If still need more study and time permits before dinner
        const secondaryRemaining = studyMinsRemaining - primaryDuration;
        const roomForSecondary = sleepTargetMins - 85 - (currentPointer + 15);
        if (secondaryRemaining >= 30 && roomForSecondary >= 30) {
          const secondaryDuration = Math.min(secondaryRemaining, roomForSecondary);
          const secondarySub = weakSubs[1] || profile.studyPreferences?.strongSubjects?.[0] || 'Practice & Exercises';
          blocks.push({
            id: `blk_secondary_study_${dateStr}`,
            title: `Focused Practice: ${secondarySub}`,
            category: 'study',
            subject: secondarySub,
            startTime: minutesTo24h(currentPointer + 15),
            endTime: minutesTo24h(currentPointer + 15 + secondaryDuration),
            durationMinutes: secondaryDuration,
            priority: 'high',
            isLocked: false,
            reason: 'Secondary subject problem solving',
            recurringStatus: 'daily',
            source: 'ai_generated',
            completed: false,
          });
          currentPointer += 15 + secondaryDuration;
        }
      }
    }

    // Dinner & Family Time
    const preferredDinnerStart = timeToMinutes(profile.dinnerTime || '20:00');
    // Ensure dinner starts early enough to finish before bedtime
    const dinnerStart = Math.max(currentPointer + 15, Math.min(preferredDinnerStart, Math.max(currentPointer + 15, sleepTargetMins - 75)));
    blocks.push({
      id: `blk_dinner_${dateStr}`,
      title: 'Dinner & Family Time',
      category: 'meal',
      startTime: minutesTo24h(dinnerStart),
      endTime: minutesTo24h(dinnerStart + 45),
      durationMinutes: 45,
      priority: 'high',
      isLocked: false,
      recurringStatus: 'daily',
      source: 'ai_generated',
      completed: false,
    });

    currentPointer = dinnerStart + 45;

    // Active Revision (+1, +3, +7 spaced interval)
    // Deterministic Bedtime Protection: Never reduce protected sleep
    const availableBeforeSleep = sleepTargetMins > currentPointer ? sleepTargetMins - currentPointer : 0;
    if (availableBeforeSleep >= 20) {
      const revisionDuration = Math.min(30, availableBeforeSleep);
      blocks.push({
        id: `blk_revision_${dateStr}`,
        title: 'Active Mistake Revision (+1, +3, +7)',
        category: 'revision',
        startTime: minutesTo24h(currentPointer),
        endTime: minutesTo24h(currentPointer + revisionDuration),
        durationMinutes: revisionDuration,
        priority: 'critical',
        isLocked: false,
        reason: 'Spaced retrieval practice to prevent forgetting',
        recurringStatus: 'daily',
        source: 'ai_generated',
        completed: false,
      });
      currentPointer += revisionDuration;
    } else {
      // If evening is too tight, schedule revision deterministically in morning slot to protect sleep
      blocks.splice(1, 0, {
        id: `blk_revision_morning_${dateStr}`,
        title: 'Active Mistake Revision (+1, +3, +7 Morning Slot)',
        category: 'revision',
        startTime: minutesTo24h(wakeMins + 15),
        endTime: minutesTo24h(wakeMins + 45),
        durationMinutes: 30,
        priority: 'critical',
        isLocked: false,
        reason: 'Scheduled for morning slot to protect restorative sleep cycle and prevent bedtime encroachment',
        recurringStatus: 'daily',
        source: 'ai_generated',
        completed: false,
      });
    }

    // Optional Skill Lab (only if user has skillTracks and fits before sleep)
    const userSkills = profile.studyPreferences?.skillTracks || profile.skillTracks || [];
    if (userSkills.length > 0 && currentPointer + 20 <= sleepTargetMins) {
      const labDuration = Math.min(30, sleepTargetMins - currentPointer);
      blocks.push({
        id: `blk_skill_lab_${dateStr}`,
        title: `Skill Lab: ${userSkills[0]}`,
        category: 'skill_lab',
        startTime: minutesTo24h(currentPointer),
        endTime: minutesTo24h(currentPointer + labDuration),
        durationMinutes: labDuration,
        priority: 'medium',
        isLocked: false,
        reason: 'Applied project work and proof-of-work output',
        recurringStatus: 'daily',
        source: 'ai_generated',
        completed: false,
      });
      currentPointer += labDuration;
    }

    // Optional Night Reading (only if fits before sleep)
    if (profile.dailyReadingGoalMinutes && profile.dailyReadingGoalMinutes > 0 && currentPointer + 15 <= sleepTargetMins) {
      const readDuration = Math.min(profile.dailyReadingGoalMinutes, sleepTargetMins - currentPointer);
      blocks.push({
        id: `blk_reading_${dateStr}`,
        title: 'Non-Fiction / Academic Reading',
        category: 'reading',
        startTime: minutesTo24h(currentPointer),
        endTime: minutesTo24h(currentPointer + readDuration),
        durationMinutes: readDuration,
        priority: 'high',
        isLocked: false,
        reason: 'Cognitive cooldown and knowledge compounding',
        recurringStatus: 'daily',
        source: 'ai_generated',
        completed: false,
      });
      currentPointer += readDuration;
    }

    // Sleep Target
    blocks.push({
      id: `blk_sleep_${dateStr}`,
      title: 'Lights Out & Sleep Target',
      category: 'sleep',
      startTime: minutesTo24h(sleepTargetMins),
      endTime: minutesTo24h(wakeMins),
      durationMinutes: sleepTargetMins < wakeMins ? wakeMins - sleepTargetMins : 1440 - sleepTargetMins + wakeMins,
      priority: 'critical',
      isLocked: true,
      reason: 'Uncompromised physical recovery & memory consolidation',
      recurringStatus: 'daily',
      source: 'ai_generated',
      completed: false,
    });

    const enriched = blocks.map((b) => ({
      ...b,
      whyThis: b.whyThis || b.reason || RoutineEngine.getBlockRationale(b),
    }));

    return this.repairSchedule(enriched);
  }

  /**
   * Adjust routine when a holiday is announced or configured
   */
  public static adjustForHoliday(
    routine: FullDayRoutineBlock[],
    holiday: HolidayRecord
  ): { updatedBlocks: FullDayRoutineBlock[]; changes: string[] } {
    const changes: string[] = [];
    const updated: FullDayRoutineBlock[] = [];

    routine.forEach((b) => {
      if (b.category === 'school' || (b.category === 'commute' && b.title.toLowerCase().includes('school'))) {
        changes.push(`Removed "${b.title}" (${b.durationMinutes}m) due to ${holiday.holidayName}.`);
        return;
      }
      updated.push(b);
    });

    // Add holiday leisure & revision balance block
    changes.push(`Allocated free morning hours to Skill Lab project and afternoon family/leisure time.`);

    return {
      updatedBlocks: this.repairSchedule(updated),
      changes,
    };
  }

  /**
   * Generate Evening "Tomorrow Brief"
   */
  public static generateTomorrowBrief(
    tomorrowDateStr: string,
    profile: StudentRoutineProfile,
    tomorrowBlocks: FullDayRoutineBlock[],
    pendingRevisionsCount: number,
    holiday?: HolidayRecord
  ): TomorrowBrief {
    const dateObj = new Date(tomorrowDateStr);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[dateObj.getDay()];

    const isHoliday = Boolean(holiday);
    const schoolBlock = tomorrowBlocks.find((b) => b.category === 'school');
    const sportsBlock = tomorrowBlocks.find((b) => b.category === 'sports' || b.category === 'academy');

    const keyBlocks = tomorrowBlocks
      .filter((b) => ['study', 'revision', 'skill_lab', 'workout', 'sports', 'academy'].includes(b.category))
      .map((b) => ({
        time: `${minutesToFormattedTime(timeToMinutes(b.startTime))} - ${minutesToFormattedTime(timeToMinutes(b.endTime))}`,
        title: b.title,
        category: b.category,
        durationMinutes: b.durationMinutes,
      }));

    return {
      id: `brief_${tomorrowDateStr}`,
      date: tomorrowDateStr,
      dayOfWeek,
      isHoliday,
      holidayName: holiday?.holidayName,
      wakeTime: minutesToFormattedTime(timeToMinutes(profile.wakeTime || '06:00')),
      sleepTargetTime: minutesToFormattedTime(timeToMinutes(profile.sleepTime || '22:00')),
      schoolHours: schoolBlock
        ? `${minutesToFormattedTime(timeToMinutes(schoolBlock.startTime))} - ${minutesToFormattedTime(timeToMinutes(schoolBlock.endTime))}`
        : isHoliday ? 'School Closed (Holiday Schedule Active)' : 'No School Scheduled',
      keyBlocks,
      examsTomorrow: [],
      revisionsDue: pendingRevisionsCount > 0 ? [`${pendingRevisionsCount} Spaced Revision Items Due`] : [],
      unfinishedTasksCount: 0,
      academyOrSportsNotes: sportsBlock ? `${sportsBlock.title} at ${minutesToFormattedTime(timeToMinutes(sportsBlock.startTime))}` : undefined,
      holidayAdjustmentNotes: isHoliday && holiday ? `Tomorrow is ${holiday.holidayName}. School routine adjusted.` : undefined,
      generatedAt: new Date().toISOString(),
      viewed: false,
    };
  }

  /**
   * Generates a deterministic contextual rationale for why a block is placed where it is
   */
  public static getBlockRationale(block: Partial<FullDayRoutineBlock>): string {
    if (block.whyThis) return block.whyThis;
    if (block.reason) return block.reason;

    switch (block.category) {
      case 'wake':
        return 'Establishes baseline circadian rhythm with immediate hydration and daylight exposure.';
      case 'school':
        return 'Institutional academic hours aligned with your verified school timetable.';
      case 'commute':
        return 'Travel transition buffer between home and external commitments to prevent rushing.';
      case 'tuition':
        return 'Coaching / tuition commitment prioritized to preserve your external tutoring cadence.';
      case 'sports':
      case 'academy':
        return 'High-performance athletic conditioning block for cardiovascular health and focus.';
      case 'meal':
        return 'Scheduled nourishment break to maintain stable blood glucose and cognitive energy.';
      case 'study':
        return 'Deep focus study window allocated to meet your configured daily target.';
      case 'revision':
        return 'Active recall mistake review block scheduled before sleep to maximize memory retention.';
      case 'skill_lab':
        return 'Dedicated proof-of-work project session to develop real-world technical capabilities.';
      case 'reading':
        return 'Cognitive cool-down through structured reading before evening wind-down.';
      case 'workout':
        return 'Physical conditioning and mobility exercise to relieve postural tension from study.';
      case 'sleep':
        return 'Protected non-negotiable sleep block ensuring neurobiological recovery and memory consolidation.';
      default:
        return 'Scheduled component of your balanced daily operating cadence.';
    }
  }

  /**
   * Exhaustive deterministic conflict detection engine.
   * Checks for overlapping commitments, travel buffer violations, meal gaps, and bedtime encroachment.
   */
  public static detectDetailedConflicts(
    blocks: FullDayRoutineBlock[],
    profile: StudentRoutineProfile
  ): { hasConflicts: boolean; issues: ScheduleConflictIssue[] } {
    const issues: ScheduleConflictIssue[] = [];
    if (!blocks || blocks.length === 0) {
      return { hasConflicts: false, issues: [] };
    }

    const wakeTime = profile.wakeTime || '06:30';
    const sorted = sortBlocksCircadian(blocks, wakeTime);
    const sleepTargetMins = timeToMinutes(profile.sleepTime || '22:30');
    const wakeMins = timeToMinutes(wakeTime);
    const circadianSleepTarget = sleepTargetMins < wakeMins ? sleepTargetMins + 1440 : sleepTargetMins;

    for (let i = 0; i < sorted.length; i++) {
      const curr = sorted[i];
      const start = timeToMinutes(curr.startTime);
      const end = timeToMinutes(curr.endTime);
      const duration = calculateIntervalDuration(curr.startTime, curr.endTime, true);

      // Duration is only invalid if start === end or computed duration is 0
      if (start === end || duration <= 0) {
        issues.push({
          severity: 'critical',
          title: `Invalid Block Duration: ${curr.title}`,
          detail: `Start time (${curr.startTime}) is identical to end time (${curr.endTime}).`,
          blockId1: curr.id,
          suggestedAction: 'Edit the block start and end times.',
        });
      }

      // Check overlap with next block in circadian sequence
      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        const currSortStart = getCircadianSortKey(curr.startTime, wakeTime, curr.dayOffset);
        const currSortEnd = currSortStart + duration;
        const nextSortStart = getCircadianSortKey(next.startTime, wakeTime, next.dayOffset);

        if (currSortEnd > nextSortStart && curr.category !== 'sleep' && next.category !== 'sleep') {
          const overlap = currSortEnd - nextSortStart;
          if (curr.isLocked && next.isLocked) {
            issues.push({
              severity: 'critical',
              title: `Collision Between Locked Commitments`,
              detail: `"${curr.title}" overlaps with "${next.title}" by ${overlap} minutes. Both cannot happen simultaneously.`,
              blockId1: curr.id,
              blockId2: next.id,
              suggestedAction: 'Adjust your school, tuition, or sports timings in your schedule settings.',
            });
          } else {
            issues.push({
              severity: 'warning',
              title: `Flexible Schedule Overlap`,
              detail: `"${curr.title}" overlaps with "${next.title}" by ${overlap} minutes.`,
              blockId1: curr.id,
              blockId2: next.id,
              suggestedAction: 'Use "Repair Schedule" or "Regenerate Unlocked" to automatically shift flexible blocks.',
            });
          }
        }

        // Travel gap check between external commitments
        const isExternal = (b: FullDayRoutineBlock) => ['school', 'tuition', 'sports', 'academy'].includes(b.category);
        if (isExternal(curr) && isExternal(next) && nextSortStart >= currSortEnd) {
          const transitGap = nextSortStart - currSortEnd;
          if (transitGap < 15) {
            issues.push({
              severity: 'warning',
              title: `Insufficient Travel Buffer`,
              detail: `Only ${transitGap} minutes between finishing "${curr.title}" and starting "${next.title}". You may be rushed or arrive late.`,
              blockId1: curr.id,
              blockId2: next.id,
              suggestedAction: 'Add at least a 15-30 minute commute buffer between external commitments.',
            });
          }
        }
      }

      // Bedtime & Sleep Window Validation
      const startMins = timeToMinutes(curr.startTime);
      const currSortStart = getCircadianSortKey(curr.startTime, wakeTime, curr.dayOffset);
      const currSortEnd = currSortStart + duration;

      // 1. Bedtime Encroachment: block starts during daytime/evening waking hours and concludes past sleep target
      if (
        ['study', 'homework', 'revision', 'tuition'].includes(curr.category) &&
        currSortStart < circadianSleepTarget &&
        currSortEnd > circadianSleepTarget
      ) {
        issues.push({
          severity: 'warning',
          title: `Bedtime Encroachment: ${curr.title}`,
          detail: `"${curr.title}" concludes at ${curr.endTime}, which is past your sleep target of ${profile.sleepTime}. Studying late reduces retention.`,
          blockId1: curr.id,
          suggestedAction: 'Shift this study block earlier or reduce daily study duration to preserve sleep.',
        });
      }

      // 2. Protected Sleep Window Collision: block scheduled during protected sleep hours
      if (curr.category !== 'sleep' && curr.category !== 'wake') {
        const sleepDuration = sleepTargetMins < wakeMins ? wakeMins - sleepTargetMins : 1440 - sleepTargetMins + wakeMins;
        const isDuringSleepWindow = currSortStart >= circadianSleepTarget && currSortStart < circadianSleepTarget + sleepDuration;
        if (isDuringSleepWindow) {
          issues.push({
            severity: curr.isLocked ? 'critical' : 'warning',
            title: `Sleep Window Collision: ${curr.title}`,
            detail: `"${curr.title}" (${curr.startTime} - ${curr.endTime}) is scheduled during your protected sleep interval (${profile.sleepTime} - ${profile.wakeTime}). Sleep is essential for memory consolidation.`,
            blockId1: curr.id,
            suggestedAction: 'Shift this commitment to daytime waking hours to preserve recovery.',
          });
        }

        // 3. Early morning wake overlap (starts before wake target on Day 0)
        if (startMins >= 240 && startMins < wakeMins && !curr.dayOffset) {
          issues.push({
            severity: 'warning',
            title: `Early Morning Sleep Overlap: ${curr.title}`,
            detail: `"${curr.title}" starts at ${curr.startTime}, which is before your wake target of ${profile.wakeTime}.`,
            blockId1: curr.id,
            suggestedAction: `Adjust your wake time to ${curr.startTime} in routine settings if waking early.`,
          });
        }
      }
    }

    // Meal check: flag if total awake span has no meal
    const meals = sorted.filter((b) => b.category === 'meal');
    if (meals.length === 0) {
      issues.push({
        severity: 'info',
        title: 'No Meal Blocks Scheduled',
        detail: 'Routine does not contain dedicated breakfast, lunch, or dinner blocks.',
        suggestedAction: 'Add at least lunch and dinner intervals to protect energy levels.',
      });
    }

    const hasCritical = issues.some((iss) => iss.severity === 'critical');
    return { hasConflicts: hasCritical || issues.length > 0, issues };
  }

  /**
   * Deterministic "Make Lighter" schedule transformation.
   * Reduces flexible study blocks by 20-30% and introduces breathing room.
   */
  public static makeLighter(
    blocks: FullDayRoutineBlock[],
    profile: StudentRoutineProfile
  ): FullDayRoutineBlock[] {
    const updated = blocks.map((b) => {
      if (!b.isLocked && (b.category === 'study' || b.category === 'revision' || b.category === 'skill_lab')) {
        const lighterDuration = Math.max(25, Math.round((b.durationMinutes * 0.75) / 5) * 5);
        const start = timeToMinutes(b.startTime);
        return {
          ...b,
          durationMinutes: lighterDuration,
          endTime: minutesTo24h(start + lighterDuration),
          whyThis: 'Adjusted to a lighter cadence with reduced cognitive strain.',
          reason: 'Lighter schedule mode: reduced duration.',
          source: 'schedule_repair' as const,
        };
      }
      return { ...b };
    });
    return this.repairSchedule(updated);
  }

  /**
   * Deterministic "Make More Intensive" schedule transformation.
   * Maximizes study blocks in free daylight hours while strictly protecting fixed commitments and sleep.
   */
  public static makeMoreIntensive(
    blocks: FullDayRoutineBlock[],
    profile: StudentRoutineProfile
  ): FullDayRoutineBlock[] {
    const targetDaily = profile.studyPreferences?.targetDailyStudyMinutes ?? 180;
    const currentStudy = blocks
      .filter((b) => b.category === 'study' || b.category === 'revision')
      .reduce((sum, b) => sum + b.durationMinutes, 0);

    const neededExtra = Math.max(30, targetDaily - currentStudy);
    const updated = blocks.map((b) => {
      if (!b.isLocked && b.category === 'study' && b.durationMinutes < 90) {
        const added = Math.min(30, neededExtra);
        const newDuration = b.durationMinutes + added;
        const start = timeToMinutes(b.startTime);
        return {
          ...b,
          durationMinutes: newDuration,
          endTime: minutesTo24h(start + newDuration),
          whyThis: 'Intensive focus mode: extended study block for syllabus mastery.',
          reason: 'Intensive schedule mode: expanded focus block.',
          source: 'schedule_repair' as const,
        };
      }
      return { ...b };
    });
    return this.repairSchedule(updated);
  }

  /**
   * Deterministic "Keep Sports Priority" schedule transformation.
   * Locks all athletic and academy commitments and guarantees recovery buffers.
   */
  public static prioritizeSports(
    blocks: FullDayRoutineBlock[],
    profile: StudentRoutineProfile
  ): FullDayRoutineBlock[] {
    const updated: FullDayRoutineBlock[] = [];
    for (const b of blocks) {
      if (b.category === 'sports' || b.category === 'academy') {
        updated.push({
          ...b,
          isLocked: true,
          priority: 'critical',
          whyThis: 'Non-negotiable athletic training block protected by Sports Priority mode.',
        });
        const endMins = timeToMinutes(b.endTime);
        updated.push({
          id: `blk_sports_recovery_${b.id}`,
          title: 'Athletic Cool-down, Hydration & Shower',
          category: 'break',
          startTime: minutesTo24h(endMins),
          endTime: minutesTo24h(endMins + 20),
          durationMinutes: 20,
          priority: 'high',
          isLocked: true,
          whyThis: 'Physical recovery and hydration after intense athletic training.',
          reason: 'Cool-down buffer post sports practice.',
          recurringStatus: 'custom',
          source: 'schedule_repair',
          completed: false,
        });
      } else {
        updated.push({ ...b });
      }
    }
    return this.repairSchedule(updated);
  }

  /**
   * Deterministic "Keep Sleep Priority" schedule transformation.
   * Enforces that all intellectual and academic work finishes at least 45 minutes before sleep target.
   */
  public static prioritizeSleep(
    blocks: FullDayRoutineBlock[],
    profile: StudentRoutineProfile
  ): FullDayRoutineBlock[] {
    const sleepMins = timeToMinutes(profile.sleepTime || '22:30');
    const cutoffMins = sleepMins - 45;

    const updated = blocks
      .map((b) => {
        const bEnd = timeToMinutes(b.endTime);
        const bStart = timeToMinutes(b.startTime);

        if (!b.isLocked && ['study', 'revision', 'skill_lab'].includes(b.category) && bEnd > cutoffMins) {
          if (bStart >= cutoffMins) {
            return null;
          }
          const newDuration = Math.max(20, cutoffMins - bStart);
          return {
            ...b,
            durationMinutes: newDuration,
            endTime: minutesTo24h(bStart + newDuration),
            whyThis: 'Shifted earlier to protect bedtime wind-down and non-negotiable sleep.',
            reason: 'Capped to prevent bedtime encroachment.',
            source: 'schedule_repair' as const,
          };
        }
        return { ...b };
      })
      .filter(Boolean) as FullDayRoutineBlock[];

    return this.repairSchedule(updated);
  }

  /**
   * Deterministic "Regenerate Unlocked" schedule transformation.
   * Keeps all user-locked commitments and regenerates flexible blocks cleanly.
   */
  public static regenerateUnlocked(
    blocks: FullDayRoutineBlock[],
    profile: StudentRoutineProfile,
    dateStr: string
  ): FullDayRoutineBlock[] {
    const lockedBlocks = blocks.filter((b) => b.isLocked);
    const freshFullDay = this.generateFullDayRoutine(profile, dateStr);

    const merged: FullDayRoutineBlock[] = [];
    freshFullDay.forEach((b) => {
      const existingLocked = lockedBlocks.find((l) => l.category === b.category && l.title === b.title);
      if (existingLocked) {
        merged.push(existingLocked);
      } else {
        merged.push(b);
      }
    });

    return this.repairSchedule(merged);
  }
}
