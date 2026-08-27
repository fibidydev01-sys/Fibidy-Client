# ROADMAP — RICH TEXT DESKRIPSI PRODUK

Syaratmu: **hemat server, tanpa kerja server yang mahal**, dan **fondasi
solid**. Dua syarat itu yang menentukan seluruh rencana ini, bukan library
mana yang paling enak dipakai.

Semua angka di sini **diukur**, bukan dikutip. Cara mengukurnya ada di
`RESEARCH_RICH_TEXT.md`.

---

## Keputusan inti: simpan MARKDOWN, bukan HTML

| | Simpan HTML | **Simpan Markdown** |
|---|---|---|
| Ubah `SanitizePipe` | wajib | **tidak** |
| Pustaka sanitasi di server | wajib (`sanitize-html`) | **tidak** |
| `@MaxLength(1000)` | wajib diubah (hitung teks) | **tidak — tetap benar** |
| Migrasi data lama | perlu | **tidak — teks polos SUDAH markdown sah** |
| Total kerja server | **mahal** | **nol baris produksi** |

Diuji langsung ke server yang berjalan (Postgres + NestJS + login sungguhan),
`POST /api/products`:

```
DIKIRIM   : Diskon > 50% & stok < 10. **Tebal** _miring_\n- Panas\n- Dingin
TERSIMPAN : Diskon &gt; 50% & stok &lt; 10. **Tebal** _miring_\n- Panas\n- Dingin
```

Markdown-nya **utuh byte per byte**. 7 dari 9 konstruksi markdown lolos
`SanitizePipe` tanpa perubahan sama sekali — yang berubah cuma kutipan (`>`)
dan `<`/`>` di teks biasa.

Itu bukan kebetulan: markdown tidak mengandung `<` atau `>`, dan justru itu
satu-satunya yang di-encode pipe tersebut. **Formatnya cocok dengan pertahanan
yang sudah ada, bukan melawannya.**

---

## Bonus: satu bug yang sudah jalan hari ini ikut sembuh

Perhatikan baris di atas: `Diskon > 50%` tersimpan sebagai `Diskon &gt; 50%`.
Etalase merender `{product.description}` sebagai **teks** — jadi pembeli hari
ini melihat harfiah `Diskon &gt; 50%`. Penjual yang menulis `<` atau `>` sudah
kena sekarang, lepas dari rich text.

Begitu deskripsi dirender sebagai markdown, entitas itu **kembali jadi
karakter aslinya**. Diuji:

```
sumber : Diskon &gt; 50%, stok &lt; 10
render : <p>Diskon &gt; 50%, stok &lt; 10</p>   → di layar: Diskon > 50%, stok < 10
```

Bug lama hilang tanpa menyentuh server.

---

## ⚠️ Jebakan terbesar: `remark-breaks` WAJIB

Ini yang paling mudah terlewat dan paling merusak. Deskripsi lama ditulis
dengan tombol Enter biasa. Markdown **tidak** menganggap satu baris baru
sebagai ganti baris.

Diuji pada deskripsi bergaya lama:

```
sumber              : Kopi susu gula aren\nPanas atau dingin\nBisa tanpa gula

tanpa remark-breaks : <p>Kopi susu gula arenPanas atau dinginBisa tanpa gula</p>
dengan remark-breaks: <p>Kopi susu gula aren<br/>Panas atau dingin<br/>Bisa tanpa gula</p>
```

Tanpa plugin itu, **setiap deskripsi produk yang sudah ada** di seluruh
etalase berubah jadi kata-kata yang dempet. Biayanya cuma **0,5 KB gzip**.
Bukan opsional.

---

## Pilihan pustaka — dan yang dicoret

### Perender di etalase publik (diukur, gzip, react dikecualikan)

| Pustaka | Ukuran | Putusan |
|---|---|---|
| `react-markdown` | 35,2 KB | dasar |
| + `remark-breaks` | **35,6 KB** | **DIPAKAI** — wajib, lihat di atas |
| + `remark-gfm` | 45,9 KB | **DICORET** — +10,3 KB untuk tabel & coretan yang tidak dipakai deskripsi produk |
| `marked` | 12,3 KB | dicoret — butuh `dangerouslySetInnerHTML` |
| `snarkdown` | 0,9 KB | **DICORET — tidak aman**, lihat bawah |

