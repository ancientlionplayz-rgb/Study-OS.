'use client';

import React, { useState, useMemo } from 'react';
import { BookMarked, Plus, CheckCircle2, Flame, Lightbulb, BookOpen, X } from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';

export default function ReadingPage() {
  const { readingLogs, createReadingLog, selectedDate } = useStudyOS();
  const [showModal, setShowModal] = useState(false);
  const [bookTitle, setBookTitle] = useState('Deep Work');
  const [author, setAuthor] = useState('Cal Newport');
  const [pagesRead, setPagesRead] = useState(10);
  const [keyIdea, setKeyIdea] = useState('Attention residue causes a severe cognitive tax when switching contexts; dedicated blocks protect deep work.');
  const [takeaways, setTakeaways] = useState('Schedule every minute of your day in blocks rather than working reactively.');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createReadingLog({
      date: selectedDate,
      bookTitle: bookTitle.trim(),
      author: author.trim() || undefined,
      pagesRead,
      targetMet: pagesRead >= 5,
      keyIdea: keyIdea.trim(),
      takeaways: takeaways.trim() || undefined,
    });
    setShowModal(false);
  };

  const todayLogs = readingLogs.filter((r) => r.date === selectedDate);
  const todayPages = todayLogs.reduce((acc, r) => acc + r.pagesRead, 0);

  // Dynamic reading streak calculation (consecutive days with >= 5 pages)
  const readingStreak = useMemo(() => {
    if (readingLogs.length === 0) return 0;

    const pagesByDate: Record<string, number> = {};
    readingLogs.forEach((log) => {
      pagesByDate[log.date] = (pagesByDate[log.date] || 0) + log.pagesRead;
    });

    const dates = Object.keys(pagesByDate).sort().reverse();
    if (dates.length === 0) return 0;

    let streak = 0;
    const today = selectedDate;
    let checkDate = new Date(today + 'T00:00:00');

    // If today has met target, start from today, else start from yesterday
    const todayMet = (pagesByDate[today] || 0) >= 5;
    if (!todayMet) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if ((pagesByDate[dateStr] || 0) >= 5) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [readingLogs, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Intellectual Discipline
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Target: 5+ Pages/Day
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Reading & Non-Fiction Log
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Daily minimum 5 pages. Track book, pages read, one key distilled idea, and reading streak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-surface border border-border-default text-right flex items-center gap-2.5 shadow-sm">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <div>
              <div className="text-[10px] font-mono uppercase text-text-muted font-bold">Reading Streak</div>
              <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">{readingStreak} days</div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0 btn-interactive"
          >
            <Plus className="w-4 h-4" />
            <span>Log Reading</span>
          </button>
        </div>
      </div>

      {/* Target Status Card */}
      <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Today’s Reading Target
          </div>
          <div className="text-2xl font-black text-text-primary font-mono">{todayPages} / 5 Pages</div>
          <div className="text-xs text-text-secondary mt-0.5">
            {todayPages >= 5 ? 'Daily 5+ pages target achieved!' : `${5 - todayPages} pages remaining today`}
          </div>
        </div>

        <div>
          {todayPages >= 5 ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Target Met
            </span>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-surface-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-text-primary border border-border-default text-xs font-semibold btn-interactive"
            >
              Complete 5 Pages Today
            </button>
          )}
        </div>
      </div>

      {/* Reading Logs List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Reading Logs & Key Ideas ({readingLogs.length})
        </h3>

        {readingLogs.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500">
            No reading logged yet. Build the daily habit of reading at least 5 pages of non-fiction.
          </div>
        ) : (
          readingLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm">{log.bookTitle}</span>
                  {log.author && <span className="text-slate-400 ml-2">by {log.author}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-400 font-bold">{log.pagesRead} pages</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-slate-400">{log.date}</span>
                </div>
              </div>

              {/* One Key Idea */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono uppercase font-bold text-amber-400">
                    One Key Idea Distilled
                  </div>
                  <div className="text-xs text-amber-100 font-medium leading-relaxed mt-0.5">
                    {log.keyIdea}
                  </div>
                </div>
              </div>

              {log.takeaways && (
                <div className="text-slate-400 pt-0.5">
                  <strong className="text-slate-300">Actionable Takeaways: </strong>
                  {log.takeaways}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Log Reading Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                  Intellectual Discipline
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Log Daily Reading</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Book Title</label>
                  <input
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g. Deep Work, Atomic Habits"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pages Read</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={pagesRead}
                    onChange={(e) => setPagesRead(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Author (Optional)</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Cal Newport"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  One Key Idea (Distilled in 1–2 sentences)
                </label>
                <textarea
                  rows={2}
                  required
                  value={keyIdea}
                  onChange={(e) => setKeyIdea(e.target.value)}
                  placeholder="What is the single most important mental model or insight from today's reading?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Actionable Takeaways / Application (Optional)
                </label>
                <input
                  type="text"
                  value={takeaways}
                  onChange={(e) => setTakeaways(e.target.value)}
                  placeholder="How will this be applied to study sessions or habits?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Save Reading Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
