'use client';

// ============================================================================
// FORM FIELD — satu bentuk isian untuk SELURUH dasbor
// File: src/components/dashboard/shared/form-field.tsx
//
// Melengkapi tata bahasa yang sudah ditulis form-panel.tsx. Pembagiannya
// persis seperti yang diminta pemilik produk:
//
//   FormSection  → satu per langkah      (kerangka + grid)
//   FormPanel    → KONTAINER, satu per formulir
//   FormField    → WRAPPER, banyak per formulir — satu isian, satu label,
//                  satu penghitung
//
// ── MASALAH YANG DIPERBAIKI ────────────────────────────────────────────────
//
// Penghitung karakter ditulis TIGA kali dengan tiga perilaku berbeda:
//
//   product/form/char-counter.tsx          text-xs · amber di 90% · merah di 100%
//   settings/form/hero/step-identity.tsx   text-[11px] font-mono · amber di max-1
//   setup-store/seller/step-story.tsx      text-[11px] font-mono · amber di max-10/-2/-20
//
// Ketiganya benar sendiri-sendiri dan bertentangan begitu dilihat berurutan:
// penjual yang mengisi wizard lalu membuka Pengaturan melihat dua penghitung
// dengan ukuran huruf, warna, dan titik peringatan yang berbeda untuk medan
// yang SAMA.
//
// Lebih buruk: tiga isian Pengaturan → Hero → Cerita (Headline, Subheading,
// Tagline) tidak punya penghitung MAUPUN `maxLength`, padahal servernya
// membatasi ketiganya (200/300/500). Satu-satunya umpan balik adalah
// penolakan berbahasa Inggris dari class-validator setelah menekan Simpan.
//
// ── LETAK PENGHITUNG ───────────────────────────────────────────────────────
//
// DI DALAM isian, bukan di bawahnya. Alasannya bukan estetika: penghitung
// yang duduk di baris tersendiri menambah tinggi tiap isian, dan pada grid
// dua kolom isian dengan penghitung jadi lebih tinggi dari tetangganya —
// persis cacat D2 yang form-panel.tsx ada untuk mencegah.
//
//   input     → kanan, di tengah tinggi   (isian satu baris)
//   textarea  → kanan bawah               (baris terakhir selalu punya sisa)
//
// Padding isian dilebarkan otomatis sebesar lebar penghitungnya, dihitung
// dari jumlah digit `max` — bukan `pr-16` yang ditulis tangan di tiap
// pemanggil dan meleset begitu batasnya empat digit ("1000/1000").
// ============================================================================

import * as React from 'react';
import { Lock } from 'lucide-react';

import { cn } from '@/lib/shared/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { warnThreshold, type FieldLimit } from '@/lib/constants/dashboard/field-limits';

// ─── Bentuk placeholder ─────────────────────────────────────────────────────
//
// ── MASALAH YANG DIPERBAIKI ────────────────────────────────────────────────
//
// Slot terkunci dan slot kosong di Unggulan menggambar "isian yang belum ada"
// dengan angka yang diketik tangan:
//
//   <div className="h-9 rounded-md …" />        ← wakil sebuah Input
//   <div className="h-[76px] rounded-md …" />   ← wakil sebuah Textarea
//
// Keduanya BERBOHONG, dan bohongnya makin jauh setiap kali tokennya bergeser:
//
//   h-9 = 36px   sementara Input sungguhan setinggi --field-height = 44px
//   rounded-md   angka harfiah; ia tidak ikut saat --shape-field berubah
//                dari pil ke 8px, jadi placeholder-nya tertinggal di dialek
//                yang sudah tidak dipakai siapa pun
//
// Placeholder yang bentuknya beda dari benda yang diwakilinya bukan cuma
// tidak rapi — ia membuat layar BERGESER saat isian aslinya muncul, karena
// tingginya memang berbeda 8px.
//
// Ketiga kelas di bawah menurunkan bentuk dari token yang SAMA dengan
// kontrolnya. Begitu --shape-field atau --field-height berubah, placeholder
// ikut, tanpa ada yang perlu diingat.

/** Wakil sebuah <Input>: tinggi dan radius isian satu baris. */
export const SKELETON_FIELD =
  'h-[var(--field-height)] rounded-[var(--shape-field)]';

/**
 * Wakil sebuah <Textarea rows={3}>.
 *
 * Faktornya BUKAN tebakan: <Textarea rows={3}> diukur 86px di panel dasbor
 * (3 baris × line-height + py-3 dua sisi + border dua sisi), dan
 * 86 / 44 = 1.95. Angka lama `h-[76px]` meleset 10px, jadi layar bergeser
 * tepat saat isian aslinya menggantikan placeholder-nya.
 *
 * Ditulis sebagai kelipatan --field-height, bukan 86px harfiah, supaya ia
 * ikut kalau tinggi isian digeser.
 */
