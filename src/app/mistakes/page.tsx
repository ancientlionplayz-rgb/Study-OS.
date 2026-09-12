'use client';

import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { MistakeLog } from '../../components/mistakes/MistakeLog';
import { HelpButton } from '../../components/help/HelpButton';
import { FeatureMiniTip } from '../../components/tutorial/FeatureMiniTip';

export default function MistakesPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Error-Driven Recovery
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            Spaced Retrieval (+1, +3, +7)
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              Mistake Logbook & Revision Engine
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Convert lost marks into permanent neural recall with deterministic spaced revision.
            </p>
          </div>
          <HelpButton topicKey="mistakes" />
        </div>
      </div>

      {/* Dismissible First-Time Feature Mini-Tip */}
      <FeatureMiniTip
        featureId="mistakes_intro"
        title="Welcome to the Mistake Logbook"
        badge="High-Leverage Tool"
        description="Every academic error is a diagnostic goldmine. Categorize your errors honestly into 6 core types. StudyOS will automatically schedule spaced retrieval tests at +1d, +3d, and +7d."
        quickTips={[
          'Tag every mistake with its subject, topic, and exact reason',
          'Spaced tests automatically populate your Today dashboard when due',
          'Failing a test resets it back to +1d for immediate repair',
          'Complete independent reattempts before marking as solved',
        ]}
      />

      <MistakeLog />
    </div>
  );
}
