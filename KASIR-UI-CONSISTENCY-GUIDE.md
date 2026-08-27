# Panduan Konsistensi UI/UX — Modul Kasir

> **Status dokumen: SUDAH DIIMPLEMENTASI.**
> Bagian audit (§2) menggambarkan keadaan SEBELUM refactor dan disimpan apa
> adanya sebagai catatan alasan. Kontrak desain (§3) dan blueprint (§5) sekarang
> menggambarkan kode yang berjalan. Status per fase ada di §8.
>
> Referensi lebar & tata letak yang dianggap **sudah benar**:
> `/dashboard/kasir/papan` dan `/dashboard/products`.
>
> Tanggal audit: Agustus 2026 · Branch: `claude/kasir-ui-consistency-mby3tv`

## Hasil akhir

| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Komponen `ui/*` yang di-import modul kasir | 12 | **37** (+ `sidebar` & `sonner` dari layout global) |
| Halaman dengan `mx-auto max-w-2xl` | 5 dari 6 | **0** (kecuali `width="focused"` di Keranjang, lewat shell) |
| `max-w-2xl` di dalam `CartBar` | ada | **tidak ada** |
| Blok `rounded-xl border` sebagai kartu | 22 di 11 file | **0** (semuanya `Card`) |
| `Loader2` mentah | 17 di 7 file | **0** (semuanya `Spinner`) |
| `space-y-6` di modul kasir | 4 | **0** |
| Query dengan `keepPreviousData` | 0 | **4** (produk, layanan, transaksi, stok) |
| Offset sticky ajaib | 3 angka berbeda | **1 token** `--kasir-bottom-inset` |
| `tsc --noEmit` | — | bersih |
| `eslint` pada berkas kasir | — | 0 error, 0 warning |
| `next build` | — | sukses, 6 rute kasir ter-prerender |

Komponen yang di-wire (37): `alert`, `alert-dialog`, `avatar`, `badge`,
`breadcrumb`, `button`, `calendar`, `card`, `chart`, `collapsible`, `combobox`,
`context-menu`, `dialog`, `drawer`, `dropdown-menu`, `empty`, `field`,
`hover-card`, `input`, `input-group`, `label`, `pagination`, `popover`,
`progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`,
`skeleton`, `spinner`, `switch`, `table`, `tabs`, `textarea`, `toggle-group`,
`tooltip`.

---

## 0. TL;DR

| # | Masalah | Dampak | Perbaikan |
|---|---------|--------|-----------|
| 1 | 5 dari 6 layar kasir dikunci `max-w-2xl`, papan & products full-width | Lebar halaman **melompat** saat pindah tab | Satu shell tunggal `KasirPageShell`, lebar = papan |
| 2 | Wrapper berbeda antar state (`space-y-6` vs `gap-4`) | Jarak antar elemen berubah saat loading → sukses | Shell yang sama membungkus semua state |
| 3 | ~40 blok markup mentah (`rounded-xl border`, chip, segmented, chart CSS) padahal komponennya ada | Tidak konsisten, sulit dirawat, bukan "shadcn look" | Ganti ke `Card`, `Table`, `ToggleGroup`, `InputGroup`, `Chart`, `RadioGroup`, dst. |
| 4 | Jumlah tab berubah setelah `useKasirConfig` selesai | **Flicker** strip tab di setiap page load | Reservasi tinggi + skeleton tab + `placeholderData` |
| 5 | Tidak ada `placeholderData` di query yang dipakai search | Skeleton berkedip tiap ketikan | `placeholderData: (prev) => prev` + dim `isFetching` |
| 6 | Dua sistem badge (`KasirBadge` vs `ui/badge`) | Warna/tipografi status beda antar layar | `KasirBadge` dibangun di atas `Badge` |
| 7 | 3 offset sticky berbeda (`bottom-20`, `bottom-16`, `pb-40`) | Bar bawah bertumpuk / bergetar | Token CSS `--kasir-bottom-inset` |

Ketujuh baris di atas semuanya sudah dikerjakan — lihat tabel "Hasil akhir" dan
status per fase di §8.

---

## 1. Ruang lingkup

### Halaman
| Route | File |
|---|---|
| `/dashboard/kasir` (Jual) | `src/app/[locale]/(dashboard)/dashboard/kasir/client.tsx` |
| `/dashboard/kasir/papan` | `.../kasir/papan/client.tsx` — **referensi lebar** |
| `/dashboard/kasir/riwayat` | `.../kasir/riwayat/client.tsx` |
| `/dashboard/kasir/stok` | `.../kasir/stok/client.tsx` |
| `/dashboard/kasir/laporan` | `.../kasir/laporan/client.tsx` |
| `/dashboard/kasir/keranjang` | `.../kasir/keranjang/client.tsx` |

### Komponen modul
`src/components/dashboard/kasir/`: `cart-bar`, `category-chips`, `diskon-picker`,
`kasir-badges`, `kasir-page-header`, `kasir-plan-gate`, `kasir-tabs`,
`katalog-toggle`, `layanan-row`, `papan-kartu`, `product-row`, `qty-stepper`,
`stok-kelola-sheet`, `struk-dialog`, `terima-pembayaran-dialog`,
`transaksi-detail-sheet`.

### Pendukung
`src/components/layout/dashboard/dashboard-shell.tsx`,
`src/app/globals.css` (`@utility container`), `src/hooks/dashboard/use-kasir.ts`.

---

## 2. Temuan audit

### 2.1 Lebar halaman tidak konsisten — **temuan utama**

Shell dashboard tidak memberi batas lebar sama sekali:

```
src/components/layout/dashboard/dashboard-shell.tsx:30
  <div className="container flex-1 p-4 md:p-6 lg:p-8">

src/app/globals.css:271
  @utility container { margin-inline: auto; padding-inline: 2rem; }   ← tanpa max-width
```

Di Tailwind v4 utility ini **tidak punya `max-width`**, jadi `container` di sini =
"full width + padding 2rem". Konsekuensinya lebar konten sepenuhnya ditentukan
masing-masing halaman:

| Halaman | Wrapper sukses | Wrapper error | Lebar efektif |
|---|---|---|---|
| products | `space-y-6` (`products/client.tsx:279`) | — | **penuh** ✅ |
| papan | `space-y-4` (`papan/client.tsx:132`) | `space-y-4` (`:67`) | **penuh** ✅ |
| Jual | `mx-auto flex max-w-2xl flex-col gap-4` (`kasir/client.tsx:194`) | `mx-auto max-w-2xl space-y-6` (`:167`) | 672px ❌ |
| riwayat | `mx-auto flex max-w-2xl flex-col gap-4` (`:98`) | `mx-auto max-w-2xl space-y-6` (`:71`) | 672px ❌ |
| stok | `mx-auto flex max-w-2xl flex-col gap-4` (`:82`) | `mx-auto max-w-2xl space-y-6` (`:55`) | 672px ❌ |
| laporan | `mx-auto flex max-w-2xl flex-col gap-4` (`:175`) | `mx-auto max-w-2xl space-y-6` (`:130`) · loading `space-y-4` (`:158`) | 672px ❌ |
| keranjang | `mx-auto flex max-w-2xl flex-col` (`:250`) | — | 672px ⚠️ (disengaja) |

Efek yang terlihat user: pindah dari **Papan Kerja** (kolom Kanban selebar layar)
ke **Jual** → konten menciut jadi kolom 672px di tengah, judul & strip tab ikut
bergeser horizontal. Itu yang membuat modul terasa "bukan satu aplikasi".

