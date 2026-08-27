'use client';

// [PANGKAS PRODUK DIGITAL]
// Blok info file, hitungan penjualan, dan penguncian tombol Hapus semuanya
// bertumpu pada Purchase — yang sudah tidak ada. Produk kini selalu boleh
// dihapus dari sini.
//
// [IDR MIGRATION FOLLOW-UP — May 2026] — Bug #22 fix
// Harga dirender lewat formatPriceIDR() dari @/lib/shared/format, bukan
// .toFixed(2). Dulu "$50000.00" untuk produk IDR — salah di semua sisi:
// simbol, pemisah, dan aturan desimal. Sekarang "Rp 50.000".
//
// [UI/UX CONSISTENCY AUDIT]
// Rebuilt on top of the shared shadcn Drawer primitives (DrawerHeader /
// DrawerFooter from '@/components/ui/drawer') instead of raw vaul +
// a hand-rolled sticky-on-scroll IntersectionObserver. Header and footer
// now sit outside the scroll container as regular flex siblings, so they
// stay put by construction — only the middle section scrolls.
//
// [RESPONSIVE DIRECTION FIX — Aug 2026]
// Was always rendering with the vaul default direction="bottom",
// regardless of viewport — so desktop got the same full-width bottom
// sheet as mobile instead of a right-side panel. drawer.tsx's
// DrawerContent already has full styling for
// data-[vaul-drawer-direction=right] (inset-y-0 right-0, w-3/4,
// sm:max-w-sm, border-l, drag handle correctly hidden for non-bottom
// directions) — it was just never given direction="right" to key off.
//
// Fix: useIsMobile() (src/hooks/shared/use-media-query.ts, breakpoint
// (max-width: 639px) — i.e. below Tailwind's sm) decides direction
// per-render:
//   isMobile → direction="bottom"  (existing behavior, unchanged)
//   !isMobile → direction="right"  (new — 384px side panel, slide from right)
//
// max-h-[92vh] is likewise only applied on mobile — for direction="right"
// the primitive already sets inset-y-0 (full viewport height); capping
// height on top of that left the leftover space pooling under the footer
// instead of the panel filling edge-to-edge. Desktop uses h-full instead.
//
// No SSR flash concern here: this drawer only mounts once a product is
// clicked (ProductPreviewDrawer returns product-less content otherwise),
// by which point window exists and useIsMobile's client snapshot is
// already accurate — unlike a drawer present in the initial server-rendered
// tree, where the hook's getServerSnapshot hardcoded to false could
// cause a first-paint flash.
//
// [IMAGE LOADING SKELETON — Aug 2026]
// Main image and thumbnails were plain next/image <Image> with no
// placeholder — on a cold cache (hard refresh, first open) the Cloudinary
// URL is still in flight when the drawer opens, so the box rendered empty
// (only the alt text briefly visible) until the fetch completed. Reopening
// the same drawer in the same session looked fine because the browser
// already had the image cached from the first attempt — same underlying
// cause, just invisible once warm. Switched both to OptimizedImage
// (src/components/ui/optimized-image.tsx), which now renders a Skeleton
// overlay that fades out on onLoad/onError, matching the pattern
// already used in product-grid-card.tsx.
//
// [ACTIVATE TOGGLE RELOCATION + REALTIME — Aug 2026]
// Moved Activate/Deactivate out of the footer action grid and into the
// header, top-left corner, as a standalone icon-pill button. Footer now
// only holds Edit + Delete (Delete conditionally hidden per FIX #9 above).
//
// "Realtime" here means the button's own icon/label flips the instant
// it's clicked — it does NOT wait for the update mutation's network
// round-trip. This requires local optimistic state:
//
//   - `optimisticIsActive` seeds from `product.isActive` on mount/product
//     change (via the `key={product.id}` remount on DrawerInner — see
//     ProductPreviewDrawer below — so switching products always reseeds
//     correctly rather than carrying over the previous product's state).
//   - On click: flip `optimisticIsActive` immediately (button updates
//     synchronously), THEN fire the mutation.
//   - On mutation error: revert `optimisticIsActive` back and surface the
//     existing toast error (useUpdateProductFile's onError already toasts
//     via getErrorMessage — no duplicate handling needed here).
//   - On mutation success: no action needed — optimisticIsActive already
//     holds the correct new value; the eventual query refetch (via
//     invalidateQueries in the hook) will confirm it server-side, but the
//     drawer doesn't need to wait for that to reflect the change.
//
// Why not just use `product.isActive` directly: `product` is a prop
// snapshot captured at click-time by the parent (see product-grid.tsx's
// `selectedProduct` state) and is never reassigned from fresh query data
// after the initial click — so reading `product.isActive` post-mutation
// would keep showing the stale pre-toggle value until the drawer is
// closed and reopened. Local optimistic state sidesteps that entirely.
//
// [TITLE NUDGE RIGHT — Aug 2026]
// The header wrapper stays `relative` + `justify-center` with the toggle
// button `absolute left-0`, exactly as before — the button is pulled out
// of flex flow, so it never pushes the <h2> sideways on its own. The
// title previously sat dead-center via `text-center` + symmetric
// `px-[92px]` on both sides. To nudge the title right of center (not all
// the way to the corner), the padding was made ASYMMETRIC: more on the
// left (`pl-[128px]`) than the right (`pr-[56px]`). Since the text is
// still `text-center` *within its own box*, widening the left padding
// relative to the right shifts where that box's center — and therefore
// the centered text — falls, without touching the button or the
// wrapper's own centering logic. `pl` stays comfortably above the
// button's `min-w-[92px]` so the title never overlaps it even at its
// leftmost extent; `pr` was reduced so the net effect is a rightward
// shift rather than just widening the box on both sides.

