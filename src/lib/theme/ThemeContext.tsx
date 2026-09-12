'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DashboardThemeTemplate, ThemeConfig } from '@/types';

export const THEME_CONFIGS: Record<DashboardThemeTemplate, ThemeConfig> = {
  'focus-light': {
    id: 'focus-light',
    name: 'Focus Light',
    tagline: 'Clean Academic Productivity',
    description: 'Crisp white surfaces, high-contrast typography, and focused indigo accents for maximum distraction-free clarity.',
    previewColors: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      accent: '#4F46E5',
      text: '#0F172A',
    },
  },
  'athletic': {
    id: 'athletic',
    name: 'Athletic Performance',
    tagline: 'High-Energy Sport Aesthetic',
    description: 'Inspired by professional training telemetry with high-contrast emerald borders, warm gold badges, and bold metrics.',
    previewColors: {
      bg: '#F4F6F8',
      card: '#FFFFFF',
      accent: '#059669',
      text: '#111827',
    },
  },
  'tech-ai': {
    id: 'tech-ai',
    name: 'Tech / AI',
    tagline: 'Clean Engineering & Cyber Logic',
    description: 'Precision engineering aesthetic featuring deep cyan accents, violet telemetry highlights, and sleek structured cards.',
    previewColors: {
      bg: '#F0F4F8',
      card: '#FFFFFF',
      accent: '#0284C7',
      text: '#0B132B',
    },
  },
  'calm-study': {
    id: 'calm-study',
    name: 'Calm Study',
    tagline: 'Warm Soothing Paper Tone',
    description: 'Gentle on tired eyes during extended evening study blocks. Warm stone surfaces and bronze highlights prevent eye fatigue.',
    previewColors: {
      bg: '#FAF8F5',
      card: '#FFFFFF',
      accent: '#B45309',
      text: '#292524',
    },
  },
};

interface ThemeContextType {
  theme: DashboardThemeTemplate;
  setTheme: (theme: DashboardThemeTemplate) => void;
  themeConfig: ThemeConfig;
  allThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_THEME_KEY = 'studyos_selected_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<DashboardThemeTemplate>('focus-light');

  // Load saved theme from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY) as DashboardThemeTemplate | null;
      if (saved && THEME_CONFIGS[saved]) {
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'focus-light');
      }
    } catch {
      document.documentElement.setAttribute('data-theme', 'focus-light');
    }
  }, []);

  const setTheme = (newTheme: DashboardThemeTemplate) => {
    if (!THEME_CONFIGS[newTheme]) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeConfig: THEME_CONFIGS[theme] || THEME_CONFIGS['focus-light'],
        allThemes: Object.values(THEME_CONFIGS),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
