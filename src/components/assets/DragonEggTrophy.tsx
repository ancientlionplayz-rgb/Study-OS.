import React from 'react';

interface TrophyProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export function DragonEggTrophy({ className = '', size = 64, glow = true }: TrophyProps) {
  return (
    <div className={"relative inline-flex items-center justify-center " + className}>
      {glow && (
        <div
          className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-indigo-500/20 to-emerald-400/20 rounded-full blur-xl animate-pulse pointer-events-none"
          style={{ width: size * 1.3, height: size * 1.3 }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-md"
      >
        <defs>
          <linearGradient id="eggGrad" x1="20" y1="10" x2="80" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
          <linearGradient id="goldShine" x1="30" y1="20" x2="70" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="scales" cx="50" cy="60" r="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Pedestal */}
        <path d="M30 110 H70 L75 116 H25 Z" fill="#334155" />
        <path d="M35 106 H65 L68 110 H32 Z" fill="#64748B" />

        {/* Dragon Egg Shell */}
        <path
          d="M50 15 C28 15, 18 50, 20 82 C22 98, 35 106, 50 106 C65 106, 78 98, 80 82 C82 50, 72 15, 50 15 Z"
          fill="url(#eggGrad)"
          stroke="#F59E0B"
          strokeWidth="2"
        />

        {/* Dragon Scale Patterns */}
        <path d="M40 50 Q50 60 60 50" stroke="#FEF3C7" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M34 65 Q50 78 66 65" stroke="#FEF3C7" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M38 80 Q50 90 62 80" stroke="#FEF3C7" strokeWidth="2" fill="none" opacity="0.5" />

        {/* Central Magical Dragon Core */}
        <circle cx="50" cy="65" r="14" fill="url(#scales)" />
        <circle cx="50" cy="65" r="5" fill="#FEF08A" className="animate-pulse" />

        {/* Highlighting Shine */}
        <ellipse cx="40" cy="35" rx="10" ry="16" fill="url(#goldShine)" transform="rotate(-20 40 35)" />
      </svg>
    </div>
  );
}
