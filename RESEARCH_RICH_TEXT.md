# RISET — RICH TEXT UNTUK DESKRIPSI PRODUK

Diverifikasi langsung ke npm registry dan ke kode kedua repo, bukan dari
ringkasan. Tanggal pemeriksaan: **2026-08-24**.

---

## Ringkasan: jangan pakai dua paket yang direkomendasikan

Dan yang lebih penting: **memilih library adalah keputusan TERAKHIR, bukan
pertama.** Ada satu penghalang di server yang membuat editor apa pun — Tiptap,
Quill, Plate — menghasilkan sampah di database pada penyimpanan pertama.
Laporan itu tidak menyinggungnya sama sekali.

---

## 1. Dua paket itu dibuat KEMARIN

Diambil dari `registry.npmjs.org`:

| | `@amitdhoju/tiptap-ui` | `@sheenvalue/plate-rich-text` |
|---|---|---|
| Dibuat | **2026-08-23 15:48** | **2026-08-23 11:56** |
| Versi terakhir | 1.1.0 (15:55 — **7 menit** setelah dibuat) | 0.1.0 |
| Jumlah versi | 2 | 1 |
| Maintainer | 1 (`amitdhoju`) | 1 (`tayeb.om`) |
| `repository` | **tidak ada** | **tidak ada** |
| `homepage` / `bugs` | **tidak ada** | — |

Hari ini 2026-08-24. Keduanya **berumur satu hari**, satu maintainer, **tanpa
repositori publik**. Tidak ada kode yang bisa dibaca, tidak ada issue tracker,
tidak ada riwayat. Klaim "MIT license, gak ada drama" tidak menjawab apa pun:
lisensi bukan jaminan mutu, dan paket sehari tidak bisa punya rekam jejak
untuk dinilai.

Ini profil risiko rantai pasok yang paling standar. Untuk dependensi produksi
sebuah platform yang memegang data penjual, jawabannya tidak.

> Catatan: unduhan/minggu tidak bisa saya ambil karena `api.npmjs.org`
> diblokir proxy lingkungan ini. Metadata registry sudah cukup menjelaskan.

### Lagipula ia menduplikasi yang sudah kita punya

`@amitdhoju/tiptap-ui` meminta 24 dependensi. **Sembilan** di antaranya sudah
ada di `umkm-client`:

| Paket | Di repo kita | Diminta paket itu |
|---|---|---|
| `@radix-ui/react-select` | ^2.2.6 | ^2.3.7 |
| `@radix-ui/react-separator` | ^1.1.8 | ^1.1.15 |
| `@radix-ui/react-toggle` | ^1.1.10 | ^1.1.18 |
| `@radix-ui/react-toggle-group` | ^1.1.11 | ^1.1.19 |
| `@radix-ui/react-tooltip` | ^1.2.8 | ^1.2.16 |
| `class-variance-authority` | ^0.7.1 | ^0.7.1 |
| `clsx` | ^2.1.1 | ^2.1.1 |
| `lucide-react` | **^0.542.0** | **^1.33.0** ← beda mayor |
| `tailwind-merge` | ^3.4.0 | ^3.6.0 |

`lucide-react` beda versi mayor, jadi bundel akan memuat **dua salinan**
pustaka ikon.

Dan jualan utamanya — *"no consumer Tailwind/shadcn setup required"* — untuk
repo ini justru **kerugian**, bukan fitur. Kamu sendiri yang bilang *"gunakan
component UI yang udah kita sediakan"*. Paket itu sengaja **tidak** memakainya:
ia menyuntik gaya sendiri, di luar token tema yang baru saja kita seragamkan
sepanjang sesi ini.

Fitur unggulan lain yang disebut, **image upload**, juga menyelesaikan masalah
yang form ini tidak punya: form produk sudah punya langkah media sendiri
(`step-media.tsx`). Gambar di dalam deskripsi berarti jalur gambar kedua yang
bersaing dengan yang sudah ada.

---

## 2. PENGHALANG SEBENARNYA: server meng-encode semua HTML

Ini yang membatalkan skenario "5 menit, drop-in".

