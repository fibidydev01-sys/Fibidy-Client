# DESAIN & ROADMAP — TURUN TIER TANPA MENGHUKUM KLIEN

> **Dokumen induk: `umkm-server/BILLING_DAN_MODEL_BISNIS.md`.**
>
> Baca itu dulu. Dokumen ini mengurus satu bab — apa yang terlihat SETELAH
> turun tier — dan bab itu baru punya arti setelah induknya dikerjakan.
>
> Yang perlu diketahui sebelum lanjut: **turun tier belum bisa terjadi hari
> ini.** Tidak ada cron kedaluwarsa, dan `subscriptionTier` tidak pernah
> ditulis turun oleh kode mana pun. Pekerjaan di bawah menyiapkan tempat
> mendarat yang manusiawi — dan tempat itu harus jadi lebih dulu sebelum
> kedaluwarsa dinyalakan, bukan sesudah.

## Prinsip

> **Turun tier mencabut KEMAMPUAN BARU, bukan yang sudah ada.**
>
> Data yang dibuat klien saat berlangganan tetap **terlihat** dan tetap **bisa
> dipakai**. Yang berhenti hanyalah kemampuan menambah lebih banyak.

Ini keputusan bisnis sekaligus moral. Catatan penjualan, foto produk, dan
halaman landing adalah **milik klien**, bukan milik kita. Menyanderanya di
balik tembok bayar setelah mereka berhenti membayar bukan monetisasi — itu
menghukum orang yang pernah membayar kita.

Ada alasan praktis juga: klien mungkin butuh rekaman transaksinya untuk
pembukuan, pajak, atau sengketa dengan pembeli. Menghilangkannya dari layar
membuat mereka mengira data itu **terhapus**.

---

## Audit: apa yang sebenarnya terjadi hari ini

> **Audit ini adalah potret SEBELUM perbaikan.** Sengaja tidak ditulis ulang —
> temuannya yang membentuk desain di bawah, dan menghapusnya berarti membuang
> alasan kenapa kodenya sekarang begitu. Kolom terakhir menandai apa yang
> sudah berubah.

Tiga batas paket, tiga perilaku berbeda — dan cuma satu yang benar.

| Batas | Cara ditegakkan | Nasib data lama saat turun tier | Sekarang |
|---|---|---|---|
| `maxProducts` | dicek saat **create** (`products.service.ts:351`) | ✅ **BENAR** — 50 produk tetap terlihat & bisa diedit | tidak diubah |
| `maxImagesPerProduct` | dicek saat **create DAN update** (`:352`, `:548`) | ⚠️ **KUNCI-EDIT SENYAP** | ✅ T3 — grandfathering |
| `componentBlockVariants` | dicek saat **publish landing** (`tenants.service.ts:308`) | ⚠️ **KUNCI-EDIT SENYAP** | ✅ T3 — grandfathering |
| Modul Kasir | `KasirPlanGuard` di **9/9 controller** | ❌ **SELURUH MODUL HILANG** | ✅ T1 — GET dibuka |

`maxProducts` sudah melakukan persis yang prinsip di atas minta. **Tiga
lainnya menyimpang dari pola yang dipakai repo ini sendiri.**

Yang tidak muncul di tabel ini karena letaknya di klien, bukan di server:
gerbang tombol kasir (dicabut di T2) dan gembok terbit di Studio (dicabut di
T3, lihat **E**). Dua-duanya menolak sebelum server sempat menjawab.

### ⚠️ Kunci-edit senyap #1 — foto produk

`checkImageLimit(tenantId, dto.images.length)` di jalur **update** (baris 548)
membandingkan jumlah foto baru dengan batas paket, **tanpa tahu berapa foto
yang sudah ada sebelumnya**.

Akibatnya, penjual BUSINESS punya produk berfoto 5. Turun ke FREE (batas 2):

- Etalase **tetap** menampilkan kelima fotonya — tidak ada penyaringan saat
  dibaca.
- Tapi begitu ia membuka produk itu dan menekan simpan — **walau cuma
  membetulkan salah ketik di harga** — server menolak dengan 403
  *"Maximum 2 images per product"*.

