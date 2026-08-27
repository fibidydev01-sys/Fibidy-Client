# ROADMAP — dialek EAS untuk dashboard

> **Status: FASE 0–5 SUDAH JALAN, FASE 6 SEBAGIAN.**
> Sumber bentuk: screenshot dasbor EAS (expo.dev). Sumber warna, tipe, radius,
> dan ritme: **`expo.design.md`, tanpa satu hex pun di luar itu.**
> Lanjutan dari `DESIGN_EXPO.md`.

Cakupan: **dashboard saja**. Marketing dan legal berhenti di titik yang sudah
ter-push. Storefront tidak disentuh (warnanya milik seller).

---

## Status implementasi

| Fase | Isi | Keadaan |
|---|---|---|
| 0 | Inter + JetBrains Mono | ✅ `d31fe9a` |
| 1 | Token bentuk, elevasi 3 lapis, `data-surface`, inset | ✅ `d31fe9a` |
| 2 | Primitif → pil + 44px | ✅ `d31fe9a` · adopsi `Field` belum |
| 3 | `CardFooter` jadi bilah aksi | ✅ mekanismenya · pemakainya lebih sedikit dari perkiraan, lihat di bawah |
| 4 | Sidebar bergrup + kepala + kaki | ✅ `06849f7` |
| 5 | Grid⇄daftar, cari, urutkan (Produk) | ✅ `8b631df` · kasir belum |
| 6 | Sapu per halaman | 🟡 Langganan `6344ada` · Studio & Setup-store belum |
| — | Koreksi elevasi + garis, NavUser, paginasi | ✅ `966a30c` |
| — | Sidebar dikembalikan ke kontrak resmi shadcn | ✅ `ea76645` |
| — | Pilih-banyak, kebab baris, strip meta kartu | ✅ `7f43fa2` |
| — | Toggle kartu⇄tabel Kasir Riwayat | ✅ `5f01868` |
| — | Label kalimat ala EAS + kelas mati dicabut | ✅ `0c80879` |
| — | Studio & sisa judul | ✅ |

### Enam hal yang berbeda dari rencana

**1. Skala jarak bernama tidak bisa dipasang.** §2c merencanakan sembilan
`--spacing-*` dari design.md. Itu merusak 126 tempat: di Tailwind v4
namespace `--spacing-*` juga menyelesaikan `max-w-*` / `w-*` / `h-*`, jadi
`--spacing-md: 20px` membajak `max-w-md` dari 28rem menjadi 20px. Ketahuan
saat kotak pencarian menciut jadi lingkaran. Dicabut; nilainya tetap
dituruti lewat `p-1..p-12` bawaan yang angkanya memang sama. Jebakannya
dicatat di `globals.css`.

**2. Seksi Pengaturan bukan halaman berkartu.** §3 fase 3 merencanakan
Simpan pindah ke `CardFooter` di "Pengaturan, Studio". Kesembilan seksi
Pengaturan ternyata `StepWizard` + `WizardNav` — wizard bertahap. Aturan
§2f sendiri berlaku: "Lanjut/Kembali" milik seluruh langkah, jadi
`WizardNav` yang benar di sana. Bilahnya tetap dibangun dan dipakai
Langganan.

**3. Kelas `group-data-[collapsible=icon]:*` di `sidebar.tsx` mati.**
Sidebar repo ini sudah dimodifikasi jadi overlay-hover dengan grup
BERNAMA (`group/sidebar`), sementara kelas bawaan shadcn mencari grup
tanpa nama. Tidak ketahuan selama nol `SidebarGroupLabel` dipakai; langsung
terlihat begitu label pertama masuk dan terpotong jadi "STOR". Diperbaiki
di `06849f7`.

**4. Arah elevasi terbalik dan garis kartu tak pernah tergambar.** §2b versi
pertama memasang bingkai sebagai permukaan paling pekat, dan `--border` gelap
`#1a1a1a` yang identik dengan `--card`. Diperbaiki di `966a30c`; tabel §2b
sudah versi yang benar.

**5. `SidebarMenuButton` menyembunyikan SEMUA `<span>` anak langsung.**
`[&>span]:hidden [&>span]:group-hover/sidebar:inline` — benar untuk label,
salah untuk tanda gambar. Kotak brand dan avatar dipindah ke `<div>`, persis
seperti contoh resmi shadcn.

**6. `sidebar.tsx` sudah dimodifikasi sampai memutus kontraknya sendiri.**
Varian desktopnya overlay-hover dengan `data-state="collapsed"` dipatok, jadi
`SidebarTrigger` tidak berfungsi, `useSidebar().state` berbohong, pintasan
Ctrl/Cmd+B jadi hiasan, dan enam kelas `group-data-[collapsible=icon]:*` mati.
Dikembalikan ke perilaku resmi di `ea76645`, dan tambalan `group-hover/sidebar:`
dari commit sebelumnya dicabut.

