// ============================================================================
// FORM PANEL — satu tata bahasa untuk SEMUA formulir bertahap
// File: src/components/dashboard/shared/form-panel.tsx
//
// Dipakai dua tempat yang selama ini berkembang sendiri-sendiri:
//   setup-store/seller/step-*.tsx        (wizard 5 langkah)
//   settings/form/**/step-*.tsx          (8 formulir Pengaturan)
//
// ── MASALAH YANG DIPERBAIKI ────────────────────────────────────────────────
//
// Empat cacat yang terlihat langsung saat berpindah antar langkah, semuanya
// berakar pada satu hal: TIDAK ADA aturan bentuk halaman, jadi tiap langkah
// memilih sendiri.
//
// D1  Tiga grid berbeda di lima langkah.
//       Step 1 Visual      PAGE_GRID_CARDS   3 kolom
//       Step 2 Story       PAGE_GRID_2_FORM  2 kolom
//       Step 3 Highlights  PAGE_GRID_CARDS   3 kolom
//       Step 4 Contact     PAGE_GRID_2_FORM  2 kolom
//       Step 5 Social      PAGE_GRID_2_FORM  2 kolom
//     Berpindah langkah berarti berpindah bentuk halaman. Itu yang terbaca
//     sebagai "tidak konsisten" — bukan salah satu langkahnya, tapi
//     perpindahannya.
//
// D2  Lebar isian berbeda DI DALAM satu langkah.
//     Step 2 terukur: Headline 720px, Tagline 1470px (PAGE_SPAN_2), Button
//     Text 720px. Tiga isian sejenis, bertumpuk vertikal, tiga lebar
//     berbeda. Mata menangkap ini sebagai cacat sebelum sempat membaca
//     labelnya.
//
// D3  Teks pengantar dan lencana ikut jadi SEL GRID.
//     Step 3 menaruh <p>{intro}</p> dan <AutofillBadge/> sebagai anak
//     langsung grid 3-kolom. Keduanya memakan sel 1 dan 2, jadi kartu
//     Highlight 1 mendarat di sel 3 — sendirian di kanan, dengan kolom
//     tengah berisi lencana melayang dan kolom kiri berisi paragraf.
//     Ini bukan salah CSS-nya; ini salah menaruh anak.
//
// D4  Kolom berhenti di ketinggian acak.
//     `items-start` + isi yang panjangnya jauh berbeda (kotak unggah logo
//     ~470px vs enam bulatan warna ~150px) = tiga kolom yang tidak diikat
//     apa pun. Tanpa bingkai, tidak ada yang menjelaskan kenapa kolom
//     tengah berhenti lebih dulu.
//
// ── ATURANNYA ──────────────────────────────────────────────────────────────
//
// 1. Setiap langkah = HEADER (opsional) lalu GRID PANEL.
//    Header berisi pengantar dan lencana, selebar halaman, DI LUAR grid.
//    Ini yang membuat D3 mustahil terulang: pengantar tidak punya cara
//    menjadi sel grid, karena ia bukan anak grid.
//
// 2. Sel grid HANYA berisi panel. Tidak pernah isian telanjang.
//
// 3. Isian di dalam panel SELALU selebar panel.
//    Panel yang isinya butuh lebar diberi `wide` (dua kolom) — dan saat
//    itu SELURUH isian di panel itu ikut melebar bersamaan. Tidak ada lagi
//    satu isian melebar sendirian di tengah tumpukan.
//
// 4. Bingkai panel yang menjelaskan tinggi.
//    Kolom yang berhenti lebih pendek tidak lagi terbaca sebagai kolom
//    terpotong — ia kartu yang memang isinya segitu.
//
// Bandingkan dengan aturan yang sudah lebih dulu ditulis KasirPageShell:
// konten yang terlalu lebar TIDAK dipersempit dengan max-w, melainkan
// dipecah jadi grid oleh halamannya. Berkas ini memberi grid itu bentuk
// yang sama di mana pun ia dipakai.
// ============================================================================

// ── [EAS MURNI — Agu 2026] SATU TANGGA RADIUS, TIGA ANAK TANGGA ───────────
//
// expo.design.md memberi tiga radius yang berarti, dan tiap benda punya
// tempatnya:
//
//   8px   {rounded.md}    tombol, isian, select, chip saringan
//   12px  {rounded.lg}    KARTU — feature-card, code-block, pricing, panel ini
//   16px  {rounded.xl}    {device-mockup-card} — chrome halaman, SATU tempat
//
// Panel ini dulu `rounded-xl` (16px) yang ditulis tangan, begitu juga sembilan
// permukaan kartu lain di dasbor. Artinya kartu di dasbor 16px sementara
// <Card> milik design system 12px — dua radius untuk benda yang sama, dan
// yang membedakan cuma berkas mana yang kebetulan dipakai.
//
// Sekarang semuanya `rounded-[var(--shape-panel)]`. Satu-satunya `rounded-xl`
// yang tersisa di seluruh app ada di SidebarInset, dan itu memang benda yang
// dimaksud {device-mockup-card}: chrome halaman, bukan kartu di dalamnya.

import { cn } from '@/lib/shared/utils';