**Produknya terkunci dari pemiliknya sendiri.** Ia tidak bisa mengubah harga
tanpa lebih dulu menghapus tiga fotonya. Itu bukan batas paket, itu sandera.

### ⚠️ Kunci-edit senyap #2 — blok landing Studio

Bentuknya persis sama. Penjual memakai blok 20 saat BUSINESS, turun ke FREE
(batas 3):

- Landing-nya **tetap** merender blok 20 — config tersimpan, tidak disaring
  saat dibaca.
- Tapi menyimpan perubahan apa pun — bahkan cuma mengedit satu kalimat —
  ditolak 403 *"Block 20 is only available on a higher plan"*.

**Halaman landing-nya beku.** Ia tidak bisa memperbaiki typo tanpa lebih dulu
menurunkan desainnya sendiri.

Dua-duanya lebih **licik** daripada kasir, karena baru muncul saat klien
mencoba hal yang sama sekali tidak berhubungan. Kasir setidaknya jujur sejak
awal: layarnya diganti. Ini menunggu sampai orangnya sudah mengetik.

> **Koreksi.** Versi pertama dokumen ini menulis dua kunci-edit itu "lebih
> menyakitkan daripada kasir". Itu keliru — dua sumbu yang berbeda tercampur.
> Licik bukan berarti lebih berat. Perbandingan yang benar:
>
> | | Kasir | Kunci-edit |
> |---|---|---|
> | Datanya | **tidak terlihat sama sekali** | tetap terlihat di etalase |
> | Volume | seluruh riwayat penjualan | satu produk / satu halaman |
> | Bisa diakali klien sendiri? | **tidak — hanya dengan membayar** | ya (hapus foto / ganti blok) |
> | Yang hilang | **catatan usaha** — pembukuan, pajak, sengketa | kemampuan menyunting |
>
> Yang menentukan: kunci-edit **punya jalan keluar** yang bisa ditempuh klien
> sendiri. Kasir tidak. Dan yang lenyap di kasir adalah rekaman yang mungkin
> mereka butuhkan di depan petugas pajak. **Kasir yang paling menghukum**, dan
> urutan pengerjaan di bawah mengikuti itu.

### ❌ Kasir — seluruh modul hilang

Kesembilan controller kasir dijaga `KasirPlanGuard`, jadi 403 di semua
endpoint. Untuk penjual yang turun tier setelah berbulan-bulan jualan:
riwayat transaksi, preset diskon, program promo, dan konfigurasi struknya
**lenyap dari layar** — diganti satu kartu upsell.

Datanya sendiri **selamat** — diverifikasi: tidak ada `deleteMany`, tidak ada
cron yang menyentuh tabel kasir. Jadi ini murni salah di lapisan tampilan.
Rekamannya ada, hanya tidak terlihat oleh pemiliknya.

---

## Tiga perilaku yang dibutuhkan

Bedakan dengan tegas, karena selama ini ketiganya tercampur:

| # | Perilaku | Berlaku untuk |
|---|---|---|
| 1 | **Tetap terlihat** | riwayat kasir, preset, promo, config, stok |
| 2 | **Tetap bisa diedit** (grandfathering) | foto produk, blok landing |
| 3 | **Yang BARU diblokir** | semua — ini yang sudah benar |

Nomor 3 sudah jalan di mana-mana. Nomor 1 rusak di kasir. Nomor 2 rusak di
foto dan blok.

---

## Desain

### A. Kasir — buka jalur BACA, kunci jalur TULIS

Endpoint kasir: **19 GET, 13 mutasi** (8 PATCH, 3 POST, 2 DELETE).

`KasirPlanGuard` jadi **sadar-method**: izinkan GET, tetap tolak mutasi. Satu
berkas, satu kondisi. Server tetap jadi backstop — kalau UI bocor, mutasinya
tetap ditolak.

**Gerbang UI dipasang di HOOK, bukan di tombol.** Ada 12 hook mutasi kasir vs
30-an tombol aksi. Menggantungnya di hook berarti:

- tiga kali lebih sedikit tempat untuk salah,
- tombol yang lupa dimahkotai **tetap tidak bisa menembak**,
- mahkota di tombol jadi murni urusan tampilan, bukan pengaman.

