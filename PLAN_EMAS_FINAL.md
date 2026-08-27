# PLAN EMAS — FINAL

**Pangkas Product Digital → Platform UMKM Murni**
Repo: `kliping-com/umkm-server` + `kliping-com/umkm-client`
Branch kerja: `claude/emas-plan-final-ndvcu0` (kedua repo)
Status: **SELESAI — ketiga fase dieksekusi**

> Dokumen ini menggantikan `PANGKAS_PRODUCT_DIGITAL.md` dan
> `PANGKAS_PRODUCT_DIGITAL_FRONTEND.md`. Kalau ada beda, **dokumen ini yang benar** —
> alasannya ada di Bagian 1.
>
> Disusun dari audit langsung atas source code kedua repo pada commit:
> - server `ca8f4d0`
> - client `6b7b1c0`
>
> File kembar ada di `umkm-server/docs/PLAN_EMAS_FINAL.md`.

---

## DAFTAR ISI

1. [Koreksi Kritis atas 2 Dokumen Lama](#1-koreksi-kritis-atas-2-dokumen-lama)
2. [Matriks HAPUS / TETAP / UBAH](#2-matriks-hapus--tetap--ubah)
3. [Jebakan Hasil Audit — Baca Sebelum Ngoding](#3-jebakan-hasil-audit--baca-sebelum-ngoding)
4. [3 Keputusan — SUDAH DIPUTUSKAN](#4-3-keputusan--sudah-diputuskan)
5. [Urutan Eksekusi Antar-Repo](#5-urutan-eksekusi-antar-repo)
6. [Eksekusi SERVER](#6-eksekusi-server)
7. [Eksekusi CLIENT](#7-eksekusi-client)
8. [Fase 3 — Nuclear](#8-fase-3--nuclear-dieksekusi-bukan-expandcontract)
9. [Verifikasi & Rollback](#9-verifikasi--rollback)
10. [Checklist Final](#10-checklist-final)
11. [Fase 4 — Hapus Admin Panel](#11-fase-4--hapus-admin-panel)

---

## 1. KOREKSI KRITIS ATAS 2 DOKUMEN LAMA

Dua file MD yang lo share ditulis dari audit **sebelum** PLAN EMAS final.
Ada 3 hal yang kalau diikuti mentah-mentah akan **merusak fitur yang lo bilang TETAP**.

### ❌ KOREKSI #1 — Tripay & Subscription JANGAN dihapus

`PANGKAS_PRODUCT_DIGITAL.md` STEP 1 menyuruh:

```bash
rm -rf src/tripay        # ⛔ JANGAN
rm -rf src/subscription  # ⛔ JANGAN
```

Tapi PLAN EMAS FINAL bilang **TETAP**:
> 1. ✅ Tripay (QRIS subscription)
> 2. ✅ Plan FREE/STARTER/BUSINESS
> 3. ✅ Subscription page + status

Kalau 2 folder itu dihapus, **seluruh monetisasi platform hilang** — tidak ada
cara seller bayar STARTER/BUSINESS, dan `KasirPlanGuard` (yang baca
`subscriptionTier`) mengunci kasir untuk semua orang selamanya.

**Yang benar:** `src/tripay/` (10 file) dan `src/subscription/` (5 file) **TETAP**.
Yang dibuang cuma **LemonSqueezy** (bayar via kartu) — dan itu perlu operasi
bedah di dalam `subscription.service.ts`, bukan `rm -rf`.

Konsekuensi berantai — model Prisma ini juga **TETAP** (dokumen lama menyuruh hapus):

| Model / Enum | Alasan wajib tinggal |
|---|---|
| `Subscription` | `TripayPayment.subscriptionId` → FK ke sini. Hapus = Tripay mati. |
| `TripayPayment` | Inti pembayaran QRIS. |
| `WebhookEvent` | Idempotency webhook Tripay (`tripayEventId`). |
| `SubscriptionStatus` | Dipakai `Subscription.status` + `Tenant.subscriptionStatus`. |
| `TripayPaymentStatus` | Dipakai `TripayPayment.status`. |
| `SubscriptionTier` | Dipakai `Tenant.subscriptionTier` + `KasirPlanGuard`. |

Di sisi client, ini juga **TETAP** (dokumen lama menyuruh hapus):

```
src/components/dashboard/subscription/     (4 file — buang opsi Kartu saja)
src/hooks/dashboard/use-tripay-checkout.ts
src/hooks/dashboard/use-tripay-payment.ts
src/hooks/dashboard/use-subscription-plan.ts
src/lib/api/subscription.ts
src/app/[locale]/(dashboard)/dashboard/subscription/
messages/*/dashboard.json → key "subscription"
```

### ❌ KOREKSI #2 — Semua path client kurang prefix `src/`

Dokumen frontend menulis:

```bash
rm -rf "app/[locale]/discover"     # ⛔ tidak ada folder ini
rm -f components/dashboard/product/kyc-banner.tsx   # ⛔ tidak ada
```

Struktur asli repo `umkm-client` pakai **`src/`**:

```bash
rm -rf "src/app/[locale]/discover"                    # ✅
rm -f src/components/dashboard/product/kyc-banner.tsx  # ✅
```

`rm -f` pada path yang tidak ada **exit 0 tanpa pesan apa pun**. Kalau dijalankan
apa adanya, lo akan mengira 28 file terhapus padahal **nol** yang terhapus, lalu
bingung kenapa `npm run build` masih ijo.

### ❌ KOREKSI #3 — Ada 9 file/tempat yang tidak disebut sama sekali

Hasil audit menemukan titik-titik ini menyimpan produk digital tapi luput dari
kedua dokumen. Kalau dilewat, build **pecah** atau menu hantu tetap muncul:

| File | Kenapa penting |
|---|---|
| `src/i18n/request.ts` | Meng-`import` `discover.json` + `checkout.json`. Hapus JSON tanpa edit file ini → **build gagal total**. |
| `src/components/layout/dashboard/sidebar-nav.tsx` | Nav **ketiga** (selain sidebar & mobile-navbar). Punya link `/dashboard/library` + `/discover`. |
| `src/components/user-auth/` (3 file) | AuthDialog + form login/register dialog. Cuma di-mount di `/discover/layout.tsx`. Jadi yatim setelah discover hilang. |
| `src/hooks/user/use-buyer-register.ts` | Register BUYER dari dialog `/discover`. |
| `src/hooks/user/use-upgrade-to-seller.ts` | **Sudah dead code sekarang** — nol konsumen. |
| `src/hooks/shared/use-preview.ts` | `import { discoverApi }` → pecah begitu `lib/api/discover.ts` hilang. |
| `src/types/discover.ts` | Tipe marketplace. |
| `src/app/[locale]/(dashboard)/dashboard/onboard/page.tsx` | Route KYC **kedua**, beda dari `src/app/[locale]/onboard/`. |
| `next-sitemap.config.js` | Meng-exclude `/checkout/*` + `/onboard/*` yang sudah tidak ada. |

Ditambah di server:

| File | Kenapa penting |
|---|---|
| `src/admin/admin.service.ts` | Revenue platform dihitung dari `purchase.aggregate()` → error kompilasi begitu model `Purchase` hilang. |
| `src/admin/admin-maintenance.service.ts` | `downloadLog.deleteMany()` → sama. |
| `src/tenants/tenants.service.ts` | Query pakai filter `fileKey: null`. |

---

## 2. MATRIKS HAPUS / TETAP / UBAH

### SERVER — HAPUS TOTAL (40 file)

```
src/checkout/          5 file   Stripe checkout session
src/discover/          4 file   Marketplace publik
src/library/           3 file   Perpustakaan pembeli
src/refund/            5 file   Auto-refund
src/stripe/            7 file   Stripe Connect + KYC
src/storage/           2 file   Cloudflare R2
src/lemon-squeezy/     6 file   Billing kartu
                      ──────
                      32 file

src/common/guards/digital-products.guard.ts
src/products/products-kyc.service.ts
src/products/products-upload.service.ts
src/products/pdf-validation.ts
src/products/preview-generation.ts
src/products/dto/initiate-upload.dto.ts
src/products/dto/confirm-upload.dto.ts
src/products/dto/query-download-history.dto.ts
                      ──────
                       8 file

TOTAL SERVER DIHAPUS: 40 file
```

### SERVER — TETAP UTUH

```
src/auth/         src/tenants/      src/kasir/
src/admin/        src/redis/        src/prisma/
src/validators/   src/common/       (minus digital-products.guard.ts)
src/tripay/       10 file — ⚠️ TETAP, koreksi #1
```

### SERVER — TETAP TAPI DIUBAH (17 file)

| File | Perubahan |
|---|---|
| `src/app.module.ts` | Buang 8 import digital. Sisakan `SubscriptionModule` + `TripayModule`. |
| `src/main.ts` | Raw-body: sisakan **hanya** `/api/webhooks/tripay`. Buang 2 log webhook. |
| `src/products/products.module.ts` | Buang `StripeModule` + 2 service. |
| `src/products/products.controller.ts` | Buang 7 endpoint digital + import guard. |
| `src/products/products.service.ts` | Buang `StorageService`, 3 method, 5 filter `fileKey`. |
| `src/products/dto/index.ts` | Buang 3 export. |
| `src/subscription/subscription.module.ts` | Buang `LemonSqueezyModule`. |
| `src/subscription/subscription.service.ts` | Buang `LemonSqueezyService` + 3 cabang LS. |
| `src/subscription/subscription.controller.ts` | Buang `POST /subscription/checkout` (LS). |
| `src/subscription/plan-limits.ts` | Buang 4 field digital. |
| `src/subscription/subscription.constants.ts` | Ambang tetap; komentar sumber diperbarui ke kasir (Keputusan B). |
| `src/tenants/tenants.service.ts` | Buang filter + select `fileKey`. |
| `src/admin/admin.service.ts` | Revenue tanpa `Purchase`; buang `lsCustomerId`, `totalSalesAmount`, `totalSalesCount`. |
| `src/admin/admin-maintenance.service.ts` | Buang cleanup `downloadLog`; **pertahankan** cleanup `WebhookEvent`. |
| `src/admin/admin.controller.ts` | Update doc-comment cleanup. |
| `prisma/schema.prisma` | Lihat Bagian 8. |
| `src/auth/auth.controller.ts` + `auth.service.ts` + `dto/` | Buang `POST /register-buyer` + `RegisterBuyerDto` (Keputusan A). |
| `package.json` | Buang `stripe`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `pdf-lib`. |

### CLIENT — HAPUS TOTAL (57 file)

```
── App Routes (20) ─────────────────────────────────────────
src/app/[locale]/discover/                              9
src/app/[locale]/checkout/                              4
src/app/[locale]/(dashboard)/dashboard/library/         2
src/app/[locale]/(dashboard)/dashboard/products/downloads/  2
src/app/[locale]/onboard/                               2
src/app/[locale]/(dashboard)/dashboard/onboard/         1   ← luput di MD lama

── Components (20) ─────────────────────────────────────────
src/components/discover/                                6
src/components/library/                                 4
src/components/user-auth/                               3   ← luput di MD lama
src/components/store/checkout/stripe-checkout-button.tsx    1
src/components/dashboard/product/kyc-banner.tsx             1
src/components/dashboard/product/storage-usage-bar.tsx      1
src/components/dashboard/product/upload-dropzone.tsx        1
src/components/dashboard/product/download-history-table.tsx 1
src/components/dashboard/product/form/step-upload.tsx       1
src/components/shared/coming-soon-page.tsx                  1

── Hooks (6) ───────────────────────────────────────────────
src/hooks/dashboard/use-checkout.ts
src/hooks/dashboard/use-library.ts
src/hooks/dashboard/use-refund.ts
src/hooks/shared/use-preview.ts                             ← luput di MD lama
src/hooks/user/use-buyer-register.ts                        ← luput di MD lama
src/hooks/user/use-upgrade-to-seller.ts                     ← dead code

── Lib / Store / Types (7) ─────────────────────────────────
src/lib/api/checkout.ts
src/lib/api/discover.ts
src/lib/api/library.ts
src/lib/api/refund.ts
src/lib/config/features.ts
src/stores/auth-dialog-store.ts
src/types/discover.ts                                       ← luput di MD lama

── i18n (4) ────────────────────────────────────────────────
messages/{en,id}/discover.json
messages/{en,id}/checkout.json

TOTAL CLIENT DIHAPUS: 57 file
```

### CLIENT — TETAP UTUH (jangan disentuh)

```
src/components/dashboard/studio/     Landing builder + 25 block   ⚠️ BUKAN fitur digital
src/components/dashboard/kasir/      POS
src/components/dashboard/settings/   Settings
src/hooks/shared/use-cloudinary-upload.ts   Upload FOTO produk (bukan R2)
src/hooks/shared/use-image-crop.ts
src/components/store/checkout/whatsapp-order-button.tsx     ← inti checkout UMKM
src/components/store/checkout/contact-seller-button.tsx     ← inti checkout UMKM
src/stores/auth-store.ts
src/lib/shared/product-utils.ts      (hapus 1 fungsi saja, lihat bawah)

⚠️ KOREKSI #1 — semua ini TETAP:
src/components/dashboard/subscription/       (4 file)
src/hooks/dashboard/use-tripay-checkout.ts
src/hooks/dashboard/use-tripay-payment.ts
src/hooks/dashboard/use-subscription-plan.ts
src/lib/api/subscription.ts
src/app/[locale]/(dashboard)/dashboard/subscription/
```

### CLIENT — TETAP TAPI DIUBAH (26 file)

| File | Perubahan |
|---|---|
| `src/i18n/request.ts` | ⚠️ **WAJIB** — buang 2 baris import JSON. Lupa = build gagal. |
| `src/components/layout/dashboard/dashboard-sidebar.tsx` | Buang menu library/onboard + cabang `FEATURES`. |
| `src/components/layout/dashboard/mobile-navbar.tsx` | Idem. |
| `src/components/layout/dashboard/sidebar-nav.tsx` | ⚠️ Nav ketiga — buang `/dashboard/library` + `/discover`. |
| `src/components/layout/dashboard/dashboard-route-guard.tsx` | Runtuhkan Case A/B; `/dashboard/onboard` keluar dari daftar. |
| `src/components/dashboard/product/form/product.tsx` | `stepKeys` → `['details','cover']`; buang `StepUpload`, `showFileStep`. |
| `src/components/dashboard/product/form/step-details.tsx` | Buang cabang `priceHelper` vs `priceHelperNoDigital`. |
| `src/components/dashboard/product/form/step-preview.tsx` | Buang prop `showFileSection`. |
| `src/components/dashboard/product/product-grid-card.tsx` | Buang badge digital + `_count.purchases`. |
| `src/components/dashboard/product/product-preview-drawer.tsx` | Buang section file/storage/preview. |
| `src/components/store/product/product-actions.tsx` | Buang `StripeCheckoutButton`; sisakan WhatsApp. |
| `src/components/dashboard/subscription/payment-method-dialog.tsx` | Buang opsi **Kartu (LS)**; sisakan **QRIS**. |
| `src/components/dashboard/subscription/subscription-page-content.tsx` | Runtuhkan 6 cabang `FEATURES.digitalProducts`. |
| `src/app/[locale]/(dashboard)/dashboard/settings/client.tsx` | Runtuhkan cabang `FEATURES`. Tab subscription **TETAP**. |
| `src/hooks/auth/use-auth.ts` | Redirect pasca-login: buang cabang `/dashboard/library`. |
| `src/hooks/dashboard/use-products.ts` | Buang 6 hook digital (325–514). |
| `src/hooks/dashboard/use-subscription-plan.ts` | Buang field `digitalProducts`/`storageMb` dari fallback. |
| `src/lib/api/products.ts` | Buang 6 fungsi digital; gabung `updateFile` → `update`. |
| `src/lib/api/auth.ts` | Buang `registerBuyer()` (Keputusan A). |
| `src/lib/shared/product-utils.ts` | Buang **hanya** `isDigitalProduct()`; sisanya dipakai kasir & store. |
| `src/types/product.ts` | Buang tipe digital + field digital dari `Product`. |
| `src/lib/constants/shared/route-guard.ts` | Bersihkan komentar BUYER; `SELLER_ONLY_ROUTES` + `isBuyerRestrictedRoute` tetap dipakai guard. |
| `next-sitemap.config.js` | Buang exclude `/checkout/*`, `/onboard/*`. |
| `messages/{en,id}/dashboard.json` | Buang key `library`, `comingSoon`, `onboard`, `kycBanner`. **Sisakan `subscription`.** |
| `messages/{en,id}/store.json` | Buang key `checkout` (Stripe). |
| `package.json` | Buang `pdfjs-dist`. |

---

## 3. JEBAKAN HASIL AUDIT — BACA SEBELUM NGODING

Delapan hal yang **gagal secara diam-diam** kalau cuma ikut checklist.

### 🪤 J1 — `fileKey: null` itu FILTER, bukan cuma kolom

Ada **6 query** yang memakai `fileKey: null` untuk menyembunyikan produk digital
dari katalog. Begitu kolom `fileKey` di-drop, Prisma Client **error kompilasi**
di 6 titik ini:

```
src/products/products.service.ts:265   findByStoreSlug  (etalase toko)
src/products/products.service.ts:839   getKasirProducts (grid kasir)
src/products/products.service.ts:902   getKasirLayanan  (katalog jasa)
src/products/products.service.ts:943   getKasirCategories
src/tenants/tenants.service.ts:174     produk di landing page
src/kasir/stok/kasir-stok.service.ts:35  laporan stok     ← luput di audit awal
```

> Titik keenam ditemukan saat eksekusi Fase 2, bukan saat audit. Pelajarannya:
> jangan cari `fileKey` cuma di `products/` dan `tenants/` — sisir SELURUH `src/`.

Buang **barisnya**, jangan diganti apa pun — tanpa produk digital, semua produk
memang harus tampil.

### 🪤 J2 — `Subscription` tidak bisa di-drop, ada FK dari Tripay

`TripayPayment.subscriptionId` → `Subscription.id`. `DROP TABLE subscriptions`
akan ditolak Postgres, atau kalau dipaksa cascade, **menghapus seluruh riwayat
pembayaran QRIS**. Model ini tinggal; yang dibuang cuma kolom `ls_*` di dalamnya.

### 🪤 J3 — `WebhookEvent` dipakai bersama, jangan dihapus

Dokumen lama menyuruh hapus. Kenyataannya `tripay-webhook.controller.ts:152`
memakainya untuk klaim idempotency. Yang dibuang cuma 2 **kolom**:
`stripe_event_id` dan `ls_event_id`. Tabelnya tinggal.

### 🪤 J4 — ⛔ BUSINESS jadi mustahil dibeli (bug senyap paling mahal)

`subscription.service.ts:551` menggerbangi upgrade BUSINESS:

```ts
const qualified =
  tenant.totalSalesAmount >= 3_000_000 ||
  tenant.totalSalesCount   >= 20;
```

Dua kolom itu **satu-satunya penulisnya** adalah `stripe-connect.handlers.ts:489`
— file yang dihapus di rencana ini. Setelah pangkas, keduanya **permanen 0**,
sehingga:

> **Tidak ada satu pun seller yang bisa upgrade ke BUSINESS. Selamanya.**

Tidak ada error, tidak ada log. Cuma pesan "butuh Rp 3.000.000 / 20 transaksi,
saat ini Rp 0 / 0 transaksi" yang tidak akan pernah berubah.
→ Diselesaikan di **Keputusan B**: sumber angka pindah ke omzet kasir.

### 🪤 J5 — `i18n/request.ts` bikin build gagal total

`src/i18n/request.ts:37-39` meng-`import` `discover.json` dan `checkout.json`.
Menghapus JSON tanpa mengedit file ini = **Next.js build gagal**, bukan warning.
Hapus JSON dan edit `request.ts` dalam **commit yang sama**.

### 🪤 J6 — Admin panel error kompilasi di 2 tempat

```
src/admin/admin.service.ts:111,114        this.prisma.purchase.aggregate(...)
src/admin/admin-maintenance.service.ts:45 this.prisma.downloadLog.deleteMany(...)
```

Revenue platform saat ini = jumlah `Purchase.platformFeeAmount`. Tanpa produk
digital, **platform tidak punya per-transaction revenue sama sekali** — pendapatan
cuma dari langganan. Ganti agregasi itu jadi hitungan langganan aktif
(`Tenant.subscriptionTier != FREE`), atau kembalikan `0` dengan komentar jujur.
Jangan dibiarkan sebagai TODO diam.

### 🪤 J7 — `FEATURES.digitalProducts` sudah `false` di produksi

Kabar baik: flag ini default `false`, jadi **jalur "digital OFF" adalah perilaku
yang sekarang hidup**. Menghapus flag = mengunci cabang `false` yang sudah
dipakai user tiap hari. Risiko regresi rendah — asal setiap `if` diruntuhkan ke
cabang `false`, **bukan** dihapus buta.

Ada 18 titik pemakaian. Aturannya:

```tsx
// SEBELUM
const showFileStep = FEATURES.digitalProducts || (product != null && isDigitalProduct(product));
// SESUDAH  →  false || (…) menjadi hanya (…), lalu isDigitalProduct ikut hilang
// hasil akhir: buang variabelnya, step 'file' tidak pernah ada
```

### 🪤 J8 — `products.service.ts:711` memblokir hapus produk

`remove()` menolak menghapus produk yang punya riwayat `Purchase`. Setelah model
`Purchase` hilang, blok ini harus dibuang — kalau tidak, error kompilasi. Efek
sampingnya bagus: seller akhirnya bisa menghapus produk lama tanpa hambatan.

---

## 4. 3 KEPUTUSAN — SUDAH DIPUTUSKAN

Tiga hal ini tidak bisa disimpulkan dari kode. **Ketiganya sudah dijawab** —
spesifikasinya di bawah sudah mengikat, tinggal dieksekusi.

### ✅ Keputusan A — Role BUYER: **bersihkan jalur, sisakan enum**

BUYER cuma pernah ada untuk beli produk digital di `/discover`. Setelah discover
hilang, BUYER tidak punya alasan hidup.

**Yang dilakukan:**

| Target | Aksi |
|---|---|
| `POST /auth/register-buyer` | Hapus endpoint + `RegisterBuyerDto` + `registerBuyer()` di service |
| `src/components/user-auth/` (3 file) | Hapus |
| `src/hooks/user/use-buyer-register.ts` | Hapus |
| `src/hooks/user/use-upgrade-to-seller.ts` | Hapus (sudah dead code) |
| `dashboard-route-guard.tsx` Case A | Runtuhkan: `role === 'BUYER'` → `/dashboard/setup-store` |
| `dashboard-route-guard.tsx` Case B | Hapus (tujuannya `/dashboard/library` sudah tiada) |
| `use-auth.ts` redirect | Selalu `/dashboard/products`, tidak pernah `/dashboard/library` |
| `buyerNavItems` di 3 file nav | Hapus |

**Yang TIDAK dilakukan:**

```prisma
enum TenantRole { SELLER  BUYER }   // ⚠️ nilai BUYER TETAP di database
```

Baris tenant lama yang ber-role BUYER tetap valid dan tetap bisa login — mereka
mendarat di `/dashboard/setup-store` untuk jadi seller. Menghapus nilai enum
akan menuntut backfill dan bisa menggagalkan migrasi di produksi; menyimpannya
harganya nol.

### ✅ Keputusan B — Qualifier BUSINESS: **ganti sumber ke omzet kasir**

Jebakan J4 diselesaikan dengan memindahkan sumber angka dari kolom Stripe yang
mati ke transaksi kasir yang hidup. Maksud produk terjaga — *"buktikan lo toko
beneran"* — dan ambang Rp 3.000.000 / 20 transaksi justru lebih pas untuk omzet
kasir UMKM daripada untuk penjualan PDF.

**Sumber angka baru** — `KasirTransaksi`, difilter `status: COMPLETED`:

```ts
// src/subscription/subscription.service.ts
private async resolveOmzetKasir(tenantId: string) {
  const agg = await this.prisma.kasirTransaksi.aggregate({
    where: { tenantId, status: 'COMPLETED' },
    _sum: { grandTotal: true },
    _count: true,
  });
  return {
    totalAmount: agg._sum.grandTotal ?? 0,
    totalCount: agg._count,
  };
}
```

Kenapa `status: COMPLETED` dan bukan yang lain:

| Status | Ikut dihitung? | Alasan |
|---|---|---|
| `COMPLETED` | ✅ | Selesai dan lunas — ini definisi omzet di repo ini |
| `BELUM_BAYAR` | ❌ | Pesanan jasa yang uangnya belum diterima |
| `VOID` | ❌ | Salah input, bukan penjualan |
| `REFUND` | ❌ | Uang sudah balik ke pelanggan |

**Perubahan menyusul:**

- `assertTierUpgradeAllowed()` — parameter `tenant.totalSalesAmount/Count` diganti
  hasil `resolveOmzetKasir()`. Isi gerbangnya (`>= 3jt` OR `>= 20 transaksi`) **tidak berubah**.
- `getPlanInfo()` baris 107–131 — `businessQualified` dan `totalAmount` dibaca
  dari sumber yang sama, supaya kartu progres di FE menampilkan angka yang
  benar-benar dipakai gerbangnya. Kalau tidak disamakan, seller bisa lihat
  "sudah memenuhi" tapi tetap ditolak saat checkout.
- `subscription.constants.ts` — `BUSINESS_QUALIFIER_AMOUNT_IDR` dan
  `_TX_COUNT` **tetap**, komentarnya diperbarui: sumbernya kini kasir, bukan
  Stripe Connect.
- `Tenant.totalSalesAmount` + `totalSalesCount` — jadi yatim, **di-drop** di
  Bagian 8b. `admin.service.ts` yang men-`select` keduanya ikut dibersihkan.
- FE `subscription-page-content.tsx` — kartu `businessQualified` **tetap hidup**,
  tidak perlu diubah: ia membaca respons `GET /subscription/me` yang sekarang
  berisi angka kasir.

⚠️ **Efek yang harus disadari:** seller yang dulu "lolos" lewat penjualan digital
tidak otomatis lolos lewat kasir. Setelah rilis, cek dulu apakah ada tenant
BUSINESS aktif — mereka tidak diturunkan (gerbang ini hanya menjaga *upgrade*),
tapi kalau berhenti berlangganan mereka tidak bisa naik lagi tanpa omzet kasir.

### ✅ Keputusan C — `Product.currency`: **dipertahankan**

Non-null, `@default("IDR")`, dipakai 6 `select` dan formatter harga storefront.
Kolom ini bukan sisa produk digital. Menghapusnya menyentuh 6 select + tipe FE +
1 migrasi demi menghemat satu kolom `String`. Tidak sepadan — biarkan.

---

## 5. URUTAN EKSEKUSI ANTAR-REPO

Urutan ini penting supaya **tidak ada jendela waktu di mana user lihat error**.

```
FASE 1 — CLIENT  ▸ hapus semua pemanggilan endpoint digital ▸ deploy
         Server masih punya endpoint itu, tapi tidak ada yang memanggil.
         Aman: endpoint nganggur ≠ endpoint rusak.

FASE 2 — SERVER  ▸ hapus kode + endpoint, schema Prisma MASIH UTUH ▸ deploy
         Kode berhenti menyentuh kolom digital, tapi kolomnya masih di DB.
         Reversibel penuh: rollback = deploy commit sebelumnya.

FASE 3 — SERVER  ▸ migrasi DROP kolom & tabel ▸ setelah Fase 2 stabil ≥ 1 hari
         Titik tanpa jalan pulang. Backup wajib. Detail di Bagian 8.
```

⛔ **Jangan** balik urutan Fase 1 dan 2. Kalau server mencabut endpoint duluan,
setiap `/discover` dan `/dashboard/library` yang masih ter-deploy di client akan
melempar 404/500 ke muka user sampai client menyusul.

---

## 6. EKSEKUSI SERVER

Semua perintah dari `/home/user/umkm-server`, di branch `claude/emas-plan-final-ndvcu0`.

### S1 — Hapus folder & file (40 file)

```bash
rm -rf src/checkout src/discover src/library src/refund \
       src/stripe src/storage src/lemon-squeezy

rm -f  src/common/guards/digital-products.guard.ts \
       src/products/products-kyc.service.ts \
       src/products/products-upload.service.ts \
       src/products/pdf-validation.ts \
       src/products/preview-generation.ts \
       src/products/dto/initiate-upload.dto.ts \
       src/products/dto/confirm-upload.dto.ts \
       src/products/dto/query-download-history.dto.ts
```

⚠️ **JANGAN** `rm -rf src/tripay src/subscription` — lihat Koreksi #1.

### S2 — `src/app.module.ts`

Buang 8 import + 8 entri `imports[]`: `StorageModule`, `StripeModule`,
`CheckoutModule`, `LibraryModule`, `DiscoverModule`, `RefundModule`,
`LemonSqueezyModule`. **Pertahankan** `SubscriptionModule`, `TripayModule`,
`ScheduleModule` (dipakai cron rekonsiliasi Tripay).

### S3 — `src/main.ts`

Raw-body **tetap dibutuhkan** untuk verifikasi signature Tripay. Persempit saja:

```ts
// SEBELUM: 3 path  →  SESUDAH: 1 path
if (req.path === '/api/webhooks/tripay') { … }
```

Buang 2 baris log (`Stripe Connect webhook`, `LemonSqueezy webhook`), baris
`📦 Digital Products`, dan konstanta `digitalEnabled`. Ubah baris provider jadi
`🏧 Tripay (QRIS)`. `interface RawBodyRequest` dan `import { json }` **tetap**.

### S4 — `src/products/` (module, controller, service, dto)

- **module** — buang `StripeModule` + `ProductsKycService` + `ProductsUploadService`.
- **controller** — buang 7 endpoint: `GET public/:id/preview`, `POST kyc/initiate`,
  `GET kyc/status`, `POST upload/initiate`, `POST upload/confirm`,
  `GET storage/usage`, `GET downloads`. Plus import `DigitalProductsGuard`.
- **service** — buang import `StorageService`, properti constructor `storage`,
  method `getPublicPreview` / `getStorageUsage` / `getDownloadHistory`, blok
  penghapusan R2 + `storageUsedMb` di `remove()`, blok penolak hapus karena
  `Purchase` (jebakan J8), semua `select` field digital, dan **5 filter
  `fileKey: null`** (jebakan J1). Ganti `PlanName` → `SubscriptionTier` dari
  `@prisma/client` di `resolveTierForTenant`.
- **dto/index.ts** — sisakan 3 export.

### S5 — `src/subscription/` — operasi bedah, bukan penghapusan

| File | Perubahan |
|---|---|
| `subscription.module.ts` | `imports: [TripayModule]` saja. |
| `subscription.service.ts` | Buang import + properti `lsService`. `getPlanInfo`: buang `select` `lsSubscriptionId`, `totalSalesAmount`, `totalSalesCount` → ganti `resolveOmzetKasir()`. `createCheckout` (LS): **hapus method**. `cancelSubscription`: buang cabang LS, sisakan jalur Tripay (yang memang sudah menangani "tenant tanpa lsSubscriptionId"). Tambah `resolveOmzetKasir()` + sesuaikan `assertTierUpgradeAllowed()` (Keputusan B). |
| `subscription.controller.ts` | Buang `POST /subscription/checkout`. **Pertahankan** `POST /checkout/tripay`, `GET /tripay/payments/:id`, `GET /me`, `GET /verify`, `POST /cancel`. |
| `plan-limits.ts` | Buang `maxDigitalProducts`, `maxStorageGb`, `maxFileSizeMb`, `allowedFileTypes`. |
| `subscription.constants.ts` | Ambang `3_000_000` / `20` **tetap**; perbarui komentar: sumbernya kini `KasirTransaksi`, bukan Stripe Connect. |

### S6 — `src/admin/` (jebakan J6)

- `admin.service.ts` — ganti 2 `purchase.aggregate()` dengan metrik langganan;
  buang `select` `lsCustomerId`, `subscription.lsSubscriptionId`,
  `totalSalesAmount`, `totalSalesCount` (kolomnya di-drop, lihat 8b).
- `admin-maintenance.service.ts` — buang `cleanupExpiredDownloadLogs` dan field
  `downloadLogsDeleted`. **Pertahankan** `cleanupOldWebhookEvents` (jebakan J3).
- `admin.controller.ts` — perbarui doc-comment endpoint cleanup.

### S7 — `src/tenants/tenants.service.ts`

Buang filter `fileKey: null` (baris 174) dan `select` `fileKey` (baris 187).
Import `PLAN_LIMITS` **tetap** — dipakai `componentBlockVariants` untuk studio.

### S8 — `package.json`

```bash
npm uninstall stripe @aws-sdk/client-s3 @aws-sdk/s3-request-presigner pdf-lib
```

`axios` + `@nestjs/axios` **tetap** — dipakai `tripay-client.service.ts`.

### S9 — ENV

Buang: `STRIPE_*`, `R2_*`, `LEMON_SQUEEZY_*`, `LS_ALLOW_TEST_MODE`,
`DIGITAL_PRODUCTS_ENABLED`.
**Pertahankan**: semua `TRIPAY_*`, `DATABASE_URL`, `DIRECT_URL`, `JWT_*`,
`ADMIN_*`, `NODE_ENV`, `PORT`, `FRONTEND_URL`, `COOKIE_DOMAIN`, `UPSTASH_*`.

---

## 7. EKSEKUSI CLIENT

Semua perintah dari `/home/user/umkm-client`. **Perhatikan prefix `src/`** (Koreksi #2).

### C1 — Hapus file (57 file)

```bash
# App routes
rm -rf "src/app/[locale]/discover" \
       "src/app/[locale]/checkout" \
       "src/app/[locale]/(dashboard)/dashboard/library" \
       "src/app/[locale]/(dashboard)/dashboard/products/downloads" \
       "src/app/[locale]/onboard" \
       "src/app/[locale]/(dashboard)/dashboard/onboard"

# Components
rm -rf src/components/discover src/components/library src/components/user-auth
rm -f  src/components/store/checkout/stripe-checkout-button.tsx \
       src/components/dashboard/product/kyc-banner.tsx \
       src/components/dashboard/product/storage-usage-bar.tsx \
       src/components/dashboard/product/upload-dropzone.tsx \
       src/components/dashboard/product/download-history-table.tsx \
       src/components/dashboard/product/form/step-upload.tsx \
       src/components/shared/coming-soon-page.tsx

# Hooks
rm -f  src/hooks/dashboard/use-checkout.ts \
       src/hooks/dashboard/use-library.ts \
       src/hooks/dashboard/use-refund.ts \
       src/hooks/shared/use-preview.ts \
       src/hooks/user/use-buyer-register.ts \
       src/hooks/user/use-upgrade-to-seller.ts

# Lib / store / types
rm -f  src/lib/api/checkout.ts src/lib/api/discover.ts \
       src/lib/api/library.ts src/lib/api/refund.ts \
       src/lib/config/features.ts \
       src/stores/auth-dialog-store.ts \
       src/types/discover.ts

# i18n
rm -f  messages/en/discover.json messages/id/discover.json \
       messages/en/checkout.json messages/id/checkout.json
```

⚠️ **JANGAN** `rm -rf src/hooks/dashboard/use-tripay-*` atau
`src/components/dashboard/subscription/` — lihat Koreksi #1.

### C2 — `src/i18n/request.ts` — **lakukan di commit yang sama dengan C1**

Buang 2 baris:

```ts
...(await import(`../../messages/${locale}/discover.json`)).default,   // ⛔
...(await import(`../../messages/${locale}/checkout.json`)).default,   // ⛔
```

Perbarui komentar "Merge all 15 namespaced message files" → 12.

### C3 — Tiga file navigasi

`dashboard-sidebar.tsx`, `mobile-navbar.tsx`, dan **`sidebar-nav.tsx`** (yang
luput di MD lama). Buang entri `library`, `onboard`, `/discover`, dan semua
pembungkus `...(FEATURES.digitalProducts ? [...] : [])`. Array `buyerNavItems`
ikut hilang bersama Keputusan A.

### C4 — `dashboard-route-guard.tsx`

Runtuhkan Case A (`!FEATURES.digitalProducts && role === 'BUYER'` → jadi
`role === 'BUYER'`), buang Case B beserta `router.replace('/dashboard/library')`,
dan keluarkan `/dashboard/onboard` dari daftar path.

### C5 — Wizard produk

```ts
// product.tsx — SEBELUM
const showFileStep = FEATURES.digitalProducts || (product != null && isDigitalProduct(product));
const stepKeys = useMemo<StepKey[]>(() => (showFileStep ? ['details','file','cover'] : ['details','cover']), [showFileStep]);

// SESUDAH
const stepKeys = useMemo<StepKey[]>(() => ['details', 'cover'], []);
```

Buang import `StepUpload` + `isDigitalProduct`, blok render `<StepUpload/>`,
dan prop `showFileSection` di `step-preview.tsx`. Di `step-details.tsx`,
`priceHelper` selalu memakai varian `priceHelperNoDigital` (rename kuncinya
jadi `priceHelper` biar tidak aneh dibaca setahun lagi).

### C6 — Kartu & drawer produk

`product-grid-card.tsx`: buang badge tipe file, ukuran file, dan
`_count.purchases`. `product-preview-drawer.tsx`: buang section info file,
`StorageUsageBar`, tombol Preview PDF, dan import `usePreview`.

### C7 — `product-actions.tsx` (store)

```tsx
// SEBELUM: percabangan digital vs fisik
// SESUDAH: satu jalur
<WhatsAppOrderButton … />
```

Buang import `StripeCheckoutButton`.

### C8 — Subscription: buang Kartu, sisakan QRIS

- `payment-method-dialog.tsx` — buang blok Kartu/LemonSqueezy, `handleLemonSqueezy`,
  `lsLoading`, import `CreditCard`. Kalau QRIS jadi satu-satunya metode,
  pertimbangkan melompati dialog dan langsung memanggil `startCheckout()`.
- `subscription-page-content.tsx` — runtuhkan 6 cabang `FEATURES.digitalProducts`
  ke `false`: `visibleTiers` selalu varian non-digital, grid selalu `md:grid-cols-2`,
  banner BUSINESS-qualifier **tetap dirender** — datanya kini datang dari omzet
  kasir lewat `GET /subscription/me`, jadi tidak ada perubahan di sisi FE.

### C9 — API, hooks, tipe

- `lib/api/products.ts` — buang `initiateKyc`, `getKycStatus`, `initiateUpload`,
  `uploadToR2`, `confirmUpload`, `getStorageUsage`, `getDownloadHistory`.
  `updateFile` cuma alias `PATCH /products/:id` → gabungkan ke `update`.
- `hooks/dashboard/use-products.ts` — buang `useKycStatus`, `useInitiateKyc`,
  `useKycReturnHandler`, `useStorageUsage`, `useUploadProduct`,
  `useDownloadHistory`, `useUpdateProductFile` (baris 257–514).
- `types/product.ts` — buang `KycStatus*`, `StorageUsage`, `Refund*`, `Purchase`,
  `PublicProduct` (versi discover), `DiscoverResponse`, `InitiateUploadResponse`,
  `UpdateProductFileInput`, fungsi `isDigitalProduct`, dan field
  `fileKey`/`fileName`/`fileType`/`fileSizeMb`/`previewData`/`previewFileKey`/
  `previewPageCount`/`_count.purchases` dari `Product`. **`currency` tetap**
  (Keputusan C).
- `lib/shared/product-utils.ts` — buang **hanya** `isDigitalProduct()`.
  `getProductPricing`, `formatDurasiLayanan`, `getMaxImages` dipakai kasir & store.

### C10 — i18n, sitemap, deps

- `messages/{en,id}/dashboard.json` — buang `library`, `comingSoon`, `onboard`,
  `kycBanner`. **`subscription` TETAP** (Koreksi #1). Di dalam `products`, buang
  sub-key upload/file/storage.
- `messages/{en,id}/store.json` — buang key `checkout`.
- `next-sitemap.config.js` — buang exclude `/checkout/*`, `/id/checkout/*`, `/onboard/*`.
- `package.json` — `pnpm remove pdfjs-dist` (satu-satunya pemakainya adalah
  `components/discover/pdf-preview.tsx` yang sudah dihapus).

---

## 8. FASE 3 — NUCLEAR (dieksekusi, bukan expand–contract)

> Rencana awal memakai pola expand–contract karena mengasumsikan ada data
> produksi. **Ternyata belum ada satu pun user**, jadi strateginya diganti:
> pangkas sampai ke akar, tanpa menyisakan kompatibilitas mundur.

### 8a. Yang berubah dari rencana awal

| Rencana awal | Yang dieksekusi | Alasan |
|---|---|---|
| Drop kolom bertahap, backup wajib | Sekali jalan | Tidak ada data yang bisa hilang |
| `enum TenantRole.BUYER` dipertahankan | **Enum + kolom `role` dihapus total** | Tanpa BUYER, enum satu-nilai cuma menyisakan cabang mati di ~25 titik |
| `Product.currency` dipertahankan | **Dihapus** | Kolom itu ada karena produk digital sempat dihargai USD; platform ini Rupiah saja |
| `POST /subscription/cancel` dipertahankan | **Dihapus** | Tidak ada klien lama yang perlu dijawab |
| Riwayat migrasi dipertahankan | **Di-squash jadi satu `init`** | 4 migrasi lama memuat seluruh tabel digital |

### 8b. Schema akhir — 13 tabel

```
Tenant · Product · Subscription · TripayPayment · WebhookEvent
Admin · AdminLog
TenantKasirConfig · DiskonPreset · PromoRule
KasirTransaksi · KasirTransaksiItem · StockLog
```

Enum yang tersisa: `AdminRole`, `TenantStatus`, `SubscriptionTier`,
`SubscriptionStatus`, `TripayPaymentStatus`, `KasirPaymentMethod`,
`KasirTransaksiStatus`, `KasirItemType`, `StockLogType`, `TipePromo`,
`KasirItemKind`, `ProductKind`, `KasirDagangType`, `StatusJasa`.

### 8c. Yang dihapus dari schema

```prisma
model Purchase · DownloadLog · RefundRequest
enum  KycStatus · PurchaseSource · RefundStatus
      RefundApproveReason · RefundRejectReason · TenantRole

Tenant   : role, stripe*, kyc*, storageUsedMb, disputeCount, lastDisputeAt,
           lsCustomerId, totalSalesAmount, totalSalesCount, purchasesMade
Product  : fileKey, fileName, fileType, fileSizeMb, previewData,
           previewFileKey, previewPageCount, currency, purchases
Subscription : lsSubscriptionId, lsOrderId, lsVariantId, lsCustomerId,
               lsRenewsAt, lsEndsAt
WebhookEvent : stripeEventId, lsEventId (+ 2 index)
```

### 8d. Migrasi

Empat migrasi lama dihapus, diganti satu `20260820000000_init` (464 baris,
13 `CREATE TABLE`) yang dihasilkan dari schema bersih:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

⚠️ **Konsekuensi:** database mana pun yang sudah pernah menjalankan migrasi
lama TIDAK bisa lanjut — riwayatnya tidak cocok lagi. Jalankan
`npx prisma migrate reset` di setiap environment (lokal, staging) sebelum
`migrate deploy` pertama. Tidak ada data yang hilang karena memang belum ada.

### 8e. Seed

`prisma/seed-dev.ts` ditulis ulang. Dulu menyemai toko ebook + satu akun
BUYER; sekarang satu toko pangkas rambut yang menjual **barang sekaligus
layanan** — kasus yang paling banyak menyentuh fitur sekali jalan (katalog
produk, katalog jasa berdurasi, stok, grid kasir). Dua produk sengaja
disemai dengan stok 0 dan stok di bawah `minStock` supaya badge "HABIS" dan
kartu "stok menipis" langsung terlihat tanpa menyiapkan data manual.

---

## 9. VERIFIKASI & ROLLBACK

### 9a. Verifikasi statis — semua harus KOSONG

Server:
```bash
grep -rn "StorageService\|StripeModule\|StripeService\|DigitalProductsGuard" src/ --include=*.ts
grep -rn "CheckoutModule\|LibraryModule\|DiscoverModule\|RefundModule\|LemonSqueezy" src/ --include=*.ts
grep -rn "fileKey\|previewFileKey\|storageUsedMb\|downloadLog\|prisma.purchase" src/ --include=*.ts
```

Client:
```bash
grep -rn "FEATURES\|digitalProducts\|features'" src/ --include=*.ts --include=*.tsx
grep -rn "StripeCheckoutButton\|StorageUsageBar\|KycBanner\|UploadDropzone\|ComingSoonPage" src/
grep -rn "auth-dialog-store\|use-preview\|api/discover\|api/library\|api/refund\|api/checkout" src/
grep -rn "isDigitalProduct\|/dashboard/library\|'/discover'" src/
```

Yang **harus MASIH ADA** (kalau kosong, ada yang kebablasan):
```bash
grep -rn "TripayModule\|SubscriptionModule" src/ --include=*.ts          # server
grep -rn "use-tripay-checkout\|api/subscription\|WhatsAppOrderButton" src/ # client
```

### 9b. Verifikasi build

```bash
# server
npx prisma generate && npx tsc --noEmit && npm run build && npm test

# client
npx tsc --noEmit && npm run build
```

### 9c. Uji asap manual

| Alur | Harapan |
|---|---|
| `POST /api/auth/login` | 200, cookie terpasang |
| `GET /api/products/store/:slug` | Produk tampil — **termasuk** yang dulu punya `fileKey` |
| `GET /api/kasir/products` | Grid kasir terisi |
| `POST /api/kasir/transaksi` | Transaksi walk-in tersimpan |
| `GET /api/subscription/me` | ⚠️ Plan + status tampil; `totalAmount` = omzet kasir, bukan 0 |
| Upgrade BUSINESS | ⚠️ Tenant dengan omzet kasir ≥ Rp 3jt **bisa** checkout (jebakan J4 tertutup) |
| `POST /api/subscription/checkout/tripay` | ⚠️ QRIS terbit |
| `POST /api/webhooks/tripay` | ⚠️ Signature terverifikasi (raw body utuh) |
| Halaman produk toko | Hanya tombol WhatsApp |
| `/discover`, `/dashboard/library` | 404 |
| Sidebar | Tidak ada Library/Downloads/Onboard; **Subscription tetap ada** |
| Studio | 25 block utuh |

### 9d. Rollback

| Fase | Cara pulang |
|---|---|
| Fase 1 (client) | `git revert` + redeploy. Bersih. |
| Fase 2 (server, schema utuh) | `git revert` + redeploy. Bersih — kolom masih di DB. |
| Fase 3 (nuclear) | `git revert` + `prisma migrate reset`. Tidak ada data yang hilang karena belum ada user. |

---

## 10. CHECKLIST FINAL

### Sebelum mulai
- [x] Keputusan A — role BUYER: bersihkan jalur, sisakan enum
- [x] Keputusan B — qualifier BUSINESS dari omzet kasir (`KasirTransaksi`, `COMPLETED`)
- [x] Keputusan C — `Product.currency` dipertahankan
- [ ] Backup DB produksi dibuat & diverifikasi
- [ ] Branch `claude/emas-plan-final-ndvcu0` aktif di kedua repo

### Fase 1 — Client
- [ ] C1 hapus 57 file (cek `git status` menunjukkan 57 deletion, bukan 0)
- [ ] C2 `i18n/request.ts` — commit yang sama dengan C1 (jebakan J5)
- [ ] C3 tiga file nav termasuk `sidebar-nav.tsx`
- [ ] C4 route guard · C5 wizard · C6 kartu/drawer · C7 product-actions
- [ ] C8 subscription: Kartu hilang, **QRIS tetap**
- [ ] C9 api/hooks/tipe · C10 i18n/sitemap/deps
- [ ] Jejak BUYER bersih: user-auth/, use-buyer-register, Case A/B, redirect library
- [ ] `npx tsc --noEmit` bersih · `npm run build` sukses
- [ ] Deploy + asap test

### Fase 2 — Server (schema belum disentuh)
- [ ] S1 hapus 40 file — **`src/tripay` & `src/subscription` masih ada**
- [ ] S2 app.module · S3 main.ts (raw body Tripay tetap)
- [ ] S4 products — termasuk 5 filter `fileKey` (J1) & blok `Purchase` (J8)
- [ ] S5 subscription — bedah LS, Tripay utuh
- [ ] S5b `resolveOmzetKasir()` + `assertTierUpgradeAllowed()` pindah sumber (Keputusan B)
- [ ] S5c `POST /auth/register-buyer` + DTO dihapus (Keputusan A)
- [ ] S6 admin — `purchase.aggregate` & `downloadLog` (J6), `WebhookEvent` tetap (J3)
- [ ] S7 tenants · S8 deps · S9 env
- [ ] `npx tsc --noEmit` bersih · `npm run build` · `npm test` hijau
- [ ] Deploy + asap test — **webhook Tripay diuji betulan**

### Fase 3 — Nuclear
- [x] Schema dipangkas ke 13 tabel; `TenantRole`, `role`, `currency` ikut dicabut
- [x] 4 migrasi lama di-squash jadi satu `20260820000000_init`
- [x] `seed-dev.ts` ditulis ulang jadi toko UMKM (barang + jasa)
- [x] Jalur BUYER dicabut sampai ke wizard daftar dan setup-store
- [ ] `prisma migrate reset` di tiap environment sebelum deploy pertama
- [ ] Asap test ulang, terutama QRIS & kasir

### Hasil akhir
```
Platform UMKM murni yang mengudara — tanpa legacy, tanpa cabang mati:
  Auth · Tenant · Produk Fisik & Jasa · Kasir POS · Papan Kerja
  Studio (25 block) · Storefront + WhatsApp order · Admin
  Langganan FREE/STARTER/BUSINESS via QRIS Tripay
  Qualifier BUSINESS dihitung dari omzet kasir
Tanpa: Stripe · R2 · Digital Product · Discover · Library · Refund · LemonSqueezy · KYC
```

**Server:** 40 file dihapus · 17 dimodifikasi
**Client:** 57 file dihapus · 26 dimodifikasi

---

## 11. FASE 4 — HAPUS ADMIN PANEL

Panel admin dicabut sepenuhnya beserta rantainya: 15 file server, 20 file
client, 3 model Prisma, dan seluruh i18n-nya.

### 11a. Dua simpul yang menggantung — dan cara menanganinya

**🪤 Pembersih `WebhookEvent` ikut hilang.** `AdminMaintenanceService` adalah
SATU-SATUNYA yang menghapus catatan idempotency callback Tripay. Tabel itu
hanya bertambah; tidak ada jalur lain yang membersihkannya. Menghapus admin
tanpa menyiapkan pengganti berarti tabel membengkak diam-diam berbulan-bulan
— tanpa error, tanpa tanda apa pun, sampai query idempotency melambat.

→ Dipindah ke `TripayWebhookCleanupService`: `@Cron` harian jam 3 pagi di
`TripayModule`, modul yang memang memiliki tabelnya. Dikerjakan **sebelum**
`src/admin/` dihapus, bukan sesudah. Retensi tetap 90 hari.

**⚠️ `Tenant.status` tidak punya penulis lagi.** Kolom ini dibaca di gerbang
login, storefront publik, dan katalog, tapi yang MENULIS-nya hanya tombol
suspend di panel admin.

→ Kolomnya **DIPERTAHANKAN**. Ini satu-satunya sakelar untuk menurunkan toko
bermasalah (laporan penyalahgunaan, permintaan takedown). Menghapusnya berarti
platform tidak punya cara apa pun untuk menonaktifkan sebuah toko. Tanpa
panel, dijalankan lewat SQL:

```sql
UPDATE "Tenant" SET status = 'SUSPENDED' WHERE slug = '...';
```

### 11b. Yang dihapus

```
SERVER  src/admin/                          15 file
        prisma: model Admin, AdminLog, enum AdminRole
        prisma/seed-admin.ts + prisma/seed.ts (orkestrator)
        AdminModule di app.module.ts
        cabang cookie admin di auth-exception.filter.ts
        script prisma:seed:admin + prisma:seed:dev

CLIENT  app/[locale]/(admin)/                6 file
        app/[locale]/admin/login/            2 file
        components/admin/ · components/layout/admin/   5 file
        hooks/admin/ · lib/api/admin{,-client}.ts      3 file
        stores/admin-store.ts · types/admin.ts         2 file
        messages/{en,id}/admin.json                    2 file
        + namespace admin di query-keys, rute admin di sitemap,
          key adminLogin/toast.admin/validation.admin di i18n
```

Schema turun dari 13 tabel ke **11**. Halaman client dari 58 ke **48**.

### 11c. Yang sengaja TIDAK dihapus

| Hal | Alasan |
|---|---|
| `Tenant.status` + enum `TenantStatus` | Sakelar takedown, dijalankan via SQL |
| `GET /api/my-ip` (`ADMIN_SECRET_KEY`) | Bukan panel — alat diagnostik untuk menyetel `TRIPAY_CALLBACK_ALLOWED_IPS`. Salah isi di sana membuat callback Tripay ditolak diam-diam |
| `ADMIN_SECRET_KEY` di env | Dipakai endpoint di atas |

**ENV yang bisa dibuang:** `ADMIN_JWT_SECRET`.

### 11d. Seed diruntuhkan

Dulu tiga file: `seed.ts` sebagai orkestrator yang memanggil `seed-admin.ts`
lalu `seed-dev.ts`. Tanpa admin, orkestratornya cuma membungkus satu
pemanggilan — ketiganya diruntuhkan jadi `prisma/seed.ts` tunggal.
