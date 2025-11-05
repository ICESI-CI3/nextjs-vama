'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './Toast/ToastContainer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