**7. `CollectionToolbar` TIDAK dipasang di Kasir Riwayat.** Roadmap
menyebutnya sisa pekerjaan; setelah diperiksa, Riwayat sudah punya pencarian
debounce sisi-SERVER plus filter status, rentang tanggal, dan paginasi server.
Menggantinya dengan penyaring sisi-klien yang generik akan menurunkan
kemampuannya. Yang dipakai ulang hanya `useCollectionView`.

**8. `tracking-widests` bukan kelas Tailwind.** Tigabelas label memakainya —
satu huruf `s` kelebihan. Diverifikasi tidak muncul sama sekali di CSS
terbangun. Dicabut seluruhnya di `0c80879`.

### Sisa pekerjaan

- **Adopsi `field.tsx`** (`Field`/`FieldLabel`/`FieldDescription`/`FieldError`)
  di ~45 berkas yang masih membungkus sendiri dengan `space-y-1.5`. Sengaja
  DITUNDA: nilai visualnya sudah didapat lewat penyeragaman label di
  `0c80879`, sementara mengganti pembungkus di 45 formulir sekaligus adalah
  perubahan mekanis besar dengan risiko tata letak yang nyata dan payoff
  yang tidak terlihat. Layak dikerjakan per-formulir saat formulirnya
  memang sedang disentuh, bukan sebagai sapuan tunggal.
- **`CollectionToolbar` untuk Kasir Stok** — Stok punya pencarian sendiri;
  perlu diperiksa dulu apakah sisi-server seperti Riwayat.
- **Setup-store**: sudah ikut penyeragaman label, belum disisir per layar.

---

## 0. Delapan keputusan yang sudah diambil

| # | Keputusan | Konsekuensi terbesar |
|---|---|---|
| 1 | **Geist → Inter + JetBrains Mono** | Global, kena marketing juga — tipografi fondasi, tidak bisa di-scope per permukaan |
| 2 | **Dua tema digarap serius** | Gelap dan terang sama-sama pakai token design.md, arah terbalik |
| 3 | **Pil penuh di field DAN tombol** | Dashboard punya dialek bentuk sendiri |
| 4 | **Fokus form/field** | Pengaturan, Produk, Studio, Setup-store — kasir ikut untuk daftar/grid |
| 5 | **Pakai `components/ui` yang ada, modifikasi penuh** | Nol komponen baru (§2a) |
| 6 | **Sidebar inset, gelap total** | `variant="inset"` memaksa tiga tingkat elevasi (§2b) |
| 7 | **Tombol Simpan = `CardFooter`** | `WizardNav` mengambang dipensiunkan di halaman berkartu (§2d) |
| 8 | **Warna & ritme 100% dari design.md** | Nol hex karangan — koreksi terhadap draf sebelumnya (§2b) |

### Koreksi terhadap draf sebelumnya

Draf kemarin mengusulkan `#0a0a0b` / `#0e0e10` / `#141416` untuk tiga lapis
gelap. **Itu hex karangan, dan salah.** design.md sudah punya tangga gelapnya
sendiri, dan ternyata cukup untuk tiga lapis tanpa menambah satu nilai pun —
lihat §2b.

Draf kemarin juga menanyakan tinggi field 44px. **Pertanyaan itu tidak perlu
ditanyakan**: design.md sudah menjawabnya sendiri di resep komponennya —

```yaml
text-input:
  rounded: "{rounded.md}"
  padding: 12px 16px
  height: 44px          # ← 44px, tertulis di spec
```

Jadi 44px bukan tafsiran dari screenshot; ia angka spec. Yang diambil dari
EAS cuma radiusnya (pil, bukan `md`).

---

## 1. Ketegangan inti: satu `Button`, dua dialek

`Button`, `Input`, `Textarea`, `Select`, `Card` dipakai bersama oleh marketing
(8px) dan dashboard (pil). Tiga cara menyelesaikannya, dua di antaranya salah:

| Cara | Kenapa ditolak |
|---|---|
| Prop `shape="pill"` di tiap pemanggil | 115 `<Input>` + 77 `<Button>` + 31 `<Textarea>` = 223 tempat, dan tempat ke-224 yang ditulis besok pasti lupa |
| Komponen kembar (`AppInput` vs `Input`) | Dua sumber kebenaran yang perlahan menyimpang — penyakit yang `FormPanel` dan `KasirPageShell` dibuat untuk menyembuhkan |
| **Token bentuk yang di-scope permukaan** | **Dipilih** — nol perubahan di pemanggil, satu tempat memutuskan |

```css
/* dialek baku — marketing, legal, storefront */
:root {
  --shape-field:   var(--radius-md);    /*  8px, {rounded.md}  */
  --shape-control: var(--radius-md);    /*  8px                */
  --shape-panel:   var(--radius-lg);    /* 12px, {rounded.lg}  */
  --field-height:  2.75rem;             /* 44px, {text-input.height} */
}

/* dialek EAS — hanya di dalam cangkang dashboard */
[data-surface="app"] {
  --shape-field:   var(--radius-pill);  /* {rounded.pill} */
  --shape-control: var(--radius-pill);
  --shape-panel:   var(--radius-xl);    /* 16px, {rounded.xl} */
}
```

