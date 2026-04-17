// src/hooks/dashboard/use-refund.ts
//
// SSOT Section 18 — Frontend Flow F: Library + Refund Request
//
// Mutation: POST /refund/:purchaseId → auto-evaluate → approve/reject
// On success: invalidate library list so card updates immediately
// Toast: different message for APPROVED vs REJECTED

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { refundApi } from '@/lib/api/refund';
import { getErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/shared/query-keys';
import type { RefundResponse } from '@/types/product';

export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation<RefundResponse, Error, string>({
    mutationFn: (purchaseId: string) => refundApi.request(purchaseId),
    onSuccess: (data) => {
      if (data.status === 'APPROVED') {
        toast.success(
          'Refund approved! Funds will return to your account in 5-10 business days.',
        );
      } else {
        // REJECTED — show reason-specific message
        const message = getRejectMessage(data.reason);
        toast.error(message);
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

// ── Reject reason → user-facing message ─────────────────────
function getRejectMessage(reason: string): string {
  switch (reason) {
    case 'FILE_ACCESSIBLE_AND_VALID':
      return 'File is accessible and valid. Refund cannot be processed.';
    case 'OUTSIDE_TIME_WINDOW':
      return 'Refund window (7 days) has expired.';
    case 'ALREADY_REFUNDED':
      return 'This purchase has already been refunded.';
    default:
      return 'Refund request was rejected.';
  }
}