### Kenapa yang 0,9 KB dicoret

Menggoda, tapi ia mengeluarkan string HTML yang harus dipasang lewat
`dangerouslySetInnerHTML`. Diuji berdampingan:

| Serangan | `react-markdown` | `snarkdown` |
|---|---|---|
| `[klik](javascript:alert(1))` | `<a href="">` | `<a href="javascript:alert(1">` |
| `[klik](javascript&#58;alert(1))` | `<a href="">` | `<a href="javascript&#58;alert(1">` |
| `<img src=x onerror=alert(1)>` | di-escape jadi teks | **diteruskan hidup-hidup** |

Baris kedua penting: `javascript&#58;` **lolos** dari `SanitizePipe` (regexnya
cuma mencocokkan `javascript:` harfiah). Jadi bertumpu pada pipe itu sebagai
satu-satunya pertahanan memang bocor.

`react-markdown` aman **secara struktur** — ia membangun pohon elemen React,
tidak pernah HTML mentah, dan menyaring protokol URL. Ini akan jadi konten
buatan pengguna **pertama** yang dirender sebagai markup di etalase publik.
35,6 KB untuk keamanan yang tidak bergantung pada tebakan regex itu murah.

### Editor di dashboard

`@tiptap/markdown` **resmi** — bukan `tiptap-markdown` komunitas yang
direkomendasikan laporan sebelumnya:

| | `tiptap-markdown` (komunitas) | **`@tiptap/markdown` (resmi)** |
|---|---|---|
| Rilis terakhir | 2025-09-08 (11 bulan lalu) | **2026-08-24 (hari ini)** |
| Maintainer | 1 | **6 (tim ueberdosis)** |
| Repo | pribadi | `github.com/ueberdosis/tiptap` |
| Lisensi | MIT | **MIT** — bukan ekstensi Conversion berbayar |

Penulis paket komunitas itu sendiri menyatakan tidak akan merilis v1 maupun
menangani issue yang ada; Tiptap merilis ekstensi resminya di 3.7.0.

**Biaya bundel Tiptap: 141 KB gzip.** Besar — dan di situlah idemu soal
Step 2 menyelamatkan keadaan.

---

## Idemu soal Step 2 ternyata memecahkan masalah bundel

Form produk sekarang **2 langkah**: `details` → `cover`.
Rencana: **3 langkah** — `details` → **`deskripsi`** → `cover`.

**Dikonfirmasi:** editor teks di Step 2, gambar sampul geser ke Step 3.

Yang tidak kamu sebut tapi ikut didapat: **langkah terpisah adalah batas
code-split yang alami.** Editor 141 KB itu dimuat lewat `dynamic()` dan baru
diunduh saat penjual benar-benar membuka Step 2. Yang cuma mengubah harga
tidak pernah membayarnya.

Jadi 141 KB itu bukan biaya tetap, melainkan biaya sesuai pemakaian.

---

## Urutan eksekusi

```
R1  Fondasi: kontrak format + tes penjaga        ← tanpa UI
R2  Perender di etalase (react-markdown)         ← nilai mandiri, mundur-kompatibel
R3  Jalur teks-polos: SEO, JSON-LD, WhatsApp
R4  Step 2 baru: pindahkan deskripsi
R5  Editor Tiptap di Step 2, dimuat malas + gerbang tier
R6  Verifikasi terukur
```

**Kenapa perender lebih dulu, bukan editor.** R2 bekerja penuh pada deskripsi
teks polos yang sudah ada — nol migrasi — dan langsung memperbaiki bug `&gt;`
di atas. Kalau R5 batal atau ditunda, R2 tetap berguna dan tetap benar. Kalau
editornya dikerjakan duluan, penjual bisa menulis markdown yang belum bisa
dirender siapa pun.

### R1 — Fondasi

Satu berkas kontrak di klien yang menuliskan keputusan formatnya: markdown,
subset terbatas (tebal, miring, daftar, tautan, judul kecil), disimpan apa
adanya, dihitung apa adanya.