`data-surface="app"` dipasang **satu kali** di `dashboard-shell.tsx`.

> **Catatan urutan.** `:root` dan `[data-surface="app"]` sama-sama
> spesifisitas 0,1,0 — yang menang urutan sumber. Blok `[data-surface]`
> **wajib** ditulis setelah `:root`. Ditulis sebagai komentar di berkasnya,
> bukan diingat.

---

## 2a. Nol komponen baru — semuanya sudah ada

Diperiksa satu per satu di `src/components/ui/`. Tidak ada satu pun pola EAS
yang menuntut komponen baru.

| Pola EAS | Komponen | Status |
|---|---|---|
| Field pil | `input.tsx` | ubah radius/tinggi → token |
| Textarea | `textarea.tsx` | ubah radius → token |
| Dropdown urutkan | `select.tsx` / `dropdown-menu.tsx` | ✓ |
| Pencarian berikon | `input-group.tsx` | sudah punya addon depan/belakang |
| Tombol pil | `button.tsx` | ubah radius → token |
| **Label + field + deskripsi + error** | **`field.tsx`** | **lengkap, cuma dipakai 5 berkas kasir** |
| **Bilah aksi kaki kartu** | **`card.tsx` → `CardFooter`** | **sudah ada, tinggal digayakan** |
| Sidebar inset | `sidebar.tsx` → `variant="inset"` | **didukung penuh** |
| Label grup sidebar | `sidebar.tsx` → `SidebarGroupLabel` | ada, **belum dipakai sama sekali** |
| Kepala sidebar (switcher) | `sidebar.tsx` → `SidebarHeader` | ada, **belum dipakai** |
| Toggle grid ⇄ daftar | `toggle-group.tsx` | ✓ dipakai kasir, belum di produk |
| Tab + lencana hitung | `tabs.tsx` + `badge.tsx` | ✓ |
| Baris daftar + kepala kolom | `table.tsx` | ✓ |
| Menu kebab | `dropdown-menu.tsx` | ✓ |
| Avatar kotak membulat | `avatar.tsx` | ✓ |
| Centang pilih-semua | `checkbox.tsx` | ✓ |
| Keadaan kosong | `empty.tsx` | ✓ (5 pemakai) |
| Halaman berikutnya | `pagination.tsx` | ✓ (1 pemakai) |
| Lipatan seksi | `collapsible.tsx` | ✓ (1 pemakai) |
| Lencana terverifikasi | `badge.tsx` | ✓ |

Dua baris tebal mengubah bentuk roadmap ini.

**`field.tsx` sudah punya seluruh tata bahasa field EAS** — `Field`,
`FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`,
`FieldLegend`, `FieldSeparator`, `FieldContent`, `FieldTitle`. Tapi cuma lima
berkas kasir memakainya; Pengaturan, Produk, dan Studio masih menulis
`<Label>` + `<Input>` telanjang. Jadi fase 2 bukan "bikin input jadi pil",
melainkan **mengadopsi `Field` sebagai tata bahasa** — pil-nya ikut gratis.

**`CardFooter` sudah ada.** Draf pertama mengusulkan `CardActionBar` baru; itu
salah dan dicabut. Bilah aksi EAS adalah `CardFooter` yang digayakan.

---

## 2b. Elevasi tiga lapis — semuanya dari design.md

`sidebar.tsx` sudah mendukung inset penuh:

```diff
  // dashboard-sidebar.tsx — perubahan totalnya sebaris
- <Sidebar collapsible="icon">
+ <Sidebar variant="inset" collapsible="icon">
```

Sisanya ter-wire shadcn sendiri, terverifikasi di berkasnya:

```
SidebarProvider  →  has-data-[variant=inset]:bg-sidebar          (latar terluar)
SidebarInset     →  m-2 ml-0 rounded-xl shadow-sm bg-background  (panel isi)
```

Inset **memaksa tiga tingkat elevasi**. design.md menyediakan ketiganya —
tidak ada nilai baru yang perlu dikarang:

> **DIKOREKSI setelah dilihat hasilnya.** Tabel di bawah ini sudah versi
> yang benar. Versi pertama memasang arahnya TERBALIK — bingkai paling pekat,
> halaman lebih terang — dan `--border` gelapnya kebetulan sama persis dengan
> `--card`, jadi tidak ada satu pun garis kartu yang benar-benar tergambar.

| Lapis | Token CSS | Gelap | dari design.md | Terang | dari design.md |
|---|---|---|---|---|---|
| **Halaman** (panel inset) | `--background` | `#000000` | `{colors.primary}` | `#f0f0f3` | `{colors.surface-strong}` |
| Bingkai + rel sidebar | `--sidebar` | `#1a1a1a` | `{colors.surface-dark-elevated}` | `#ffffff` | `{colors.surface-card}` |
| Kartu | `--card` | `#171717` | `{colors.surface-dark}` | `#ffffff` | `{colors.surface-card}` |
| Garis | `--border` | `on-dark` 12% | diturunkan — spec tidak punya hairline gelap | `#dcdee0` | `{colors.hairline-strong}` |

