'use client';

// ============================================================================
// SLUG CONFLICT DIALOG (REC-9)
// File: src/components/auth/register/slug-conflict-dialog.tsx
//
// [PHASE D · POST-AUDIT — May 2026]
// Extracted dari inline definition di register.tsx.
// Behavior preserved:
//   - Header icon + tone: destructive (conflict/attention)
//   - Chip-style suggestions row
//   - "Edit manually" → navigate back ke store-info step
//   - Soft dialog (Esc + backdrop allowed — recoverable conflict)
// ============================================================================

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
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

export interface SlugConflictDialogProps {
  open: boolean;
  conflictingSlug: string;
  suggestions: string[];
  onClose: () => void;
  onPickSuggestion: (slug: string) => void;
  onEditManually: () => void;
}

export function SlugConflictDialog({
  open,
  conflictingSlug,
  suggestions,
  onClose,
  onPickSuggestion,
  onEditManually,
}: SlugConflictDialogProps) {
  const t = useTranslations('auth.register.slugConflict');

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle
                className="h-5 w-5 text-destructive"
                aria-hidden
              />
            </div>
            <AlertDialogTitle className="text-base leading-snug">
              {t('title')}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pl-[52px]">
            {t('description', { slug: conflictingSlug || '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {suggestions.length > 0 && (
          <div className="py-2 pl-[52px]">
            <p className="text-xs text-muted-foreground mb-2">
              {t('suggestionsLabel')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPickSuggestion(s)}
                  className="inline-flex items-center rounded-full border border-input bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
          <AlertDialogAction onClick={onEditManually}>
            {t('editManuallyButton')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