Ikutannya: `CartBar` **mengunci lebarnya sendiri**, terpisah dari halaman:

```
src/components/dashboard/kasir/cart-bar.tsx:37
  <div className="mx-auto max-w-2xl px-1">
```

Jadi begitu halaman Jual dilebarkan, cart bar tetap 672px dan tidak lagi sejajar
dengan daftar produk di atasnya. Lebar **harus** datang dari shell, bukan dari
komponen anak.

### 2.2 Wrapper berubah antar state

Di keempat halaman, cabang `isError` memakai `space-y-6` sedangkan cabang sukses
memakai `gap-4`, dan `laporan` menambah varian ketiga (`space-y-4` untuk loading,
`laporan/client.tsx:158`). Header di-render ulang di tiap cabang
(`KasirPageHeader` muncul 2–3× per file). Akibatnya: jarak judul→tab→konten
berubah saat data datang — persis "halaman melompat" yang komentar di
`kasir-page-header.tsx:7-10` sebenarnya ingin dihindari.

`KasirPlanGate` memperparah: skeleton-nya (`kasir-plan-gate.tsx:37-45`) berbentuk
`h-9 w-48` + `h-12` + `h-64`, tidak menyerupai header+tab+konten halaman mana pun,
jadi ada satu lompatan lagi sebelum halaman muncul.

### 2.3 Markup mentah padahal komponennya sudah ada

Daftar lengkap ada di §5. Ringkasnya:

Angka di kolom "lokasi" diverifikasi dengan `rg` pada
`src/components/dashboard/kasir` + `src/app/[locale]/(dashboard)/dashboard/kasir`.

| Pola mentah | Jumlah lokasi | Komponen yang seharusnya |
|---|---|---|
| `rounded-xl border …` sebagai kartu/baris | **22 kemunculan di 11 file** | `Card` / `Table` |
| Chip filter `rounded-full border px-3 py-1.5` | 3 | `ToggleGroup` + `ScrollArea` |
| Segmented control manual | 2 | `Tabs` / `ToggleGroup` |
| `Input` + ikon absolute + tombol clear manual | 3 | `InputGroup` (+`Addon`,`Button`) |
| `<label className="text-sm font-medium">` | 4 | `Field` / `FieldLabel` |
| Radio berbentuk tombol (metode bayar) | 2 | `RadioGroup` / `ToggleGroup` |
| Bar chart CSS manual | 1 (`laporan:79-116`) | `ChartContainer` + Recharts |
| `dl` sebagai tabel perbandingan | 2 | `Table` |
| Skeleton `animate-pulse` manual | 1 (`product-row.tsx:108-118`) | `Skeleton` |
| Empty/error `border-dashed` manual | 3 (`papan:69,97,115`) | `Empty` / `Alert` |
| Badge tone manual | 2 (`papan:141-150`) | `Badge` |

Catatan penting: `Card` di repo ini sudah versi baru (`card.tsx:11`) yang
membawa `py-6 gap-6` sendiri. Kode yang ada melawannya dengan override
(`CardContent ... p-0` di `stok:90`, `CardHeader className="pb-2"` di
`laporan:264,293,315,355`). Hasilnya tinggi kartu antar layar tidak sama.
Aturannya nanti: **pakai anatomi penuh Header/Content/Footer, jangan override
padding** — kalau butuh tampilan padat, pakai varian yang disepakati di §3.2.

### 2.4 Sumber flicker & layout shift

1. **Strip tab berubah jumlah.** `kasir-tabs.tsx:84-89` memfilter tab berdasarkan
   `dagangType` yang default-nya `'PRODUK'` sampai `useKasirConfig` selesai. Toko
   `HYBRID` melihat 4 tab lalu tiba-tiba 5 (tab Papan menyelip di posisi ke-2).
   Ini flicker yang muncul **di setiap** halaman kasir.
2. **Search memicu skeleton penuh.** `useKasirProducts` / `useKasirLayanan` /
   `useTransaksis` hanya menyetel `staleTime` (`use-kasir.ts:84,107,313`); tanpa
   `placeholderData`, setiap perubahan `debouncedSearch` menghasilkan
   `isLoading === true` → daftar hilang → skeleton → daftar muncul lagi.
3. **Gate dua tahap.** `KasirPlanGate` render skeleton → children; `children`
   lalu punya loading-nya sendiri. Dua pergantian layout untuk satu navigasi.
4. **Offset sticky saling tabrak.** `cart-bar.tsx:36` `bottom-20 md:bottom-4`,
   `keranjang/client.tsx:462` `bottom-16 md:bottom-0`, layout global
   `dashboard-layout.tsx:53` `pb-40 md:pb-0`. Tiga angka ajaib untuk satu
   `MobileNavbar` setinggi 64px.
5. **`active:scale-[0.995]`** pada baris produk (`product-row.tsx:100`,
   `layanan-row.tsx:108`) — transform pada elemen selebar layar, terasa sebagai
   getaran saat tap cepat.
6. **Skeleton tidak menyerupai konten.** `riwayat` memakai `h-[70px]`,
   `stok` `h-16`, `laporan` `h-24/h-48/h-40` — angka yang tidak diturunkan dari
   tinggi kartu sungguhan, jadi selalu ada geseran saat data datang.

### 2.5 Dua sistem badge

`kasir-badges.tsx:22-34` mendefinisikan `BASE` + peta `TONE` sendiri, sementara
`ui/badge.tsx` sudah punya `badgeVariants`. Akibatnya badge kasir tidak ikut
perubahan design system (radius, ring focus, `[&>svg]` sizing), dan `papan`
malah menulis badge ketiga langsung di JSX (`papan/client.tsx:141-150`).

---

## 3. Kontrak desain

### 3.1 Shell & lebar

Satu komponen baru, dipakai **semua** halaman kasir, membungkus **semua** state:

```tsx
// src/components/dashboard/kasir/kasir-page-shell.tsx
export function KasirPageShell({
  title, subtitle, actions, toolbar, children,
}: { … }) {
  return (
    <div className="flex flex-col gap-4">          {/* lebar = penuh, sama dgn papan */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        <KasirTabs />
      </div>
      {toolbar}
      {children}
    </div>
  );
}
```

Aturan:
- **Tidak ada** `max-w-*` di halaman kasir mana pun. Lebar ditentukan
  `DashboardShell` — sama seperti `papan` dan `products`.
- Konten yang secara alami tidak enak dibaca selebar 1900px **tidak** dipersempit
  dengan `max-w`, tapi **dipecah jadi grid**: `lg:grid-cols-2` / `xl:grid-cols-3`.
  (Detail per halaman di §5.)
- Pengecualian tunggal: `/keranjang` — checkout adalah alur fokus. Lebarnya tetap
  dibatasi, tapi lewat prop eksplisit `KasirPageShell` (`width="focused"`),
  bukan `mx-auto max-w-2xl` yang ditulis ulang di file.
- `CartBar` **menghapus** `max-w-2xl` internalnya dan mengikuti lebar induk.

### 3.2 Anatomi Card

Setiap `Card` di modul kasir memakai anatomi lengkap dan **tidak** meng-override
padding bawaan:

```tsx
<Card>
  <CardHeader>
    <CardTitle>…</CardTitle>
    <CardDescription>…</CardDescription>
    <CardAction><Button variant="ghost" size="sm">…</Button></CardAction>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter className="border-t">…</CardFooter>   {/* border-t memicu pt-6 bawaan */}
</Card>
```