**Halaman yang paling pekat, bukan bingkainya.** Yang membuat kartu terbaca
sebagai kartu bukan bayangannya, melainkan jarak nada ke permukaan di
bawahnya. Sidebar dan kartu duduk di tingkat yang sama — keduanya benda yang
mengambang di atas halaman.
| Teks | `--foreground` | `#ffffff` | `{colors.on-dark}` | `#171717` | `{colors.ink}` |
| Teks sekunder | `--muted-foreground` | `#b0b4ba` | `{colors.on-dark-soft}` | `#60646c` | `{colors.body}` |

**Itulah "gelap total" yang benar.** Latar terluarnya bukan abu gelap
karangan — ia `#000000`, voltase merek itu sendiri, dipakai sebagai tanah.
Dan panel inset-nya `surface-dark` persis seperti kartu fitur gelap dan blok
kode di halaman marketing. Satu sistem, dua permukaan.

Terang memakai struktur identik dengan arah terbalik: latar terluar abu,
panel sedikit abu, kartu putih bersih. Langkah elevasinya sama, jadi terang
bukan sisa.

Semua di-scope `[data-surface="app"]`, jadi marketing gelap tetap memakai
`#171717` sebagai kanvas seperti sekarang.

---

## 2c. Ritme — skala jarak design.md, bukan angka bebas

design.md memberi sembilan langkah bernama. Sekarang repo cuma punya
`--spacing-section`; sisanya kebetulan cocok dengan bawaan Tailwind, dan
"kebetulan cocok" bukan ritme.

| Nama | Nilai | Tailwind | Dipakai untuk |
|---|---|---|---|
| `xxs` | 4px | `1` | jarak label ke ikon |
| `xs` | 8px | `2` | jarak dalam kelompok field |
| `sm` | 12px | `3` | padding vertikal field (`{text-input}`) |
| `base` | 16px | `4` | padding horizontal field |
| `md` | 20px | `5` | padding blok kode & kartu langkah |
| `lg` | 24px | `6` | padding kartu (`{feature-card}`), jarak antar panel |
| `xl` | 32px | `8` | padding kartu harga, jarak antar kartu |
| `xxl` | 48px | `12` | jarak antar kelompok kartu |
| `section` | 96px | `24` | ritme seksi |

Ditulis sebagai `--spacing-*` supaya `p-lg`, `gap-xl`, `py-section` menjadi
nama yang berarti, bukan angka yang harus dicocokkan ulang tiap kali.

Ukuran dari resep komponen design.md yang juga dipasang:

| Resep | Nilai | Dipakai untuk |
|---|---|---|
| `text-input.height` | 44px | tinggi field — menjawab pertanyaan draf lalu |
| `text-input.padding` | 12px 16px | padding field. **Satu penyimpangan:** radius pil (22px) menuntut padding kiri ≥20px supaya teks tidak menempel lengkungan. Jadi 12px 20px di dalam `[data-surface="app"]` |
| `top-nav.height` | 64px | tinggi `SidebarHeader` dan bilah kepala halaman |
| `workflow-step-icon` | 32px, `md`, `surface-strong` | keping ikon kecil |
| `ecosystem-tile` | 64px, `md` | **avatar proyek EAS persis segini** — dipakai kartu produk mode grid |
| `badge-pill.padding` | 4px 10px | ✓ sudah dipasang |
| `button-primary` | 40px, 10px 18px | ✓ sudah dipasang di `size="lg"` |

---

## 2d. Paritas penuh EAS ↔ repo — 43 pola, disisir per wilayah

Ini jawaban untuk "apa lagi yang kelewat". Disisir dari lima screenshot,
wilayah demi wilayah, lalu dicari padanannya di repo. Kolom **Status**:
✅ sudah ada & bentuknya benar · 🟡 ada tapi bentuk/pemakaiannya beda ·
❌ belum ada sama sekali.

### A. Sidebar — 13 pola

| # | Pola EAS | Repo sekarang | Status |
|---|---|---|---|
| A1 | Logo + wordmark di kepala sidebar | tidak ada di sidebar (logo cuma di navbar marketing) | ❌ |
| A2 | Ikon lonceng + cari di baris kepala | tidak ada | ❌ |
| A3 | Pemilih akun (avatar + nama + chevron) | tidak ada — **dan tidak perlu**, lihat catatan | — |
| A4 | Pemilih proyek (ikon folder + chevron) | tidak ada — **dan tidak perlu** | — |
| A5 | Item aktif: latar terisi halus, rounded, ikon + label | `SidebarMenuButton isActive` ✓ tapi **ikon saja, tanpa label** | 🟡 |
| A6 | Item diam: ikon + label muted | ikon saja | 🟡 |
| A7 | Label grup huruf-besar mungil (`ACCOUNT`, `SETTINGS`) | `SidebarGroupLabel` ada, **nol pemakai** | ❌ |
| A8 | Item tanpa ikon, menjorok (kredensial) | tidak ada | ❌ |
| A9 | Kaki sidebar: chip user + kebab | `SidebarFooter` dipakai, isinya tombol Pengaturan | 🟡 |
| A10 | "← Back to dashboard" di halaman settings | tidak ada | ❌ |
| A11 | Grup "ON THIS PAGE" = nav jangkar dalam halaman | daftar seksi Pengaturan ada, tapi **di badan halaman, bukan sidebar** | 🟡 |
| A12 | Grup "DANGER ZONE" bernada destruktif | tidak ada | ❌ |
| A13 | Sidebar inset — panel isi mengambang | `collapsible="icon"`, bukan inset | 🟡 |

