'use client';

// ==========================================
// ADMIN MAINTENANCE — CLEANUP CARD
// File: src/components/admin/maintenance/cleanup-card.tsx
//
// [TIDUR-NYENYAK FIX #6] UI for admin-triggered log cleanup.
// Calls POST /admin/maintenance/cleanup-logs.
//
// Safe to run multiple times. Shows deletion counts on success.
// ==========================================

import { useState } from 'react';
import {
  Trash2,
  Database,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminApi, type CleanupLogsResponse } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';

const DEFAULT_DAYS = 90;

export function CleanupCard() {
  const [downloadLogDays, setDownloadLogDays] = useState(DEFAULT_DAYS);
  const [webhookEventDays, setWebhookEventDays] = useState(DEFAULT_DAYS);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastResult, setLastResult] = useState<CleanupLogsResponse | null>(null);

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setIsLoading(true);
    setLastResult(null);

    try {
      const result = await adminApi.cleanupLogs({
        downloadLogOlderThanDays: downloadLogDays,
        webhookEventOlderThanDays: webhookEventDays,
      });

      setLastResult(result);
      toast.success('Cleanup successful', {
        description: `${result.deleted.downloadLogs} download logs + ${result.deleted.webhookEvents} webhook events deleted.`,
      });
    } catch (err) {
      toast.error('Cleanup failed', { description: getErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Cleanup Logs</CardTitle>
          </div>
          <CardDescription>
            Delete old DownloadLog and WebhookEvent records to prevent DB
            bloat. Safe to run anytime — historical data required for
            accounting is not deleted.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Threshold Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="download-days" className="text-xs font-medium">
                Download Logs (days)
              </Label>
              <Input
                id="download-days"
                type="number"
                min={7}
                max={365}
                step={1}
                value={downloadLogDays}
                onChange={(e) => setDownloadLogDays(Number(e.target.value) || DEFAULT_DAYS)}
                disabled={isLoading}
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Delete records older than {downloadLogDays} days
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-days" className="text-xs font-medium">
                Webhook Events (days)
              </Label>
              <Input
                id="webhook-days"
                type="number"
                min={7}
                max={365}
                step={1}
                value={webhookEventDays}
                onChange={(e) => setWebhookEventDays(Number(e.target.value) || DEFAULT_DAYS)}
                disabled={isLoading}
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Delete records older than {webhookEventDays} days
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <p className="font-medium mb-0.5">This cannot be undone.</p>
                <p className="text-amber-700 dark:text-amber-400">
                  Make sure the thresholds are correct before running. Deleted
                  data cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting records...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Run Cleanup
              </>
            )}
          </Button>

          {/* Last Result */}
          {lastResult && (
            <>
              <Separator />
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    {lastResult.message}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md bg-white/60 dark:bg-black/20 px-3 py-2">
                    <p className="text-emerald-700 dark:text-emerald-400">Download logs</p>
                    <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                      {lastResult.deleted.downloadLogs.toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="rounded-md bg-white/60 dark:bg-black/20 px-3 py-2">
                    <p className="text-emerald-700 dark:text-emerald-400">Webhook events</p>
                    <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                      {lastResult.deleted.webhookEvents.toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Run cleanup?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p>
                  The following data will be permanently deleted from the database:
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>
                      <strong>DownloadLog</strong> older than{' '}
                      <strong>{downloadLogDays} days</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>
                      <strong>WebhookEvent</strong> older than{' '}
                      <strong>{webhookEventDays} days</strong>
                    </span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  Purchase records, Tenant data, and Subscription history will NOT
                  be affected.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
