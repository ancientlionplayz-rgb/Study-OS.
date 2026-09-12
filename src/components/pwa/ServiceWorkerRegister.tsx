'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[StudyOS PWA] Service worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[StudyOS PWA] Service worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