> **A3/A4 gugur, diverifikasi bukan diasumsikan.** EAS punya dua pemilih
> karena satu akun bisa memiliki 42 proyek. Fibidy tidak: API-nya `/tenants/me`
> — tunggal, tanpa endpoint daftar, dan `use-tenant.ts` mengembalikan satu
> objek. Menyalin pemilih ke sini menghasilkan dropdown yang isinya selalu satu
> baris. `SidebarHeader` cukup diisi logo + nama toko.

### B. Kepala konten — 6 pola

| # | Pola EAS | Repo sekarang | Status |
|---|---|---|---|
| B1 | Tab ikon + label + lencana hitung (`Projects 42`) | `tabs.tsx` ✓, tapi tanpa lencana hitung | 🟡 |
| B2 | Aksi utama kanan atas (pil putih + `+`) | `PageHeader` punya slot `children` ✓ | ✅ |
| B3 | Label di atas kontrol (`Search project`, `Sort list`) | tidak ada — kontrol berdiri telanjang | ❌ |
| B4 | Pencarian pil berikon depan | `kasir-search-field.tsx` ✓ — **tapi Produk tidak punya pencarian** | 🟡 |
| B5 | Dropdown urutkan (`Activity ▾`) | **nol kontrol urutkan di seluruh dashboard** | ❌ |
| B6 | Toggle tampilan grid ⇄ daftar | **tidak ada** — lihat §2e | ❌ |

### C. Tampilan daftar — 5 pola

| # | Pola EAS | Repo sekarang | Status |
|---|---|---|---|
| C1 | Baris kepala kolom (`Project · Slug · Latest activity`) | `TableHeader` dipakai di riwayat kasir ✓ | 🟡 |
| C2 | Bilah massal: "Select all" + "Delete" | **nol pilih-banyak di seluruh dashboard** | ❌ |
| C3 | Baris: centang + avatar + nama + meta + kebab | `KasirRowCard` mendekati, tanpa centang & kebab | 🟡 |
| C4 | Pemisah baris hairline | ✓ | ✅ |
| C5 | Wadah membulat mengelilingi tabel | tabel telanjang | 🟡 |

### D. Tampilan grid — 5 pola

| # | Pola EAS | Repo sekarang | Status |
|---|---|---|---|
| D1 | Kartu `rounded-xl` + garis + kebab pojok | `product-grid-card.tsx` ✓ tanpa kebab | 🟡 |
| D2 | Avatar 64px kotak membulat di tengah | gambar produk penuh, bukan avatar | 🟡 |
| D3 | Nama tebal + slug muted | ✓ | ✅ |
| D4 | **Strip kaki kartu berisi meta** (ikon + status build) | tidak ada | ❌ |
| D5 | Kartu tautan promo (`FEATURED` / `BLOG` / `CHANGELOG`) | tidak ada | ❌ |

### E. Halaman pengaturan — 9 pola

| # | Pola EAS | Repo sekarang | Status |
|---|---|---|---|
| E1 | Judul halaman besar tebal | `PageHeader` `text-2xl` — belum pakai token display | 🟡 |
| E2 | Kartu: judul + deskripsi + tombol aksi di kanan kepala | `CardHeader` + `CardAction` ada ✓, belum dipakai begitu | 🟡 |
| E3 | Avatar dengan lencana pensil edit | `image-slot.tsx` mendekati | 🟡 |
| E4 | Body dengan tautan biru sebaris | ✓ (`text-link` dari pekerjaan lalu) | ✅ |
| E5 | Grid field dua kolom | `PANEL_FIELDS_2` ✓ | ✅ |
| E6 | **Bilah kaki kartu berisi Simpan rata kanan** | `CardFooter` ada, **nol pemakai sebagai bilah aksi** | ❌ |
| E7 | Simpan aktif = pil putih; nonaktif = pil abu | `disabled:opacity-50` — EAS memakai warna beda, bukan opasitas | 🟡 |
| E8 | Baris nilai + lencana "Verified" hijau | `badge.tsx` ✓, `semantic-success` ✓ — belum dirangkai | 🟡 |
| E9 | Kartu bertumpuk berjarak seragam | `PANEL_GRID` ✓ | ✅ |

### F. Lintas wilayah — 5 pola

