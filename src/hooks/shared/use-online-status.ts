'use client';

// ============================================================================
// USE ONLINE STATUS — Sprint 3.1
// File: src/hooks/shared/use-online-status.ts
//
// [PHASE F — May 2026]
// Hybrid online detection: navigator.onLine (fast) + active probe (accurate).
//
// WHY HYBRID?
// navigator.onLine === true ≠ internet reachable. Common false positives:
//   - WiFi connected but captive portal not signed in
//   - VPN connected to DNS-only resolver, no real egress
//   - Router up, but ISP outage upstream
//
// PROBE STRATEGY:
//   - Endpoint: authApi.status() — cheapest existing endpoint
//   - Frequency: 30s when online, 5s when suspected offline
//   - HTTP error (4xx, 5xx) = ONLINE (server responded)
//   - Network error (fetch throw) = OFFLINE
//
// PERFORMANCE:
//   - Singleton: one probe loop for entire app regardless of consumers
//
// [FIX — May 2026]
// getServerSnapshot MUST return a stable cached reference.
// React requires getServerSnapshot to never return a new object on each call —
// doing so causes an infinite loop in React's reconciler.
// Fix: module-level SERVER_SNAPSHOT constant + bound method refs on singleton.
// ============================================================================

import { useSyncExternalStore } from 'react';
import { authApi } from '@/lib/api/auth';

type OnlineStatus = 'online' | 'offline' | 'unknown';

interface OnlineState {
  status: OnlineStatus;
  lastSeenOnline: number | null;
  isChecking: boolean;
}

const PROBE_INTERVAL_ONLINE_MS = 30_000;
const PROBE_INTERVAL_OFFLINE_MS = 5_000;
const DEBOUNCE_ONLINE_CONFIRM_MS = 3_000;
const PROBE_TIMEOUT_MS = 8_000;

// ── Stable server snapshot — MUST be a module-level constant ─────────────────
// React calls getServerSnapshot during SSR and hydration. If it returns a new
// object reference each time, React detects a "changed" snapshot and loops.
const SERVER_SNAPSHOT: OnlineState = {
  status: 'unknown',
  lastSeenOnline: null,
  isChecking: false,
};

class OnlineStatusStore {
  private state: OnlineState = {
    status: 'unknown',
    lastSeenOnline: null,
    isChecking: false,
  };
  private listeners = new Set<() => void>();
  private probeTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private mounted = false;
  private mountCount = 0;

  // ── Stable bound method refs ────────────────────────────────────────────────
  // These are bound once on construction so the same function reference is
  // passed to useSyncExternalStore on every render — required for React to
  // correctly detect no-change and not re-subscribe.
  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    this.mountCount += 1;

    if (!this.mounted) {
      this.mount();
    }

    return () => {
      this.listeners.delete(listener);
      this.mountCount -= 1;
      if (this.mountCount === 0) {
        this.unmount();
      }
    };
  };

  readonly getSnapshot = (): OnlineState => this.state;

  // Returns the module-level constant — same reference every call, no loop.
  readonly getServerSnapshot = (): OnlineState => SERVER_SNAPSHOT;

  private mount() {
    if (typeof window === 'undefined') return;
    this.mounted = true;

    window.addEventListener('online', this.handleBrowserOnline);
    window.addEventListener('offline', this.handleBrowserOffline);

    const initialOnline = navigator.onLine;
    this.setState({
      status: initialOnline ? 'online' : 'offline',
      lastSeenOnline: initialOnline ? Date.now() : null,
      isChecking: false,
    });

    this.scheduleProbe(0);
  }

  private unmount() {
    if (typeof window === 'undefined') return;
    this.mounted = false;

    window.removeEventListener('online', this.handleBrowserOnline);
    window.removeEventListener('offline', this.handleBrowserOffline);

    if (this.probeTimer) clearTimeout(this.probeTimer);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.probeTimer = null;
    this.debounceTimer = null;
  }

  private handleBrowserOnline = () => {
    this.scheduleProbe(0);
  };

  private handleBrowserOffline = () => {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.setState({ ...this.state, status: 'offline', isChecking: false });
    this.scheduleProbe(PROBE_INTERVAL_OFFLINE_MS);
  };

  private scheduleProbe(delayMs: number) {
    if (this.probeTimer) clearTimeout(this.probeTimer);
    this.probeTimer = setTimeout(() => {
      void this.runProbe();
    }, delayMs);
  }

  private async runProbe() {
    if (!this.mounted) return;

    this.setState({ ...this.state, isChecking: true });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

    let reachable = false;
    try {
      await authApi.status();
      reachable = true;
    } catch (err) {
      // HTTP errors (4xx/5xx) mean server responded → network is up
      if (err && typeof err === 'object' && 'status' in err) {
        reachable = true;
      } else {
        reachable = false;
      }
    } finally {
      clearTimeout(timeoutId);
    }

    if (!this.mounted) return;

    if (reachable) {
      if (this.state.status === 'online') {
        this.setState({
          ...this.state,
          isChecking: false,
          lastSeenOnline: Date.now(),
        });
        this.scheduleProbe(PROBE_INTERVAL_ONLINE_MS);
        return;
      }

      this.setState({ ...this.state, isChecking: false });

      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        if (!this.mounted) return;
        this.setState({
          status: 'online',
          lastSeenOnline: Date.now(),
          isChecking: false,
        });
        this.debounceTimer = null;
      }, DEBOUNCE_ONLINE_CONFIRM_MS);

      this.scheduleProbe(PROBE_INTERVAL_ONLINE_MS);
    } else {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      this.setState({
        status: 'offline',
        lastSeenOnline: this.state.lastSeenOnline,
        isChecking: false,
      });
      this.scheduleProbe(PROBE_INTERVAL_OFFLINE_MS);
    }
  }

  private setState(next: OnlineState) {
    const prev = this.state;
    if (
      prev.status === next.status &&
      prev.lastSeenOnline === next.lastSeenOnline &&
      prev.isChecking === next.isChecking
    ) {
      return;
    }
    this.state = next;
    this.listeners.forEach((l) => l());
  }
}

// ── Module-level singleton ────────────────────────────────────────────────────
// Created once per module lifetime. subscribe/getSnapshot/getServerSnapshot
// are all stable references pointing to this single instance.
const store = new OnlineStatusStore();

// ── Public hooks ──────────────────────────────────────────────────────────────

export interface UseOnlineStatusReturn {
  status: OnlineStatus;
  isOnline: boolean;
  isOffline: boolean;
  isChecking: boolean;
  lastSeenOnline: number | null;
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  // All three args are stable module-level references — no new objects per render.
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return {
    status: state.status,
    isOnline: state.status === 'online',
    isOffline: state.status === 'offline',
    isChecking: state.isChecking,
    lastSeenOnline: state.lastSeenOnline,
  };
}

export interface UseOfflineGateReturn {
  isDisabled: boolean;
  tooltipMessage: string | null;
}

export function useOfflineGate(offlineMessage: string): UseOfflineGateReturn {
  const { isOffline } = useOnlineStatus();
  return {
    isDisabled: isOffline,
    tooltipMessage: isOffline ? offlineMessage : null,
  };
}

export const __TEST_ONLY__ = {
  reset: () => {
    // No-op in production singleton pattern.
    // In tests, mock the module instead.
  },
};