'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => { };

// ==========================================
// USE MOUNTED
// Check if component is hydrated client-side
// ==========================================

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}