| # | Pola EAS | Repo sekarang | Status |
|---|---|---|---|
| F1 | Keadaan kosong bergambar + aksi | `empty.tsx` ✓, 5 pemakai — sudah seragam sejak commit `4de17f1` | ✅ |
| F2 | Halaman berikutnya | `pagination.tsx` ✓, **1 pemakai** (riwayat) | 🟡 |
| F3 | Lipatan seksi | `collapsible.tsx` ✓, **1 pemakai** (laporan) | 🟡 |
| F4 | Gulir kustom (batang tipis) | `hide-scrollbar` ada, gaya batang tidak | ❌ |
| F5 | Kartu bernada destruktif (Danger zone) | `destructive` token ✓, pola kartunya belum | ❌ |

### Rekap

| Status | Jumlah | Artinya |
|---|---|---|
| ✅ sudah benar | 7 | tidak perlu disentuh |
| 🟡 ada, bentuk beda | 19 | ubah gaya / rangkai ulang |
| ❌ belum ada | 15 | perlu dirangkai dari komponen yang sudah ada |
| — gugur | 2 | tidak berlaku untuk model data Fibidy |
| **total** | **43** | |

**Nol dari 41 pola yang berlaku menuntut komponen `ui/` baru.** Lima belas
yang ❌ semuanya rangkaian dari `checkbox` + `table` + `dropdown-menu` +
`toggle-group` + `sidebar` + `card` yang sudah ada di folder.

---

## 2e. Grid ⇄ daftar — yang lu tunjuk, dan kenapa ia bukan sekadar toggle

Keadaan sekarang, terukur:

| Halaman | Bentuk | Toggle? |
|---|---|---|
| Produk | grid 2→5 kolom, **grid saja** | ❌ tidak ada |
| Kasir Riwayat | kartu di bawah `md`, `<Table>` dari `md` ke atas | ❌ **responsif**, bukan pilihan user |
| Kasir Stok | daftar | ❌ |
| Kasir Papan | grid | ❌ |

Kasir Riwayat sudah menyimpan dua tampilan lengkap — `KasirRowCard` untuk
kartu dan `<Table>` untuk baris — dan memilihnya lewat breakpoint. EAS memilih
lewat **kehendak user**, dan pilihannya diingat.

Jadi pekerjaannya bukan membangun tampilan kedua; **tampilan keduanya sudah
ada di Riwayat**. Yang perlu dibangun:

1. `ToggleGroup` dua ikon (`LayoutGrid` / `List`) — komponennya sudah dipakai
   tiga tempat di kasir, jadi bentuknya sudah ada rujukannya.
2. Penyimpanan pilihan (`localStorage`), supaya tidak balik tiap muat.
3. **Produk butuh tampilan daftarnya dibuat** — sekarang benar-benar cuma grid.
4. Riwayat: breakpoint diturunkan jadi *default*, bukan *aturan* — user boleh
   menimpanya.

---

## 2f. Tombol Simpan — `CardFooter`, dan `WizardNav` pensiun

Keputusan lu: bilah kaki kartu.

Konsekuensi yang perlu ditulis terang-terangan, karena ia mencabut sesuatu
yang punya alasan panjang di repo:

`page-column.tsx` dan `wizard-nav.tsx` memuat ~120 baris komentar yang
menjelaskan kenapa pill mengambang dipilih — `fixed` di bawah `md`, `sticky`
dari `md`, `NAV_PILL_CLEARANCE` `pb-40 md:pb-6` yang menyisakan ruangnya.
Semua itu benar untuk **wizard bertahap**, di mana satu halaman = satu
langkah dan tombolnya "Lanjut", bukan "Simpan".

Jadi pemisahannya begini, bukan salah satu menang total:

| Konteks | Tombol | Alasan |
|---|---|---|
| Halaman berkartu (Pengaturan, Studio) | **`CardFooter`** per kartu | tiap kartu menyimpan dirinya sendiri, seperti EAS |
| Wizard bertahap (Produk, Setup-store) | **`WizardNav`** tetap | "Lanjut/Kembali" milik seluruh langkah, bukan satu kartu |

`NAV_PILL_CLEARANCE` tetap dipakai wizard, dan **dicabut** dari halaman yang
pindah ke `CardFooter` — kalau tidak, halaman Pengaturan menyisakan 160px
kosong di bawah untuk pill yang sudah tidak ada.

---

## 3. Fase

### Fase 0 — Font: Inter + JetBrains Mono · **sudah diverifikasi bisa**

Diuji lebih dulu, bukan diasumsikan: `next/font/google` menembus proxy,
mengunduh 15 berkas woff2, dan membentuk `--font-inter: "Inter","Inter
Fallback"` di CSS terbangun. Probe-nya sudah dicabut.

- `layout.tsx`: `geist/font/*` → `Inter` + `JetBrains_Mono`, kelas variabel
  tetap di `<html>`.
- `globals.css`: `--font-sans` → Inter, `--font-mono` → JetBrains Mono.
- Catatan *fail-loud* ditulis ulang — alasan lamanya gugur, karena situsnya
  memang sudah jatuh ke fallback tanpa ada yang tahu. Gantinya uji otomatis
  yang membaca `getComputedStyle` (§4).
