# ROADMAP — LEBAR HALAMAN KONSISTEN

Tujuan: satu aturan lebar untuk seluruh dashboard, tanpa merusak mobile dan
tablet, dan tanpa membuat formulir terasa sempit di desktop.

---

## Jawaban atas usulanmu: grid-nya BENAR, angkanya SALAH

> *"Container tetap `max-w-3xl` (lebih lega dikit dari 2xl). Di dalamnya pakai
> `grid lg:grid-cols-2`."*

Grid dua kolom itu tepat. Tapi `max-w-3xl` = **768px**. Dibagi dua kolom
dengan gap 24px = **~372px per kolom** — lebih sempit dari 672px yang sekarang
kamu keluhkan. Usulan itu memperbaiki gejalanya sambil memperparah
penyebabnya.

Yang benar bukan wadah lebih kecil dengan isi dibagi dua, tapi wadah lebih
besar **hanya saat ada ruang untuk dibagi dua**.

---

## Kondisi sekarang: bukan 2 lebar, tapi 4

| Lebar | Dipakai | |
|---|---|---|
| penuh | Products, Kasir (Jual/Riwayat/Stok/Papan) | via `container` |
| `max-w-5xl` (1024px) | Kasir Keranjang | `KasirPageShell width="focused"` |
| `max-w-3xl` (768px) | Wizard setup-store | satu-satunya pemakai |
| `max-w-2xl` (672px) | 8 seksi Pengaturan, Langganan, WizardNav, halaman legal | |

Penting: **`container` di repo ini tidak punya `max-width`.**

```css
@utility container { margin-inline: auto; padding-inline: 2rem; }
```

Jadi Products & Kasir benar-benar selebar layar. Di monitor 1920px itu 1856px.
Formulir selebar itu tidak bisa dibaca — makanya "samakan semua dengan
Products" bukan jawabannya.

### Dua halaman yang sudah rusak hari ini, dan belum kamu lihat

`settings/hero.tsx` dan `product/form/product.tsx` **tidak punya `max-w` sama
sekali**. Formulirnya selebar layar, tapi keduanya merender `WizardNav` yang
dikunci `max-w-2xl` di tengah. Jadi pill navigasinya melayang 672px di tengah
formulir selebar 1856px. Sudah salah sebelum ada yang melaporkannya.

---

## Aturannya: satu rumus, satu pemilik

```
mx-auto w-full max-w-2xl lg:max-w-5xl
```

| Viewport | Lebar | Kolom | vs sekarang |
|---|---|---|---|
| < lg (mobile, tablet) | 672px | 1 | **identik** — tidak ada yang berubah |
| lg 1024px | ~960px | 2 × ~468px | +288px |
| ≥ 1280px | 1024px | 2 × ~500px | +352px |

Kenapa rumus ini:

- **Mobile & tablet tidak disentuh sama sekali.** Di bawah `lg` hasilnya
  persis 672px satu kolom seperti sekarang. Risiko regresi di dua breakpoint
  itu nol, bukan "kecil".
- **`max-w-5xl` bukan angka baru.** `KasirPageShell` sudah memakainya untuk
  `width="focused"`. Jadi ini mengadopsi token yang sudah ada, bukan menambah
  yang kelima.
- **Kolomnya melebar, bukan menyempit.** 500px per kolom > 372px usulan awal,
  dan tiap kolom masih di bawah batas nyaman baca.

Hasil akhirnya **dua** lebar di dashboard, keduanya bernama dan dimiliki satu
tempat:

- `full` — halaman daftar/grid (Products, Kasir). Sudah ada.
- `focused` — halaman formulir (Pengaturan, Langganan, Produk, setup-store).

### WizardNav: aturannya dipertahankan, konstantanya diganti

Header `wizard-nav.tsx` menulis keputusan yang tidak boleh saya langgar:

> *"Desktop bar width is HARDCODED max-w-2xl, on purpose, not a per-caller
> prop. … The one time it did, the result was every page having a visibly
> different bar width, which read as broken rather than adaptive. One width,
> everywhere, no exceptions."*

Aturan itu berbunyi **"satu lebar di mana-mana"**, bukan "672px selamanya".
Mengganti satu konstanta jadi `max-w-2xl lg:max-w-5xl` **mematuhi** aturan
itu — pill tetap satu lebar di semua halaman, dan kini sejajar dengan
kontennya di setiap breakpoint. Yang melanggar aturan adalah menjadikannya
prop per-pemanggil, dan itu tidak saya lakukan.

Supaya tidak ada dua sumber kebenaran, rumusnya jadi **satu konstanta yang
diimpor** — halaman dan WizardNav membaca string yang sama. Mustahil melenceng
lagi.

