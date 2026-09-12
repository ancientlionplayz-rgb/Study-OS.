'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { GuidedTour } from '../tutorial/GuidedTour';
import { AuthGuard } from '../auth/AuthGuard';

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/callback',
  '/auth/pending',
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthPage) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="flex w-full min-h-screen bg-background text-text-primary">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
          <Header />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* Global Interactive Guided Tour */}
        <GuidedTour />
      </div>
    </AuthGuard>
  );
}