- Copot dependensi `geist` dari `package.json`.
- Kena 126 pemakaian `font-mono`, semuanya otomatis.

**Risiko:** Inter punya tinggi-x lebih besar dari Geist. Tracking display
mungkin perlu disetel ulang. Diukur setelah fase ini, bukan ditebak sekarang.

### Fase 1 — Token: bentuk, ritme, elevasi, inset

- `--shape-*` / `--field-height` di `:root` dan `[data-surface="app"]`.
- **`--radius-pill: 9999px` belum ada** dan dibuat di sini. Tangga radius
  kemarin berhenti di `--radius-4xl`; `rounded-full` selama ini datang dari
  bawaan Tailwind, bukan token repo. Menuliskannya membuat pil jadi keputusan
  tercatat, bukan efek samping.
- Sembilan `--spacing-*` bernama dari design.md (§2c).
- Elevasi tiga lapis gelap & terang (§2b) — **hanya token design.md**.
- `dashboard-shell.tsx`: `data-surface="app"`.
- `dashboard-sidebar.tsx`: `variant="inset"`.
- **Perubahan visual di fase ini hanya inset + elevasi.** Token bentuk belum
  dibaca siapa pun, jadi field dan tombol belum bergerak. Bisa di-rollback
  tanpa menyentuh satu formulir pun.

### Fase 2 — Tata bahasa `Field` + primitif jadi pil

Tujuh berkas primitif, menjangkau 223+ instans:

| Berkas | Yang berubah |
|---|---|
| `ui/input.tsx` | radius + tinggi 44px + padding → token |
| `ui/textarea.tsx` | radius → `--shape-panel` |
| `ui/select.tsx` | trigger → `--shape-field`, konten → `--shape-panel` |
| `ui/button.tsx` | radius → `--shape-control` |
| `ui/input-group.tsx` | radius + `calc(var(--radius) - 5px)` yang kini jadi 3px |
| `ui/combobox.tsx` | trigger + popover |
| `ui/command.tsx` | kotak pencarian |

**Textarea sengaja tidak jadi pil.** Pil pada kotak multi-baris menaruh
lengkungan tepat di tempat teks mulai, dan baris pertama terpotong secara
optis. EAS pun tidak melakukannya.

**Lalu mengadopsi `field.tsx`.** `<Label>` + `<Input>` telanjang diganti
`Field` / `FieldLabel` / `FieldDescription` / `FieldError`. Ini yang membuat
susunan EAS berlaku otomatis alih-alih ditulis ulang di 45 berkas. Lima berkas
kasir sudah memakainya dan jadi rujukan bentuk; 110 `<Label>` menyusul.

> ⚠️ **Risiko terbesar seluruh roadmap.** Ada **57 tempat di luar
> `components/ui/`** yang menyamakan tinggi ke `h-9` manual — tombol di sebelah
> input, ikon di sebelah field, baris toolbar. Menaikkan field ke 44px tanpa
> menyentuh mereka melencengkan 57 baris sekaligus.
>
> Penanganannya: audit ke-57 tempat **sebelum** menaikkan tinggi, pilah mana
> yang "menyamai field" (ikut token) dan mana yang kebetulan `h-9` (dibiarkan).
> Ini pekerjaan terbesar fase 2, bukan ganti radiusnya.

### Fase 3 — `CardFooter` sebagai bilah aksi · **menutup E6, E7, D4**

- `card.tsx` → `CardFooter` digayakan jadi bilah: dipisah hairline, latar
  selangkah lebih gelap dari kartu, isi rata kanan.
- Varian kedua: **strip meta** (D4) — ikon + teks status, tanpa tombol.
- `FormPanel` dapat prop `footer` memakai bilah yang sama.
- Simpan nonaktif memakai **warna beda**, bukan `opacity-50` (E7).
- `NAV_PILL_CLEARANCE` dicabut dari halaman yang pindah ke `CardFooter`.

### Fase 4 — Sidebar penuh · **menutup A1, A2, A5–A12**

Inset sudah masuk di fase 1; fase ini isinya.

- `SidebarHeader`: logo + nama toko, tinggi 64px (`{top-nav.height}`).
  Bukan pemilih — A3/A4 gugur, lihat §2d.
- `SidebarGroupLabel` untuk tiap grup — token `text-caption-uppercase
  caption-uppercase`, sama persis dengan judul `FormPanel` yang sudah benar.
- `collapsible="icon"` tetap, tapi keadaan mengembang **menampilkan label**.
- `SidebarFooter`: chip user + `dropdown-menu` kebab.
- Grup "Zona Berbahaya" bernada `destructive` (A12, F5).
- "← Kembali ke dasbor" di halaman Pengaturan (A10).
- Daftar seksi Pengaturan pindah ke sidebar sebagai "Di halaman ini" (A11).

### Fase 5 — Daftar & grid · **menutup B1–B6, C1–C5, D1–D3**