---

## Gambar: vertikal di mobile, horizontal di desktop

Dua hal berbeda, dan cuma satu yang aman disentuh.

**Yang diubah — arah tata letak & kotak pratinjau.** Di mobile gambar
menumpuk penuh di atas kolom isian; di desktop duduk di sebelahnya. Kotak
pratinjau yang sekarang dikunci `aspect-square` ikut melebar jadi lanskap di
layar lebar.

**Yang TIDAK diubah — rasio crop yang tersimpan.** Logo di-crop 1:1 dan latar
hero 16:9 karena etalase publik merender dengan rasio itu. Mengubahnya bukan
perkara tampilan, itu mengubah data yang sudah jadi. Kalau memang mau diubah,
itu pekerjaan lain dengan migrasi gambar lama.

**Koreksi atas daftar komponen.** Saya sempat menambahkan `AspectRatio` karena
daftarmu menandainya belum ada. Ternyata **sudah ada** di
`src/components/ui/aspect-ratio.tsx`, implementasinya identik — jadi yang saya
"tambahkan" cuma memformat ulang file yang sudah berjalan. Perubahan itu
dibatalkan. Rasio pratinjau akhirnya cukup memakai kelas `aspect-video` yang
diselesaikan tailwind-merge melawan `aspect-square` bawaan slot: tanpa prop
baru, tanpa komponen baru.

Dari lima yang kamu catat belum ada, **dua sebenarnya sudah ada**
(`AspectRatio`, `Carousel`). Yang benar-benar belum: `Button Group`,
`Typography`, `Attachment`.

---

## Urutan eksekusi

```
L1  Token lebar (page-column.tsx)                ← pondasi, 1 file baru
L2  WizardNav + SetupWizardNav pakai token       ← 2 file
L3  11 halaman formulir pakai token              ← termasuk hero & product
                                                    yang selama ini tanpa max-w
L4  Grid 2 kolom di formulir yang isinya cukup   ← per halaman, pakai penilaian
L5  Gambar: tumpuk di mobile, sisi di desktop
L6  Verifikasi terukur di 3 breakpoint
```

L1→L2→L3 dulu dan berurutan: setelah L3 seluruh halaman sudah **konsisten**
walaupun belum dua kolom. Kalau L4 bermasalah, konsistensinya tidak ikut
hilang. Menggabungkannya membuat bisection mustahil.

### Catatan L4 — dua kolom pakai penilaian, bukan pukul rata

Tidak semua formulir pantas dua kolom. Yang isian pendeknya banyak dan saling
bebas (Bio, Kontak, Sosial, Mode Dagang) memang mengisi dua kolom dengan baik.
Yang alurnya berurutan dan cuma tiga isian (Ganti Password) justru jadi aneh —
itu tetap satu kolom, dan alasannya ditulis di tempatnya. Isian panjang
(textarea, deskripsi) selalu `lg:col-span-2`.

Halaman yang tetap satu kolom **tetap memakai token lebar yang sama**. Itu
inti konsistensinya: lebarnya seragam, jumlah kolomnya mengikuti isi.

---

## Pagar verifikasi

Selain `tsc --noEmit` bersih, `next build` sukses, dan eslint nol delta:
jalankan aplikasinya, ukur di **390 / 820 / 1440** dan pastikan tepi kiri-kanan
pill WizardNav **sama persis** dengan tepi konten di atasnya. Sejajar itu yang
dilihat mata sebagai "konsisten" — bukan angka di kelas CSS.

Di bawah `lg` hasil ukurnya wajib **identik dengan sebelum perubahan**. Kalau
tidak, saya merusak mobile sambil memperbaiki desktop.

---

## Setelah fase ini — belum dikerjakan

**Rich text di form produk.** Deskripsi produk sekarang `Textarea` polos
dengan batas 1000 karakter plus `CharCounter`. Menggantinya dengan rich text
membawa satu masalah yang harus diputuskan dulu: batas 1000 itu menghitung
**karakter mentah**, dan markup HTML akan memakan jatah itu — teks 300 kata
bisa tertolak karena tag-nya, bukan karena isinya. Jadi penghitungnya harus
beralih menghitung teks, dan server yang memvalidasi panjang harus ikut. Itu
menyentuh `umkm-server`, bukan cuma tampilan.

**Komponen UI yang belum ada.** Setelah dicek langsung ke repo: `AspectRatio`
dan `Carousel` **sudah ada**. Yang benar-benar belum cuma `Button Group`,
`Typography`, `Attachment` — dan tidak satu pun dipakai oleh pekerjaan yang
sedang berjalan. Dipasang saat ada yang memakainya, bukan untuk mengejar
daftar centang.