import { useState, useCallback, useEffect } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useTranslations } from 'next-intl';
import {
  Tag,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/shared/utils';
import { formatDateShort, formatPriceIDR } from '@/lib/shared/format';
import { useIsMobile } from '@/hooks/shared/use-media-query';
import type { Product } from '@/types/product';
import { MarkdownText } from '@/components/store/shared/markdown-text';
import { markdownToPlainText } from '@/lib/shared/markdown';

interface ProductPreviewDrawerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleActive?: (product: Product) => void;
}

interface DrawerInnerProps {
  product: Product;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleActive?: (product: Product) => void;
}

function DrawerInner({
  product,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleActive,
}: DrawerInnerProps) {
  const t = useTranslations('dashboard.products.previewDrawer');
  // [i18n FIX] For the "FILE" fallback label when fileType is null.

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // [REALTIME TOGGLE] Local optimistic mirror of product.isActive.
  // Seeded from the product prop; flipped instantly on click, reverted
  // only if the mutation actually fails. See file-header note above for
  // why we can't just read product.isActive directly post-click.
  const [optimisticIsActive, setOptimisticIsActive] = useState(product.isActive);

  // Re-seed if the underlying product identity changes while mounted.
  // In practice DrawerInner is remounted via key={product.id} whenever
  // the selected product changes (see ProductPreviewDrawer below), so
  // this mainly guards against any future call site that doesn't remount.
  useEffect(() => {
    setOptimisticIsActive(product.isActive);
  }, [product.id, product.isActive]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(product);
      onOpenChange(false);
    }
  }, [product, onEdit, onOpenChange]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(product);
      onOpenChange(false);
    }
  }, [product, onDelete, onOpenChange]);

  // [REALTIME TOGGLE] Flip the visible state immediately, then fire the
  // mutation. If the mutation rejects, revert. onToggleActive's own
  // mutation hook already handles the error toast (getErrorMessage), so
  // we only need to undo our local optimistic flip here — no duplicate
  // error UI.
  const handleToggleActive = useCallback(() => {
    if (!onToggleActive) return;
    const next = !optimisticIsActive;
    setOptimisticIsActive(next);
    try {
      const result = onToggleActive(product) as unknown;
      if (result && typeof (result as Promise<unknown>).catch === 'function') {
        (result as Promise<unknown>).catch(() => {
          setOptimisticIsActive(!next);
        });
      }
    } catch {
      setOptimisticIsActive(!next);
    }
  }, [product, onToggleActive, optimisticIsActive]);

  const hasImages = product.images && product.images.length > 0;
  const currentImage = hasImages ? product.images[selectedImageIndex] : null;
  // [IDR MIGRATION] Default to IDR uniformly. Was: hardcoded $X.XX.

  return (
    <>
      {/* Sticky header — outside the scroll container, so it never moves */}
      <DrawerHeader className="border-b shrink-0 gap-0">
        <DrawerTitle asChild>
          <VisuallyHidden.Root>
            {product.name ? t('title', { name: product.name }) : t('titleFallback')}
          </VisuallyHidden.Root>
        </DrawerTitle>
        <DrawerDescription asChild>
          {/* [MARKDOWN] Dilucuti, bukan dirender. Ini teks yang DIBACAKAN
              pembaca layar — menaruh markup di sini membuat pengguna mendengar
              "bintang bintang Kopi bintang bintang". Jalur teks-polos, sama
              seperti meta description dan JSON-LD. */}
          <VisuallyHidden.Root id="drawer-description">
            {markdownToPlainText(product.description) ||
              t('descriptionFallback', { name: product.name || '' })}
          </VisuallyHidden.Root>
        </DrawerDescription>

        {/*
          [ACTIVATE TOGGLE RELOCATION] Top-left pill button WITH label text
          (icon + "Activate"/"Deactivate"), absolutely positioned against
          this header. `relative` on the header wrapper div below anchors
          it. `min-w-[92px]` reserves enough width for the LONGER of the
          two labels ("Deactivate") so the button doesn't change width
          when the label text swaps after toggling.

          [TITLE NUDGE RIGHT] The h2 below no longer uses symmetric
          px-[92px] — see file-header note for the asymmetric pl/pr
          reasoning. Title sits right-of-center now instead of dead
          center, while the button keeps its original left-pinned spot.
        */}
        <div className="relative flex items-center justify-center min-h-8">
          {onToggleActive && (
            /* [KONSISTEN] Dulu <button> bergaya sendiri: `rounded-full`,
               `h-8`, cincin fokus tulis tangan. Tiga hal yang sudah punya
               jawaban di <Button>, dan pil-nya melanggar aturan bentuk EAS
               (pil hanya untuk badge). Sekarang Button variant ghost — radius,
               tinggi, hover, dan fokusnya ikut token seperti tombol lain. */
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToggleActive}
              aria-label={optimisticIsActive ? t('deactivate') : t('activate')}
              className={cn(
                'absolute left-0 min-w-[92px] gap-1.5',
                optimisticIsActive
                  ? 'text-muted-foreground'
                  : 'text-amber-600 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-400',
              )}
            >
              {optimisticIsActive ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 shrink-0" />
                  {t('deactivate')}
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 shrink-0" />
                  {t('activate')}
                </>
              )}
            </Button>
          )}
          <h2 className="font-semibold text-base text-center truncate pl-[128px] pr-[56px]">
            {product.name}
          </h2>
        </div>
      </DrawerHeader>

      {/* Scrollable content — the only part that scrolls */}
      <div className="flex-1 overflow-y-auto">
        {/* Image / File icon */}
        <div className="px-4 py-6">
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted">
              {currentImage ? (
                <OptimizedImage
                  src={currentImage}
                  alt={product.name}
                  fill
                  crop="fill"
                  gravity="auto"
                  sizes="(max-width: 640px) 100vw, 448px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">{t('noImage')}</p>
                </div>
              )}
            </div>

            {hasImages && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden bg-muted border-2',
                      selectedImageIndex === idx
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/20',
                    )}
                  >
                    <OptimizedImage
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      crop="fill"
                      gravity="auto"
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="px-4 pb-8 max-w-2xl mx-auto">
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              {/* [IDR MIGRATION] formatPrice — was: ${(price).toFixed(2)} */}
              <span className="text-2xl font-bold">
                {formatPriceIDR(product.price ?? 0)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPriceIDR(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {t('description')}
              </h3>
              <MarkdownText className="text-sm break-words">
                {product.description}
              </MarkdownText>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {product.category && (
              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('category')}</p>
                  <p className="text-sm font-medium">{product.category}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">{t('created')}</p>
                <p className="text-sm font-medium">
                  {formatDateShort(product.createdAt)}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/*
        Sticky footer — outside the scroll container, always reachable.
        [ACTIVATE TOGGLE RELOCATION] Activate/Deactivate moved to the
        header (top-left) — footer now holds Edit + Delete side by side
        in the same 2-column grid the footer originally used for
        Toggle+Edit.
      */}
      <DrawerFooter className="border-t">
        <div className="grid grid-cols-2 gap-3">
          {onEdit && (
            <Button
              variant="default"
              className="w-full"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
              {t('edit')}
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              {t('deleteProduct')}
            </Button>
          )}
        </div>
      </DrawerFooter>
    </>
  );
}

