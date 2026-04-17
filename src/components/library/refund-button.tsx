// src/components/library/refund-button.tsx
//
// SSOT Section 18 — RefundButton Adaptive States
//
// | Condition                              | Button State         | Label                  |
// | refundRequest === null && canRequest   | Enabled, outline     | "Request Refund"       |
// | refundRequest === null && !canRequest  | Disabled             | "Refund window expired" |
// | refundRequest.status === 'PENDING'     | Disabled, loading    | "Refund pending"       |
// | refundRequest.status === 'APPROVED'    | Disabled, green      | "Refunded"             |
// | refundRequest.status === 'REJECTED'    | Disabled + tooltip   | "Refund rejected"      |

'use client';

import { useState } from 'react';
import { Check, X, Loader2, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RefundDialog } from './refund-dialog';
import type { Purchase, RefundRejectReason } from '@/types/product';

interface RefundButtonProps {
  purchase: Purchase;
}

function getRejectReasonMessage(reason?: RefundRejectReason | null): string {
  switch (reason) {
    case 'FILE_ACCESSIBLE_AND_VALID':
      return 'File is accessible and not corrupted. Refund denied as per policy.';
    case 'OUTSIDE_TIME_WINDOW':
      return 'Refund window (7 days) has expired.';
    case 'ALREADY_REFUNDED':
      return 'This purchase has already been refunded.';
    default:
      return 'Refund request was rejected.';
  }
}

export function RefundButton({ purchase }: RefundButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const refund = purchase.refundRequest;
  const { canRequest, daysRemaining } = purchase.refundEligibility;

  // ── State: APPROVED ───────────────────────────────────────
  if (refund?.status === 'APPROVED') {
    return (
      <Badge
        variant="outline"
        className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/30"
      >
        <Check className="h-3 w-3 mr-1" />
        Refunded
      </Badge>
    );
  }

  // ── State: REJECTED ───────────────────────────────────────
  if (refund?.status === 'REJECTED') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-destructive border-destructive/30 bg-destructive/5 cursor-help"
            >
              <X className="h-3 w-3 mr-1" />
              Refund Rejected
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px]">
            <p className="text-xs">{getRejectReasonMessage(refund.rejectReason)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // ── State: PENDING ────────────────────────────────────────
  if (refund?.status === 'PENDING') {
    return (
      <Button size="sm" variant="outline" disabled className="gap-1.5">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processing...
      </Button>
    );
  }

  // ── State: Window expired (no refundRequest, can't request) ─
  if (!canRequest) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" disabled className="gap-1.5 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Refund Expired
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Refund window (7 days) has expired.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // ── State: Eligible — can request ─────────────────────────
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="gap-1.5"
      >
        <RotateCcw className="h-3 w-3" />
        Request Refund
        {daysRemaining > 0 && (
          <span className="text-[10px] text-muted-foreground ml-0.5">
            ({daysRemaining}d left)
          </span>
        )}
      </Button>
      <RefundDialog
        purchase={purchase}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}