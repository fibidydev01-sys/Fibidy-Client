'use client';

// ============================================================================
// BLOCK DRAWER — Studio Flow v3
// File: src/components/dashboard/studio/block-drawer.tsx
//
// [STUDIO FLOW v3 — May 2026]
// Props baru:
//   - autoOpen: boolean            → auto-buka drawer saat onboarding fase drawer
//   - autoPublish: boolean         → setelah auto-open, auto publishToServer()
//   - onAutoOpenConsumed: ()=>void  → parent reset flag autoOpen
//   - onAutoPublishConsumed: ()=>void → parent reset flag autoPublish
//   - publishChanges: ()=>Promise  → direct ref ke publishToServer dari hook
//
// Flow saat autoOpen + autoPublish = true:
//   1. Drawer/Sheet open
//   2. block1 di-pulse + badge "Mulai di sini" muncul 2.5s
//   3. 600ms delay (user sempat lihat) → publishChanges() dipanggil otomatis
//   4. Setelah publish → parent useLandingConfig.onSaveSuccess → FirstPublishDialog
//
// User TIDAK perlu klik apapun di drawer — semua otomatis.
// Drawer ditampilkan sebagai "showcase" fitur, bukan action required.
//
// [COLLAPSED TRIGGER — Aug 2026]
// Sebelumnya, collapsed-state trigger tiap platform beda filosofi:
//   - Mobile: pill kecil "Pilih Tampilan" mengambang bottom-right, dempet
//     dengan bottom nav (Produk/Studio/Pengaturan) — tidak match desktop.
//   - Desktop: strip w-12 siku (no border-radius) nempel di right edge.
//
// Sekarang KEDUANYA disamakan filosofinya jadi "rounded strip chevron"
// yang nempel di edge masing-masing, cuma orientasi beda:
//   - Desktop: strip VERTIKAL nempel RIGHT edge, rounded di sisi KIRI
//     (sisi yang menghadap konten) — w-12, full height.
//   - Mobile: strip HORIZONTAL nempel BOTTOM (di atas bottom nav, TIDAK
//     menggantikannya), rounded di sisi ATAS (sisi yang menghadap
//     konten) — h-12, lebar mengikuti container (ada margin kiri-kanan
//     agar terlihat floating, bukan full-bleed).
// Isi kedua strip: 1 chevron di tengah (arah sesuai orientasi buka).
// ============================================================================

import { useState, useEffect, memo, useCallback, useRef } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  Save,
  Sparkles,
} from 'lucide-react';
import type { BlockOption } from './block-options';
import { BLOCK_OPTIONS_MAP, isProBlock } from './block-options';
import type { PublishResult } from '@/hooks/dashboard/use-landing-config';
import { storeAbsoluteUrl } from '@/lib/public/store-url';

type SectionType = 'hero';

interface BlockDrawerProps {
  section: SectionType;
  currentBlock?: string;
  onBlockSelect: (block: string) => void;
  blockVariantLimit?: number;
  storeSlug: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  configHasProBlocks: boolean;
  heroEnabled: boolean;
  hasPublishedOnce: boolean;
  onPublish: () => void;
  /** [v3] Auto-buka drawer — dari parent saat onboarding fase drawer */
  autoOpen?: boolean;
  /** [v3] Auto-publish setelah drawer terbuka — first-time flow */
  autoPublish?: boolean;
  /** [v3] Callback setelah autoOpen dikonsumsi */
  onAutoOpenConsumed?: () => void;
  /** [v3] Callback setelah autoPublish dikonsumsi */
  onAutoPublishConsumed?: () => void;
  /** [v3] Direct ref ke publishToServer — dipakai untuk auto-publish */
  publishChanges?: () => Promise<PublishResult>;
  /** [v3] Callback setelah auto-publish selesai */
  onPublishDone?: () => void;
}

const MOBILE_QUERY = '(max-width: 768px)';
const PULSE_DURATION_MS = 2500;
// Delay sebelum auto-publish — user sempat lihat drawer sebentar
const AUTO_PUBLISH_DELAY_MS = 600;

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
  heroEnabled: boolean;
  hasPublishedOnce: boolean;
  onPublish: () => void;
}