Ini penting justru untuk kasus turun tier: penjual yang baru berhenti bayar
akan **benar-benar mencoba** menekan tombol yang kemarin masih jalan. Satu
yang bocor = toast 403 mentah di muka orang yang sudah kecewa.

**Empty state ikut diubah.** Yang membuat Preset Diskon terbaca rusak dulu
bukan kekosongannya, tapi kalimatnya: *"belum ada preset — buat satu"*,
mengajak aksi yang tidak bisa dilakukan. Diganti *"tersedia di paket
berbayar"* + mahkota, kosong pun jadi jujur.

### B. Foto produk — grandfathering

`checkImageLimit` di jalur **update** harus tahu berapa foto yang sudah ada:

```
izinkan bila  jumlahBaru <= batasPaket
          ATAU jumlahBaru <= jumlahSebelumnya      ← tidak menambah
```

Artinya penjual dengan 5 foto di paket FREE:

- boleh menyimpan perubahan apa pun selama tetap 5 foto atau lebih sedikit,
- boleh **menghapus** foto (turun ke 4, 3, 2 — selalu diizinkan),
- **tidak** boleh menambah jadi 6.

Jalur **create** tidak berubah — produk baru tetap tunduk pada batas paket.

**Terpasang** sebagai `jumlahDalamJatah()` di
`umkm-server/src/subscription/grandfathering.ts`, dipanggil dari
`checkImageLimit()`. Jalur update meneruskan `existing.images.length`;
jalur create tidak meneruskan apa-apa, jadi batas paket berlaku penuh.

### C. Blok landing — grandfathering

Bentuk yang sama:

```
izinkan bila  nomorBlok <= batasPaket
          ATAU nomorBlok == blokYangSudahTersimpan   ← tidak ganti ke yang lebih tinggi
```

Penjual boleh terus mengedit isi landing-nya dengan blok 20, tapi tidak boleh
**berpindah** ke blok tinggi lain yang belum pernah ia pakai.

**Terpasang** sebagai `blokDalamJatah()` di file yang sama, dipanggil dari
`updateMe()`. `existing` sekarang ikut mengambil `landingConfig` supaya blok
tersimpan bisa dibandingkan.

> Perhatikan: yang dibandingkan adalah blok yang **tersimpan sekarang**, bukan
> blok tertinggi yang pernah dipakai. Begitu penjual turun sukarela ke blok 2,
> blok 20-nya hangus — naik lagi ditolak. Jalan satu arah, dan itu memang
> disengaja: kalau puncak sejarah yang disimpan, satu bulan berlangganan
> BUSINESS berarti blok 25 selamanya.

### E. Gembok ketiga — klien yang menolak sebelum server sempat menjawab

Ditemukan saat mengerjakan C, tidak ada di rencana awal. Di
`dashboard/studio/page.tsx`:

```ts
const handlePublish = useCallback(async () => {
  if (configHasProBlocks) { setUpgradeModalOpen(true); return; }   // ← di sini
  ...
  await publishToServer();
}, [...]);
```

Tombol terbit membuka modal upgrade dan **permintaannya tidak pernah
dikirim**. Grandfathering di server jadi sia-sia: permintaan yang mestinya
di-grandfather tidak pernah sampai ke server untuk di-grandfather.

Ini bentuk yang sama dengan gerbang tombol kasir yang sudah dicabut di T2, dan
obatnya juga sama: **klien tidak menebak, klien bertanya.**

- `handlePublish` selalu mengirim. Tidak ada lagi tebakan di klien.
- `useLandingConfig` dapat `onPlanRejected`. Kalau server menjawab 403,
  barulah modal upgrade muncul — dengan alasan asli dari server.
- Toast "gagal menyimpan, coba lagi" tidak lagi muncul untuk 403. Percobaan
  kedua pasti ditolak juga; menawarkannya cuma mempermainkan orang.
- `configHasProBlocks` tetap ada, tapi sekarang **hanya** menyalakan lencana
  mahkota di tombol. Jujur menyebut bloknya berbayar, tanpa menahan apa pun.

> Efek sampingnya: satu ketidakcocokan lama ikut hilang. `hasProBlocks()` di
> klien mengembalikan `false` kalau hero dimatikan, sedangkan server memeriksa
> `heroBlock?.block` tanpa peduli hero hidup atau mati. Penjual dengan hero
> mati dan blok tinggi tersimpan dulu ditolak server padahal klien mengira
> aman. Sekarang server menerimanya lewat grandfathering.