export function ProductPreviewDrawer({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductPreviewDrawerProps) {
  // [RESPONSIVE DIRECTION FIX] Below sm (639px and under) → bottom sheet,
  // matching the original/mobile behavior. sm and up → right side panel,
  // per the desktop spec (slide from right, sm:max-w-sm — already styled
  // in drawer.tsx's DrawerContent, just never keyed off before).
  const isMobile = useIsMobile();

  // max-h-[92vh] only makes sense for direction="bottom": it caps how far
  // up the sheet can rise, leaving intentional breathing room above it.
  // For direction="right", the primitive already sets inset-y-0 (full
  // viewport height, top-0 to bottom-0) — layering max-h-[92vh] on top of
  // that caps the panel's height without moving where it's anchored, so
  // the leftover 8% collects entirely at the bottom instead of being
  // centered, leaving a visible gap under the footer and making the
  // header/content/footer read as disconnected from the viewport edge.
  // Applying the cap only when isMobile keeps the intentional mobile
  // spacing while letting the desktop side panel fill edge-to-edge.
  const contentHeightClass = isMobile ? 'max-h-[92vh]' : 'h-full';

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? 'bottom' : 'right'}
    >
      <DrawerContent className={cn('z-[60]', contentHeightClass)}>
        {product && (
          <DrawerInner
            key={product.id}
            product={product}
            onOpenChange={onOpenChange}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}