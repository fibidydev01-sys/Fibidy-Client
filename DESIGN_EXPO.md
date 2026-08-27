# Sistem Desain — dialek Expo

> **Status: SUDAH DIIMPLEMENTASI.** Seluruh app, bukan cuma halaman marketing.
> Sumber: `expo.design.md` (format spec Google Labs, versi alpha, 12 Mei 2026).
> Branch: `claude/frontend-expo-design-oidgx9` · Agustus 2026

Sebelum ini voltase merek adalah **merah muda** (`oklch(0.656 0.241 354.308)`,
= Tailwind `pink-500`, `#ec4899`), dan seluruh tangga netral ikut ditarik ke
rona merah muda — `--border`, `--muted`, `--accent`, `--sidebar` semuanya
membawa hue 340–354. Sekarang voltasenya **hitam murni** dan netralnya benar-
benar netral.

## Hasil akhir

| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Voltase aksi | `#ec4899` (pink-500) | **`#000000`** (terang) / `#ffffff` (gelap) |
| Netral | ber-hue 340–354 | abu murni (`#f0f0f3`, `#60646c`, `#dcdee0`) |
| Nilai merah muda di `src/` + `public/` | 4 hex berbeda di 7 tempat | **0** |
| Tangga radius | diturunkan dari 1 basis (10px) → `lg`=10, `xl`=14 | eksplisit: 4/6/8/12/16/24 |
| Gaya tipe sebagai token | 0 | **15** (`text-display-mega` … `text-nav-link`) |
| Font yang benar-benar tampil | `ui-sans-serif` (Geist tidak pernah termuat) | **Geist** |
| Ritme seksi marketing | 64/80px | **96px** di md+ |
| Warna chrome PWA | 2 nilai berbeda di 3 berkas | 1 aturan |
| `tsc --noEmit` | bersih | bersih |
| `next build` | sukses | sukses, 48 halaman ter-prerender |
| `eslint` pada berkas tersentuh | — | 0 error |

## 1. Peta token

Semua nilai ada di `src/app/globals.css`, ditulis **hex** supaya bisa
di-diff langsung terhadap `expo.design.md`.

| Slot shadcn | Terang | Token Expo |
|---|---|---|
| `--background` | `#ffffff` | canvas |
| `--foreground` | `#171717` | ink |
| `--card` | `#ffffff` | surface-card |
| `--primary` | `#000000` | primary |
| `--primary-foreground` | `#ffffff` | on-primary |
| `--secondary` / `--accent` | `#f0f0f3` | surface-strong |
| `--muted` | `#f5f5f7` | hairline-soft |
| `--muted-foreground` | `#60646c` | body |
| `--border` / `--input` | `#dcdee0` | hairline-strong |
| `--ring` | `#171717` | ink |

Token Expo yang tidak punya slot shadcn ditulis apa adanya dan diekspos
sebagai utility: `text-ink`, `border-hairline`, `bg-surface-strong`,
`bg-surface-dark`, `text-on-dark-soft`, `text-link`, `text-accent-warning`,
`bg-sky-light`, dan seterusnya.

## 2. Enam penyimpangan dari spec, dengan alasannya

Spec ini ditulis untuk **situs marketing satu halaman**. App ini situs
marketing **plus** dasbor, kasir, dan storefront multi-tenant. Enam tempat
di mana mengikuti spec secara harfiah akan merusak sesuatu:

**1. Font tetap Geist, bukan Inter.** Diputuskan pemilik repo. `globals.css`
sudah memuat catatan *fail-loud* yang menjelaskan kenapa Inter sengaja
dicabut dari rantai fallback; catatan itu lebih berharga daripada kesetiaan
huruf pada satu baris spec. Yang diambil dari spec adalah **skalanya** —
ukuran, bobot 600, dan tracking negatif (−1.92px di 64px). Geist menerimanya
sama baiknya. `code` memakai Geist Mono dengan alasan yang sama seperti
JetBrains Mono di spec: satu keluarga mono di setiap permukaan kode.