`umkm-server/src/main.ts:154` memasang `SanitizePipe` sebagai pipe global
**pertama**, sebelum `ValidationPipe`. Baris terakhir
`sanitize.pipe.ts:sanitizeString()`:

```js
str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
```

Setiap `<` dan `>` pada **setiap string di setiap request** di-encode. Saya
salin fungsi itu apa adanya lalu jalankan pada keluaran khas editor:

| Dikirim editor | Tersimpan di database |
|---|---|
| `<p>Kopi susu <strong>gula aren</strong></p>` | `&lt;p&gt;Kopi susu &lt;strong&gt;gula aren&lt;/strong&gt;&lt;/p&gt;` |
| `<a href="https://toko.id">katalog</a>` | `&lt;a href="https://toko.id"&gt;katalog&lt;/a&gt;` |
| `<img src="data:image/png;base64,…">` | `&lt;img src="image/png;base64,…"&gt;` |

Perhatikan baris ketiga: selain di-encode, `data:` **ikut dihapus** oleh
`str.replace(/data:/gi, '')`, jadi gambar tempel/base64 rusak dengan cara yang
berbeda lagi.

Akibat berantai:

1. Database berisi entitas HTML, bukan HTML.
2. Etalase merender `{product.description}` sebagai **teks biasa**
   (`product-actions.tsx:126`) — pembeli melihat tag mentah.
3. Markupnya **memakan jatah** `@MaxLength(1000)`: contoh pertama 88 karakter
   membengkak jadi 136 sebelum divalidasi.

Ini bukan soal styling. Datanya sudah rusak di pintu masuk API, sebelum
menyentuh Prisma.

---

## 3. Yang benar-benar harus diubah

Semuanya wajib bersamaan. Melewatkan satu saja membuat sisanya sia-sia.

### `umkm-server`

1. **Kecualikan `description` dari `SanitizePipe`.** Selama masih ikut, HTML
   selalu di-encode.
2. **Ganti dengan sanitasi sungguhan.** Regex di pipe itu bukan sanitizer HTML
   — ia menambal pola yang diingat penulisnya. Kalau menyimpan HTML, wajib
   pakai allowlist. Kandidat terkuat **`sanitize-html`** (v2.17.7, 126 versi,
   **4 maintainer**) — profil paling sehat di antara yang saya periksa;
   `dompurify` (151 versi) hanya 1 maintainer akun. Sanitasi **saat menulis**,
   sehingga database hanya pernah berisi HTML bersih.
3. **`@MaxLength(1000)` harus menghitung TEKS, bukan markup.** Kalau tidak,
   deskripsi 300 kata bisa ditolak karena tag-nya.

### `umkm-client`

4. **Editor di `step-details.tsx`** lewat `Controller` react-hook-form.
5. **`CharCounter` harus menghitung dengan aturan PERSIS sama** dengan server.
   Kalau beda sedikit saja, penjual melihat "850/1000" lalu ditolak server —
   kesalahan yang tidak bisa mereka duga sebabnya.
6. **Etalase merender HTML** (`product-actions.tsx`).
7. **`step-preview.tsx`** ikut merender HTML.
8. **Jalur teks-polos harus melucuti tag lagi.** Yang ini terlewat total di
   laporan itu:
   - `seo.ts:41` `sanitizeMetaText()` **hanya merapikan spasi**, tidak
     membuang tag → `<meta name="description">` akan berisi tag mentah.
   - `seo.ts:95` OpenGraph malah memakai `truncateDescription(description)`
     **tanpa** melewati `sanitizeMetaText` sama sekali — dan pemotongan bisa
     jatuh di tengah tag.
   - Deskripsi juga mengalir ke **pesan WhatsApp** dan `social-share.tsx`.
     WhatsApp tidak mengerti HTML; pembeli akan menerima tag mentah.

Repo ini **belum punya pustaka sanitasi sama sekali** — dicek di kedua
`package.json`. `dangerouslySetInnerHTML` yang ada sekarang cuma dipakai untuk
JSON-LD dan CSS hasil generate, tidak pernah untuk konten pengguna. Rich text
akan jadi **yang pertama**. Itu menaikkan taruhannya: kalau sanitasinya salah,
lubangnya XSS tersimpan di etalase publik penjual.

