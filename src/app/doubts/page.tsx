'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { DoubtInbox } from '../../components/doubts/DoubtInbox';
import { HelpButton } from '../../components/help/HelpButton';
import { FeatureMiniTip } from '../../components/tutorial/FeatureMiniTip';

export default function DoubtsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Academic Recovery Engine
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
            Zero Ambiguity
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              Academic Doubt Inbox
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Catalog, prioritize, and systematically eliminate conceptual blockages before exams.
            </p>
          </div>
          <HelpButton topicKey="doubts" />
        </div>
      </div>

      {/* Dismissible Feature Mini-Tip */}
      <FeatureMiniTip
        featureId="doubts_intro"
        title="Doubt Resolution Pipeline"
        badge="Zero Lingering Blockers"
        description="Never let a confused formula or concept sit unanswered until exam eve. Log doubts as soon as you get stuck, get them clarified with teachers or AI, and verify with a clean recheck."
        quickTips={[
          'Move doubts from Unsolved -> Learning -> Solved -> Recheck',
          'Include exact textbook page numbers and problem figures',
          'High unresolved doubt counts directly shape AI study recommendations',
          'Perform a quick recheck within 7 days to prove true understanding',
        ]}
      />

      <DoubtInbox />
    </div>
  );
}
