'use client';

// ─── Step 2: Media ─────────────────────────────────────────────────────────
// Satu grid terintegrasi: foto terisi + slot kosong + slot locked (Crown)

import { useRef } from 'react';
import { Crown, GripVertical } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/shared/utils';
import { useCloudinaryUpload } from '@/hooks/shared/use-cloudinary-upload';
import { TOTAL_SLOTS, FREE_SLOTS } from '@/lib/constants/shared/constants';
import { FilledSlot, EmptySlot, LockedSlot } from '@/components/dashboard/shared/image-slot';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormData } from '@/lib/shared/validations';

interface StepMediaProps {
  form: UseFormReturn<ProductFormData>;
  maxImages: number;
  isBusiness: boolean;
  onUpgrade: () => void;
}

export function StepMedia({ form, maxImages, isBusiness, onUpgrade }: StepMediaProps) {
  const imagesRef = useRef<string[]>([]);

  const { isUploading, openWidget } = useCloudinaryUpload({
    folder: 'fibidy/products',
    multiple: true,
    onSuccess: (url) => {
      const cur = imagesRef.current;
      if (!cur.includes(url)) {
        form.setValue('images', [...cur, url]);
      }
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field }) => {
        imagesRef.current = field.value || [];
        const images: string[] = field.value || [];

        const handleOpen = () => {
          const slots = maxImages - images.length;
          openWidget(slots);
        };

        const handleRemove = (url: string) =>
          field.onChange(images.filter((u) => u !== url));

        const handleDragEnd = ({ active, over }: DragEndEvent) => {
          if (!over || active.id === over.id) return;
          const from = images.indexOf(active.id as string);
          const to = images.indexOf(over.id as string);
          field.onChange(arrayMove(images, from, to));
        };

        return (
          <FormItem>
            <FormControl>
              <div className="space-y-4">

                {/* Context label */}
                <div className="rounded-xl border px-4 py-3 text-sm bg-muted/50 border-border text-muted-foreground">
                  <p>
                    <span className="font-semibold">Foto produk —</span>{' '}
                    {isBusiness
                      ? 'Upload hingga 5 foto. Foto pertama jadi thumbnail utama.'
                      : `Upload hingga ${FREE_SLOTS} foto. Slot 4 & 5 tersedia di Business Plan.`
                    }
                  </p>
                </div>

                {/* Grid 5 slot */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={images} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
                        if (i < images.length) {
                          return (
                            <FilledSlot
                              key={images[i]}
                              url={images[i]}
                              index={i}
                              onRemove={() => handleRemove(images[i])}
                              draggable
                            />
                          );
                        }
                        if (!isBusiness && i >= FREE_SLOTS) {
                          return <LockedSlot key={`locked-${i}`} onClick={onUpgrade} />;
                        }
                        return (
                          <EmptySlot
                            key={`empty-${i}`}
                            index={i}
                            onClick={handleOpen}
                            isLoading={isUploading && i === images.length}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tabular-nums">{images.length} / {maxImages} foto</span>
                  <div className="flex items-center gap-3">
                    {images.length > 1 && (
                      <span className="flex items-center gap-1 opacity-60">
                        <GripVertical className="h-3 w-3" />
                        Drag untuk urutkan
                      </span>
                    )}
                    {!isBusiness && (
                      <button
                        type="button"
                        onClick={onUpgrade}
                        className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        <Crown className="h-3 w-3" />
                        Upgrade ke Business
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}