function DrawerToolbar({
  storeSlug,
  hasUnsavedChanges,
  isSaving,
  configHasProBlocks,
  heroEnabled,
  hasPublishedOnce,
  onPublish,
}: ToolbarProps) {
  const t = useTranslations('studio.header');
  const tDisabled = useTranslations('studio.publishDisabled');

  const heroOff = !heroEnabled;
  const nothingToSave = hasPublishedOnce && !hasUnsavedChanges;
  const isPublishDisabled = isSaving || heroOff || nothingToSave;

  const tooltipReason: string | null = isSaving
    ? null
    : heroOff
      ? tDisabled('heroOff')
      : nothingToSave
        ? tDisabled('nothingToSave')
        : null;

  const publishButton = (
    <Button
      size="sm"
      onClick={onPublish}
      disabled={isPublishDisabled}
      className="gap-1.5 h-9 text-xs flex-1"
    >
      {configHasProBlocks && <Crown className="h-3 w-3 text-amber-300" />}
      <Save className="h-3.5 w-3.5" />
      {isSaving ? t('publishing') : t('publish')}
    </Button>
  );

  return (
    <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 py-2.5 flex items-center justify-between gap-2">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="gap-1.5 h-9 text-xs flex-1"
      >
        <a href={storeAbsoluteUrl(storeSlug)}>
          <ExternalLink className="h-3.5 w-3.5" />
          {t('preview')}
        </a>
      </Button>

      {tooltipReason ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* `flex` (not just `flex-1`) so the nested Button's own flex-1 still stretches it to match the enabled size */}
              <span className="flex-1 flex">{publishButton}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs">
              {tooltipReason}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        publishButton
      )}
    </div>
  );
}

// ============================================================================
// SHARED AUTO-OPEN + AUTO-PUBLISH LOGIC
// ============================================================================

