# ROADMAP PERBAIKAN UI/UX

Empat temuan visual. **Fungsionalitasnya jalan** — yang salah lebar, potongan,
dan URL. Diurutkan dari yang paling merusak, bukan dari yang paling gampang.

---

## B1 — Locale hilang saat berpindah halaman 🔴

**Gejala.** Di `/id/dashboard/settings` bahasa Indonesia jalan. Klik menu Produk
→ mendarat di `/dashboard/products`, bukan `/id/dashboard/products`. Bahasa
balik ke Inggris tanpa pernah diminta.

**Akar masalah.** `localePrefix: 'as-needed'` dengan `defaultLocale: 'en'`
berarti `/id` **wajib ditulis** untuk bahasa Indonesia, dan tidak ada prefix
untuk Inggris. Repo ini sudah menyediakan pembungkus sadar-locale di
`src/i18n/navigation.ts`:

```ts
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

Tapi sebagian besar komponen masih mengimpor `Link` dari `next/link` dan
`useRouter`/`usePathname` dari `next/navigation`. Keduanya **tidak tahu apa-apa
soal locale** — `href="/dashboard/products"` dikirim apa adanya, prefix `/id`
rontok, middleware menganggapnya Inggris.

Ini bukan satu bug di satu file. Ini satu kesalahan yang sama, berulang.

**Sebaran.** 48 file mengimpor `next/link`, 33 mengimpor `next/navigation`.
Tidak semuanya salah — dipilah begini:

| Golongan | Perlakuan |
|---|---|
| `useSearchParams`, `notFound`, `useParams` | **TETAP** `next/navigation` — tidak punya konsep locale |
| Chrome dashboard (sidebar, navbar, tabs, guard, layout) | **GANTI** — ini jalur bug yang dilaporkan |
| Halaman dashboard (produk, kasir, keranjang, settings, setup-store) | **GANTI** |
| Hook navigasi (`use-auth`, `use-nav-guard`, `use-tripay-checkout`) | **GANTI** |
| Chrome auth (login, register-nav, forgot-password, auth-guard, auth-logo) | **GANTI** |
| Storefront publik (header, footer, breadcrumb, kartu produk, filter) | **GANTI** |
| `components/dashboard/blocks/*` (25 file) | **DILUAR CAKUPAN** — lihat catatan |

> **Kenapa blok Studio dikecualikan.** `ctaLink` di sana **diisi seller** lewat
> builder, defaultnya `/products`. Isinya bisa tautan internal, bisa URL
> eksternal. Menukarnya jadi `Link` sadar-locale menyentuh perilaku data
> buatan pengguna, bukan sekadar routing internal — itu perubahan lain dengan
> risiko lain. Dicatat, tidak dikerjakan bersama perbaikan ini.

**Urutan kerja.** Chrome dashboard dulu (jalur yang dilaporkan), lalu halaman
dashboard, hook, auth, terakhir storefront. Tiap lapis diverifikasi terpisah
supaya kalau ada yang pecah, jelas lapis mana.

---

## B2 — Chip kategori kasir terpotong 🔴

**Gejala.** Di `/dashboard/kasir` hanya empat chip terlihat: Semua, Kopi Klasik,
Kopi Signature, Makanan Berat. Padahal katalognya juga punya **Non-Kopi,
Pastry, dan Snack**.

**Akar masalah.** Bukan kategorinya yang tidak terhitung — kategorinya
ter-scroll keluar layar.

```tsx
// kasir/client.tsx
<CategoryChips … className="sm:max-w-md" />   // 448px
```

`CategoryChips` merender `KasirFilterGroup`, yaitu `ScrollArea` + `ToggleGroup`.
Dibatasi 448px, empat chip pertama sudah menghabiskan jatah; sisanya hidup di
area scroll yang tidak kelihatan ada. Di layar 1500px, ruang kosong 1000px
menganggur di sebelahnya.

**Kenapa bisa lolos.** `className` itu disalin dari `KasirSearchField` tepat di
atasnya. Untuk kolom pencarian, batas 448px **benar** — input selebar 1500px
konyol. Untuk barisan chip, batas yang sama justru menyembunyikan pilihan.

**Bukti drift.** Tiga pemanggil `KasirFilterGroup`, tiga lebar berbeda:

| Halaman | className | Lebar |
|---|---|---|
| Kasir · Jual | `sm:max-w-md` | 448px ← memotong |
| Kasir · Riwayat | *(kosong)* | penuh |
| Kasir · Stok | `w-auto` | sepanjang isi |

Komponennya sendiri sudah memperingatkan pola ini di header-nya: dulu tiga
tempat itu punya tombol chip buatan tangan yang radius dan state-nya mulai
berbeda. Disatukan jadi satu komponen, tapi **lebarnya kembali menyimpang**.

**Perbaikan.** Lebar berhenti jadi urusan pemanggil — untuk `CategoryChips`.
- Varian chip → selalu selebar induk. Barisan filter memang harus memakai ruang
  yang ada; ScrollArea tetap menangani layar sempit.
- Varian Combobox (>12 kategori) → batas 448px **di dalam komponen**, karena
  yang itu memang sebuah input.
- Halaman Jual berhenti mengirim `className`.

> **Koreksi saat pengerjaan.** Rencana awal di sini menulis "ketiga pemanggil
> berhenti mengirim `className` lebar". Itu keliru untuk **Stok**: filternya
> berbagi satu baris `justify-between` dengan sebuah Switch, jadi `w-auto` di
> sana memang disengaja — melepasnya membuat filter memenuhi baris dan
> mendorong Switch turun. `w-auto` dikembalikan, alasannya kini ditulis di
> tempatnya. `KasirFilterGroup` tetap menerima `className` untuk kebutuhan tata
> letak yang nyata; yang berhenti menerima lebar dari luar hanya
> `CategoryChips`, si baris filter selebar halaman.

---

## B3 — Lebar halaman tidak konsisten 🟠

**Gejala.** Pengaturan dan Langganan terasa sempit dibanding Produk dan Kasir.
Pindah tab menggeser judul secara horizontal.

**Akar masalah.**

| Halaman | Lebar |
|---|---|
| Produk | penuh (mengikuti dashboard) |
| Kasir (semua tab) | penuh, lewat `KasirPageShell` |
| **Pengaturan** | `max-w-2xl mx-auto` → 672px |
| **Langganan** | `max-w-2xl mx-auto` → 672px |

**Preseden sudah ada.** `KasirPageShell` dibuat persis untuk masalah ini, dan
header-nya menuliskan alasannya:

> *"Akibatnya berpindah tab menggeser judul dan strip tab secara horizontal —
> modul yang sama terasa seperti dua aplikasi berbeda."*

Serta aturannya:

> *"Konten yang terlalu lebar untuk dibaca TIDAK dipersempit dengan max-w,
> melainkan dipecah jadi grid oleh halamannya masing-masing."*

Pengaturan dan Langganan melanggar aturan yang sudah ditulis modul sebelah.

**Perbaikan.** Lepas `max-w-2xl` dari keduanya; ikut lebar dashboard seperti
Produk dan Kasir. Daftar baris Pengaturan yang jadi terlalu panjang untuk
dibaca dipecah jadi grid di layar lebar — dilebarkan, bukan diregangkan.

---

## B4 — Tombol Lanjut/Sebelumnya di `/register` tenggelam ✅

**Gejala.** Nav pill di dasar wizard tenggelam / mepet tepi bawah.

**Dugaan awal (SALAH sebagian).** Roadmap ini semula menebak sticky-nya mati
karena induknya `<div className="pt-4 pb-4 shrink-0">` tidak punya ruang gerak.
Saya jalankan aplikasinya dan mengukur — dugaan itu meleset. Induknya memang
setinggi isinya (94px), tapi bukan itu yang merusak.

**Akar masalah sebenarnya.** Diukur di `/id/register`, step "Jenis Usaha",
viewport 1440x900, dari pill naik sampai `<html>`:

| # | Kelas | Tinggi | |
|---|---|---|---|
| 7 | `flex min-h-svh flex-col` | **4173** | ← sumbernya |
| 6 | `grid flex-1` | 4114 | |
| 5–2 | `h-full`, `overflow-hidden` | 4114 | mewarisi |
| — | `flex-1 overflow-y-auto` (body) | ~4020 | tak pernah overflow |
| 1 | `pt-4 pb-4 shrink-0` | 94 | benar |
| 0 | pill nav | 62 | mendarat di y=**4095** |

`min-h-svh` itu **lantai, bukan plafon**. Daftar kategori setinggi ~3900px
membuat kotak terluar tumbuh jadi 4173px, dan seluruh rantai `h-full` di
bawahnya ikut mengembang. Zona scroll register **tidak pernah overflow —
jadi tidak pernah scroll**; dokumen yang scroll (3273px). Nav mendarat 3257px
di bawah layar. Itulah "tenggelam".

Tiga zona (sticky header / body scroll / footer) hanya bisa bekerja kalau
kotak terluarnya dibatasi setinggi viewport. Semua `overflow-hidden`,
`h-full`, dan `flex-1 overflow-y-auto` di rantai ini sudah menganggap batas
itu ada. Yang hilang cuma batasnya.

**Perbaikan — dua baris, dan keduanya wajib.**

1. `(auth)/layout.tsx` — `min-h-svh` → `h-svh`. Memberi plafonnya.
2. `register/page.tsx` — `grid flex-1` → `grid flex-1 min-h-0`. Tanpa ini
   nomor 1 **no-op**: sebagai flex item ber-`overflow: visible`, div itu
   punya `min-height: auto` = min-content (~4114px), dan minimum otomatis
   itu menang melawan plafon induknya. Saudara-saudaranya aman sendiri
   karena ber-`overflow-hidden`.

Menambal `register-nav.tsx` jadi `fixed` di semua breakpoint memang lebih
pendek, tapi itu meninggalkan `overflow-hidden` / `h-full` /
`overflow-y-auto` di seluruh rantai sebagai perancah mati — persis
"memindahkan bug, bukan menutupnya" yang diwanti-wanti di versi awal
catatan ini.

**Hasil ukur sesudah.**

| | Sebelum | Sesudah |
|---|---|---|
| pill keluar bawah viewport | **+3257px** | **−16px** (persis `bottom-4`) |
| scroller internal | tidak ada | `flex-1 overflow-y-auto` 3894/622 |
| scroll dokumen | 3273px | **0** |

Diverifikasi di 1440x900, 1440x640, 1280x800, 820x700, 390x844 — dan di
**kelima** langkah wizard (welcome, intent, kategori, detail toko, akun),
di dua mode breakpoint (`sticky` di md+, `fixed` di bawahnya). Semua
`keluarBawah −16` di desktop / `−80` di mobile, `docScroll 0`. Semua
pengukuran dilakukan dengan OfflineBanner tampil — kasus yang lebih berat,
karena banner memakan 60px dari jatah tinggi.

**Halaman auth lain tidak jadi korban.** Login & forgot-password ikut memakai
layout yang sama tapi tidak punya `overflow-hidden`, jadi konten yang lebih
tinggi tetap meluber dan dokumen tetap bisa di-scroll seperti sebelumnya —
diukur di 1440x500: `docScrollable` 21px / 16px, tidak ada yang terpotong.
Plafonnya hanya menggigit di tempat yang kodenya memang meminta.

---

## Urutan eksekusi

```
1. B2  chip kategori      — terisolasi, satu komponen + tiga pemanggil
2. B3  lebar halaman      — terisolasi, dua halaman
3. B1  locale             — luas; dikerjakan berlapis, verifikasi per lapis
4. B4  nav register       — perlu dilihat langsung dulu
```

B2 dan B3 didahulukan karena sempit dan mandiri: kalau build pecah setelahnya,
penyebabnya pasti di situ. B1 disimpan setelahnya justru karena ia menyentuh
banyak file — mencampurnya dengan yang lain membuat bisection mustahil.

## Pagar verifikasi

Setiap lapis: `tsc --noEmit` bersih, `next build` sukses, dan eslint
dibandingkan dengan baseline — **nol peringatan baru**, bukan sekadar "tidak
error". Perilaku tidak boleh berubah: ini perbaikan visual dan URL, bukan
perubahan fungsional.
