'use client';

// ============================================================================
// SORTABLE FORM PANEL — panel yang bisa diurut ulang dengan seret
// File: src/components/dashboard/shared/sortable-form-panel.tsx
//
// Dipakai Highlights di kedua sisi (setup-store dan Pengaturan).
//
// ── KENAPA BERKAS TERPISAH DARI form-panel.tsx ─────────────────────────────
// `form-panel.tsx` tidak punya 'use client' dan tidak mengimpor apa pun.
// Menaruh dnd-kit di sana memaksa SETIAP pemakai FormPanel — sebelas
// formulir, sebagian tanpa satu pun elemen yang bisa diseret — ikut menarik
// bundel dnd-kit ke klien. Dipisah supaya ongkosnya cuma dibayar yang
// benar-benar memakainya.
//
// ── PERBEDAAN PENTING DARI POLA DI step-media.tsx ──────────────────────────
// Repo ini sudah punya pola dnd-kit yang bekerja, di
// `product/form/step-media.tsx`, dan pola itu diikuti di sini: sensor,
// arrayMove, dan serializeTransform lokal (lihat catatan di bawah).
//
// SATU hal sengaja DIBUAT BERBEDA, dan ini yang menentukan apakah
// komponennya bisa dipakai sama sekali:
//
//   step-media           {...listeners} di SELURUH pembungkus kartu
//   di sini              {...listeners} HANYA di grip
//
// Di step-media itu benar — isi kartunya cuma sebuah gambar, tidak ada yang
// perlu diklik. Panel highlight berisi unggah gambar, satu Input, dan satu
// Textarea. Menyebar listeners ke pembungkus membuat PointerSensor menelan
// pointerdown di dalam field: kursor tidak pernah masuk, teks tidak bisa
// diblok, dan kartunya malah ikut terseret saat penjual mencoba mengetik.
//
// Grip terpisah juga membuat maksudnya terlihat. Kartu formulir tidak
// mengumumkan dirinya bisa diseret; ikon grip mengumumkannya.
//
// ── AKSESIBILITAS ──────────────────────────────────────────────────────────
// `attributes` dari useSortable ikut dipasang di grip, bukan di pembungkus.
// Di situlah ia berguna: grip jadi tombol yang bisa difokus keyboard dan
// membawa peran serta instruksi dari dnd-kit. Dipasang di pembungkus, ia
// menjadikan seluruh kartu satu target fokus raksasa yang mengubur field di
// dalamnya dari urutan tab.
// ============================================================================

import {
  DndContext,
  KeyboardSensor,
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
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';

import { cn } from '@/lib/shared/utils';
import { FormPanel } from './form-panel';

/**
 * Transform → string CSS.
 *
 * Disalin apa adanya dari step-media.tsx, beserta alasannya: formatter
 * resminya ada di `@dnd-kit/utilities`, yang BUKAN dependensi langsung repo
 * ini (ia transitif lewat @dnd-kit/sortable, dan tipenya tidak diekspor
 * ulang dari entrypoint publik mana pun). Menambah paket ketiga demi satu
 * pemformat string adalah ongkos dependensi yang tidak sepadan.
 *
 * Bentuknya diketik struktural, jadi ia menerima apa pun yang
 * useSortable() kembalikan tanpa mengimpor tipenya.
 */
function serializeTransform(
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null,
): string | undefined {
  if (!transform) return undefined;
  return `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`;
}

// ─── Daftar ─────────────────────────────────────────────────────────────────

interface SortablePanelListProps<T> {
  /** Urutan sekarang. */
  items: T[];
  /** Id stabil per item. WAJIB tidak berubah saat isinya disunting. */
  getId: (item: T, index: number) => string;
  /** Dipanggil dengan urutan baru. */
  onReorder: (next: T[]) => void;
  children: React.ReactNode;
}

/**
 * Pembungkus DndContext + SortableContext.
 *
 * `getId` diminta eksplisit dan bukan diturunkan dari isi item — itu
 * pelajaran dari step-media, yang memakai URL gambar sebagai id. Di sana
 * aman karena URL tidak berubah. Di sini isi panel BISA disunting sambil
 * daftar terpasang, dan id yang ikut berubah membuat dnd-kit kehilangan
 * jejak elemen yang sedang diseret di tengah seretan.
 */
export function SortablePanelList<T>({
  items,
  getId,
  onReorder,
  children,
}: SortablePanelListProps<T>) {
  const sensors = useSensors(
    // distance 8 — sama dengan step-media. Tanpa ambang, klik biasa di grip
    // sudah dihitung sebagai seretan.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = items.map(getId);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      // DndContext merender DUA simpul aksesibilitas sendiri — instruksi
      // ("tekan spasi untuk mengangkat…") dan live-region pengumuman.
      // Secara bawaan keduanya lahir sebagai SAUDARA dari children, yang di
      // sini berarti ANAK GRID: terukur dua sel tambahan setinggi 0px dan
      // 1px yang ikut mengisi baris.
      //
      // Tidak terlihat, tapi ia menggeser panel setelahnya — persis cacat
      // D3 yang seluruh berkas form-panel.tsx ada untuk mencegahnya, cuma
      // datang dari pustaka alih-alih dari kode kita.
      //
      // Dipindah ke <body>. Simpulnya tetap ada dan tetap dibacakan screen
      // reader; ia cuma tidak lagi tinggal di dalam grid.
      accessibility={
        typeof document !== 'undefined' ? { container: document.body } : undefined
      }
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

// ─── Panel ──────────────────────────────────────────────────────────────────

interface SortableFormPanelProps {
  id: string;
  title: string;
  required?: boolean;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  /** Label aksesibilitas grip, mis. "Ubah urutan Highlight 1". */
  handleLabel: string;
  /**
   * Aksi tambahan di samping grip — mis. tombol hapus.
   *
   * Ditaruh di kepala panel, BUKAN di dalam badan: tombol hapus yang
   * berbaur dengan isian membuat penjual harus mencarinya, dan yang lebih
   * buruk, mendekatkannya ke field yang sedang diketik.
   */
  extraAction?: React.ReactNode;
  children: React.ReactNode;
}

export function SortableFormPanel({
  id,
  title,
  required,
  description,
  badge,
  handleLabel,
  extraAction,
  children,
}: SortableFormPanelProps) {
  const {
    setNodeRef,
    transform,
    transition,
    listeners,
    attributes,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: serializeTransform(transform), transition }}
      className={cn(isDragging && 'z-10 opacity-40')}
    >
      <FormPanel
        title={title}
        required={required}
        description={description}
        badge={badge}
        action={
          <div className="flex shrink-0 items-center gap-1">
            {extraAction}
            <button
            type="button"
            aria-label={handleLabel}
            // `touch-none` wajib: tanpa itu, di layar sentuh browser
            // menggulung halaman alih-alih menyerahkan gerakannya ke dnd-kit,
            // dan grip-nya terasa mati di ponsel.
            className="-m-1 shrink-0 cursor-grab touch-none rounded p-1 text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
        }
      >
        {children}
      </FormPanel>
    </div>
  );
}