---

## 4. Rekomendasi

### Mesinnya: Tiptap — bagian ini laporan itu BENAR

`@tiptap/react` v3.30.3, **rilis hari ini** (2026-08-24), peer
`react: ^17 || ^18 || ^19` — cocok dengan React **19.2.3** di repo ini. MIT,
dirawat aktif. ProseMirror di bawahnya.

### Tapi toolbar-nya dibangun dari komponen kita sendiri

Bukan 4–8 jam seperti klaim laporan itu. Yang dibutuhkan deskripsi produk UMKM
cuma: **tebal, miring, daftar berpoin, tautan**. Bukan tabel, bukan warna,
bukan emoji picker, bukan sub/superscript. Repo sudah punya `ToggleGroup`,
`Separator`, `Button`, `Tooltip` — toolbar sekecil itu beberapa jam, dan
hasilnya memakai token tema yang sama dengan seluruh dashboard.

Tiga paket: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`.

### Alternatif lebih murah: simpan Markdown, bukan HTML

Temuan sampingan yang menarik saat menguji pipe-nya: **markdown lolos hampir
utuh** dari `SanitizePipe`. `**tebal**`, `*miring*`, `- daftar`, `[a](b)` —
tidak satu pun mengandung `<` atau `>`, jadi tidak tersentuh. (Kecuali
blockquote `>` yang jadi `&gt;`.)

Keuntungannya nyata:
- Tidak perlu mengubah `SanitizePipe`.
- Batas 1000 karakter tetap bermakna — markdown hampir sepanjang teksnya.
- **Turun dengan anggun ke WhatsApp**, yang justru memakai sintaks mirip
  (`*tebal*`, `_miring_`).

Kerugiannya: bukan WYSIWYG, dan mengetik markdown di ponsel lebih repot —
padahal penjual UMKM separuh waktunya di ponsel.

**Pilihan saya: Tiptap + toolbar sendiri, simpan HTML bersih.** Itu yang kamu
minta, dan menyelesaikan masalahnya di tempat yang benar. Markdown saya catat
karena kalau pekerjaan server terlalu mahal untuk sekarang, ini jalan keluar
yang jujur — bukan tambalan.

---

## 5. Yang laporan itu BENAR

Adil disebut:

- **`react-quill` memang harus dihindari.** Terverifikasi: rilis terakhir
  v2.0.0 **2022-08-03** (4 tahun lalu), `peerDependencies.react`
  `^16 || ^17 || ^18`. Repo ini React 19.2.3. Klaimnya tepat.
- **Tiptap memang mesin yang tepat.** Terverifikasi mendukung React 19 dan
  dirilis hari ini.

Yang salah bukan arah teknisnya, melainkan **memilih paket berumur sehari
tanpa repositori** sebagai jawaban, dan menyimpulkan "5 menit setup" tanpa
pernah melihat jalur data di repo yang akan memakainya.

---

## 6. Angka yang tidak bisa saya konfirmasi

Supaya jelas mana yang terverifikasi dan mana yang tidak:

- Ukuran bundel di tabel laporan itu (~40KB, 60–90KB, ~90KB) **tidak saya
  verifikasi**. Yang bisa saya baca cuma `unpackedSize` `@amitdhoju/tiptap-ui`
  = **139 KB**, dan itu bukan ukuran bundel setelah tree-shaking.
- "Setup 5 menit" / "4–8 jam" adalah tebakan, bukan pengukuran. Estimasi saya
  di atas juga tebakan — bedanya, saya menyebutnya tebakan.

---

# PUTARAN 2 — setelah syarat "hemat server" ditetapkan

Syarat baru: **tanpa kerja server yang mahal**, fondasi solid. Itu mengubah
kesimpulan putaran 1 dari "Tiptap + simpan HTML" menjadi **"Tiptap + simpan
markdown"**. Rencana kerjanya ada di `ROADMAP_RICH_TEXT.md`.

## Sumber yang dipakai

1. **`registry.npmjs.org`** — metadata paket (tanggal, maintainer, lisensi,
   peer deps, ukuran unpacked).
2. **Aplikasi yang berjalan** — Postgres + NestJS + login sungguhan,
   `POST /api/products` lalu membaca balik yang tersimpan.
3. **Kode kedua repo** — `SanitizePipe`, DTO, jalur render etalase, SEO.
4. **Eksekusi nyata pustaka kandidat** — render markdown ke HTML,
   uji XSS berdampingan, pengukuran bundel dengan esbuild + gzip.
5. **Pencarian web** — status perawatan `tiptap-markdown` dan keberadaan
   ekstensi resmi.

## Koreksi atas putaran 1

Putaran 1 mencatat `tiptap-markdown` sebagai kandidat serializer. **Itu
pilihan yang salah.** Ada `@tiptap/markdown` **resmi** dari tim ueberdosis:

| | `tiptap-markdown` | `@tiptap/markdown` |
|---|---|---|
| Versi | 0.9.0, rilis 2025-09-08 | 3.30.3, rilis **2026-08-24** |
| Versi total | 33 | 66 |
| Maintainer | 1 | **6** |
| Repo | pribadi | `github.com/ueberdosis/tiptap` |
| Lisensi | MIT | **MIT** |
| Peer | `@tiptap/core ^3.0.1` | `@tiptap/core 3.30.3` (dipatok) |

Penulis paket komunitas menyatakan tidak akan merilis v1 maupun menangani
issue yang ada; ekstensi resmi hadir sejak Tiptap 3.7.0. Beberapa fork
komunitas untuk v3 juga beredar — semuanya tidak perlu lagi.

Catatan: `@tiptap/markdown` MIT dan gratis. Yang berbayar adalah ekstensi
**Conversion** milik Tiptap Pro (impor/ekspor .docx dsb) — beda barang.

## Pengukuran bundel (esbuild, minify, gzip -9, react dikecualikan)

| Paket | gzip |
|---|---|
| `react-markdown` | 36.045 B (35,2 KB) |
| `react-markdown` + `remark-breaks` | **36.547 B (35,6 KB)** |
| ` ` + `remark-gfm` | 47.053 B (45,9 KB) |
| `marked` | 12.645 B (12,3 KB) |
| `snarkdown` | 1.006 B (0,9 KB) |
| Tiptap (`react` + `starter-kit` + `markdown`) | **144.443 B (141,0 KB)** |

`remark-gfm` dicoret: +10,3 KB untuk tabel dan coretan yang tidak dipakai
deskripsi produk. `remark-breaks` dipertahankan karena +0,5 KB dan wajib.

## Uji XSS — dijalankan, bukan dikutip

| Serangan | `react-markdown` | `snarkdown` |
|---|---|---|
| `[klik](javascript:alert(1))` | `<a href="">` | `<a href="javascript:alert(1">` |
| `[klik](javascript&#58;alert(1))` | `<a href="">` | `<a href="javascript&#58;alert(1">` |
| `[klik](data:text/html,…)` | `<a href="">` | `<a href="data:text/html,…">` |
| `<img src=x onerror=alert(1)>` | di-escape jadi teks | diteruskan hidup-hidup |

Baris kedua yang menentukan: bentuk entitas `javascript&#58;` **lolos** dari
`SanitizePipe`, yang regexnya cuma mencocokkan `javascript:` harfiah. Jadi
opsi 0,9 KB itu benar-benar bisa dieksploitasi di sini, bukan cuma "kurang
ideal".

## Yang paling mudah terlewat

`remark-breaks` bukan pemanis. Tanpa plugin itu, deskripsi lama yang ditulis
dengan Enter berubah jadi kata-kata dempet:

```
tanpa : <p>Kopi susu gula arenPanas atau dinginBisa tanpa gula</p>
dengan: <p>Kopi susu gula aren<br/>Panas atau dingin<br/>Bisa tanpa gula</p>
```

Itu akan merusak **setiap deskripsi produk yang sudah ada** di seluruh
etalase. Tidak akan ketahuan dari membaca dokumentasi mana pun — hanya
ketahuan dengan menjalankannya.