### D. Mahkota — satu jalur untuk semua tenant FREE

Belum-pernah-bayar dan pernah-bayar diperlakukan **sama**: data ditampilkan
apa adanya (kosong kalau memang kosong), aksi bermahkota.

Alasannya bukan kemalasan. Dua jalur berarti dua set keadaan yang harus dijaga
benar selamanya, dan sesi ini sudah berulang kali menunjukkan bahwa keadaan
kembar selalu melenceng — empat lebar halaman yang berbeda, skeleton yang
tidak sebentuk dengan isinya, tiga seksi kasir yang gagal dengan dua cara
berbeda. Kosong-bermahkota sudah jujur untuk pengguna baru.

---

## Roadmap

```
T1  Server: KasirPlanGuard sadar-method       ✅ SELESAI — 19 GET terbuka, 13 mutasi tetap 403
T2  Klien: gerbang di hook mutasi + spanduk   ✅ SELESAI — ketujuh layar sekaligus, bukan cuma Riwayat
T3  Server: grandfathering foto & blok        ✅ SELESAI — dua kunci-edit senyap dicabut, + gembok ketiga di klien
T4  Verifikasi turun tier                     ✅ SELESAI — kasir, foto, dan blok, ketiganya diukur di server hidup
```

> **Catatan pelaksanaan.** T2 dan T4 versi rencana ini terpisah — "Riwayat
> dulu, enam layar sisanya menyusul". Saat dikerjakan, keduanya jatuh jadi
> SATU pekerjaan: gerbangnya dipasang di 13 hook mutasi dan spanduknya di
> `KasirPlanGate`, dan ketujuh layar kasir sudah memakai keduanya. Memecahnya
> jadi "Riwayat saja dulu" justru butuh kerja tambahan untuk menahan enam
> layar lain, bukan menghemat.
>
> **T3 ternyata tiga gembok, bukan dua.** Rencana ini menyebut dua kunci-edit
> senyap di server. Saat dikerjakan, muncul yang ketiga — dan yang ketiga ini
> lebih rapat daripada keduanya: `handlePublish` di klien membuka modal
> upgrade dan **tidak pernah mengirim permintaannya**. Grandfathering di
> server tidak akan pernah terpakai, karena permintaan yang mestinya
> di-grandfather tidak pernah lahir. Ketiganya dicabut sekaligus — lihat
> bagian **E** di Desain.

### Terukur saat T4

Simulasi sungguhan: tenant BUSINESS dengan dua transaksi lunas, diturunkan
ke FREE di database, lalu diperiksa di browser dan lewat API langsung.

| | BUSINESS | FREE |
|---|---|---|
| Spanduk penjelas | tidak ada | **ada** |
| Transaksi terlihat | 2 | **2** |
| Layar diganti upsell | tidak | **tidak** |

API dipanggil langsung dari browser, tanpa lewat UI — membuktikan server
tetap lapis terakhir walau gerbang klien dilewati:

```
GET   /kasir/transaksi   200
POST  /kasir/transaksi   403 KASIR_PLAN_REQUIRED
PATCH /kasir/config      403 KASIR_PLAN_REQUIRED
```

### Terukur saat T3

Sepuluh skenario, dijalankan lewat HTTP ke server yang hidup — bukan unit
test, bukan penalaran dari kode. Tenant FREE sungguhan, datanya ditanam
langsung di database supaya menyerupai orang yang paketnya baru turun.

**Blok landing** — tenant FREE (jatah 3), `block25` tersimpan:

| Yang dicoba | Harusnya | Hasil |
|---|---|---|
| simpan ulang `block25`, ganti judul | lolos | **200**, judul berubah |
| pindah ke `block24` | ditolak | **403** |
| turun sukarela ke `block2` | lolos | **200** |
| sesudah turun, balik ke `block25` | ditolak | **403** |

**Foto produk** — tenant FREE (jatah 2), produk berfoto 5:

