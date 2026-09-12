import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StudyOSProvider } from '../lib/storage/context';
import { AuthProvider } from '../lib/supabase/AuthContext';
import { ThemeProvider } from '../lib/theme/ThemeContext';
import { AppShell } from '../components/navigation/AppShell';
import { ServiceWorkerRegister } from '../components/pwa/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'StudyOS - Class 9 ICSE Academic Comeback & Growth OS',
  description:
    'Personal growth operating system for students combining academic recovery, daily 3.5h study, mandatory 60m Maths, mistake-driven revision, skills, football, fitness, and discipline.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary min-h-screen flex antialiased selection:bg-indigo-600 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <StudyOSProvider>
              <ServiceWorkerRegister />
              <AppShell>{children}</AppShell>
            </StudyOSProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
