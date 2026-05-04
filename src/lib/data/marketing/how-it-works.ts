// ==========================================
// HOW IT WORKS DATA
// File: src/lib/data/marketing/how-it-works.ts
//
// Three-step journey from signup to first sale. Three is the cap
// per HANDOFF §2.7 — more than three steps signals product
// complexity that should be reduced, not visualized.
//
// Copy at `marketing.howItWorks.steps.{id}.*` in marketing.json.
// ==========================================

import { UserPlus, UploadCloud, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface HowItWorksStep {
  /** i18n key suffix */
  id: 'register' | 'setup' | 'sell';
  /** Visible step number */
  index: 1 | 2 | 3;
  /** Lucide icon */
  icon: LucideIcon;
}

export const howItWorksSteps: readonly HowItWorksStep[] = [
  { id: 'register', index: 1, icon: UserPlus },
  { id: 'setup', index: 2, icon: UploadCloud },
  { id: 'sell', index: 3, icon: ShoppingBag },
] as const;