| Yang dicoba | Harusnya | Hasil |
|---|---|---|
| betulkan harga, foto tetap 5 | lolos | **200**, harga berubah |
| tambah jadi 6 | ditolak | **403** |
| hapus satu, 5 → 4 | lolos | **200** |
| sesudah 4, balik ke 5 | ditolak | **403** |
| turun sampai masuk jatah, 4 → 2 | lolos | **200** |
| produk **baru** dengan 3 foto | ditolak | **403** |

Baris terakhir yang paling penting: grandfathering hanya berlaku untuk yang
sudah terlanjur ada. Produk baru tetap tunduk penuh pada batas paket, jadi
paketnya tidak jadi percuma.

Aturannya sendiri dikunci `grandfathering.spec.ts` — 20 tes, dua arah:
yang lama harus tetap bisa disimpan, yang baru harus tetap ditolak.

**Diurutkan menurut BERAT, bukan menurut murah.** Versi pertama roadmap ini
menaruh kunci-edit lebih dulu karena perbaikannya paling kecil. Itu
mengoptimalkan hal yang salah: yang paling merugikan klien harus dicabut lebih
dulu, walau ongkosnya lebih besar.

**T1 + T2 adalah irisan tertipis yang mencabut luka terberat.** Guard-nya
per-controller, tapi membuatnya sadar-method tetap satu berkas — sama besarnya
mau membuka satu controller atau sembilan. Jadi penghematannya bukan di
server, melainkan di klien: T2 cuma menggarap **satu layar**, Riwayat, bukan
tujuh. Riwayat justru yang paling penting — di situlah catatan penjualan yang
mereka butuhkan untuk pembukuan tinggal.

Setelah T1+T2, klien yang turun tier **melihat kembali seluruh riwayat
penjualannya**. Enam layar lain menyusul di T4 tanpa ada yang mendesak.

**Pengaman sebelum kosmetik, di tiap fase klien.** Gerbang hook dipasang lebih
dulu, mahkota belakangan. Kalau tampilannya tertunda, sistemnya tetap aman —
cuma belum ada mahkotanya. Kalau dibalik, ada jendela di mana tombol terlihat
terkunci padahal masih bisa menembak.

### T5 — cara memverifikasinya

Bukan mengarang skenario. Simulasi turun tier yang sungguhan:

1. Set tenant ke BUSINESS, buat data lewat UI: transaksi kasir, preset diskon,
   program promo, produk berfoto 5, landing pakai blok tinggi.
2. Turunkan ke FREE di database.
3. Buktikan: **semua data itu masih terlihat**, semua aksi bermahkota, dan
   mengedit harga produk berfoto 5 **berhasil**.
4. Buktikan juga yang sebaliknya: menambah foto ke-6 **ditolak**, dan mutasi
   kasir **ditolak** di server meski gerbang UI dilewati.

---

## Yang masih perlu kamu putuskan

1. **Tombol bermahkota: tetap bisa diklik (buka modal upgrade) atau disabled +
   tooltip?**
   Saya condong **bisa diklik**. Untuk penjual yang baru turun tier, tombol
   mati tanpa penjelasan lebih menjengkelkan daripada yang bilang "ini kenapa,
   dan begini cara mengaktifkannya lagi".

2. **`GET /kasir/config` menulis** — ia pakai `upsert`, jadi membuka gerbang
   GET berarti tenant FREE yang membuka Mode Dagang akan membuat baris
   `TenantKasirConfig` untuk dirinya. Tidak berbahaya (config default
   miliknya sendiri), tapi "read-only" di endpoint itu jadi tidak harfiah.
   Dibiarkan, atau dibikin baca-saja untuk FREE?

3. **Batas foto FREE = 2, tapi paket berbayar STARTER = 3.** Penjual FREE yang
   belum pernah bayar cuma dapat 2 foto. Itu memang disengaja, atau sisa dari
   fase produk digital? Saya tidak mengubah angka tanpa kamu putuskan.

---

## Cakupan yang TIDAK masuk

**Etalase publik tidak disentuh sama sekali.** Foto ke-5 dan blok 20 memang
sudah tampil di sana hari ini, dan itu benar — pembeli tidak boleh ikut
dihukum oleh perubahan tier penjualnya. Tidak ada penyaringan baca yang
ditambahkan di mana pun.
