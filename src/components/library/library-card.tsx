// src/components/library/library-card.tsx
//
// [TIDUR-NYENYAK FIX #1] Q2=B treatment:
// When downloadRevoked = true → Download button replaced with
// "Akses Dicabut" badge + tooltip explaining reason.
//
// Card stays visible (not grayed out) — buyer still sees purchase
// history, but cannot download the file anymore.

'use client';

import {
  FileText,
  Music,
  Video,
  Image,
  Archive,
  Download,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDownloadUrl } from '@/hooks/dashboard/use-library';
import { RefundButton } from './refund-button';
import { formatPrice } from '@/lib/shared/format';
import type { Purchase } from '@/types/product';

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  epub: FileText,
  mp3: Music,
  wav: Music,
  mp4: Video,
  mov: Video,
  jpg: Image,
  jpeg: Image,
  png: Image,
  zip: Archive,
  rar: Archive,
};

interface LibraryCardProps {
  purchase: Purchase;
}

export function LibraryCard({ purchase }: LibraryCardProps) {
  const Icon = FILE_ICONS[purchase.fileType] ?? FileText;
  const { getDownloadUrl } = useDownloadUrl(purchase.purchaseId);

  // [FIX #1] Source of truth: downloadRevoked field from backend.
  // Fallback: if server hasn't been deployed yet and field is missing,
  // derive from refund status (backward compat).
  const isRevoked =
    purchase.downloadRevoked === true ||
    purchase.refundRequest?.status === 'APPROVED';

  const revokedReason =
    purchase.refundRequest?.status === 'APPROVED'
      ? 'Akses dicabut karena refund sudah disetujui.'
      : 'Akses download untuk produk ini telah dicabut.';

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {purchase.productName}
          </p>
          <p className="text-xs text-muted-foreground">
            {purchase.seller.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {new Date(purchase.purchasedAt).toLocaleDateString('id-ID')}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium">
              {formatPrice(purchase.paidAmount, purchase.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions row — adaptive based on revoke state */}
      <div className="flex items-center gap-2">
        {isRevoked ? (
          // [FIX #1] Q2=B: Replace download with "Akses Dicabut" badge + tooltip
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="flex-1 justify-center py-1.5 text-destructive border-destructive/30 bg-destructive/5 cursor-help"
                >
                  <Ban className="h-3.5 w-3.5 mr-1.5" />
                  Akses Dicabut
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                <p className="text-xs">{revokedReason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={getDownloadUrl}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </Button>
        )}

        {/* Refund button — adaptive states */}
        <RefundButton purchase={purchase} />
      </div>
    </div>
  );
}