- `ToggleGroup` grid ⇄ daftar + ingatan `localStorage` (§2e).
- **Produk: bikin tampilan daftarnya** — sekarang benar-benar cuma grid.
- Riwayat: breakpoint jadi *default*, bukan *aturan*.
- Dropdown urutkan (B5) — nol di dashboard sekarang.
- Pencarian di Produk (B4) — pola `kasir-search-field.tsx` dipakai ulang.
- Label di atas kontrol (B3).
- Pilih-banyak + hapus massal (C2) dengan `checkbox.tsx`.
- Lencana hitung di tab (B1).
- Kebab per baris & per kartu (C3, D1).
- Avatar 64px `{ecosystem-tile}` di kartu grid (D2).

### Fase 6 — Sapu bersih per halaman

| Urutan | Area | Berkas |
|---|---|---|
| 1 | Pengaturan | 17 |
| 2 | Produk | 11 |
| 3 | Studio | 8 |
| 4 | Setup-store | 11 |
| 5 | Kasir | 22 |

Sebagian besar akan **otomatis benar** setelah fase 1–5, karena semuanya lewat
`FormPanel` / `FormSection` / `PageColumn`. Fase 6 menyapu sisa yang menulis
markupnya sendiri.

---

## 4. Yang sengaja di luar cakupan

**26 berkas `components/dashboard/blocks/*`.** Blok landing page milik seller
— dirender di **storefront** dengan warna seller, bukan chrome dashboard.
Memberinya dialek EAS akan membuat toko seller terlihat seperti dasbor
developer.

Temuan yang perlu dicatat di sana: **4 dari 26** berkas (`block2`, `block3`,
`block13`, `block19`) memakai `hsl(var(--primary)/…)` untuk cuci radial. Diuji
di browser — sintaks itu menghasilkan **`none`**, bukan warna, baik dengan
oklch lama maupun hex baru. Rusak sejak repo pindah dari token HSL telanjang.
Kecil, perbaikannya juga kecil, bisa nebeng fase mana pun.

**D5 — kartu promo `FEATURED` / `BLOG` / `CHANGELOG`.** EAS punya karena Expo
punya blog dan changelog. Fibidy tidak. Membuat kerangkanya tanpa isi berarti
tiga kotak kosong di dasbor.

**Marketing & legal.** Berhenti di titik ter-push. Satu-satunya yang tetap
menyentuhnya adalah fase 0 (font).

**Storefront.** Tidak disentuh.

---

## 5. Rencana verifikasi

Diukur di build produksi lewat Chromium, bukan dibaca dari kode — cara yang
sama yang menemukan Geist tidak pernah tampil.

| Fase | Yang diukur | Lulus kalau |
|---|---|---|
| 0 | `getComputedStyle(body).fontFamily` | memuat `Inter`, bukan `ui-sans-serif` |
| 1 | `--shape-field` di dalam & luar `[data-surface="app"]` | `9999px` vs `8px` |
| 1 | `--sidebar` / `--background` / `--card` di dashboard gelap | `#000` / `#171717` / `#1a1a1a` — **cocok dengan design.md** |
| 1 | Panel `SidebarInset` | punya `margin` + `border-radius`, beda latar dari pembungkusnya |
| 2 | `borderRadius` + `height` semua field dashboard | pil seragam + 44px |
| 2 | 57 tempat `h-9` yang diaudit | sejajar dengan field di sebelahnya |
| 3 | Bilah kaki: posisi tombol | rata kanan, dipisah hairline |
| 4 | Label grup sidebar | 11px / 600 / 0.88px / uppercase |
| 5 | Toggle grid⇄daftar | pilihan bertahan setelah muat ulang |
| semua | `tsc --noEmit`, `next build`, eslint berkas tersentuh | bersih |
| semua | Screenshot terang & gelap tiap halaman | dibandingkan sebelum/sesudah |

Skrip pengukurnya sudah ada dan tinggal diarahkan ke rute dashboard — perlu
sesi login, jadi fase 0 termasuk menyiapkan seeding sesi untuk Playwright.

---

## 6. Yang masih perlu jawaban lu

Tiga pertanyaan draf lalu **sudah terjawab**: Simpan = `CardFooter` (keputusan
lu), tinggi field 44px (dijawab design.md sendiri di `text-input.height`), dan
pemilih akun/proyek (gugur — `/tenants/me` tunggal, diverifikasi). Sisa dua:

1. **A11 — daftar seksi Pengaturan pindah ke sidebar?** EAS menaruhnya di
   sidebar sebagai "ON THIS PAGE". Repo menaruhnya di badan halaman, dan
   `page-column.tsx` mencatat pemilik produk minta ia tetap satu kolom
   memanjang. Pindah atau tetap?
2. **Urutan fase 6** — gua tulis Pengaturan duluan (paling mirip "User
   settings" EAS). Kalau Produk lebih mendesak, tinggal bilang.

Fase 0 sampai 5 **tidak terhalang** keduanya dan bisa jalan sekarang — A11 cuma
menyentuh satu blok di fase 4, dan urutan fase 6 baru relevan setelahnya.