**2. Mode gelap dipertahankan.** Spec menyebut dirinya *light-only* dan
memakai gelap sebagai alat kontras di dalam halaman terang. App ini punya
mode gelap sungguhan lewat `next-themes` dengan `enableSystem`, dipakai
orang, dan mencabutnya bukan bagian dari permintaan. Yang dipakai bukan
kanvas Expo melainkan **logika inversinya**: `surface-dark` jadi kanvas,
`surface-dark-elevated` jadi kartu, `on-dark-soft` jadi teks sekunder.
Satu hal wajib membalik — hitam murni di atas `#171717` adalah tombol tak
terlihat, jadi di gelap `--primary` = `#ffffff` dengan tinta gelap di atasnya.
Disiplinnya utuh: tetap satu warna aksi, tanpa aksen jenuh.

**3. `--border` memakai hairline-strong (`#dcdee0`), bukan hairline
(`#f0f0f3`).** Di situs marketing, garis cuma memisahkan kartu. Di sini garis
mengerjakan pekerjaan struktural — tabel kasir, tepi input, pemisah baris —
dan `#f0f0f3` di atas putih itu kontras 1.06:1, praktis hilang. Hairline
halus tetap bisa dipanggil eksplisit lewat `border-hairline`.

**4. Aksi merusak tidak memakai `semantic-error` apa adanya.** Spec cuma
memberi `#eb8e90` — rona lembut untuk garis dan latar peringatan, kontras
2.1:1 dengan teks putih. Tombol "Hapus transaksi" tidak boleh setipis itu,
jadi `--destructive` = `#c8383c` (5.1:1) pada rona yang sama, dan nilai
spec-nya tetap tersedia sebagai `--semantic-error`. Di mode gelap justru
nilai spec yang benar dan dipakai apa adanya.

**5. Tinggi tombol default tetap 36px.** Spec mematok CTA 40px. Ada **57
tempat di luar `components/ui/`** yang menyamakan tinggi ke `h-9` secara
manual; menggeser default akan melencengkan semuanya sekaligus. Jadi CTA
40px milik spec dipasang di `size="lg"` (yang memang sudah 40px dan memang
dipakai CTA marketing), lengkap dengan padding 10/18 dari spec. `default`
36px tetap jadi dialek padat untuk chrome app.

**6. Badge tidak dipaksa huruf besar.** `badge-pill` di spec memakai
`caption-uppercase`, tapi badge di app ini memuat kalimat — "Menunggu
pembayaran", nama kategori produk. Meng-uppercase semuanya merusak isinya.
Pil 9999px dipertahankan (spec memang menyisakan pil khusus badge), dan yang
butuh gaya eyebrow memanggil `text-caption-uppercase caption-uppercase`
secara eksplisit — seperti eyebrow langkah di halaman marketing.

## 3. Warna toko seller tidak ikut berubah

`THEME_COLORS` (Sky, Emerald, Rose, Amber, Violet, Orange) adalah **data
seller**, bukan warna merek. Storefront menimpa `--primary`, `--ring`,
`--sidebar-primary`, dan `--chart-1` lewat `.tenant-theme` di
`src/lib/shared/colors.ts`, jadi toko yang sudah memilih Emerald tetap
Emerald. Yang berubah cuma `DEFAULT_THEME` — jatuh-balik untuk toko tanpa
pilihan warna, dari merah muda platform menjadi hitam/putih.

Konsekuensinya untuk komponen storefront: `text-primary` di
`components/store/**` dan `layout/store/**` **sengaja tidak disentuh** —
di sana ia memang harus mengikuti warna seller.

## 4. Aturan yang dipakai saat menyapu 275 pemakaian `*-primary`

| Peran | Perlakuan |
|---|---|
| Aksi terisi (`bg-primary` di tombol) | **tetap** — itu memang voltasenya |
| Tautan sebaris di body | **→ `text-link`** (`#0d74ce`) |
| Penekanan teks (bukan tautan) | **→ `text-ink`** |
| Keping ikon (`bg-primary/10` + `text-primary`) | **→ `bg-surface-strong` + `text-ink`** |
| Apa pun di dalam storefront | **jangan disentuh** |

Baris kedua yang paling penting: sejak primary = hitam murni,
`text-primary hover:underline` terbaca sebagai teks badan yang kebetulan
bergaris bawah. Spec menaruh biru justru untuk kasus ini — tautan **di
dalam** body copy, tidak pernah di tombol. `variant="link"` pada `Button`
ikut pindah ke `text-link`.