/**
 * Grid panel baku: satu kolom sampai `lg`, dua kolom setelahnya.
 *
 * `items-start` dipertahankan — panel BERBINGKAI yang tingginya berbeda
 * sudah terbaca benar (lihat aturan 4), dan meregangkannya justru
 * menghasilkan kartu tinggi berisi ruang kosong.
 *
 * Jaraknya ditulis terpisah (`gap-x` / `gap-y`) dengan alasan yang sama
 * seperti PAGE_GRID_2_FORM: `gap-6` lalu ditimpa `gap-y-8` menghasilkan dua
 * kelas beda grup di tailwind-merge yang sama-sama terbawa, dan pemenangnya
 * bergantung urutan CSS, bukan urutan kelasnya.
 */
export const PANEL_GRID = 'grid gap-x-6 gap-y-6 lg:grid-cols-2 items-start';

/**
 * Varian tiga kolom — HANYA untuk deretan panel yang benar-benar sejenis
 * dan berjumlah tiga (Highlights).
 *
 * Ini bukan pengecualian dari aturan 1, melainkan aturan yang sama pada
 * jumlah yang berbeda: tiga kartu identik di grid dua kolom menghasilkan
 * satu kartu yatim di baris kedua. Header, jarak, bingkai, dan padding
 * tetap sama persis.
 */
export const PANEL_GRID_3 =
  'grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 items-start';

/** Panel yang memakai kedua kolom. */
export const PANEL_WIDE = 'lg:col-span-2';

/**
 * Grid isian DI DALAM satu panel.
 *
 * Aturan 3 melarang satu isian melebar sendirian di tengah tumpukan — yang
 * dilarang adalah CAMPURAN. Panel yang isinya banyak isian seragam (delapan
 * tautan sosial) boleh menjajarkannya, asal SEMUANYA ikut: satu grid seragam,
 * bukan sebagian melebar.
 *
 * Panel selebar halaman yang menumpuk delapan isian justru menghasilkan
 * delapan kotak selebar 1856px — persis bentuk yang page-column.tsx minta
 * dipecah jadi kolom, cuma dipindah satu tingkat ke dalam.
 */
export const PANEL_FIELDS_2 = 'grid gap-4 sm:grid-cols-2';

// ─── FormSection ────────────────────────────────────────────────────────────

interface FormSectionProps {
  /** Kalimat pengantar langkah. Selebar halaman, di ATAS grid. */
  intro?: React.ReactNode;
  /** Lencana (mis. AutofillBadge). Sebaris dengan pengantar. */
  badge?: React.ReactNode;
  /** Jumlah kolom panel. Tiga hanya untuk deretan panel sejenis. */
  columns?: 2 | 3;
  className?: string;
  children: React.ReactNode;
}

/**
 * Kerangka satu langkah.
 *
 * `data-form-section` bukan hiasan: atribut itu yang dipakai skrip pengukur
 * untuk menghitung anak grid dan membandingkan lebar isian antar panel.
 * Tanpa penanda, verifikasinya balik jadi menebak elemen mana yang
 * "langkahnya".
 */
export function FormSection({
  intro,
  badge,
  columns = 2,
  className,
  children,
}: FormSectionProps) {
  const punyaHeader = Boolean(intro || badge);

  return (
    <div data-form-section className={cn('space-y-6', className)}>
      {punyaHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {intro ? (
            <p className="text-sm text-muted-foreground">{intro}</p>
          ) : (
            <span />
          )}
          {badge}
        </div>
      )}

      <div className={columns === 3 ? PANEL_GRID_3 : PANEL_GRID}>
        {children}
      </div>
    </div>
  );
}

// ─── FormPanel ──────────────────────────────────────────────────────────────

interface FormPanelProps {
  title: string;
  /** Menambahkan tanda bintang di judul. */
  required?: boolean;
  /** Kalimat penjelas di bawah judul. */
  description?: React.ReactNode;
  /** Lencana panel (mis. AutofillBadge) — pojok kanan atas, bersama `action`. */
  badge?: React.ReactNode;
  /** Memakai kedua kolom. Seluruh isian di dalamnya ikut melebar bersamaan. */
  wide?: boolean;
  /** Aksi di kanan judul — mis. grip drag, tombol hapus. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Satu panel: kartu berbingkai berjudul.
 *
 * Isinya ditumpuk `space-y-4` dan SELALU selebar panel. Itu satu-satunya
 * cara D2 tidak bisa terulang — tidak ada tempat di API ini untuk membuat
 * satu isian lebih lebar dari tetangganya.
 */
export function FormPanel({
  title,
  required,
  description,
  badge,
  wide,
  action,
  className,
  children,
}: FormPanelProps) {
  return (
    <section
      data-form-panel
      className={cn(
        'rounded-[var(--shape-panel)] border bg-card p-5 space-y-4',
        wide && PANEL_WIDE,
        className,
      )}
    >
      <header className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-caption-uppercase caption-uppercase text-muted-foreground">
            {title}
            {required && (
              <span className="ml-1 font-normal normal-case text-destructive">
                *
              </span>
            )}
          </h3>

          {/*
            [BERSIH] Lencana dan aksi berbagi SATU gugus di pojok kanan atas.
            Sebelumnya lencana dirender di bawah deskripsi, sebagai baris
            tersendiri setinggi satu baris penuh — di Langkah 1 ada tiga, dan
            masing-masing mendorong isiannya turun sekaligus memisahkan judul
            dari isian yang dijudulinya.
          */}
          {(badge || action) && (
            <div className="flex shrink-0 items-center gap-1">
              {badge}
              {action}
            </div>
          )}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </header>

      <div className="space-y-4">{children}</div>
    </section>
  );
}