**Satu-satunya sentuhan ke server: sebuah TES**, bukan kode produksi. Satu
unit test pada `SanitizePipe` yang menegaskan markdown lolos utuh. Tanpa itu,
seluruh arsitektur ini bergantung pada perilaku yang tidak ada yang menjaganya
— orang berikutnya yang merapikan regex pipe itu bisa mematahkannya diam-diam.
Ini yang dimaksud "fondasi solid" dengan harga paling murah.

### R2 — Perender etalase

Komponen `MarkdownText` sekali, dipakai empat tempat:
`product-actions.tsx` (2 varian) dan `product-preview-drawer.tsx` (2 varian).
`react-markdown` + `remark-breaks`, tanpa `remark-gfm`, di-`dynamic()`.

### R3 — Jalur teks-polos

Deskripsi juga mengalir ke tempat yang **tidak boleh** menerima markup:

- `seo.ts:152` → `<meta name="description">` dan OpenGraph. Tanpa dilucuti,
  `**Kopi Susu**` bocor ke hasil pencarian Google.
- `product-schema.tsx` → JSON-LD.
- Pesan WhatsApp dan `social-share.tsx`.
- `step-preview.tsx:214` memotong di 60 karakter — bisa jatuh di tengah
  sintaks (`**Ko…`).

Butuh satu helper "markdown → teks polos". Kecil, tanpa dependensi baru.

### R4 — Step 2

`stepKeys` dari `['details','cover']` jadi `['details','deskripsi','cover']`,
kunci i18n baru, dan pemetaan scroll-to-error ikut menyesuaikan.

Deskripsi keluar dari `step-details.tsx` — sekaligus melegakan Step 1 yang
sekarang memuat nama, kategori, jenis, harga, harga pembanding, stok, dan stok
minimum.

### R5 — Editor

Tiptap + `@tiptap/markdown`, toolbar dibangun dari `ToggleGroup`, `Separator`,
`Button`, `Tooltip` yang **sudah ada** — sesuai permintaanmu memakai komponen
kita sendiri, dan supaya ikut token tema yang baru diseragamkan.

Tombolnya cukup: **tebal, miring, daftar berpoin, daftar bernomor, tautan.**
Bukan tabel, bukan warna, bukan emoji picker.

`CharCounter` menghitung **string markdown yang disimpan** — sama persis
dengan yang divalidasi `@MaxLength(1000)` di server. Dengan HTML, dua
penghitung itu akan berbeda dan penjual kena tolak tanpa tahu sebabnya. Di
sini selisihnya **nol menurut konstruksi**, bukan karena disamakan manual.

---

## Keputusan — sudah dikunci

### 1. Tiga langkah: `details` → **`deskripsi`** → `cover` ✅

Dikonfirmasi. Editor teks di Step 2, gambar sampul geser ke Step 3.

Langkah terpisah juga jadi batas `dynamic()` yang alami, jadi editor 141 KB
baru diunduh saat penjual benar-benar membuka Step 2.

### 2. Rich text untuk STARTER & BUSINESS. FREE tidak. ✅

Rancangannya:

| Tier | Step 2 menampilkan |
|---|---|
| FREE | `Textarea` polos seperti sekarang + ajakan upgrade |
| STARTER / BUSINESS | Editor Tiptap + toolbar |

Tiga akibat yang enak, dan satu yang harus dijaga.

**Enak.** (a) Teks polos milik penjual FREE **tetap markdown yang sah**, jadi
etalase merendernya lewat jalur yang sama persis — tidak ada dua jalur render.
(b) Saat mereka upgrade, tulisan lama langsung bisa diformat, tanpa konversi.
(c) Jalur `Textarea` tetap hidup sebagai cadangan yang teruji, bukan kode mati.

**Turun tier.** Penjual yang menulis markdown di STARTER lalu turun ke FREE:
datanya **tidak disentuh**, etalase tetap merendernya berformat, dan textarea
menampilkan markdown mentah (`**tebal**`). Jujur dan tidak merusak — tidak ada
yang hilang, dan naik tier lagi mengembalikan editornya.

**Yang harus dijaga — kedipan tier.** `useSubscriptionPlan()` punya
`placeholderData` dengan `tier: 'FREE'`. Artinya **selama query paket masih
memuat, tier terbaca FREE**. Kalau gerbangnya ditulis naif, penjual STARTER
melihat `Textarea` polos sepersekian detik, lalu editornya menggantikan di
bawah tangannya — bisa pas mereka sudah mulai mengetik.

