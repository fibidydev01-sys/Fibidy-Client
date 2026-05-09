'use client';

// ==========================================
// SAVE TIME CALENDAR (FEATURES BENTO — 4th tile)
// File: src/components/marketing/sections/features/visuals/save-time-calendar.tsx
//
// [PHASE 4 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/features/visuals/index.tsx
// (was the SaveTimeVisual block in the v14 monolith). Behavior
// preserved verbatim. Only path changed.
//
// ──────────────────────────────────────────────────────────────────
//
// Fourth bento tile — react-day-picker v9 single-mode Calendar
// pinned to today's date. Anchors the "5 menit, bukan 5 minggu"
// copy with a literal calendar visual.
//
// CLIENT — Calendar primitive (in @/components/ui/calendar) is a
// react-day-picker v9 wrapper. v9 requires client component for
// the Chevron component slot + DayPicker's internal state.
//
// useState lazy initializer (`() => new Date()`) keeps the today
// reference stable across rerenders without re-rendering the
// calendar to a new "today" mid-session if the component happens
// to live across midnight.
//
// Top mask + scale-to-bg-on-hover treatment matches the original
// Magic UI demo for visual rhythm with the other 3 tiles.
// ==========================================

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

export function SaveTimeVisual() {
  const [today] = useState(() => new Date());

  return (
    <Calendar
      mode="single"
      selected={today}
      defaultMonth={today}
      className="absolute right-0 top-10 origin-top scale-75 rounded-md border bg-card [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
    />
  );
}
