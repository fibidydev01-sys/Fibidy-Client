'use client';

// ─── Shared Image Slot Components ─────────────────────────────────────────
// FilledSlot, EmptySlot, LockedSlot — semua square 1:1

import Image from 'next/image';
import { Crown, GripVertical, ImagePlus, Loader2, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { cn } from '@/lib/shared/utils';
import { Button } from '@/components/ui/button';

// ─── DnD transform helper ─────────────────────────────────────────────────
type DndTransform = { x: number; y: number; scaleX: number; scaleY: number } | null;
function toTransform(t: DndTransform): string | undefined {
  if (!t) return undefined;
  return `translate3d(${t.x}px, ${t.y}px, 0) scaleX(${t.scaleX}) scaleY(${t.scaleY})`;
}

// ─── Types ────────────────────────────────────────────────────────────────
interface FilledSlotProps {
  url: string;
  index: number;
  onRemove: () => void;
  draggable?: boolean;
  children?: React.ReactNode;
}

interface EmptySlotProps {
  index: number;
  onClick: () => void;
  isLoading: boolean;
  label?: string;
  children?: React.ReactNode;
}

interface LockedSlotProps {
  onClick: () => void;
  children?: React.ReactNode;
}

// ─── FilledSlot ───────────────────────────────────────────────────────────
export function FilledSlot({ url, index, onRemove, draggable = false, children }: FilledSlotProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: url,
    disabled: !draggable,
  });

  return (
    <div className="space-y-2">
      <div
        ref={setNodeRef}
        style={{
          transform: toTransform(transform),
          transition,
          zIndex: isDragging ? 50 : undefined,
        }}
        className={cn(
          'relative aspect-square rounded-xl overflow-hidden border bg-muted group select-none',
          isDragging && 'opacity-50 shadow-xl ring-2 ring-primary/40',
        )}
      >
        <Image
          src={url}
          alt={`Foto ${index + 1}`}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 640px) 50vw, 20vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors" />

        {/* Badge */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-semibold">
          {index === 0 ? '★ Main' : String(index + 1)}
        </div>

        {/* Remove button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {draggable ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-7 w-7"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Drag handle (only when draggable) */}
        {draggable && (
          <div
            {...attributes}
            {...listeners}
            className="absolute bottom-0 inset-x-0 flex items-center justify-center py-1.5 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-white/80" />
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

// ─── EmptySlot ────────────────────────────────────────────────────────────
export function EmptySlot({ index, onClick, isLoading, label, children }: EmptySlotProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={cn(
          'aspect-square w-full rounded-xl border-2 border-dashed border-border',
          'flex flex-col items-center justify-center gap-2',
          'bg-muted/30 hover:bg-muted/60 hover:border-primary/40',
          'transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-60',
        )}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-muted-foreground/50" />
            <span className="text-[11px] font-medium text-muted-foreground/60">
              {label ?? `Foto ${index + 1}`}
            </span>
          </>
        )}
      </button>

      {children}
    </div>
  );
}

// ─── LockedSlot ───────────────────────────────────────────────────────────
export function LockedSlot({ onClick, children }: LockedSlotProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'aspect-square w-full rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700',
          'flex flex-col items-center justify-center gap-2',
          'bg-amber-50/50 dark:bg-amber-950/20',
          'hover:bg-amber-100/60 dark:hover:bg-amber-900/30',
          'transition-colors group cursor-pointer',
        )}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 group-hover:bg-amber-200 transition-colors">
          <Crown className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          Business
        </span>
      </button>

      {children}
    </div>
  );
}