Dua varian yang disepakati (ditulis sekali sebagai komponen, bukan di-copy):

| Varian | Kapan | Bentuk |
|---|---|---|
| `Card` standar | kartu laporan, panel checkout | anatomi penuh di atas |
| `KasirRowCard` | baris daftar yang bisa ditekan (produk, layanan, transaksi, stok) | `Card` dengan `className="p-0"` **di komponen itu saja**, isi `CardContent className="flex items-center gap-3 p-3"` |

`KasirRowCard` juga yang memegang state interaktif (`hover:bg-accent/40`,
`focus-visible:ring-2`, `data-[selected=true]`), jadi baris di Jual, Riwayat,
dan Stok mustahil berbeda.

### 3.3 Skala spasi

| Konteks | Nilai |
|---|---|
| Antar blok besar dalam halaman | `gap-4` |
| Antar baris dalam daftar | `gap-2` |
| Dalam kartu | mengikuti `Card` (`gap-6`) |
| Grid kartu statistik | `gap-3` |
| Padding halaman | dari `DashboardShell`, tidak ditambah |

`space-y-6` tidak dipakai lagi di modul kasir.

### 3.4 Kebijakan state

| State | Komponen wajib |
|---|---|
| Loading pertama | `Skeleton` yang **menyerupai bentuk akhir** (dibungkus `Card`/`Table` yang sama) |
| Refetch (search, filter) | konten lama tetap tampil, `opacity-60 transition-opacity` saat `isFetching` — **bukan** skeleton |
| Pending aksi (tombol) | `Spinner` di dalam `Button`, `disabled` |
| Error | `Alert variant="destructive"` + `AlertTitle` + `AlertDescription` + tombol coba lagi |
| Kosong (belum ada data) | `EmptyPanel` — lihat §3.4.1. **Bukan** `Empty` mentah |
| Kosong (filter tidak cocok) | `KasirEmptyState` + tombol reset filter — sengaja beda, lihat §3.4.1 |
| Kolom Kanban kosong | `Empty` ringkas (tanpa media) — menggantikan `<p className="border-dashed">` di `papan:115` |

`Loader2` mentah dari lucide **diganti** `Spinner` (`ui/spinner.tsx`) di seluruh
modul, supaya ukuran & animasi seragam.

### 3.4.1 Satu pola untuk layar yang belum berisi

`src/components/dashboard/shared/empty-panel.tsx` mengunci susunannya, dan
susunan itu tidak bisa ditawar dari luar:

```
[ikon]
Judul
Penjelasan
[ Tombol utama ]      ← opsional
Pelajari cara …        ← tautan panduan (artikel luar), selalu ada
Butuh bantuan …?       ← tautan bantuan, selalu ada
```

Yang boleh berbeda cuma teks dan tujuannya. Tautan panduan diambil dari
`src/lib/constants/dashboard/guide-links.ts` — satu tempat, bukan URL
bertaburan di tiap layar.

| Layar | Tombol utama | Tujuannya |
|---|---|---|
| Jual | Tambah produk | `/dashboard/products/new` |
| Riwayat | Mulai jualan | `/dashboard/kasir` |
| Stok | Tambah produk | `/dashboard/products/new` |
| **Laporan** | **tidak ada** | — |
| Preset diskon | Tambah preset | buka form (lewat `jaga()`) |
| Program promo | Tambah promo | buka form (lewat `jaga()`) |
| Produk | Tambah | `/dashboard/products/new` |

Laporan sengaja tanpa tombol: laporan bukan sesuatu yang **dibuat** penjual,
ia muncul sebagai akibat dari berjualan. "Tambah laporan" akan berbohong soal
cara kerjanya.

**Kosong ≠ tersaring.** Yang filternya kesempitan cuma butuh satu tombol
reset — bukan tautan panduan, karena tidak ada yang perlu dia pelajari. Dua
keadaan ini memakai komponen yang berbeda, dan itu disengaja.

**Kapan Laporan dianggap kosong.** Syaratnya ketat: begitu SATU bagian punya
isi — pesanan belum dibayar, pekerjaan tertunda, transaksi di periode mana
pun, produk terlaris, produk di stok, atau diskon terpakai — halaman penuh
yang menang. Toko yang sudah punya produk tapi belum pernah jualan tetap
melihat kartu stoknya. Laporan tidak boleh menyembunyikan angka yang sudah
ada cuma karena bagian sebelahnya masih sepi.

**Lantai tinggi.** `EmptyPanel` memasang `min-h-[336px] sm:min-h-[392px]`:
tinggi ALAMI panel yang isinya paling penuh, diukur di layar. Lantai itu cuma
mengangkat yang pendek, tidak pernah memampatkan yang panjang. Hasilnya tujuh
layar mendarat di ukuran yang sama persis:

| | Lebar × tinggi |
|---|---|
| Ponsel 390 | 358×336 |
| Tablet 768 | 672×392 |
| Desktop 1440 | 1216×392 |

Lantai ini ada di `EmptyPanel`, **bukan** di `ui/empty.tsx` — primitifnya
masih dipakai untuk keadaan kosong yang kecil (mis. daftar diskon di dalam
popover), dan itu memang tidak boleh setinggi satu halaman.

### 3.5 Token bottom bar

Ganti tiga angka ajaib dengan satu variabel di `globals.css`:

```css
:root { --kasir-bottom-inset: 0px; }
@media (max-width: 767px) { :root { --kasir-bottom-inset: 4rem; } } /* MobileNavbar h-16 */
```

Dipakai `CartBar` (`bottom-[calc(var(--kasir-bottom-inset)+0.75rem)]`) dan footer
keranjang. `dashboard-layout.tsx:53` `pb-40` diturunkan mengikuti token yang sama.

---

## 4. Komponen baru yang dibuat

| Komponen | File baru | Menggantikan | Dibangun dari `ui/*` |
|---|---|---|---|
| `KasirPageShell` | `kasir-page-shell.tsx` | wrapper `mx-auto max-w-2xl` di 5 file + `kasir-page-header.tsx` | `Separator`, `Button` |
| `KasirRowCard` | `kasir-row-card.tsx` | 11 blok `rounded-xl border` | `Card`, `CardContent` |
| `KasirSearchField` | `kasir-search-field.tsx` | 3 blok search manual | `InputGroup`, `InputGroupAddon`, `InputGroupInput`, `InputGroupButton` |
| `KasirFilterChips` | mengganti isi `category-chips.tsx` | chip manual (2 tempat) | `ToggleGroup`, `ToggleGroupItem`, `ScrollArea`, `ScrollBar` |
| `KasirStatCard` | `kasir-stat-card.tsx` | grid statistik di stok & laporan | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Badge` |
| `KasirStateBlock` | `kasir-state.tsx` | cabang loading/error/empty yang di-copy 4× | `Alert`, `Empty`, `Skeleton`, `Button`, `Spinner` |
| `KasirCommandSearch` | `kasir-command.tsx` | — (baru) | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandItem`, `CommandEmpty`, `CommandGroup` |
| `ResponsiveSheet` | `responsive-sheet.tsx` | `Sheet` yang dipakai juga di mobile | `Sheet` (≥md) + `Drawer` (<md) |

---

## 5. Blueprint per halaman

Legenda kolom **Target**: nama komponen dari `src/components/ui/`.

### 5.1 Bersama (semua halaman)

