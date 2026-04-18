'use client';

// ==========================================
// ADMIN MAINTENANCE PAGE
// File: src/app/(admin)/admin/maintenance/page.tsx
//
// [TIDUR-NYENYAK FIX #6] Admin maintenance tools.
// Currently houses: Cleanup Logs card.
// Future: can add more maintenance utilities here.
// ==========================================

import { Wrench } from 'lucide-react';
import { CleanupCard } from '@/components/admin/maintenance/cleanup-card';

export default function AdminMaintenancePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Maintenance</h1>
          <p className="text-sm text-muted-foreground">
            Tools to keep the database and platform healthy
          </p>
        </div>
      </div>

      {/* Cleanup Card */}
      <CleanupCard />
    </div>
  );
}