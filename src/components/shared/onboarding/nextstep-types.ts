// ==========================================
// NEXTSTEP TYPES (SHARED — REUSABLE)
// File: src/components/shared/onboarding/nextstep-types.ts
//
// Strict TS types for tour configurations. Mirrors what nextstepjs
// expects, but typed locally so consumers (marketing tours, future
// dashboard tours) get autocomplete + type-checking without
// depending on internal nextstepjs exports.
//
// See library docs:
//   https://nextstepjs.com/docs/nextjs/tour-steps
// ==========================================

import type { ReactNode } from 'react';

/**
 * Tooltip side relative to the highlighted target.
 *
 * `*-bottom-aligned` etc. anchor the tooltip's edge to the target's
 * edge instead of centering. Useful for elements near viewport edges.
 */
export type NextStepSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-top'
  | 'left-bottom'
  | 'right-top'
  | 'right-bottom';

export interface NextStepStep {
  /** Optional emoji or icon node shown in the tooltip header */
  icon?: ReactNode;
  /** Bold heading shown in the tooltip */
  title: string;
  /** Body content — string or ReactNode */
  content: ReactNode;
  /**
   * CSS selector targeting the element to highlight. Typically an ID:
   *   selector: '#builder-category-picker'
   */
  selector: string;
  /** Where the tooltip sits relative to the target (default 'bottom') */
  side?: NextStepSide;
  /** Show next/prev/finish controls (default true). False for single-step tours. */
  showControls?: boolean;
  /** Show a skip/dismiss button (default true) */
  showSkip?: boolean;
  /** Padding around the highlighted element in pixels (default 0) */
  pointerPadding?: number;
  /** Border radius of the highlight ring in pixels (default 0) */
  pointerRadius?: number;
  /** Optional next route the tour navigates to before showing this step */
  nextRoute?: string;
  /** Optional previous route */
  prevRoute?: string;
}

export interface NextStepTour {
  /**
   * Unique tour identifier — used to start the tour:
   *   startNextStep('category-gate')
   */
  tour: string;
  steps: NextStepStep[];
}