Step 2 wajib **menahan dengan skeleton sampai `isLoading` selesai**, bukan
menebak dari `tier` saja. Ini persis pola yang bikin Mode Dagang macet (lihat
bawah) — bedanya di sana `!config` tidak pernah selesai. Di sini kondisi
berhentinya jelas, jadi aman.

### 3. Batas 1000 karakter: **TETAP** — saya ukur dulu

Diukur pada deskripsi UMKM yang realistis (kopi susu, 5 poin daftar, 1 tautan
WhatsApp):

| | karakter tersimpan |
|---|---|
| Markdown | **311** (ongkos sintaks 47 = 15,1%) |
| Sisa jatah dari 1000 | **689** |
| Kalau HTML | 524 — **69% lebih boros** untuk isi yang sama |

Alasan tetap 1000:

- **Nol perubahan server.** Itu syarat utamamu, dan menaikkannya berarti
  menyentuh DTO tanpa alasan yang terbukti.
- **Masih longgar.** Contoh nyata di atas cuma memakai 31% jatah.
- **Menaikkan batas itu mundur-kompatibel, menurunkan tidak.** Mulai
  konservatif adalah pilihan yang bisa dibatalkan; sebaliknya tidak.

Catatan teknis: kedua kolom `description` di Prisma adalah `String?` →
`text` di Postgres, **tanpa batas panjang di database**. Jadi 1000 murni
aturan DTO dan menaikkannya nanti tidak butuh migrasi sama sekali. Kalau
ternyata sempit di lapangan, itu satu angka yang diganti.

`CharCounter` menghitung **string markdown yang disimpan** — sama persis
dengan yang divalidasi `@MaxLength(1000)`. Selisihnya nol menurut konstruksi.

### 4. Deskripsi toko (`tenant.description`): **TIDAK ikut** — dan bukan sekadar "nanti"

Saya telusuri ke mana ia mengalir, dan jawabannya lebih tegas dari dugaan awal:

```
tenant.description
  → blocks/block.tsx:109  dipakai sebagai SUBTITLE HERO landing Studio
  → 26 berkas blok menyebut description
  → store-footer.tsx:227
  → layout.tsx:62,94 + seo.ts:78 + schema.ts:131  (metadata & JSON-LD)
```

Dua alasan, dan yang kedua lebih penting:

1. **Permukaannya 26 blok landing.** Menjadikannya markdown berarti mengaudit
   seluruh Studio, bukan satu halaman.
2. **Tempatnya memang bukan markdown.** Ia dipakai sebagai **subtitle hero** —
   satu baris tagline di bawah nama toko. Tagline satu baris tidak butuh
   tebal, daftar, atau tautan; yang dibutuhkannya justru **tetap teks polos**
   supaya aman masuk ke `<meta>`, JSON-LD, dan footer tanpa dilucuti.

Jadi ini bukan "produk dulu, toko menyusul". Untuk pemakaian sekarang,
`tenant.description` **sebaiknya tetap teks polos selamanya**. Kalau nanti ada
kebutuhan "Tentang Toko" yang benar-benar panjang, itu field baru dengan
keputusannya sendiri — bukan mendaur ulang subtitle hero.

## Masih terbuka dari fase sebelumnya

**Mode Dagang & Struk macet di skeleton selamanya untuk tenant FREE.**
`GET /api/kasir/config` balas 403, lalu `kasir-mode-dagang.tsx:77` menahan di
`if (isLoading || !config)`. Komponen `KasirPlanGate` sudah ada dan headernya
menyebut persis kasus ini — perbaikannya satu pembungkus. Belum dikerjakan
karena di luar cakupan fase visual.

---

## Pagar verifikasi

- `tsc --noEmit` bersih, `next build` sukses, eslint **nol delta**.
- **Deskripsi lama harus terbaca sama persis** — diuji dengan data seed nyata,
  bukan contoh karangan. Ini pagar terpenting: nol migrasi hanya benar kalau
  terbukti.
- Ukur tambahan bundel etalase **sebelum dan sesudah**, pastikan editor 141 KB
  **tidak** ikut ke bundel etalase.
- Uji XSS pada tabel di atas dijalankan ulang terhadap komponen yang sudah
  terpasang, bukan terhadap pustakanya secara terpisah.