| Elemen | Sekarang | Target | Alasan |
|---|---|---|---|
| Wrapper halaman | `mx-auto max-w-2xl` di 5 file | `KasirPageShell` | satu sumber lebar |
| Judul + subjudul | `kasir-page-header.tsx:22-32` | tetap `h1/p`, dipindah ke shell | tidak ada komponen ui untuk page title; cukup dijadikan satu |
| Sub-nav | `<nav>` + `<Link>` manual (`kasir-tabs.tsx:91-121`) | **`Tabs` + `TabsList` + `TabsTrigger asChild` → `Link`** | tampilan = shadcn tabs, navigasi tetap `next/link` (prefetch jalan) |
| Pemisah header/konten | — | `Separator` | batas visual konsisten |
| Skeleton tab saat config belum datang | tidak ada → **flicker** | `Skeleton` selebar tab + jumlah tab dikunci sementara | hilangkan pergeseran 4↔5 tab |
| Badge status | `KasirBadge` sistem sendiri | `Badge` + `badgeVariants` diperluas (`tone`) | satu sistem badge |
| Indikator pending | `Loader2` (17 kemunculan di 7 file) | `Spinner` | ukuran seragam |
| Tombol ikon tanpa teks | `aria-label` saja (`papan-kartu.tsx:136-145`) | `Tooltip` + `TooltipTrigger asChild` | desktop butuh label terlihat |

Contoh wiring sub-nav:

```tsx
<Tabs value={activeHref}>
  <TabsList className="w-full justify-start overflow-x-auto">
    {tabsTampil.map((tab) => (
      <TabsTrigger key={tab.href} value={tab.href} asChild>
        <Link href={tab.href}>
          <tab.icon className="h-4 w-4" aria-hidden />
          {t(tab.labelKey)}
        </Link>
      </TabsTrigger>
    ))}
  </TabsList>
</Tabs>
```

> Catatan aksesibilitas: Radix memberi `role="tab"` pada trigger. Karena ini
> navigasi rute (bukan panel), `TabsList` diberi `aria-label` dan tidak ada
> `TabsContent`. Alternatif yang lebih "benar" secara semantik adalah `<nav>` +
> `Link` bergaya `toggleVariants`. **Rekomendasi: pakai `Tabs`** demi konsistensi
> visual dengan `stok-kelola-sheet` yang sudah memakai `Tabs`; kalau tim lebih
> memilih semantik nav murni, ganti ke opsi kedua — keduanya sudah disiapkan.

### 5.2 `/dashboard/kasir` — Jual

| Elemen | Sekarang | Target | Catatan |
|---|---|---|---|
| Wrapper | `max-w-2xl` (`:194`) | `KasirPageShell` | full width |
| Layout desktop | satu kolom | `grid lg:grid-cols-[1fr_380px]` — katalog kiri, **keranjang ringkas kanan** (`Card` sticky) | memakai ruang yang tadinya kosong; mobile tetap satu kolom + `CartBar` |
| Toggle Produk/Layanan | grid tombol manual (`katalog-toggle.tsx:41-64`) | `Tabs` + `TabsList` + `TabsTrigger` | benar-benar mengganti isi → Tabs tepat |
| Kolom pencarian | `Input` + ikon absolute + tombol X (`:213-239`) | `InputGroup` + `InputGroupAddon`(`Search`) + `InputGroupInput` + `InputGroupAddon align="inline-end"` + `InputGroupButton`(`X`) | hilangkan positioning manual |
| Pintasan cari cepat | — | `Command` / `CommandDialog` (⌘K, dan siap untuk barcode scanner) | POS desktop: kasir mengetik tanpa lepas dari keyboard |
| Chip kategori | tombol manual (`category-chips.tsx:34-67`) | `ToggleGroup type="single"` + `ToggleGroupItem` di dalam `ScrollArea` + `ScrollBar orientation="horizontal"` | scroll konsisten lintas OS |
| Kategori > 12 | chip memanjang | `Combobox` (`Popover`+`Command`) sebagai fallback | daftar panjang tidak layak jadi chip |
| Baris produk | `<button className="rounded-xl border">` (`product-row.tsx:93-105`) | `KasirRowCard` (`Card`+`CardContent`) | satu bentuk baris untuk semua layar |
| Badge stok / promo | `KasirBadge` | `Badge` (via `KasirBadge` yang di-refactor) | — |
| Indikator stok | teks | `Progress` (stok / minStock×3) opsional | sinyal cepat tanpa membaca angka |
| Stepper qty | tombol manual (`qty-stepper.tsx:41-82`) | `Button variant="outline" size="icon"` ×2 + `Separator` vertikal | dipakai di 3 layar |
| Skeleton | `animate-pulse` manual (`product-row.tsx:108-118`) | `Skeleton` di dalam `KasirRowCard` | bentuk = bentuk akhir |
| Empty | `Empty` ✅ (`:256-300`) | tetap | sudah benar |
| Error | `Alert` ✅ (`:169-188`) | tetap, wrapper ikut shell | — |
| Cart bar | `Link` + div (`cart-bar.tsx:33-57`) | `Card` (shadow) + `Button asChild size="lg"` + `Badge` untuk jumlah item | ikut lebar shell |
| Thumbnail produk | tidak ada | `OptimizedImage` + `AspectRatio` (opsional, mode "grid") | POS makanan lebih cepat dengan gambar |

### 5.3 `/dashboard/kasir/papan` — Papan Kerja

Lebar sudah benar; yang diperbaiki **isinya**.

| Elemen | Sekarang | Target |
|---|---|---|
| Wrapper | `space-y-4` (`:132`) | `KasirPageShell` (hasil visual identik) |
| Ringkasan terlambat/belum bayar | `<span>` bergaya manual (`:138-152`) | `Badge` + `Alert` (kalau `terlambat > 0`, ini benar-benar peringatan) |
| Pemilih kolom (mobile) | `role="tablist"` manual (`:155-189`) | `Tabs` + `TabsList` + `TabsTrigger` + `Badge` penghitung |
| Judul kolom (desktop) | `<h2>` + span (`:198-203`) | `CardHeader`+`CardTitle`+`CardAction`(`Badge`) dalam `Card` kolom |
| Isi kolom | `div.space-y-2` | `ScrollArea` dengan tinggi tetap → kolom tidak saling menarik tinggi |
| Kolom kosong | `<p className="border-dashed">` (`:115`) | `Empty` ringkas |
| Loading | `Loader2` tengah layar (`:58-60`) | `Skeleton` 4 kolom × 2 kartu |
| Error | div dashed (`:69-86`) | `Alert variant="destructive"` |
| Kosong total | div dashed (`:97-106`) | `Empty` |
| Kartu | `div.rounded-xl border` (`papan-kartu.tsx:76-80`) | `Card` + `CardHeader`/`CardContent`/`CardFooter` (aksi di footer) |
| Nama PIC | teks | `Avatar` + `AvatarFallback` (inisial) | 
| Tombol mundur (ikon) | `Button` + aria-label | `Tooltip` |
| Pratinjau isi pesanan | tidak ada | `HoverCard` (desktop) berisi item + total |
| Aksi lanjutan per kartu | tidak ada | `DropdownMenu` (lihat struk, terima bayar, batal) |
| Progres tahap | tidak ada | `Progress` (1/4 … 4/4) opsional |

### 5.4 `/dashboard/kasir/riwayat`

