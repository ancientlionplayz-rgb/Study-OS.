'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  BookOpen,
  HelpCircle,
  AlertOctagon,
  Menu,
} from 'lucide-react';
import { MoreDrawer } from './MoreDrawer';
import { useStudyOS } from '../../lib/storage/context';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { revisionsDue } = useStudyOS();

  const navItems = [
    { name: 'Today', href: '/', icon: Calendar },
    { name: 'Study', href: '/study', icon: BookOpen },
    { name: 'Mistakes', href: '/mistakes', icon: AlertOctagon, badgeCount: revisionsDue.length },
    { name: 'Doubts', href: '/doubts', icon: HelpCircle },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 py-1.5 select-none">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                  isActive ? 'text-brand-blue font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5">{item.name}</span>
              </Link>
            );
          })}

          {/* More Drawer Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </div>
      </nav>

      <MoreDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
