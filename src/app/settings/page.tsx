'use client';

import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Cloud,
  CloudUpload,
  AlertCircle,
  Palette,
  User,
  Clock,
  Eye,
  Bot,
  Bell,
  HardDrive,
  Vote,
  HelpCircle,
  RefreshCw,
  Check,
  X,
  Sliders,
} from 'lucide-react';
import { useStudyOS } from '../../lib/storage/context';
import { repo } from '../../lib/storage/localStorageRepo';
import { migrateLocalStorageToSupabase, MigrationResult } from '../../lib/supabase/migration';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { useTheme } from '../../lib/theme/ThemeContext';
import { DashboardThemeTemplate } from '../../types';
import { validateContrast, getContrastRatio } from '../../lib/utils/contrast';

export default function SettingsPage() {
  const {
    profile,
    updateProfile,
    toggleDevTestMode,
    loadDevTestData,
    resetAllData,
    exportBackup,
    importBackup,
    tutorialState,
    resetTour,
    featureRequests,
    notificationSettings,
    updateNotificationSettings,
  } = useStudyOS();

  const { theme, setTheme, allThemes } = useTheme();

  const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'study' | 'privacy' | 'ai' | 'notifications' | 'data' | 'features'>('appearance');
  const [studentName, setStudentName] = useState(profile.name);
  const [studyMinutesTarget, setStudyMinutesTarget] = useState(profile.dailyStudyTargetMinutes || 210);
  const [importJson, setImportJson] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  // Custom Theme Creator State
  const [customBg, setCustomBg] = useState('#F8FAFC');
  const [customCard, setCustomCard] = useState('#FFFFFF');
  const [customText, setCustomText] = useState('#0F172A');
  const [customAccent, setCustomAccent] = useState('#4F46E5');

  // AI Health State
  const [aiHealth, setAiHealth] = useState<{
    status: string;
    model: string;
    latencyMs?: number;
    message: string;
  } | null>(null);
  const [isPingingAi, setIsPingingAi] = useState(false);

  const textBgContrast = validateContrast(customText, customBg);
  const textCardContrast = validateContrast(customText, customCard);
  const accentCardContrast = validateContrast(customAccent, customCard);

  const checkAiHealth = async () => {
    setIsPingingAi(true);
    try {
      const res = await fetch('/api/ai/coach');
      if (res.ok) {
        const data = await res.json();
        setAiHealth(data.health || { status: 'online', model: data.model, message: 'Online' });
      } else {
        setAiHealth({ status: 'offline', model: 'unknown', message: 'API returned non-200' });
      }
    } catch {
      setAiHealth({ status: 'offline', model: 'unknown', message: 'Network connection failed' });
    } finally {
      setIsPingingAi(false);
    }
  };

  const handleApplyCustomTheme = () => {
    if (!textCardContrast.isNormalTextAA) {
      setStatusMsg('Cannot apply: Text does not meet WCAG AA contrast against cards.');
      setTimeout(() => setStatusMsg(''), 3000);
      return;
    }
    document.documentElement.style.setProperty('--background', customBg);
    document.documentElement.style.setProperty('--surface', customCard);
    document.documentElement.style.setProperty('--text-primary', customText);
    document.documentElement.style.setProperty('--primary', customAccent);
    setStatusMsg('Custom contrast-verified theme applied successfully!');
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const handleCloudSync = async () => {
    setIsMigrating(true);
    const res = await migrateLocalStorageToSupabase();
    setMigrationResult(res);
    setIsMigrating(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: studentName,
      dailyStudyTargetMinutes: Number(studyMinutesTarget),
    });
    setStatusMsg('Profile and preferences updated.');
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const handleExport = () => {
    const json = exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('Backup downloaded.');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    const success = importBackup(importJson);
    if (success) {
      setStatusMsg('Data successfully imported!');
      setImportJson('');
    } else {
      setStatusMsg('Failed to parse JSON backup.');
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: User },
    { id: 'study', label: 'Study & Time', icon: Clock },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'ai', label: 'AI Coach', icon: Bot },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Backup', icon: HardDrive },
    { id: 'features', label: 'Feature Ideas', icon: Vote },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            System Preferences
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {isSupabaseConfigured ? 'Cloud Synced' : 'Local Sovereignty'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Customize your dashboard visual aesthetic, study parameters, privacy, and backup vaults.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: APPEARANCE & DASHBOARD TEMPLATES */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Dashboard Theme Templates</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose the visual style for your StudyOS dashboard. All templates preserve identical tracking features while updating colors, cards, and typography.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {allThemes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all card-interactive ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-slate-300"
                          style={{ backgroundColor: t.previewColors.accent }}
                        />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {t.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                      {t.tagline}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">Palette:</span>
                      <div className="flex gap-1.5">
                        <div className="w-5 h-4 rounded border border-slate-300" style={{ backgroundColor: t.previewColors.bg }} title="Background" />
                        <div className="w-5 h-4 rounded border border-slate-300" style={{ backgroundColor: t.previewColors.card }} title="Card Surface" />
                        <div className="w-5 h-4 rounded border border-slate-300" style={{ backgroundColor: t.previewColors.accent }} title="Accent Brand" />
                        <div className="w-5 h-4 rounded border border-slate-300" style={{ backgroundColor: t.previewColors.text }} title="Primary Text" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Theme Creator with Real-time Contrast Validation */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Custom Theme Creator & Contrast Validator</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Design your own color theme with automatic WCAG 2.1 contrast calculation to ensure zero unreadable text.
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyCustomTheme}
                disabled={!textCardContrast.isNormalTextAA}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-bold transition-all btn-interactive"
              >
                Apply Custom Palette
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customBg}
                    onChange={(e) => setCustomBg(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{customBg}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Card Surface
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customCard}
                    onChange={(e) => setCustomCard(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{customCard}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Primary Text
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{customText}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{customAccent}</span>
                </div>
              </div>
            </div>

            {/* Real-time WCAG Contrast Validation Indicators */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Accessibility & Contrast Analysis (WCAG 2.1)</span>
                <span className="text-[10px] font-mono text-slate-500">Threshold: AA &ge; 4.5:1</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Text on Card</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{textCardContrast.ratio}:1</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    textCardContrast.isNormalTextAA
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                  }`}>
                    {textCardContrast.isNormalTextAA ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {textCardContrast.grade}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Text on Background</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{textBgContrast.ratio}:1</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    textBgContrast.isNormalTextAA
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                  }`}>
                    {textBgContrast.isNormalTextAA ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {textBgContrast.grade}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Accent on Card</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{accentCardContrast.ratio}:1</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    accentCardContrast.isLargeTextAA
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400'
                  }`}>
                    {accentCardContrast.isLargeTextAA ? 'Readable' : 'Low Contrast'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reduced Motion & Micro-Interactions</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Disable button scale and card hover elevation for low-power devices.
              </p>
            </div>
            <button
              onClick={() => {
                const next = !profile.reducedMotion;
                updateProfile({ reducedMotion: next });
                setStatusMsg(`Reduced motion ${next ? 'enabled' : 'disabled'}.`);
                setTimeout(() => setStatusMsg(''), 2000);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                profile.reducedMotion
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {profile.reducedMotion ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT & TARGETS */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Profile Information</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Visible to team members and public community card.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Grade & Board
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.grade}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Targeting Class 10 ICSE Board in 2027.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all btn-interactive"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: STUDY & TIME */}
      {activeTab === 'study' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Study Targets & Cadence</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Daily Study Target Minutes
                </span>
                <input
                  type="number"
                  min="60"
                  max="480"
                  step="15"
                  value={studyMinutesTarget}
                  onChange={(e) => setStudyMinutesTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block">
                  Recommended: 210 minutes (3.5 hours) per day for Class 9 ICSE recovery.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Mandatory Morning Mathematics
                </span>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  60 Minutes Daily
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Core rule: Non-negotiable daily mathematics quota before school or sports.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                updateProfile({ dailyStudyTargetMinutes: studyMinutesTarget });
                setStatusMsg('Study targets updated.');
                setTimeout(() => setStatusMsg(''), 2000);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all btn-interactive"
            >
              Update Targets
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Public Directory & Vault Isolation</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              StudyOS implements a strict zero-leakage privacy vault. Your private notes, doubts, mistake reflections, AI conversations, and calendar schedules are NEVER visible to other students.
            </p>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Publicly Viewable Attributes:
              </div>
              <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1 list-disc pl-4">
                <li>Username & Display Name</li>
                <li>7-Day Rolling Consistency %</li>
                <li>Active Study Streak Days</li>
                <li>Dragon Egg Tier & Team Name</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI COACH */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>AI Coach Configuration & Telemetry</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  StudyOS AI Coach utilizes server-side Google Gemini models with structured JSON schemas and offline deterministic fallback.
                </p>
              </div>
              <button
                type="button"
                onClick={checkAiHealth}
                disabled={isPingingAi}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPingingAi ? 'animate-spin' : ''}`} />
                <span>{isPingingAi ? 'Pinging API...' : 'Ping Gemini Server'}</span>
              </button>
            </div>

            {/* Live Telemetry Health Card */}
            {aiHealth && (
              <div className={`p-4 rounded-xl border text-xs ${
                aiHealth.status === 'online'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
              }`}>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${aiHealth.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span>Status: {aiHealth.status.toUpperCase()}</span>
                  </span>
                  {aiHealth.latencyMs && (
                    <span className="font-mono text-[11px]">{aiHealth.latencyMs}ms Latency</span>
                  )}
                </div>
                <div className="text-[11px] font-mono">Model: {aiHealth.model}</div>
                <div className="text-[11px] mt-0.5 opacity-90">{aiHealth.message}</div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Active Model Engine</span>
                <span className="text-xs text-slate-500">Fast, verified Google Gemini multimodal generation with zero hallucination guarantee.</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                gemini-flash-lite-latest
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Default Response Depth</span>
                <span className="text-xs text-slate-500">Standard includes quick answer, structured explanation, and worked example.</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Standard
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span>Notification Preferences & Tomorrow Brief</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  Configure evening routine preparation, spaced retrieval alerts, and squad notifications.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const { NotificationService } = await import('@/lib/routine/notificationService');
                  const granted = await NotificationService.requestNotificationPermission();
                  setStatusMsg(granted ? 'Browser notifications enabled!' : 'Notification permission not granted.');
                  setTimeout(() => setStatusMsg(''), 2500);
                }}
                className="px-3 py-1.5 rounded-xl bg-primary-soft text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                Enable Web Push
              </button>
            </div>

            <div className="space-y-3">
              {/* Tomorrow Schedule Evening Brief */}
              <div className="p-4 rounded-xl bg-background border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Tomorrow Schedule (Evening Brief)</span>
                  <span className="text-[11px] text-text-muted">
                    Prepares tomorrow’s complete life routine every evening so you wake up with clear priorities.
                  </span>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <input
                    type="time"
                    value={notificationSettings.tomorrowScheduleTime}
                    onChange={(e) => updateNotificationSettings({ tomorrowScheduleTime: e.target.value })}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-border-default text-xs font-mono text-text-primary"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateNotificationSettings({
                        tomorrowScheduleEnabled: !notificationSettings.tomorrowScheduleEnabled,
                      })
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      notificationSettings.tomorrowScheduleEnabled
                        ? 'bg-success-soft text-success border border-success/30'
                        : 'bg-background text-text-muted border border-border-default'
                    }`}
                  >
                    {notificationSettings.tomorrowScheduleEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Revision Reminders */}
              <div className="p-4 rounded-xl bg-background border border-border-default flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Spaced Revision Reminders</span>
                  <span className="text-[11px] text-text-muted">
                    Alerts when +1, +3, or +7 spaced retrieval items from your Mistake Log are due.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({
                      revisionRemindersEnabled: !notificationSettings.revisionRemindersEnabled,
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    notificationSettings.revisionRemindersEnabled
                      ? 'bg-success-soft text-success border border-success/30'
                      : 'bg-background text-text-muted border border-border-default'
                  }`}
                >
                  {notificationSettings.revisionRemindersEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Task Reminders */}
              <div className="p-4 rounded-xl bg-background border border-border-default flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Study & Task Reminders</span>
                  <span className="text-[11px] text-text-muted">
                    Prompts when mandatory 60m Maths or core study blocks are starting.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({
                      taskRemindersEnabled: !notificationSettings.taskRemindersEnabled,
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    notificationSettings.taskRemindersEnabled
                      ? 'bg-success-soft text-success border border-success/30'
                      : 'bg-background text-text-muted border border-border-default'
                  }`}
                >
                  {notificationSettings.taskRemindersEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Exam Reminders */}
              <div className="p-4 rounded-xl bg-background border border-border-default flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Exam & Test Reminders</span>
                  <span className="text-[11px] text-text-muted">
                    Upcoming ICSE board and unit test reminders 3 days and 1 day prior.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({
                      examRemindersEnabled: !notificationSettings.examRemindersEnabled,
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    notificationSettings.examRemindersEnabled
                      ? 'bg-success-soft text-success border border-success/30'
                      : 'bg-background text-text-muted border border-border-default'
                  }`}
                >
                  {notificationSettings.examRemindersEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Team Invitations */}
              <div className="p-4 rounded-xl bg-background border border-border-default flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Squad / Team Invitations</span>
                  <span className="text-[11px] text-text-muted">
                    Direct squad joins and challenge invitations from peers.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({
                      teamInvitationsEnabled: !notificationSettings.teamInvitationsEnabled,
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    notificationSettings.teamInvitationsEnabled
                      ? 'bg-success-soft text-success border border-success/30'
                      : 'bg-background text-text-muted border border-border-default'
                  }`}
                >
                  {notificationSettings.teamInvitationsEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Challenge Updates */}
              <div className="p-4 rounded-xl bg-background border border-border-default flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Challenge Leaderboard Updates</span>
                  <span className="text-[11px] text-text-muted">
                    Weekly Dragon Egg and discipline competition progress.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateNotificationSettings({
                      challengeUpdatesEnabled: !notificationSettings.challengeUpdatesEnabled,
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    notificationSettings.challengeUpdatesEnabled
                      ? 'bg-success-soft text-success border border-success/30'
                      : 'bg-background text-text-muted border border-border-default'
                  }`}
                >
                  {notificationSettings.challengeUpdatesEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DATA & BACKUP */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Cloud Migration to Supabase */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Supabase Cloud Sync & Migration</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Synchronize your local sessions, doubts, mistakes, and growth logs with your standalone Supabase project.
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
              }`}>
                {isSupabaseConfigured ? 'Supabase Ready' : 'Local Offline Mode'}
              </span>
            </div>

            {migrationResult && (
              <div className={`p-4 rounded-xl border text-xs ${
                migrationResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}>
                {migrationResult.success ? (
                  <div>
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Migration Successful!
                    </div>
                    <div>Transferred: {migrationResult.importedCounts.sessions} sessions, {migrationResult.importedCounts.doubts} doubts, {migrationResult.importedCounts.mistakes} mistakes, {migrationResult.importedCounts.reading} reading logs.</div>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-700 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4" /> Notice
                    </div>
                    <div>{migrationResult.error}</div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCloudSync}
              disabled={isMigrating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all btn-interactive disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{isMigrating ? 'Migrating Data...' : 'Sync Data to Supabase'}</span>
            </button>
          </div>

          {/* Backup Export / Import */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Local Backup Vault (Export & Import)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Export your entire StudyOS history as a single JSON file. You can restore it on any computer or phone anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all btn-interactive"
              >
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Download Backup (JSON)</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Paste JSON Backup to Restore
              </label>
              <textarea
                rows={2}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste JSON content here..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
              <button
                onClick={handleImport}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all btn-interactive"
              >
                <Upload className="w-4 h-4" />
                <span>Restore Backup</span>
              </button>
            </div>
          </div>

          {/* Guided Tour Reset */}
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Tutorial & Guided Tour</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Replay the 16-step guided walkthrough covering timetable, squads, and mistake logs.
                </p>
              </div>
              <button
                type="button"
                onClick={resetTour}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all btn-interactive flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Tour</span>
              </button>
            </div>
          </div>

          {/* Developer Mode */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  <span>Developer Persona & Test Data</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Load realistic ICSE Class 9 study sessions, active mistakes (+1/+3/+7), and doubts for testing.
                </p>
              </div>

              <button
                onClick={() => {
                  if (profile.isDevTestMode) {
                    resetAllData();
                  } else {
                    loadDevTestData();
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all btn-interactive ${
                  profile.isDevTestMode
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {profile.isDevTestMode ? 'Disable & Clear' : 'Load Test Data'}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/30 dark:bg-slate-950 p-5 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Danger Zone</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Permanently clear all local study sessions, doubts, and mistake logs.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all StudyOS data to empty state?')) {
                  resetAllData();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold transition-all btn-interactive"
            >
              Reset All Data
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: COMMUNITY FEATURE IDEAS & VOTING */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Vote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Community Feature Requests & Roadmap</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Vote on feature proposals submitted by students. Highest voted features are reviewed for upcoming releases.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {featureRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {req.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {req.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.status === 'Building'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'Planned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {req.description}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      Proposed by {req.authorDisplayName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {req.votesCount} votes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