Baris keempat penting karena alasan lain: `bg-primary/10` kebetulan mendarat
di abu yang mirip `surface-strong`, tapi ia bergantung pada opasitas **warna
aksi** — dan itu pecah begitu seller menimpa `--primary` di storefront.

## 5. Temuan sampingan: Geist tidak pernah tampil

Ditemukan saat memverifikasi skala tipe di build produksi, dan **sudah ada
jauh sebelum perubahan ini** — diverifikasi dengan mem-build ulang baseline
dan mengukur DOM-nya.

`--font-geist-sans` dipasang oleh kelas `.variable` milik `next/font`, dan
kelas itu menempel di `<body>`. Tapi `--font-sans` dideklarasikan di `:root`,
dan properti kustom dihitung dari atas ke bawah — `:root` tidak bisa membaca
variabel yang baru lahir di anaknya. Akibatnya
`--font-sans: var(--font-geist-sans), sans-serif` menjadi
*invalid-at-computed-value-time*, menghitung jadi **string kosong**, dan
`font-family: var(--font-sans)` jatuh ke tumpukan preflight Tailwind.

Terukur di build produksi:

```
sebelum:  getComputedStyle(body).fontFamily
          → "ui-sans-serif, system-ui, sans-serif, …"
sesudah:  → "GeistSans, \"GeistSans Fallback\", sans-serif"
```

Fallback fail-loud bekerja persis seperti yang dirancang catatannya; yang
tidak terjadi adalah ada yang menyadarinya. Perbaikannya satu baris:
kelas variabel font pindah dari `<body>` ke `<html>`.

Ini berarti seluruh situs berjalan dengan font sistem selama ini — jadi
**perubahan tipografi yang terlihat setelah rilis ini lebih besar daripada
yang dijanjikan diff-nya**. Itu bukan efek samping dialek Expo; itu Geist
yang akhirnya termuat.

## 6. Verifikasi

Diukur di build produksi lewat Chromium, bukan dibaca dari kode:

| Yang diukur | Hasil |
|---|---|
| `--primary` terang / gelap | `#000` / `#fff` |
| `--background` terang / gelap | `#fff` / `#171717` |
| `--card` gelap | `#1a1a1a` (surface-dark-elevated) |
| `--text-link` terang / gelap | `#0d74ce` / `#47c2ff` |
| `h1` hero desktop | 64px / 600 / −1.92px — `display-mega` persis |
| `h1` hero mobile | 36px / 600 / −1.08px — `display-lg` |
| Radius CTA (7 tombol) | 8px, seragam |
| Tinggi `size="lg"` | 40px |
| CTA primer | `rgb(0,0,0)` + teks putih |
| CTA gelap | `rgb(255,255,255)` + teks `rgb(23,23,23)` |
| Ritme 5 seksi marketing | `padding: 96px` atas & bawah |
| `font-family` body | `GeistSans` |

## Yang belum dikerjakan

- **Hero mockup perangkat** masih iPhone tunggal. Spec memakai komposit
  MacBook + iPhone sebagai chrome halaman. Komponen `safari.tsx` sudah ada
  di repo dan belum dipakai — itu bahan yang dibutuhkan kalau komposit
  benar-benar diinginkan.
- **Timing animasi** (parallax mockup, masuknya hero) di luar cakupan spec,
  jadi tidak ada yang bisa disalin.
- **Blok Studio** (`components/dashboard/blocks/*`, 25 berkas) masih memakai
  `hsl(var(--primary)/0.12)` untuk cuci radial. Sintaks `hsl(var(...))` itu
  **sudah rusak sejak sebelum perubahan ini** — nilai token bukan komponen
  HSL telanjang, jadi ia tidak menghasilkan warna apa pun. Bukan regresi
  baru, tapi layak jadi pekerjaan berikutnya.
- **`--radius` 8px** sekarang dibaca langsung oleh `sonner` dan
  `input-group` lewat `calc(var(--radius) - 5px)` = 3px. Nilainya masuk
  akal, tapi belum ada yang memeriksanya secara visual.
