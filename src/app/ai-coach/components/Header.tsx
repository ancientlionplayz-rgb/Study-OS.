// Header component for AI Coach page
'use client';

import React, { useEffect, useState } from 'react';
import { AnswerMode } from '@/lib/coach/types';
import { CheckCircle2 } from 'lucide-react';

interface ApiHealth {
  status: string;
  latencyMs?: number;
  model: string;
  message: string;
}

interface ApiStatus {
  configured: boolean;
  model: string;
  mode?: string;
  health?: ApiHealth;
}

export const Header: React.FC<{
  answerMode: AnswerMode;
  setAnswerMode: (mode: AnswerMode) => void;
}> = ({ answerMode, setAnswerMode }) => {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);

  useEffect(() => {
    fetch('/api/ai/coach')
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => {
        setApiStatus({ configured: false, model: 'deterministic_engine', mode: 'offline' });
      });
  }, []);

  const statusBadge = () => {
    if (!apiStatus) return null;
    const health = apiStatus.health;
    const status = health?.status ?? 'offline';
    const colorMap: Record<string, string> = {
      online: 'bg-green-500',
      rate_limited: 'bg-yellow-500',
      quota_exhausted: 'bg-red-500',
      unauthorized: 'bg-gray-500',
      offline: 'bg-gray-500',
      fallback_mode: 'bg-indigo-500',
    };
    const bg = colorMap[status] || 'bg-gray-500';
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${bg} text-white text-xs`}>
        <CheckCircle2 size={12} />
        <span>{status.replace('_', ' ')}</span>
      </div>
    );
  };

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-surface border-b border-muted">
      <h1 className="text-2xl font-semibold text-primary">StudyOS AI Coach</h1>
      <div className="flex items-center gap-4">
        {statusBadge()}
        <div className="flex items-center gap-1">
          <label className="text-sm text-muted-foreground">Depth:</label>
          <select
            value={answerMode}
            onChange={(e) => setAnswerMode(e.target.value as AnswerMode)}
            className="border rounded p-1 text-sm"
          >
            <option value="quick">Quick (Concise)</option>
            <option value="standard">Standard</option>
            <option value="deep">Deep (Detailed)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
