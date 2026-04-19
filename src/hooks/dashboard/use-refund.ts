// src/hooks/dashboard/use-refund.ts
//
// SSOT Section 18 — Frontend Flow F: Library + Refund Request
//
// Mutation: POST /refund/:purchaseId → auto-evaluate → approve/reject
// On success: invalidate library list so card updates immediately
// Toast: different message for APPROVED vs REJECTED
//
// [i18n FIX — 2026-04-19]
// All toast messages wired to `toast.refund.*` via `useTranslations`.
// The `getRejectMessage` helper — previously a module-level function
// returning hardcoded English — now returns a JSON KEY. The caller
// resolves the key through `tToast()` so the displayed reason is
// locale-aware. This keeps the mapping logic pure (no React hooks
// needed inside it) while flowing through i18n at the point of display.
//
// JSON keys used (toast.refund):
//   - approved              (success message)
//   - rejectedFileValid     (reason: FILE_ACCESSIBLE_AND_VALID)
//   - rejectedOutOfWindow   (reason: OUTSIDE_TIME_WINDOW)
//   - rejectedAlreadyRefunded (reason: ALREADY_REFUNDED)
//   - rejectedGeneric       (unknown reason fallback)

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { refundApi } from '@/lib/api/refund';
import { getErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/shared/query-keys';
import type { RefundResponse } from '@/types/product';

export function useRequestRefund() {
  const tToast = useTranslations('toast.refund');
  const queryClient = useQueryClient();

  return useMutation<RefundResponse, Error, string>({
    mutationFn: (purchaseId: string) => refundApi.request(purchaseId),
    onSuccess: (data) => {
      if (data.status === 'APPROVED') {
        toast.success(tToast('approved'));
      } else {
        // REJECTED — resolve reason → JSON key → translated message
        const key = getRejectMessageKey(data.reason);
        toast.error(tToast(key));
      }

      // Invalidate library so card updates to new refund state
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.list(),
      });

      // Also invalidate refund list if it exists
      queryClient.invalidateQueries({
        queryKey: queryKeys.refund.all,
      });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

// ── Reject reason → JSON key under `toast.refund.*` ─────────
// Pure function, no hooks, safe to keep at module level.
// Caller translates the returned key via useTranslations('toast.refund').
function getRejectMessageKey(reason: string): string {
  switch (reason) {
    case 'FILE_ACCESSIBLE_AND_VALID':
      return 'rejectedFileValid';
    case 'OUTSIDE_TIME_WINDOW':
      return 'rejectedOutOfWindow';
    case 'ALREADY_REFUNDED':
      return 'rejectedAlreadyRefunded';
    default:
      return 'rejectedGeneric';
  }
}