function useAutoFlow({
  autoOpen,
  autoPublish,
  blocks,
  onAutoOpenConsumed,
  onAutoPublishConsumed,
  publishChanges,
  onPublishDone,
  setOpen,
  setPulsingBlock,
}: {
  autoOpen: boolean;
  autoPublish: boolean;
  blocks: BlockOption[];
  onAutoOpenConsumed?: () => void;
  onAutoPublishConsumed?: () => void;
  publishChanges?: () => Promise<PublishResult>;
  onPublishDone?: () => void;
  setOpen: (v: boolean) => void;
  setPulsingBlock: (v: string | null) => void;
}) {
  const publishRef = useRef(publishChanges);
  publishRef.current = publishChanges;

  useEffect(() => {
    if (!autoOpen) return;

    // 1. Buka drawer
    setOpen(true);
    onAutoOpenConsumed?.();

    // 2. Pulse block1 setelah drawer terbuka
    const pulseTimer = setTimeout(() => {
      const firstBlock = blocks[0];
      if (firstBlock) {
        setPulsingBlock(firstBlock.value);
        setTimeout(() => setPulsingBlock(null), PULSE_DURATION_MS);
      }
    }, 400);

    return () => clearTimeout(pulseTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  useEffect(() => {
    if (!autoPublish) return;
    onAutoPublishConsumed?.();

    // 3. Auto-publish setelah delay — user sempat lihat drawer
    const publishTimer = setTimeout(async () => {
      if (publishRef.current) {
        const result = await publishRef.current();
        if (result.ok) {
          onPublishDone?.();
        }
      }
    }, AUTO_PUBLISH_DELAY_MS);

    return () => clearTimeout(publishTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPublish]);
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
  heroEnabled,
  hasPublishedOnce,
  onPublish,
  autoOpen = false,
  autoPublish = false,
  onAutoOpenConsumed,
  onAutoPublishConsumed,
  publishChanges,
  onPublishDone,
}: BlockDrawerProps) {
  const t = useTranslations('studio.drawer');
  const [open, setOpen] = useState(false);
  const [pulsingBlock, setPulsingBlock] = useState<string | null>(null);
  const blocks = BLOCK_OPTIONS_MAP[section] || [];

  useAutoFlow({
    autoOpen,
    autoPublish,
    blocks,
    onAutoOpenConsumed,
    onAutoPublishConsumed,
    publishChanges,
    onPublishDone,
    setOpen,
    setPulsingBlock,
  });

  return (
    <>
      {/* [ROUNDED STRIP — Aug 2026] Horizontal strip nempel BOTTOM, DI ATAS
          bottom nav (tidak menggantikannya) — bukan pill mengambang lagi.
          Lebar mengikuti container (left-4 right-4) agar terlihat floating
          dengan margin kiri-kanan, tinggi h-12 menyamai desktop's w-12.
          Rounded di sisi ATAS (rounded-t-2xl) — sisi yang menghadap konten
          saat dibuka ke atas — mencerminkan desktop yang rounded di sisi
          KIRI (sisi yang menghadap konten saat dibuka ke kiri).
          `bottom-16` mempertahankan jarak di atas bottom nav yang sudah ada. */}
      {!open && (
        <div className="fixed inset-x-4 bottom-16 z-40 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('open')}
            className="flex h-12 w-full items-center justify-center rounded-t-2xl border border-b-0 bg-background shadow-2xl"
          >
            <ChevronDown className="h-5 w-5 rotate-180 text-foreground" />
          </button>
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
                isPulsing={pulsingBlock === block.value}
              />
            ))}
          </div>

          <DrawerToolbar
            storeSlug={storeSlug}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            configHasProBlocks={configHasProBlocks}
            heroEnabled={heroEnabled}
            hasPublishedOnce={hasPublishedOnce}
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
  heroEnabled,
  hasPublishedOnce,
  onPublish,
  autoOpen = false,
  autoPublish = false,
  onAutoOpenConsumed,
  onAutoPublishConsumed,
  publishChanges,
  onPublishDone,
}: BlockDrawerProps) {
  const t = useTranslations('studio.drawer');
  const [open, setOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [pulsingBlock, setPulsingBlock] = useState<string | null>(null);
  const blocks = BLOCK_OPTIONS_MAP[section] || [];

  useAutoFlow({
    autoOpen,
    autoPublish,
    blocks,
    onAutoOpenConsumed,
    onAutoPublishConsumed,
    publishChanges,
    onPublishDone,
    setOpen,
    setPulsingBlock,
  });

  const handleCollapse = useCallback(() => {
    setIsClosing(true);
    setOpen(false);
    setTimeout(() => setIsClosing(false), 350);
  }, []);

  const handleExpand = useCallback(() => setOpen(true), []);

  return (
    <>
      {/* [ROUNDED STRIP — Aug 2026] Sebelumnya siku total (no radius, border-l
          doang). Sekarang rounded di sisi KIRI (rounded-l-2xl) — sisi yang
          menghadap konten/canvas saat Sheet dibuka ke kiri. Sisi kanan
          (nempel viewport edge) tetap siku karena tidak akan pernah
          terlihat rounded di situ. `right-0` tidak diubah — strip tetap
          menempel viewport edge, hanya border-radius yang ditambah. */}
      {!open && !isClosing && (
        <div className="fixed right-0 top-0 bottom-0 w-12 bg-background border border-r-0 rounded-l-2xl shadow-lg z-40 flex items-center justify-center">
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
        onOpenChange={(v) => { if (!v) handleCollapse(); }}
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
              <SheetTitle className="text-sm font-semibold">
                {t('close')}
              </SheetTitle>
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
                isPulsing={pulsingBlock === block.value}
              />
            ))}
          </div>

          <DrawerToolbar
            storeSlug={storeSlug}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            configHasProBlocks={configHasProBlocks}
            heroEnabled={heroEnabled}
            hasPublishedOnce={hasPublishedOnce}
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
  isPulsing?: boolean;
}

const BlockListItem = memo(function BlockListItem({
  block,
  isSelected,
  onSelect,
  blockVariantLimit = 3,
  isPulsing = false,
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
        'w-full h-14 px-4 flex items-center justify-between border-b transition-all duration-200',
        isSelected
          ? 'bg-primary/10 border-primary/20'
          : 'hover:bg-muted/50 border-border',
        isPulsing && 'animate-pulse bg-primary/5 ring-2 ring-primary/30 ring-inset',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-left truncate">
          {block.label}
        </span>
        {isPulsing && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shrink-0 animate-bounce">
            <Sparkles className="h-2.5 w-2.5" />
            {t('startHere')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-2 shrink-0">
        {isPro && (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5">
            <Crown className="h-3 w-3" />
            {t('proBadge')}
          </span>
        )}
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </div>
    </button>
  );
});