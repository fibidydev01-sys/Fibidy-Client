'use client';

// ==========================================
// BLOCK DRAWER
// File: src/components/dashboard/studio/block-drawer.tsx
//
// [PHASE 5 — 2026-05-13]
// Drawer now hosts the primary action toolbar at the bottom:
//   Left:  Preview  → opens /store/{slug} in a new tab
//   Right: Publish  → triggers publish flow
//
// This replaces the floating BuilderHeader (removed in this phase).
// The top bar of the studio is now empty — only the SaveStatusPill
// floats top-center as a non-blocking status indicator.
//
// Mobile drawer (vaul, bottom sheet) and desktop sheet (shadcn, right
// side) both render the same toolbar — different containers, same UX.
// ==========================================

import { useState, useEffect, memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import { Check, Crown, ChevronLeft, ChevronRight, ExternalLink, Save } from 'lucide-react';
import type { BlockOption } from './block-options';
import { BLOCK_OPTIONS_MAP, isProBlock } from './block-options';

type SectionType = 'hero';

interface BlockDrawerProps {
  section: SectionType;
  currentBlock?: string;
  onBlockSelect: (block: string) => void;
  blockVariantLimit?: number;
  // ── Toolbar props (new in Phase 5) ─────────────────────────────────────
  storeSlug: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  configHasProBlocks: boolean;
  onPublish: () => void;
}

const MOBILE_QUERY = '(max-width: 768px)';

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

export function BlockDrawer(props: BlockDrawerProps) {
  const isMobile = useIsMobile();
  return isMobile ? <MobileDrawer {...props} /> : <DesktopSheet {...props} />;
}

// ============================================================================
// SHARED TOOLBAR
// ============================================================================

interface ToolbarProps {
  storeSlug: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  configHasProBlocks: boolean;
  onPublish: () => void;
}

function DrawerToolbar({
  storeSlug,
  hasUnsavedChanges,
  isSaving,
  configHasProBlocks,
  onPublish,
}: ToolbarProps) {
  const t = useTranslations('studio.header');

  return (
    <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 py-2.5 flex items-center justify-between gap-2">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="gap-1.5 h-9 text-xs flex-1"
      >
        <a
          href={`/store/${storeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t('preview')}
        </a>
      </Button>

      <Button
        size="sm"
        onClick={onPublish}
        disabled={isSaving || !hasUnsavedChanges}
        className="gap-1.5 h-9 text-xs flex-1"
      >
        {configHasProBlocks && <Crown className="h-3 w-3 text-amber-300" />}
        <Save className="h-3.5 w-3.5" />
        {isSaving ? t('publishing') : t('publish')}
      </Button>
    </div>
  );
}

// ============================================================================
// MOBILE
// ============================================================================

function MobileDrawer({
  section,
  currentBlock,
  onBlockSelect,
  blockVariantLimit = 3,
  storeSlug,
  hasUnsavedChanges,
  isSaving,
  configHasProBlocks,
  onPublish,
}: BlockDrawerProps) {
  const t = useTranslations('studio.drawer');
  const [open, setOpen] = useState(false);
  const blocks = BLOCK_OPTIONS_MAP[section] || [];

  return (
    <>
      {!open && (
        <div
          onClick={() => setOpen(true)}
          className="fixed bottom-16 left-4 right-4 z-40 flex flex-col items-center py-3 bg-background rounded-t-[20px] border-t shadow-2xl cursor-pointer select-none"
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          <p className="text-xs text-muted-foreground mt-1">{t('open')}</p>
        </div>
      )}

      <Drawer open={open} onOpenChange={setOpen} modal={true}>
        <DrawerContent className="z-[60] flex flex-col max-h-[85vh]">
          <VisuallyHidden.Root>
            <DrawerTitle>{t('selectBlock', { section })}</DrawerTitle>
          </VisuallyHidden.Root>

          <div
            onClick={() => setOpen(false)}
            className="flex flex-col items-center pt-3 pb-2 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            <p className="text-xs text-muted-foreground mt-1">{t('close')}</p>
          </div>

          <div className="overflow-y-auto flex-1">
            {blocks.map((block) => (
              <BlockListItem
                key={block.value}
                block={block}
                isSelected={currentBlock === block.value}
                onSelect={onBlockSelect}
                blockVariantLimit={blockVariantLimit}
              />
            ))}
          </div>

          <DrawerToolbar
            storeSlug={storeSlug}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            configHasProBlocks={configHasProBlocks}
            onPublish={onPublish}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}

// ============================================================================
// DESKTOP
// ============================================================================

function DesktopSheet({
  section,
  currentBlock,
  onBlockSelect,
  blockVariantLimit = 3,
  storeSlug,
  hasUnsavedChanges,
  isSaving,
  configHasProBlocks,
  onPublish,
}: BlockDrawerProps) {
  const t = useTranslations('studio.drawer');
  const [open, setOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const blocks = BLOCK_OPTIONS_MAP[section] || [];

  const handleCollapse = useCallback(() => {
    setIsClosing(true);
    setOpen(false);
    setTimeout(() => setIsClosing(false), 350);
  }, []);

  const handleExpand = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <>
      {!open && !isClosing && (
        <div className="fixed right-0 top-0 bottom-0 w-12 bg-background border-l shadow-lg z-40 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpand}
            className="h-auto py-8"
            title={t('openTooltip')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      <Sheet
        open={open}
        onOpenChange={(v) => {
          if (!v) handleCollapse();
        }}
        modal={false}
      >
        <SheetContent
          side="right"
          className="top-0 z-40 w-[280px] p-0 flex flex-col"
          onInteractOutside={() => handleCollapse()}
        >
          <div className="px-4 py-3 border-b shrink-0">
            <Button
              variant="ghost"
              className="h-8 px-2 gap-1 -ml-2"
              onClick={handleCollapse}
              title={t('closeTooltip')}
            >
              <ChevronRight className="h-4 w-4" />
              <SheetTitle className="text-sm font-semibold">{t('close')}</SheetTitle>
            </Button>
          </div>

          <div className="overflow-y-auto flex-1">
            {blocks.map((block) => (
              <BlockListItem
                key={block.value}
                block={block}
                isSelected={currentBlock === block.value}
                onSelect={onBlockSelect}
                blockVariantLimit={blockVariantLimit}
              />
            ))}
          </div>

          <DrawerToolbar
            storeSlug={storeSlug}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            configHasProBlocks={configHasProBlocks}
            onPublish={onPublish}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

// ============================================================================
// BLOCK LIST ITEM
// ============================================================================

interface BlockListItemProps {
  block: BlockOption;
  isSelected: boolean;
  onSelect: (blockValue: string) => void;
  blockVariantLimit?: number;
}

const BlockListItem = memo(function BlockListItem({
  block,
  isSelected,
  onSelect,
  blockVariantLimit = 3,
}: BlockListItemProps) {
  const t = useTranslations('studio.drawer');
  const isPro = isProBlock(block.value, blockVariantLimit);

  const handleClick = useCallback(() => {
    onSelect(block.value);
  }, [block.value, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full h-14 px-4 flex items-center justify-between border-b transition-colors',
        isSelected
          ? 'bg-primary/10 border-primary/20'
          : 'hover:bg-muted/50 border-border'
      )}
    >
      <span className="text-sm font-medium text-left">{block.label}</span>

      <div className="flex items-center gap-2 ml-2 shrink-0">
        {isPro && (
          <span className="flex items-center gap-1 text-xs font-medium
                           text-amber-600 dark:text-amber-400
                           bg-amber-50 dark:bg-amber-950/40
                           border border-amber-200 dark:border-amber-800
                           rounded-full px-2 py-0.5">
            <Crown className="h-3 w-3" />
            {t('proBadge')}
          </span>
        )}
        {isSelected && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>
    </button>
  );
});
