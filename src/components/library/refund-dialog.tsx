// src/components/library/refund-dialog.tsx
//
// SSOT Section 18 — RefundDialog Policy Explanation
// REFUND-FLOW Section 9.2 — Policy Disclosure layout
//
// Shows:
//   1. Warning icon + title
//   2. Policy explanation (what gets approved/rejected)
//   3. Buttons: Cancel (ghost) | Request Refund (destructive)
//
// On confirm → POST /refund/:purchaseId → toast result

'use client';

import { AlertTriangle, Check, X, Loader2, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRequestRefund } from '@/hooks/dashboard/use-refund';
import { formatPrice } from '@/lib/shared/format';
import type { Purchase } from '@/types/product';

interface RefundDialogProps {
  purchase: Purchase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundDialog({ purchase, open, onOpenChange }: RefundDialogProps) {
  const { mutate: requestRefund, isPending } = useRequestRefund();

  const handleConfirm = () => {
    requestRefund(purchase.purchaseId, {
      onSettled: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Request Refund
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-2">
              {/* Product info */}
              <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">{purchase.productName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPrice(purchase.paidAmount, purchase.currency)} · {purchase.seller.name}
                </p>
              </div>

              {/* Policy */}
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground leading-relaxed">
                  Our system will automatically verify your file and evaluate your request.
                  This process takes 5-30 seconds.
                </p>

                {/* Approved conditions */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">Approved</span> if the file cannot be downloaded
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">Approved</span> if the file is corrupted or unreadable
                    </span>
                  </div>
                </div>

                {/* Rejected conditions */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">Not approved</span> for &quot;content doesn&apos;t match expectations&quot;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">Not approved</span> for &quot;I don&apos;t need it anymore&quot;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">Not approved</span> for &quot;I bought by accident&quot;
                    </span>
                  </div>
                </div>

                {/* Preview reminder */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-3 py-2.5">
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    <AlertTriangle className="inline h-3 w-3 mr-1 -mt-0.5" />
                    You had access to a preview before purchasing. Refunds are only granted for
                    technical issues with file delivery, not subjective reasons.
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              'Request Refund'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}