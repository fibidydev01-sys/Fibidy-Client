'use client';

import { FileText, Music, Video, Image, Archive } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DownloadLogEntry } from '@/types/product';

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText, epub: FileText,
  mp3: Music, wav: Music,
  mp4: Video, mov: Video,
  jpg: Image, jpeg: Image, png: Image,
  zip: Archive, rar: Archive,
};

interface DownloadHistoryTableProps {
  logs: DownloadLogEntry[];
  isLoading: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DownloadHistoryTable({ logs, isLoading }: DownloadHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>No download history yet.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Header — hidden on mobile */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <div className="col-span-4">Product</div>
        <div className="col-span-3">Buyer</div>
        <div className="col-span-3">Time</div>
        <div className="col-span-2">IP</div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {logs.map((log) => {
          const Icon = FILE_ICONS[log.productFileType] ?? FileText;

          return (
            <div
              key={log.id}
              className="px-4 py-3 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center space-y-2 sm:space-y-0"
            >
              {/* Product */}
              <div className="col-span-4 flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{log.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.productFileType.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Buyer */}
              <div className="col-span-3 min-w-0">
                <p className="text-sm truncate">{log.buyerName || '—'}</p>
                <p className="text-xs text-muted-foreground truncate">{log.buyerEmail}</p>
              </div>

              {/* Time */}
              <div className="col-span-3">
                <p className="text-sm text-muted-foreground">
                  {formatDate(log.downloadedAt)}
                </p>
              </div>

              {/* IP */}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground font-mono">
                  {log.ipAddress ?? '—'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}