export const SKELETON_TEXTAREA =
  // `--shape-panel`, BUKAN `--shape-field`. Textarea sungguhan memakai
  // --shape-panel supaya kotak tinggi tidak terbaca oval (lihat
  // components/ui/textarea.tsx); placeholder-nya harus mengikuti benda yang
  // diwakilinya, bukan token isian satu baris.
  'h-[calc(var(--field-height)*1.95)] rounded-[var(--shape-panel)]';

/** Wakil sebuah kartu/panel — {feature-card}. */
export const SKELETON_PANEL = 'rounded-[var(--shape-panel)]';

/** Wakil sebuah tombol atau kontrol — {button-*}. */
export const SKELETON_CONTROL = 'rounded-[var(--shape-control)]';

// ─── CharCounter ────────────────────────────────────────────────────────────

/**
 * Penghitung karakter. SATU perilaku, dipakai di mana pun:
 *
 *   < 90%   redup      — ada, tapi tidak menarik perhatian
 *   ≥ 90%   kuning     — "satu kalimat lagi"
 *   ≥ 100%  destruktif — mentok; `maxLength` sudah menahan ketikannya
 *
 * `aria-live="polite"` supaya pembaca layar mengumumkan sisa ruang saat
 * mendekati batas. Tanpa itu, penghitung ini cuma dekorasi bagi penjual yang
 * memakai pembaca layar — dan merekalah yang paling butuh diberi tahu bahwa
 * ketikannya berhenti diterima.
 */
export function CharCounter({
  current,
  max,
  className,
}: {
  current: number;
  max: number;
  className?: string;
}) {
  const warn = warnThreshold(max);

  return (
    <span
      aria-live="polite"
      data-slot="char-counter"
      className={cn(
        'pointer-events-none shrink-0 font-mono text-[11px] tabular-nums',
        current >= max
          ? 'font-semibold text-destructive'
          : current >= warn
            ? 'font-semibold text-amber-600 dark:text-amber-400'
            : 'text-muted-foreground/50',
        className,
      )}
    >
      {current}/{max}
    </span>
  );
}

/**
 * Ruang yang perlu dikosongkan isian untuk penghitungnya.
 *
 * "200/300" pada 11px mono ≈ 7px per karakter. Ditambah jarak 12px dari tepi
 * dan 8px napas ke teks. Dibulatkan ke tangga padding Tailwind supaya tidak
 * ada nilai sembarang di markup.
 */
function counterPadding(max: number): string {
  const lebar = `${max}/${max}`.length;
  if (lebar <= 5) return 'pr-14';   // "15/15"
  if (lebar <= 7) return 'pr-16';   // "200/300"
  return 'pr-20';                   // "1000/1000"
}

// ─── FieldShell ─────────────────────────────────────────────────────────────

