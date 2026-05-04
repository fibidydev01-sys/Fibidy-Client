// ==========================================
// PROBLEM SECTION DATA
// File: src/lib/data/marketing/problem.ts
//
// 3 pain points UMKM hadapi sebelum Fibidy. Copy lives at
// `marketing.problem.items.{key}.*` in marketing.json.
//
// Three is the cap. Four+ pains start to feel doom-and-gloom and
// kill the pivot to Features (per HANDOFF §2.5).
// ==========================================

import { Percent, Globe, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ProblemItem {
  /** i18n key suffix — joins as marketing.problem.items.{id}.title etc */
  id: 'commission' | 'expensiveSlow' | 'notLocal';
  /** Lucide icon */
  icon: LucideIcon;
}

export const problemItems: readonly ProblemItem[] = [
  { id: 'commission', icon: Percent },
  { id: 'expensiveSlow', icon: Zap },
  { id: 'notLocal', icon: Globe },
] as const;