| Elemen | Sekarang | Target |
|---|---|---|
| Wrapper | `max-w-2xl` (`:98`) | `KasirPageShell` |
| Search | manual (`:103-125`) | `KasirSearchField` (`InputGroup`) |
| Filter status | chip manual (`:127-147`) | `ToggleGroup type="single"` + `ScrollArea` |
| Filter tanggal | tidak ada | `Popover` + `Calendar` (mode range) + `Button` pemicu |
| Urutan | tidak ada | `Select` (terbaru / nominal terbesar) |
| Sembunyikan VOID | tidak ada | `Switch` + `Label` |
| Daftar (mobile) | `<button className="rounded-xl border">` (`:178-224`) | `KasirRowCard` |
| Daftar (≥md) | — | **`Table`** + `TableHeader`/`TableRow`/`TableHead`/`TableBody`/`TableCell`/`TableCaption` | 
| Aksi per baris | hanya buka sheet | `DropdownMenu` (detail, struk, void, refund) + `ContextMenu` (klik kanan, desktop) |
| Halaman data | `LIMIT = 200` (`:49`) | `Pagination` (client-side dulu; server-side kalau API mendukung) |
| Skeleton | `h-[70px]` (`:154`) | `Skeleton` dalam `TableRow`/`KasirRowCard` yang sama |
| Empty | `Empty` ✅ | tetap + `EmptyContent` berisi tombol reset filter |
| Error | `Alert` ✅ | tetap |
| Sheet detail | `Sheet` ✅ (`transaksi-detail-sheet.tsx`) | tambah `SheetFooter` untuk tombol aksi; `dl` rincian → `Table`; `<label>` alasan → `Field`+`FieldLabel`+`FieldError`; `Textarea` ✅; `Separator` antar blok; di mobile pakai `ResponsiveSheet`→`Drawer` |
| Konfirmasi void/refund | `AlertDialog` ✅ | tetap; tambah `RadioGroup` alasan cepat + `Textarea` untuk "lainnya" |

### 5.5 `/dashboard/kasir/stok`

| Elemen | Sekarang | Target |
|---|---|---|
| Wrapper | `max-w-2xl` (`:82`) | `KasirPageShell` |
| Ringkasan 3 angka | `Card` + `CardContent p-0 divide-x` (`:89-110`) | 3× `KasirStatCard` dalam `grid gap-3 sm:grid-cols-3` (anatomi Card penuh) |
| Search | manual (`:113-136`) | `KasirSearchField` |
| Filter cepat | tidak ada | `ToggleGroup` (Semua / Menipis / Habis) |
| Daftar (mobile) | `<button className="rounded-xl border">` (`:163-192`) | `KasirRowCard` |
| Daftar (≥md) | — | `Table` + kolom Nama / Kategori / Stok / Min / Nilai / Aksi |
| Bar stok | tidak ada | `Progress` |
| Aksi baris | buka sheet | `DropdownMenu` (restock, opname, lihat riwayat stok) |
| Skeleton | `h-16` (`:142`) | `Skeleton` dalam bentuk akhir |
| Empty / Error | `Empty` ✅ / `Alert` ✅ | tetap |
| Sheet kelola | `Sheet`+`Tabs` ✅ | `<label>` → `Field`/`FieldLabel`/`FieldDescription`/`FieldError`; input angka → `InputGroup` + `InputGroupAddon`("pcs"); tombol → `SheetFooter`; `Loader2` → `Spinner`; perbandingan `dl` (`:266-288`) → `Table`; mobile → `Drawer` |
| Form restock/opname | state manual | `Form` (react-hook-form + zod) kalau validasi bertambah; sementara `Field` sudah cukup |

### 5.6 `/dashboard/kasir/laporan`

| Elemen | Sekarang | Target |
|---|---|---|
| Wrapper | `max-w-2xl` (`:175`) | `KasirPageShell`, isi jadi `grid gap-4 lg:grid-cols-2 xl:grid-cols-3` |
| Kartu aksi (belum dibayar / pekerjaan) | `<Link className="rounded-xl border">` (`:186-232`) | `Card` + `CardHeader`/`CardTitle`/`CardDescription` + `CardFooter` berisi `Button asChild` + `Badge` untuk "N terlambat" |
| Omzet hari/minggu/bulan | `Card`+`CardContent p-0 divide-x` (`:237-253`) | 3× `KasirStatCard` |
| Catatan basis kas | `<p>` melayang (`:258-260`) | `CardDescription` di dalam kartu omzet, atau `Alert` informatif |
| Grafik 7 hari | bar CSS manual (`:79-116`) | **`ChartContainer` + `ChartTooltip` + `ChartTooltipContent` + `ChartLegend`** dengan Recharts `BarChart` (recharts 2.15.4 sudah terpasang) |
| Rentang grafik | tetap 7 hari | `ToggleGroup` (7 / 30 / 90 hari) — perlu dukungan API |
| Terlaris | `<ol>/<li>` (`:41-75`) | `Table` + `Badge` peringkat, atau `Tabs` (Barang/Layanan) bila keduanya ada |
| Ringkasan stok | grid `div.bg-muted/50` (`:318-337`) | `KasirStatCard` ×3 + `Separator` + `Table` produk kritis |
| Analisa diskon | `ul/li` (`:373-391`) | `Table` + `Badge` persen |
| Bagian panjang di mobile | semua terbuka | `Accordion` / `Collapsible` per kartu |
| Loading | 3 `Skeleton` blok (`:158-163`) | `Skeleton` di dalam `Card` yang sama persis dengan hasil akhir |
| Error | `Alert` ✅ | tetap |
| Halaman kosong total | dinding angka nol | **`EmptyPanel` tanpa tombol** (§3.4.1) — muncul cuma kalau SEMUA bagian kosong |
| Grafik kosong (halaman berisi) | `<p>` (`:279-281`) | tetap `<p>` — sengaja. Ini notis di DALAM kartu, bukan keadaan halaman; bingkai putus-putus di dalam kartu cuma jadi kebisingan |
| Analisa diskon kosong (halaman berisi) | `<p>` | tetap `<p>`, alasan sama |
| Ekspor | tidak ada | `Button` + `DropdownMenu` (CSV / salin) — opsional |

Contoh wiring chart:

```tsx
const chartConfig = {
  total: { label: t('chartTitle'), color: 'var(--chart-1)' },
} satisfies ChartConfig;

<ChartContainer config={chartConfig} className="aspect-[3/1] w-full">
  <BarChart data={omzet.chart}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="tanggal" tickLine={false} axisLine={false} tickFormatter={hari} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="total" fill="var(--color-total)" radius={4} isAnimationActive={false} />
  </BarChart>
</ChartContainer>
```

`isAnimationActive={false}` + `aspect-*` pada container = tidak ada animasi
tumbuh dan tidak ada perubahan tinggi saat data masuk (anti-flicker §7).

### 5.7 `/dashboard/kasir/keranjang`

Satu-satunya layar yang **boleh** lebih sempit, tapi lewat shell:
`<KasirPageShell width="focused">` → `lg:grid lg:grid-cols-[1fr_400px]`
(item kiri, ringkasan+bayar kanan sticky). Di mobile tetap satu kolom.