interface FieldShellProps {
  /** Wajib: menyambungkan <label> ke kontrolnya. */
  htmlFor?: string;
  /**
   * `id` pada PEMBUNGKUS isian — bukan pada kontrolnya.
   *
   * Dipakai jangkar pemandu (`#tour-store-name`) dan gulir-ke-galat. Jangkar
   * memang harus menunjuk pembungkus, bukan kontrol: menyorot kotak isian
   * tanpa labelnya membuat penjual melihat kotak menyala tanpa tahu kotak
   * apa yang sedang dijelaskan.
   */
  anchorId?: string;
  label: React.ReactNode;
  /** Menambahkan tanda bintang di label. */
  required?: boolean;
  /** Menambahkan gembok di label — medan yang tampil tapi tidak bisa diubah. */
  locked?: boolean;
  /** Lencana di kanan label (mis. AutofillBadge). */
  badge?: React.ReactNode;
  /** Kalimat penjelas di bawah isian. Ditelan `error` kalau ada. */
  description?: React.ReactNode;
  /** Pesan galat. Menggantikan `description` — bukan menumpuknya. */
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Kerangka satu isian: label, kontrol, lalu penjelas ATAU galat.
 *
 * Dipakai langsung oleh isian yang kontrolnya bukan Input/Textarea polos —
 * InputGroup ber-awalan "+62", Select, RadioGroup, pemilih warna. Mereka
 * tetap mendapat label, gembok, lencana, dan aturan "penjelas ATAU galat"
 * yang sama tanpa harus menirunya sendiri.
 *
 * `data-form-field` dipakai skrip pengukur untuk mencacah isian per formulir
 * dan memeriksa bahwa setiap isian berbatas punya penghitung.
 */
export function FieldShell({
  htmlFor,
  anchorId,
  label,
  required,
  locked,
  badge,
  description,
  error,
  className,
  children,
}: FieldShellProps) {
  return (
    <div id={anchorId} data-form-field className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="gap-1.5">
          {label}
          {required && (
            <span aria-hidden className="font-normal text-destructive">
              *
            </span>
          )}
          {locked && (
            <Lock aria-hidden className="size-3 text-muted-foreground/50" />
          )}
        </Label>
        {badge}
      </div>

      {children}

      {/*
        Penjelas ATAU galat, tidak pernah keduanya. Menumpuk keduanya berarti
        penjual membaca "Contoh: Pesan Sekarang" tepat di bawah "Wajib diisi"
        dan harus memilih sendiri mana yang sedang berlaku.
      */}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

// ─── FormField ──────────────────────────────────────────────────────────────

type FormFieldProps = Omit<FieldShellProps, 'children' | 'htmlFor'> & {
  id: string;
  value: string;
  /** Menerima nilai yang SUDAH dipotong ke batas — pemanggil tidak perlu memeriksa. */
  onChange: (value: string) => void;
  placeholder?: string;
  /**
   * Batas karakter. Terima entri dari FIELD_LIMITS (`{ max, min }`) atau
   * angka telanjang. Tanpa ini, isian tidak berbatas dan tidak berpenghitung.
   */
  limit?: FieldLimit | number;
  /** Sembunyikan penghitung meski `limit` ada — mis. isian yang batasnya jauh. */
  showCounter?: boolean;
  /** `textarea` mengubah kontrol DAN memindahkan penghitung ke kanan bawah. */
  as?: 'input' | 'textarea';
  rows?: number;
  disabled?: boolean;
  inputMode?: React.ComponentProps<'input'>['inputMode'];
  type?: React.ComponentProps<'input'>['type'];
  /** Diteruskan ke pembungkus kontrol — dipakai pemandu gulir ke isian bergalat. */
  controlProps?: React.ComponentProps<'div'>;
  inputClassName?: string;
};

/**
 * Isian lengkap: label + kontrol + penghitung, dengan batas yang ditegakkan.
 *
 * Batasnya ditegakkan DUA kali dan itu disengaja. `maxLength` menahan
 * ketikan langsung; pemotongan di `onChange` menahan TEMPELAN — di beberapa
 * peramban seluler, menempelkan teks panjang ke isian ber-`maxLength` tetap
 * meloloskan seluruhnya. Tanpa pemotongan, penghitung akan menampilkan
 * "412/300" dan servernya menolak.
 */
export function FormField({
  id,
  value,
  onChange,
  placeholder,
  limit,
  showCounter = true,
  as = 'input',
  rows = 3,
  disabled,
  inputMode,
  type,
  controlProps,
  inputClassName,
  error,
  ...shell
}: FormFieldProps) {
  const max = typeof limit === 'number' ? limit : limit?.max;
  const punyaPenghitung = showCounter && typeof max === 'number';

  const handleChange = (raw: string) => {
    onChange(typeof max === 'number' ? raw.slice(0, max) : raw);
  };

  const kelasGalat = error
    ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
    : undefined;

  return (
    <FieldShell htmlFor={id} error={error} {...shell}>
      <div
        {...controlProps}
        className={cn('relative', controlProps?.className)}
        data-field-error={error ? 'true' : undefined}
      >
        {as === 'textarea' ? (
          <Textarea
            id={id}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            maxLength={max}
            aria-invalid={error ? true : undefined}
            className={cn(
              'resize-none leading-relaxed',
              // ── TINGGI DIPATOK `rows`, BUKAN ISINYA ────────────────────
              //
              // <Textarea> bawaan memakai `field-sizing-content`: kotaknya
              // TUMBUH mengikuti isi. Bagus untuk kotak chat; salah untuk
              // grid formulir.
              //
              // Terukur di Pengaturan → Bio, tiga isian bersebelahan:
              //   Headline   200 karakter → 4 baris → ~100px
              //   Subheading  73 karakter → 1 baris →  ~60px
              //   Tagline      kosong     → 1 baris →  ~55px
              //
              // Tiga tinggi berbeda untuk tiga isian sejenis, dan tingginya
              // berubah lagi setiap penjual mengetik. Langkah 1 di formulir
              // yang SAMA memakai Input setinggi 44px semuanya — barisnya
              // rata, dan itu yang membuatnya terbaca rapi.
              //
              // `field-sizing-fixed` mengembalikan `rows` sebagai penentu:
              // semua isian ber-`rows` sama jadi setinggi sama, dan tidak
              // ada yang bergerak saat diketik. Isi yang melebihi kotaknya
              // menggulir di dalam — persis seperti textarea biasa.
              'field-sizing-fixed',
              // Baris terakhir textarea perlu ruang di BAWAH, bukan di kanan:
              // penghitung di kanan-tengah akan menabrak teks di baris mana
              // pun yang kebetulan sepanjang itu.
              punyaPenghitung && 'pb-6',
              kelasGalat,
              inputClassName,
            )}
          />
        ) : (
          <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            inputMode={inputMode}
            maxLength={max}
            aria-invalid={error ? true : undefined}
            className={cn(
              punyaPenghitung && counterPadding(max),
              kelasGalat,
              inputClassName,
            )}
          />
        )}

        {punyaPenghitung && !disabled && (
          <CharCounter
            current={value.length}
            max={max}
            className={cn(
              'absolute',
              as === 'textarea'
                ? 'bottom-2 right-3'
                : 'right-3 top-1/2 -translate-y-1/2',
            )}
          />
        )}
      </div>
    </FieldShell>
  );
}
