'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import { ComingSoonPhaseCard } from '../../components/shared/ComingSoonPhaseCard';

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Collaborative Circles
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
            Phase 2
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
          Study Circles & Groups
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Subject-focused study cells targeting Class 9 ICSE syllabus completion.
        </p>
      </div>

      <ComingSoonPhaseCard
        title="Focused Academic Circles"
        category="Study Circles"
        phase="Phase 2"
        icon={UserCheck}
        description="Form small groups (3–5 students) focused on specific challenging ICSE subjects like Physics numericals, Organic Chemistry, or Java programming."
        roadmapItems={[
          'Subject-specific syllabus pacing guides',
          'Group question bank with verified solutions',
          'Shared weekend mock exam simulations',
        ]}
      />
    </div>
  );
}