| Elemen | Sekarang | Target |
|---|---|---|
| Header + tombol kembali | div manual (`:252-276`) | `KasirPageShell` varian checkout + `Breadcrumb` (Kasir → Keranjang) |
| Panel uang tunai | `div.rounded-xl border` (`:281-331`) | `Card` + `CardHeader`(`CardTitle` "Uang diterima") + `CardContent` + `CardFooter` |
| Input nominal | `Input` (`:288-295`) | `InputGroup` + `InputGroupAddon`("Rp") + `InputGroupInput` |
| Nominal cepat | tombol manual (`:297-315`) | `Button variant="outline" size="sm"` dalam `div.flex-wrap`, tombol "uang pas" `variant="secondary"` |
| Kurang / kembalian | `<p>` berwarna (`:318-330`) | `Alert` (destructive saat kurang) atau `FieldDescription` + `Badge` |
| Baris item | `div.rounded-xl border` (`:343-384`) | `Card` + `CardContent` + `Separator` + `Badge`(GRATIS) |
| Stepper | manual | `Button size="icon"` ×2 (lihat §5.2) |
| Field PIC | `<label>`+`Input` (`:392-411`) | `Field` + `FieldLabel` + `Input` + `FieldDescription` |
| Pemilih diskon | tombol → tukar layar (`:415-429`, `:228-246`) | `Popover`/`Drawer` berisi `RadioGroup`+`Label`, atau `Combobox` bila preset banyak — tidak lagi menukar seluruh isi halaman |
| Daftar preset diskon | tombol manual (`diskon-picker.tsx:64-111`) | `RadioGroup` + `RadioGroupItem` + `Label` + `Badge` persen |
| Metode pembayaran | 3 tombol manual (`:436-457`) | `RadioGroup` bergaya kartu **atau** `ToggleGroup type="single"` — pilih `RadioGroup` (semantik "pilih satu dari tiga" + keyboard nav benar) |
| Rincian total | `<dl>` (`:463-482`) | `Card` + `CardContent` + `Separator` + `CardFooter` berisi tombol bayar |
| Tombol bayar | `Button` ✅ | tetap + `Spinner` |
| Bayar nanti | `Button` ✅ | tetap |
| Konfirmasi kosongkan | `AlertDialog` ✅ | tetap |
| Gagal bayar | `AlertDialog` ✅ | boleh dipertimbangkan `ValidationDialog` (sudah ada di repo) |
| Struk | `Dialog`+`ScrollArea` ✅ | tetap; mobile → `Drawer`; tambah `Tooltip` di tombol bagikan |
| Keranjang kosong | `Empty` ✅ | tetap |

### 5.8 Overlay & gate

| Komponen | Sekarang | Target |
|---|---|---|
| `KasirPlanGate` | skeleton acak (`:37-45`) | `Skeleton` berbentuk `KasirPageShell` (judul + tab + 1 kartu); layar upsell → `Card` + `CardHeader`/`CardContent`/`CardFooter` + `Badge`("BUSINESS") |
| `StrukDialog` | `Dialog` ✅ | + `ResponsiveSheet`/`Drawer` di mobile |
| `TerimaPembayaranDialog` | `Dialog` ✅ | metode → `RadioGroup`; nominal → `InputGroup`; `Loader2` → `Spinner`; `DialogFooter` ✅ |
| Persetujuan supervisor void/refund | tidak ada | `InputOTP` (PIN 4–6 digit) — **butuh dukungan server**, ditandai opsional |

---

## 6. Matriks lengkap komponen `src/components/ui`

Status:
**✅ dipakai** = sudah dipakai di modul kasir hari ini ·
**🟢 rencana** = dipakai setelah panduan ini ·
**🟡 opsional** = punya tempat yang masuk akal, dieksekusi kalau fiturnya disetujui ·
**⛔ tidak** = sengaja tidak dipakai di kasir (alasan ditulis)

| # | Komponen | Status | Dipakai di |
|---|---|---|---|
| 1 | `accordion` | 🟡 | Laporan mobile — kartu panjang jadi bisa dilipat |
| 2 | `alert-dialog` | ✅ | keranjang (kosongkan, gagal bayar), riwayat (void/refund), stok (selisih besar) |
| 3 | `alert` | ✅→🟢 | error 5 halaman; **baru**: papan (error+terlambat), keranjang (uang kurang) |
| 4 | `android` | ⛔ | mockup perangkat, komponen marketing |
| 5 | `animated-beam` | ⛔ | dekorasi landing page |
| 6 | `animated-gradient-text` | ⛔ | dekorasi; teks kasir harus kontras tinggi |
| 7 | `animated-list` | ⛔ | animasi masuk-keluar item = flicker; papan justru harus tenang |
| 8 | `aspect-ratio` | 🟡 | thumbnail produk mode grid, container chart |
| 9 | `avatar` | 🟢 | inisial PIC di kartu papan & detail transaksi |
| 10 | `badge` | 🟢 | dasar baru `KasirBadge`; penghitung tab/kolom; status; persen diskon |
| 11 | `bento-grid` | ⛔ | tata letak marketing; laporan pakai grid biasa |
| 12 | `breadcrumb` | 🟢 | Keranjang (Kasir → Keranjang), detail transaksi |
| 13 | `button` | ✅ | seluruh modul |
| 14 | `calendar` | 🟡 | filter rentang tanggal riwayat & laporan (butuh param API) |
| 15 | `card` | ✅→🟢 | **semua** baris, panel, statistik, kolom papan |
| 16 | `carousel` | ⛔ | tidak ada konten yang layak digeser di POS |
| 17 | `chart` | 🟢 | grafik omzet 7 hari (menggantikan bar CSS manual) |
| 18 | `checkbox` | 🟡 | pilih banyak transaksi (ekspor/cetak massal) |
| 19 | `collapsible` | 🟢 | "rincian lengkap" di ringkasan keranjang & laporan |
| 20 | `combobox` | 🟢 | filter kategori saat >12 kategori; pilih preset diskon |
| 21 | `command` | 🟢 | pencarian produk ⌘K di Jual (jalur barcode/keyboard) |
| 22 | `context-menu` | 🟡 | klik kanan baris riwayat (desktop): struk, void, refund |
| 23 | `dialog` | ✅ | struk, terima pembayaran |
| 24 | `drawer` | 🟢 | pengganti `Sheet`/`Dialog` di layar <md (`ResponsiveSheet`) |
| 25 | `dropdown-menu` | 🟢 | aksi baris di riwayat, stok, papan |
| 26 | `empty` | ✅→🟢 | 4 halaman sudah; **baru**: papan (3 tempat), grafik kosong, kolom kosong |
| 27 | `field` | 🟢 | alasan void/refund, PIC, restock, opname |
| 28 | `flickering-grid` | ⛔ | latar dekoratif — nama fiturnya saja sudah bertentangan dgn "tanpa flicker" |
| 29 | `form` | 🟡 | kalau form stok/diskon dipindah ke react-hook-form + zod |
| 30 | `hexagon-pattern` | ⛔ | dekorasi |
| 31 | `highlighter` | ⛔ | efek teks marketing |
| 32 | `hover-card` | 🟡 | pratinjau isi pesanan dari kartu papan (desktop) |
| 33 | `input-group` | 🟢 | 3 kolom pencarian, input Rp, input pcs |
| 34 | `input-otp` | 🟡 | PIN supervisor untuk void/refund (butuh server) |
| 35 | `input` | ✅ | search, nominal, PIC |
| 36 | `interactive-hover-button` | ⛔ | tombol marketing; POS butuh target tap statis |
| 37 | `iphone` | ⛔ | mockup perangkat |
| 38 | `label` | 🟢 | pasangan `RadioGroup`/`Switch`/`Checkbox` |
| 39 | `mandatory-dialog` | 🟡 | onboarding kasir pertama kali (mode dagang belum diatur) |
| 40 | `marquee` | ⛔ | teks berjalan; mengganggu di layar kerja |
| 41 | `menubar` | ⛔ | pola desktop-app; sidebar sudah jadi navigasi utama |
| 42 | `morphing-text` | ⛔ | dekorasi |
| 43 | `navigation-menu` | ⛔ | tumpang tindih dengan sidebar + KasirTabs |
| 44 | `optimized-image` | 🟡 | thumbnail produk di baris/grid Jual |
| 45 | `pagination` | 🟢 | riwayat (>200 transaksi), log stok |
| 46 | `popover` | 🟢 | filter tanggal, pemilih diskon, pengaturan kolom tabel |
| 47 | `progress` | 🟢 | level stok, progres tahap pengerjaan di papan |
| 48 | `radio-group` | 🟢 | metode pembayaran (2 tempat), preset diskon, alasan void |
| 49 | `rainbow-button` | ⛔ | tombol marketing |
| 50 | `resizable` | 🟡 | split view desktop Jual ⇄ keranjang (fase lanjutan) |
| 51 | `safari` | ⛔ | mockup browser |
| 52 | `scroll-area` | ✅→🟢 | struk sudah; **baru**: baris chip, kolom papan, daftar panjang |
| 53 | `select` | 🟢 | urutan daftar (riwayat/stok), pilih periode laporan |
| 54 | `separator` | 🟢 | header↔konten, antar blok kartu, dalam stepper |
| 55 | `sheet` | ✅ | detail transaksi, kelola stok |
| 56 | `sidebar` | ✅ | layout dashboard global (di luar modul kasir) |
| 57 | `skeleton` | ✅→🟢 | semua state loading (termasuk yang sekarang `animate-pulse` manual) |
| 58 | `slider` | ⛔ | tidak ada nilai kontinu; qty & persen butuh angka pasti |
| 59 | `sonner` | ✅ | `Toaster` dipasang di layout global; kasir memanggil `toast()` |
| 60 | `spinner` | 🟢 | mengganti 7 pemakaian `Loader2` |
| 61 | `switch` | 🟢 | "sembunyikan VOID" (riwayat), "hanya stok menipis" (stok) |
| 62 | `table` | 🟢 | riwayat (≥md), stok (≥md), terlaris, analisa diskon, perbandingan opname |
| 63 | `tabs` | ✅→🟢 | stok sheet sudah; **baru**: sub-nav kasir, toggle katalog, kolom papan mobile, barang/layanan di laporan |
| 64 | `textarea` | ✅ | alasan void/refund |
| 65 | `toggle-group` | 🟢 | chip kategori, filter status, filter cepat stok, rentang grafik |
| 66 | `toggle` | 🟢 | tombol tunggal "tampilkan hanya belum dibayar" |
| 67 | `tooltip` | 🟢 | semua tombol ikon (papan, stepper, aksi tabel) |
| 68 | `validation-dialog` | 🟡 | kegagalan bayar (menggantikan AlertDialog buatan sendiri) |
| 69 | `word-rotate` | ⛔ | dekorasi |

