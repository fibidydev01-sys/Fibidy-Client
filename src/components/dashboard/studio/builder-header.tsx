'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save, Crown } from 'lucide-react';

interface BuilderHeaderProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  configHasProBlocks: boolean;
  onPublish: () => void;
  onFullPreview: () => void;
}

export function BuilderHeader({
  hasUnsavedChanges,
  isSaving,
  configHasProBlocks,
  onPublish,
  onFullPreview,
}: BuilderHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-10 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4">

      {/* ── MOBILE: Preview kiri, Publish kanan ── */}
      <div className="flex w-full items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onFullPreview}
            className="h-8 text-xs"
          >
            Preview
          </Button>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-500 text-xs">
              Unsaved
            </Badge>
          )}
        </div>

        <Button
          size="sm"
          onClick={onPublish}
          disabled={isSaving || !hasUnsavedChanges}
          className="gap-1.5 h-8 text-xs"
        >
          {configHasProBlocks && <Crown className="h-3 w-3 text-amber-300" />}
          <Save className="h-3.5 w-3.5" />
          {isSaving ? 'Publishing...' : 'Publish'}
        </Button>
      </div>

      {/* ── DESKTOP: Preview + Badge tengah, Publish kanan ── */}
      <div className="hidden lg:flex w-full items-center">

        {/* Spacer kiri */}
        <div className="flex-1" />

        {/* Preview + Badge Unsaved — tengah */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onFullPreview}
            className="h-8 text-sm"
          >
            Preview
          </Button>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-500">
              Unsaved
            </Badge>
          )}
        </div>

        {/* Publish — kanan */}
        <div className="flex-1 flex items-center justify-end">
          <Button
            size="sm"
            onClick={onPublish}
            disabled={isSaving || !hasUnsavedChanges}
            className="gap-1.5 h-8 text-sm"
          >
            {configHasProBlocks && <Crown className="h-3 w-3 text-amber-300" />}
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>

      </div>

    </div>
  );
}