**Rekap:** ✅ 14 · 🟢 24 · 🟡 12 · ⛔ 19 = 69.
Ter-wire ke modul kasir setelah eksekusi wajib: **38** (✅+🟢);
**50** kalau seluruh yang 🟡 disetujui.

> Catatan jujur soal "semuanya bisa dipakai": 19 komponen ⛔ terbagi tiga
> kelompok, dan tidak satu pun bisa dipaksakan tanpa merugikan layar kasir:
>
> 1. **Dekorasi Magic UI / mockup perangkat** (16): `android`, `iphone`,
>    `safari`, `animated-beam`, `animated-gradient-text`, `animated-list`,
>    `bento-grid`, `carousel`, `flickering-grid`, `hexagon-pattern`,
>    `highlighter`, `interactive-hover-button`, `marquee`, `morphing-text`,
>    `rainbow-button`, `word-rotate`. Semuanya bergerak atau menarik perhatian
>    — bertentangan langsung dengan syarat "tidak ada flickering", dan layar ini
>    dipakai sambil berdiri melayani antrean.
> 2. **Navigasi tandingan** (2): `menubar`, `navigation-menu` — dashboard sudah
>    punya `sidebar` + `MobileNavbar` + `KasirTabs`; lapis keempat justru
>    membingungkan.
> 3. **Kontrol yang salah bentuk** (1): `slider` — tidak ada nilai kontinu di
>    kasir; qty, persen diskon, dan stok fisik semuanya butuh angka pasti.
>
> Semuanya tetap berguna di halaman marketing/landing repo ini — hanya bukan di
> `/dashboard/kasir`.

---

## 7. Playbook anti-flicker

| Sumber | Perbaikan | File |
|---|---|---|
| Jumlah tab berubah setelah config datang | Simpan `dagangType` terakhir di `localStorage` sebagai `initialData`, dan render `Skeleton` selebar satu tab selama `isLoading` sehingga lebar strip tidak berubah | `kasir-tabs.tsx`, `use-kasir.ts` |
| Skeleton muncul tiap ketikan | `placeholderData: (prev) => prev` pada `useKasirProducts`, `useKasirLayanan`, `useTransaksis`, `useStockReport`; konten lama diberi `opacity-60` saat `isFetching` | `use-kasir.ts` |
| Gate → halaman dua tahap | Skeleton gate memakai bentuk `KasirPageShell` yang sama | `kasir-plan-gate.tsx` |
| Skeleton beda tinggi dgn konten | Skeleton dibungkus `Card`/`TableRow` yang sama persis | semua halaman |
| Grafik tumbuh saat mount | `ChartContainer` dengan `aspect-*` tetap + `isAnimationActive={false}` | `laporan/client.tsx` |
| Bar bawah bertumpuk | token `--kasir-bottom-inset` | `globals.css`, `cart-bar.tsx`, `keranjang/client.tsx` |
| `active:scale` pada baris lebar | hapus; ganti `active:bg-accent` | `product-row.tsx`, `layanan-row.tsx` |
| Wrapper beda antar state | `KasirPageShell` membungkus semua cabang | 5 halaman |
| Sheet/Dialog menggeser scrollbar | biarkan Radix menangani (`scrollbar-gutter: stable` di `html`) | `globals.css` |

---

## 8. Status eksekusi

Semua fase wajib (F0–F9) selesai. Dari daftar opsional F10, yang punya dukungan
API dan bentuk pemakaian yang jujur ikut dikerjakan; sisanya tidak — alasannya
di bawah tabel.

| Fase | Isi | Status |
|---|---|---|
| **F0** | `KasirPageShell`, `KasirRowCard`, `KasirSearchField`, `KasirFilterGroup`, `KasirStatCard`, `KasirStateBlock`, `ResponsiveSheet` | ✅ 7 file baru |
| **F1** | Shell diterapkan ke Jual, Riwayat, Stok, Laporan; `max-w-2xl` dilepas termasuk di `CartBar` | ✅ |
| **F2** | `KasirTabs` → `Tabs`; `KasirBadge` → `Badge`; `Loader2` → `Spinner`; token `--kasir-bottom-inset` | ✅ |
| **F3** | Search → `InputGroup`; chip → `ToggleGroup`+`ScrollArea`; katalog → `Tabs`; baris → `KasirRowCard`; skeleton diseragamkan | ✅ |
| **F4** | Riwayat & Stok: `Table` di ≥md, `DropdownMenu`, `Pagination` server-side | ✅ |
| **F5** | Laporan: `ChartContainer`/Recharts, `KasirStatCard`, `Table`, `Collapsible` | ✅ |
| **F6** | Keranjang: `RadioGroup`, `Field`, `Card` per zona, dua kolom di ≥lg, `Breadcrumb` | ✅ |
| **F7** | Papan: `Card` + `ScrollArea` per kolom, `Avatar`, `Tooltip`, `HoverCard`, `Progress` | ✅ |
| **F8** | Overlay: `ResponsiveSheet` (Drawer di ponsel), footer menempel, `Field` di sheet, `Table` rincian | ✅ |
| **F9** | `keepPreviousData`, tab tidak berubah jumlah, skeleton sebentuk konten, reset halaman keluar dari `useEffect` | ✅ |

### Dari F10 (opsional) — dikerjakan

| Komponen | Dipakai untuk | Alasan bisa dikerjakan sekarang |
|---|---|---|
| `Calendar` + `Popover` | filter rentang tanggal di Riwayat | `QueryTransaksiParams` sudah punya `tanggalMulai`/`tanggalSelesai` |
| `Pagination` | Riwayat | `PaginationMeta` (`page`, `totalPages`) sudah ada di respons |
| `ContextMenu` | klik kanan baris tabel Riwayat | tanpa perubahan API |
| `HoverCard` | pratinjau kartu papan di desktop | tanpa perubahan API |
| `Progress` | tingkat stok, tahap pengerjaan | tanpa perubahan API |
| `Switch` | "hanya yang perlu tindakan" di Stok | tanpa perubahan API |
| `Combobox` | filter kategori saat >12 kategori | tanpa perubahan API |
| `Collapsible` | daftar stok kritis di Laporan | tanpa perubahan API |
| `Drawer` | panel di ponsel lewat `ResponsiveSheet` | tanpa perubahan API |

### Dari F10 — TIDAK dikerjakan, dan alasannya

| Komponen | Kenapa tidak |
|---|---|
| `Command` (⌘K cari produk) | Fitur baru, bukan penyeragaman UI. Butuh keputusan soal alur barcode/keyboard dulu — kalau dipasang sekarang, ia jadi pintu kedua ke katalog yang belum diputuskan bentuknya. |
| `InputOTP` (PIN supervisor void/refund) | Butuh dukungan server (endpoint verifikasi PIN). Memasang UI-nya tanpa itu menghasilkan kontrol yang tidak menahan apa pun. |
| `Resizable` (split view Jual ⇄ keranjang) | Mengubah alur "satu pintu lewat CartBar" yang disengaja. Ruang layar lebar sudah dipakai lewat grid katalog 2–3 kolom, tanpa menambah pintu. |
| `Form` (react-hook-form) | Form kasir cuma satu-dua field dengan validasi angka sederhana; `Field` sudah menutupinya. Migrasi ke RHF di sini menambah lapisan tanpa menambah apa pun. |
| `Checkbox`, `Accordion`, `AspectRatio`, `OptimizedImage`, `MandatoryDialog`, `ValidationDialog` | Semua butuh fitur baru (pilih-banyak, foto produk di kasir, onboarding kasir) — di luar lingkup "samakan tampilan yang sudah ada". |
| `Toggle` (tunggal) | `ToggleGroup` sudah menutupi semua kebutuhan filter; menambahkan satu toggle lepas hanya akan jadi bentuk kontrol kelima untuk pekerjaan yang sama. |

### Catatan penyimpangan dari rencana awal

1. **Panel keranjang di halaman Jual (desktop) tidak dibuat.** Ruang layar lebar
   dipakai untuk memecah katalog jadi 2–3 kolom (`md:grid-cols-2
   xl:grid-cols-3`). Ini memenuhi tujuan yang sama — lebar terpakai, tata letak
   rapi — tanpa melanggar aturan "cart bar adalah satu-satunya pintu ke
   checkout" yang ditulis eksplisit di `cart-bar.tsx`.
2. **`PaginationPrevious` / `PaginationNext` tidak dipakai.** Keduanya menulis
   teks "Previous"/"Next" berbahasa Inggris langsung di JSX dan mengabaikan
   `children`, jadi label terjemahan tidak akan pernah muncul. Diganti
   `PaginationLink` + ikon + label dari next-intl.
3. **`Switch` di Stok diberi makna yang benar-benar berbeda dari chip di
   sebelahnya.** Chip MENIPIS dan HABIS saling eksklusif; tidak ada chip yang
   menampilkan keduanya sekaligus, padahal itulah daftar belanja yang
   dibutuhkan. Switch mengisi celah itu, bukan mengulang chip.

## 9. Definition of Done

Diverifikasi otomatis:

- [x] Tidak ada `max-w-` di `src/app/[locale]/(dashboard)/dashboard/kasir/**` selain via `KasirPageShell`.
- [x] Tidak ada `mx-auto max-w-2xl` di `cart-bar.tsx`.
- [x] `rg "rounded-xl border" src/components/dashboard/kasir` → 0 hasil di luar komentar.
- [x] `rg "Loader2" src/components/dashboard/kasir` → 0 hasil (semua `Spinner`).
- [x] Tidak ada `space-y-6` di modul kasir.
- [x] `npx tsc --noEmit` bersih.
- [x] `npx eslint` → 0 error & 0 warning pada seluruh berkas kasir.
- [x] `npx next build` sukses; keenam rute kasir ter-prerender untuk `id` dan `en`.
- [x] Kunci terjemahan baru ada di `messages/id` **dan** `messages/en` (jumlah kunci sama).

Perlu mata manusia — belum diverifikasi:

- [ ] Pindah antar 5 tab: judul & strip tab tidak bergeser 1px (screenshot diff).
- [ ] Mengetik di pencarian: daftar tidak pernah diganti skeleton.
- [ ] Toko HYBRID: jumlah tab tidak berubah setelah config termuat.
- [ ] Diuji di 360px, 768px, 1280px, 1920px.
- [ ] Tema terang & gelap.
- [ ] Alur transaksi utuh dengan data sungguhan (bayar, bayar nanti, void,
      refund, restock, opname) — perubahan ini menyentuh markup, bukan logika,
      tapi tidak ada test otomatis yang menjaganya di repo ini.

---

## 10. Keputusan — semua sudah diambil

| # | Pertanyaan | Keputusan yang dijalankan |
|---|---|---|
| 1 | Semantik sub-nav | `Tabs` + `TabsTrigger asChild` → `Link`, `activationMode="manual"`, `aria-label` di `TabsList`. Prefetch dan ctrl+klik tetap bekerja. |
| 2 | Lebar keranjang | Kolom fokus (`width="focused"`, max-w-5xl) + kolom kanan menempel `lg:grid-cols-[1fr_360px]`. |
| 3 | Tabel vs kartu | `Table` di ≥md untuk Riwayat & Stok, kartu di bawahnya. |
| 4 | Fitur yang butuh API | Filter tanggal & pagination **dikerjakan** (API sudah mendukung). Rentang grafik 30/90 hari dan PIN supervisor **tidak** — server belum menyediakannya. |
| 5 | Panel keranjang di halaman Jual | **Tidak dibuat.** Ruang lebar dipakai untuk katalog 2–3 kolom; cart bar tetap satu-satunya pintu ke checkout. |
