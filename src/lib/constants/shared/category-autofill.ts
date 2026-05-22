// ============================================================================
// CATEGORY AUTOFILL — Phase B
// File: client/src/lib/constants/shared/category-autofill.ts
//
// [SETUP-GATE Phase B — May 2026]
// Smart defaults for the seller setup wizard.
// 41 business categories + __default__ fallback.
//
// TYPE SAFETY STRATEGY:
//
//   Problem: `getCategoryList()` returns CategoryConfig[] where .key: string,
//   not a literal type union — TypeScript can't derive a strict union from it.
//
//   Solution: dual-layer protection.
//
//   (A) Compile-time — `satisfies` operator (TS 4.9+):
//       CATEGORY_AUTOFILL is typed as the explicit CategoryKey union.
//       Adding a key to AUTOFILL_CATEGORY_KEYS but forgetting the entry = TS error.
//
//   (B) Runtime — dev-mode assertion:
//       On module load, we call getCategoryList() and assert every key in
//       categories.ts has a matching entry in CATEGORY_AUTOFILL.
//       This catches the reverse: adding to categories.ts but forgetting
//       to update AUTOFILL_CATEGORY_KEYS. Throws in development, warns in prod.
//
//   Together these two layers ensure drift is caught at CI (pnpm typecheck)
//   AND during local development before a PR is ever opened.
//
// Usage:
//   import { getCategoryAutofill, interpolate } from '@/lib/constants/shared/category-autofill';
//   const data = getCategoryAutofill(tenant.category);
//   const title = interpolate(data.heroTitle, tenant.name, tenant.category);
//
// When adding a new category:
//   1. Add the key to categories.ts (CATEGORY_CONFIG)
//   2. Add the key to AUTOFILL_CATEGORY_KEYS below
//   3. Add the autofill entry to CATEGORY_AUTOFILL below
//   pnpm typecheck will tell you exactly what's missing.
// ============================================================================

import { getCategoryList } from './categories';
import type { FeatureItem } from '@/types/tenant';

// ─── Canonical key list — single source of truth for typing ──────────────────
//
// Kept as const so TypeScript can derive a strict literal union.
// Must stay in sync with CATEGORY_CONFIG in categories.ts.
// The runtime assertion below will catch any drift.

const AUTOFILL_CATEGORY_KEYS = [
  // FOOD & DRINK
  'RESTAURANT', 'CAFE', 'BAKERY', 'FOOD_DELIVERY', 'CATERING', 'STREET_FOOD',
  // HEALTH & BEAUTY
  'HAIR_SALON', 'BARBERSHOP', 'NAIL_SALON', 'SPA_MASSAGE', 'SKINCARE_CLINIC',
  'GYM_FITNESS', 'PHARMACY',
  // RETAIL
  'FASHION_APPAREL', 'FOOTWEAR', 'ELECTRONICS_GADGETS', 'GROCERY_CONVENIENCE',
  'BEAUTY_COSMETICS', 'HOME_LIVING',
  // HOME SERVICES
  'CLEANING_SERVICE', 'LAUNDRY', 'PLUMBING', 'ELECTRICAL', 'AC_APPLIANCE_REPAIR',
  'INTERIOR_DESIGN', 'LANDSCAPING',
  // AUTOMOTIVE
  'CAR_REPAIR', 'MOTORCYCLE_REPAIR', 'CAR_WASH', 'AUTO_PARTS',
  // LIFESTYLE & ENTERTAINMENT
  'PHOTOGRAPHY', 'TRAVEL_AGENCY', 'HOTEL_LODGING', 'EVENT_VENUE',
  'TUTORING_EDUCATION',
  // PROFESSIONAL SERVICES
  'TAILOR', 'PET_SHOP', 'PET_GROOMING', 'PRINT_SHOP', 'RENTAL_PROPERTY',
  'MOVING_SERVICE',
] as const;

/** Strict union of all supported autofill category keys */
export type CategoryKey = typeof AUTOFILL_CATEGORY_KEYS[number];

/** Full map type — every CategoryKey must have an entry + __default__ */
type CategoryAutofillMap = { [K in CategoryKey]: CategoryAutofill } & {
  __default__: CategoryAutofill;
};

// ─── Runtime drift detection (dev + prod) ────────────────────────────────────
//
// Runs once at module load. Compares AUTOFILL_CATEGORY_KEYS against the live
// CATEGORY_CONFIG in categories.ts. Logs warnings for any gaps in either direction.
//
// In development: throws so the problem is impossible to miss.
// In production: warns so logs capture it without breaking the app.

function assertAutofillCoverage(): void {
  const registryKeys = new Set(getCategoryList().map((c) => c.key));
  const autofillKeys = new Set<string>(AUTOFILL_CATEGORY_KEYS);

  const inRegistryNotAutofill = [...registryKeys].filter((k) => !autofillKeys.has(k));
  const inAutofillNotRegistry = [...autofillKeys].filter((k) => !registryKeys.has(k));

  if (inRegistryNotAutofill.length === 0 && inAutofillNotRegistry.length === 0) {
    return; // All good
  }

  const lines: string[] = ['[category-autofill] Coverage mismatch detected:'];

  if (inRegistryNotAutofill.length > 0) {
    lines.push(
      `  ❌ In categories.ts but MISSING from autofill: ${inRegistryNotAutofill.join(', ')}`,
      '     → Add entries to CATEGORY_AUTOFILL in category-autofill.ts',
    );
  }

  if (inAutofillNotRegistry.length > 0) {
    lines.push(
      `  ⚠️  In autofill but NOT in categories.ts: ${inAutofillNotRegistry.join(', ')}`,
      '     → Either add to CATEGORY_CONFIG in categories.ts or remove from autofill',
    );
  }

  const message = lines.join('\n');

  if (process.env.NODE_ENV === 'development') {
    throw new Error(message);
  } else {
    console.warn(message);
  }
}

assertAutofillCoverage();

// ─── Autofill shape ───────────────────────────────────────────────────────────

export interface CategoryAutofill {
  /** Hex color — must exist in THEME_COLORS */
  primaryColor: string;
  /** Unsplash CDN URL — landscape, tested */
  heroBackgroundImage: string;
  /** Supports {{storeName}} placeholder */
  heroTitle: string;
  /** Generic but relatable — no {{storeName}} needed */
  heroSubtitle: string;
  /** Max 2 words, 15 chars */
  heroCtaText: string;
  /** Exactly 3 feature items */
  aboutFeatures: FeatureItem[];
  /** Contact section heading */
  contactTitle: string;
  /** Contact section subheading */
  contactSubtitle: string;
}

// ─── Placeholder interpolation ────────────────────────────────────────────────

export function interpolate(
  template: string,
  storeName: string,
  category: string = '',
): string {
  return template
    .replace(/\{\{storeName\}\}/g, storeName)
    .replace(/\{\{category\}\}/g, category);
}

// ─── Lookup helper ────────────────────────────────────────────────────────────

export function getCategoryAutofill(categoryKey: string): CategoryAutofill {
  return (
    (CATEGORY_AUTOFILL as Record<string, CategoryAutofill>)[categoryKey] ??
    CATEGORY_AUTOFILL['__default__']
  );
}

// ─── Cloudinary base helper ───────────────────────────────────────────────────
// All icons live under fibidy/feature-icons/ in Cloudinary.
// Replace {name} with the actual uploaded filename (without extension changes needed).

const icon = (name: string): string =>
  `https://res.cloudinary.com/fibidy/image/upload/v1/feature-icons/${name}.svg`;

export const CATEGORY_AUTOFILL: CategoryAutofillMap = {

  // ── FOOD & DRINK (6) ────────────────────────────────────────────────────────

  RESTAURANT: {
    primaryColor: '#8B4513',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80&auto=format&fit=crop',
    heroTitle: 'Selamat Datang di {{storeName}}',
    heroSubtitle:
      'Masakan rumahan dengan cita rasa autentik — disajikan hangat setiap hari.',
    heroCtaText: 'Pesan Sekarang',
    aboutFeatures: [
      {
        icon: icon('fork-knife'),
        title: 'Menu Lengkap',
        description:
          'Dari nasi campur sampai lauk pilihan — ada sesuatu untuk semua selera.',
      },
      {
        icon: icon('chef-hat'),
        title: 'Masak Segar',
        description:
          'Setiap hidangan dimasak fresh — tidak pakai bahan kemarin.',
      },
      {
        icon: icon('location-pin'),
        title: 'Strategis',
        description:
          'Mudah dijangkau, parkir tersedia, suasana nyaman untuk keluarga.',
      },
    ],
    contactTitle: 'Temukan Kami',
    contactSubtitle:
      'Buka setiap hari — makan di tempat atau pesan bawa pulang.',
  },

  CAFE: {
    primaryColor: '#8B4513',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80&auto=format&fit=crop',
    heroTitle: 'Welcome to {{storeName}}',
    heroSubtitle:
      'Authentic coffee, freshly brewed — your go-to spot to work, meet, or just unwind.',
    heroCtaText: 'Order Now',
    aboutFeatures: [
      {
        icon: icon('coffee-bean'),
        title: 'Fresh Beans',
        description:
          'Roasted weekly from single-origin sources — every cup tells a story.',
      },
      {
        icon: icon('couch'),
        title: 'Cozy Space',
        description:
          'A quiet corner to work, meet, or just slow down for a bit.',
      },
      {
        icon: icon('leaf'),
        title: 'Local Sourced',
        description:
          'Ingredients from farmers we know by name — fresh and responsible.',
      },
    ],
    contactTitle: 'Mampir Yuk',
    contactSubtitle: "Buka setiap hari — drop by, we'll save you a seat.",
  },

  BAKERY: {
    primaryColor: '#D2691E',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80&auto=format&fit=crop',
    heroTitle: 'Freshly Baked at {{storeName}}',
    heroSubtitle:
      'Roti dan kue panggang segar setiap pagi — dibuat dengan tangan, bukan mesin.',
    heroCtaText: 'Lihat Menu',
    aboutFeatures: [
      {
        icon: icon('bread-loaf'),
        title: 'Panggang Pagi',
        description:
          'Produksi mulai subuh — kamu dapat yang benar-benar fresh setiap hari.',
      },
      {
        icon: icon('wheat'),
        title: 'Bahan Pilihan',
        description:
          'Tepung premium, butter asli — tanpa shortcut, tanpa kompromi kualitas.',
      },
      {
        icon: icon('gift-box'),
        title: 'Hamper & Custom',
        description:
          'Order kue custom untuk ulang tahun, hajatan, atau hadiah spesial.',
      },
    ],
    contactTitle: 'Ke Sini Yuk',
    contactSubtitle:
      'Datang pagi untuk pilihan terlengkap — stok sering habis sebelum sore!',
  },

  FOOD_DELIVERY: {
    primaryColor: '#FF6B35',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Pesan, Kami Antar',
    heroSubtitle:
      'Makanan favorit kamu sampai di pintu — cepat, panas, tanpa ribet.',
    heroCtaText: 'Order Sekarang',
    aboutFeatures: [
      {
        icon: icon('clock-fast'),
        title: 'Cepat Sampai',
        description:
          'Estimasi pengiriman dikasih di awal — kamu tahu kapan makanannya datang.',
      },
      {
        icon: icon('shield-check'),
        title: 'Aman & Rapi',
        description:
          'Dikemas dengan packaging kedap — sampai masih hangat dan tidak tumpah.',
      },
      {
        icon: icon('location-pin'),
        title: 'Area Luas',
        description:
          'Cek jangkauan pengiriman kami — terus berkembang setiap bulan.',
      },
    ],
    contactTitle: 'Hubungi Kami',
    contactSubtitle:
      'WhatsApp untuk order — respon cepat, estimasi waktu dikasih langsung.',
  },

  CATERING: {
    primaryColor: '#C0392B',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Katering untuk Momen Spesial',
    heroSubtitle:
      'Dari arisan kecil sampai pernikahan besar — kami siapkan semua dengan detail.',
    heroCtaText: 'Konsultasi',
    aboutFeatures: [
      {
        icon: icon('serving-dish'),
        title: 'Menu Variatif',
        description:
          'Indonesian, Chinese, Western — disesuaikan dengan tema dan selera tamu.',
      },
      {
        icon: icon('calendar-check'),
        title: 'On Time',
        description:
          'Setup tepat waktu, tim berpengalaman — acara berjalan tanpa hambatan.',
      },
      {
        icon: icon('chef-hat'),
        title: 'Chef Berpengalaman',
        description:
          'Tim dapur dengan jam terbang ratusan event — kualitas konsisten.',
      },
    ],
    contactTitle: 'Diskusi Dulu',
    contactSubtitle:
      'Ceritakan eventnya — kami bantu susun menu dan estimasi biaya tanpa ribet.',
  },

  STREET_FOOD: {
    primaryColor: '#E67E22',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Cita Rasa Jalanan yang Nagih',
    heroSubtitle:
      'Resep turun-temurun, bahan fresh — dimakan di tempat makin enak.',
    heroCtaText: 'Coba Sekarang',
    aboutFeatures: [
      {
        icon: icon('fire-flame'),
        title: 'Resep Original',
        description:
          'Bumbu rahasia keluarga — sudah jualan bertahun-tahun, pelanggan setia.',
      },
      {
        icon: icon('leaf-fresh'),
        title: 'Bahan Harian',
        description:
          'Belanja tiap pagi di pasar — kesegaran bukan basa-basi.',
      },
      {
        icon: icon('star-rating'),
        title: 'Langganan Loyal',
        description:
          'Pelanggan yang balik lagi dan lagi adalah bukti terbaik kualitas kami.',
      },
    ],
    contactTitle: 'Cari Kami di Sini',
    contactSubtitle:
      'Buka dari sore sampai malam — lokasi tetap, selalu ramai.',
  },

  // ── HEALTH & BEAUTY (7) ─────────────────────────────────────────────────────

  HAIR_SALON: {
    primaryColor: '#E91E8C',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Rambut Indah, Kamu Bersinar',
    heroSubtitle:
      'Styling, coloring, treatment — dikerjakan oleh stylist berpengalaman.',
    heroCtaText: 'Booking Now',
    aboutFeatures: [
      {
        icon: icon('scissors'),
        title: 'Stylist Pro',
        description:
          'Tim kami terus update tren terkini — hasilnya selalu fresh dan on-point.',
      },
      {
        icon: icon('hair-color'),
        title: 'Warna & Highlight',
        description:
          'Dari balayage sampai warna bold — cat aman kulit kepala, hasil tahan lama.',
      },
      {
        icon: icon('leaf-treatment'),
        title: 'Perawatan Rambut',
        description:
          'Treatment keratin, mask, dan smoothing untuk rambut sehat dan berkilau.',
      },
    ],
    contactTitle: 'Jadwalkan Kunjungan',
    contactSubtitle:
      'Hubungi kami untuk booking slot — walk-in juga diterima kalau ada tempat.',
  },

  BARBERSHOP: {
    primaryColor: '#2C3E50',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Sharp Cuts, Clean Finish',
    heroSubtitle:
      'Cukur presisi, gaya yang tahan lama — karena penampilan laki-laki itu penting.',
    heroCtaText: 'Book a Cut',
    aboutFeatures: [
      {
        icon: icon('razor'),
        title: 'Cukur Presisi',
        description:
          'Teknik klasik dan modern — fade, undercut, pompadour, semua bisa.',
      },
      {
        icon: icon('scissors-barber'),
        title: 'Beard Grooming',
        description:
          'Trim, shaping, dan hot towel shave — jenggot rapi bikin tampilan naik level.',
      },
      {
        icon: icon('crown'),
        title: 'Produk Premium',
        description:
          'Pomade, wax, dan clay terbaik tersedia — pulang langsung siap tampil.',
      },
    ],
    contactTitle: 'Mampir Ke Sini',
    contactSubtitle:
      'Walk-in welcome — tapi booking dulu kalau mau langsung dilayani tanpa antre.',
  },

  NAIL_SALON: {
    primaryColor: '#F48FB1',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Kuku Cantik, Hati Senang',
    heroSubtitle:
      'Manicure, pedicure, nail art — semua dikerjakan dengan detail dan cinta.',
    heroCtaText: 'Book Now',
    aboutFeatures: [
      {
        icon: icon('nail-polish'),
        title: 'Nail Art Custom',
        description:
          'Design sesuai keinginan kamu — dari minimalis elegan sampai bold statement.',
      },
      {
        icon: icon('shield-check'),
        title: 'Alat Steril',
        description:
          'Semua alat disterilkan sebelum dipakai — kebersihan nomor satu di sini.',
      },
      {
        icon: icon('diamond'),
        title: 'Gel & Dipping',
        description:
          'Cat gel tahan lama dan dipping powder — pilihan lengkap, hasil maksimal.',
      },
    ],
    contactTitle: 'Jadwalkan Sesi',
    contactSubtitle:
      'Booking wajib di weekend — weekday lebih santai, datang langsung juga bisa.',
  },

  SPA_MASSAGE: {
    primaryColor: '#7B68EE',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Recharge Pikiran dan Tubuh',
    heroSubtitle:
      'Pijat relaksasi, body treatment, dan perawatan holistik — semua di satu tempat.',
    heroCtaText: 'Reservasi',
    aboutFeatures: [
      {
        icon: icon('lotus'),
        title: 'Full Body Relax',
        description:
          'Pijat Swedish, deep tissue, dan reflexology — disesuaikan dengan kebutuhan tubuh.',
      },
      {
        icon: icon('candle-spa'),
        title: 'Aromaterapi',
        description:
          'Essential oil pilihan dan suasana tenang — pikiran jernih setelah satu sesi.',
      },
      {
        icon: icon('leaf-herbal'),
        title: 'Bahan Alami',
        description:
          'Scrub dan masker dari bahan lokal Indonesia — kulit lembut, alami, tanpa kimia keras.',
      },
    ],
    contactTitle: 'Kunjungi Kami',
    contactSubtitle:
      'Buka setiap hari, termasuk hari libur — karena relaksasi tidak kenal jadwal.',
  },

  SKINCARE_CLINIC: {
    primaryColor: '#00BCD4',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Kulit Sehat Dimulai dari Sini',
    heroSubtitle:
      'Konsultasi, perawatan, dan produk skincare — semua berbasis evidence, bukan hype.',
    heroCtaText: 'Konsultasi',
    aboutFeatures: [
      {
        icon: icon('microscope'),
        title: 'Diagnosa Tepat',
        description:
          'Analisis kulit mendalam sebelum treatment — bukan asal rekomendasikan produk.',
      },
      {
        icon: icon('serum-dropper'),
        title: 'Produk Tersertifikasi',
        description:
          'Hanya pakai produk dengan izin BPOM — aman, teruji, bukan abal-abal.',
      },
      {
        icon: icon('calendar-repeat'),
        title: 'Program Rutin',
        description:
          'Paket perawatan berkala untuk hasil optimal — kulit membaik dari dalam.',
      },
    ],
    contactTitle: 'Mulai Konsultasi',
    contactSubtitle:
      'Booking terlebih dahulu — dokter dan terapis siap analisis kondisi kulit kamu.',
  },

  GYM_FITNESS: {
    primaryColor: '#F44336',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Train Hard, Live Better',
    heroSubtitle:
      'Fasilitas lengkap, trainer berpengalaman — mulai perjalanan fitness kamu hari ini.',
    heroCtaText: 'Join Now',
    aboutFeatures: [
      {
        icon: icon('dumbbell'),
        title: 'Alat Lengkap',
        description:
          'Cardio, strength, functional training — semua ada, semua terawat.',
      },
      {
        icon: icon('trainer'),
        title: 'Personal Trainer',
        description:
          'PT bersertifikat siap bantu susun program sesuai target dan kemampuan kamu.',
      },
      {
        icon: icon('lightning'),
        title: 'Kelas Grup',
        description:
          'Zumba, yoga, HIIT, pilates — jadwal padat, suasana seru bareng komunitas.',
      },
    ],
    contactTitle: 'Cek Lokasi Kami',
    contactSubtitle:
      'Buka pagi sampai malam — jadwal yang fleksibel buat kamu yang sibuk.',
  },

  PHARMACY: {
    primaryColor: '#4CAF50',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Kesehatan Kamu, Prioritas Kami',
    heroSubtitle:
      'Obat resep dan bebas, vitamin, dan konsultasi apoteker — lengkap dan terpercaya.',
    heroCtaText: 'Cek Stok',
    aboutFeatures: [
      {
        icon: icon('pill-bottle'),
        title: 'Stok Lengkap',
        description:
          'Ribuan produk kesehatan tersedia — obat resep, OTC, suplemen, dan alkes.',
      },
      {
        icon: icon('pharmacist'),
        title: 'Apoteker Siap',
        description:
          'Konsultasi gratis dengan apoteker berlisensi — tanya sebelum minum obat.',
      },
      {
        icon: icon('delivery-box'),
        title: 'Antar ke Rumah',
        description:
          'Pesan via WhatsApp, kami antar — cepat, aman, dan tepat sasaran.',
      },
    ],
    contactTitle: 'Temukan Kami',
    contactSubtitle:
      'Buka setiap hari — termasuk malam dan hari libur untuk kedaruratan.',
  },

  // ── RETAIL (6) ──────────────────────────────────────────────────────────────

  FASHION_APPAREL: {
    primaryColor: '#1A1A2E',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Style That Speaks for You',
    heroSubtitle:
      'Koleksi fashion yang selalu update — dari casual harian sampai outfit statement.',
    heroCtaText: 'Shop Now',
    aboutFeatures: [
      {
        icon: icon('hanger'),
        title: 'Koleksi Terkini',
        description:
          'Update koleksi setiap minggu — selalu ada yang baru, selalu ada yang pas.',
      },
      {
        icon: icon('quality-badge'),
        title: 'Bahan Berkualitas',
        description:
          'Material dipilih dengan cermat — nyaman dipakai seharian, awet dicuci berkali-kali.',
      },
      {
        icon: icon('shipping-box'),
        title: 'Kirim Aman',
        description:
          'Packaging rapi, dikemas dengan plastik seal — sampai dalam kondisi sempurna.',
      },
    ],
    contactTitle: 'Visit the Store',
    contactSubtitle:
      'Datang langsung atau order online — pengiriman ke seluruh Indonesia.',
  },

  FOOTWEAR: {
    primaryColor: '#795548',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Step Up Your Game',
    heroSubtitle:
      'Sepatu casual, formal, dan sneakers — temukan pasangan sempurna untuk setiap langkah.',
    heroCtaText: 'Lihat Koleksi',
    aboutFeatures: [
      {
        icon: icon('sneaker'),
        title: 'Brand Pilihan',
        description:
          'Koleksi dari brand lokal dan internasional — original, bukan KW.',
      },
      {
        icon: icon('ruler-size'),
        title: 'Pilihan Size',
        description: 'Size 36–46 tersedia — plus wide fit untuk kaki lebar.',
      },
      {
        icon: icon('shield-original'),
        title: '100% Original',
        description:
          'Garansi keaslian produk — setiap item dilengkapi sertifikat atau tag resmi.',
      },
    ],
    contactTitle: 'Toko Kami',
    contactSubtitle:
      'Coba langsung di toko atau order online — ukuran tidak pas? Bisa tukar!',
  },

  ELECTRONICS_GADGETS: {
    primaryColor: '#212121',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Gadget Terkini, Harga Bersaing',
    heroSubtitle:
      'Smartphone, laptop, aksesoris — semua bergaransi resmi, pengiriman cepat.',
    heroCtaText: 'Cek Produk',
    aboutFeatures: [
      {
        icon: icon('smartphone'),
        title: 'Unit Resmi',
        description:
          'Semua produk garansi resmi distributor — bukan set, bukan refurb tanpa kejelasan.',
      },
      {
        icon: icon('shield-warranty'),
        title: 'Garansi Jelas',
        description:
          'Kartu garansi lengkap, proses klaim mudah — kami dampingi sampai selesai.',
      },
      {
        icon: icon('delivery-fast'),
        title: 'Pengiriman Aman',
        description:
          'Dikemas bubble wrap tebal, asuransi pengiriman — gadget sampai mulus.',
      },
    ],
    contactTitle: 'Konsultasi Dulu',
    contactSubtitle:
      'Bingung pilih gadget? Chat kami — tim kami bantu rekomendasikan yang paling sesuai.',
  },

  GROCERY_CONVENIENCE: {
    primaryColor: '#388E3C',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Belanja Mudah, Lengkap, Dekat',
    heroSubtitle:
      'Kebutuhan dapur dan rumah tangga tersedia — beli satuan atau grosir, harga tetap bersahabat.',
    heroCtaText: 'Belanja Yuk',
    aboutFeatures: [
      {
        icon: icon('apple-fresh'),
        title: 'Produk Segar',
        description:
          'Sayur, buah, dan bahan basah didatangkan tiap pagi dari supplier terpercaya.',
      },
      {
        icon: icon('price-tag'),
        title: 'Harga Transparan',
        description:
          'Semua harga tertera jelas — tidak ada biaya kejutan saat bayar.',
      },
      {
        icon: icon('delivery-local'),
        title: 'Antar Sekitar',
        description:
          'Pesan minimal tertentu, kami antar ke rumah kamu di area sekitar toko.',
      },
    ],
    contactTitle: 'Ke Toko Kami',
    contactSubtitle:
      'Buka pagi sampai malam — atau pesan via WhatsApp untuk pengiriman area sekitar.',
  },

  BEAUTY_COSMETICS: {
    primaryColor: '#E91E8C',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Beauty Essentials, All in One Place',
    heroSubtitle:
      'Makeup, skincare, dan fragrance — brand lokal dan internasional, harga kompetitif.',
    heroCtaText: 'Explore Now',
    aboutFeatures: [
      {
        icon: icon('lipstick'),
        title: 'Brand Lengkap',
        description:
          'Dari drugstore sampai luxury brand — semua ada, semua original.',
      },
      {
        icon: icon('brush-makeup'),
        title: 'Beauty Advisor',
        description:
          'Staff terlatih siap bantu kamu temukan shade dan produk yang paling cocok.',
      },
      {
        icon: icon('sparkle'),
        title: 'Promo Rutin',
        description:
          'Flash sale, bundle deal, dan loyalty points — belanja lebih hemat setiap minggu.',
      },
    ],
    contactTitle: 'Visit or Shop Online',
    contactSubtitle:
      'Toko fisik dan online store — gratis tester untuk kunjungan langsung.',
  },

  HOME_LIVING: {
    primaryColor: '#8D6E63',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Rumah Kamu, Cerminan Kamu',
    heroSubtitle:
      'Furnitur, dekorasi, dan aksesoris rumah — temukan gaya yang bikin betah.',
    heroCtaText: 'Jelajahi',
    aboutFeatures: [
      {
        icon: icon('sofa'),
        title: 'Koleksi Beragam',
        description:
          'Minimalis modern, Skandinavia, hingga industrial — semua ada di satu tempat.',
      },
      {
        icon: icon('quality-badge'),
        title: 'Material Tahan Lama',
        description:
          'Bukan furniture musiman — beli sekali, pakai bertahun-tahun.',
      },
      {
        icon: icon('truck-delivery'),
        title: 'Perakitan Gratis',
        description:
          'Termasuk pengiriman dan jasa pasang — kamu cukup tunjuk, kami yang kerja.',
      },
    ],
    contactTitle: 'Lihat Showroom',
    contactSubtitle:
      'Datang langsung untuk melihat, menyentuh, dan merasakan — baru yakin untuk beli.',
  },

  // ── HOME SERVICES (7) ───────────────────────────────────────────────────────

  CLEANING_SERVICE: {
    primaryColor: '#29B6F6',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Bersih Beneran, Bukan Sekadar Rapi',
    heroSubtitle:
      'Jasa cleaning profesional — rumah, kantor, dan kos. Pakai produk aman keluarga.',
    heroCtaText: 'Booking Sekarang',
    aboutFeatures: [
      {
        icon: icon('sparkle-clean'),
        title: 'Deep Cleaning',
        description:
          'Bukan cuma lap-lap — kami bersihkan area yang biasa terlewat: sudut, celah, lantai bawah.',
      },
      {
        icon: icon('shield-safe'),
        title: 'Produk Ramah Keluarga',
        description:
          'Bahan pembersih aman untuk anak dan hewan peliharaan — bersih tanpa residu berbahaya.',
      },
      {
        icon: icon('calendar-schedule'),
        title: 'Jadwal Fleksibel',
        description:
          'Cleaning harian, mingguan, atau sekali pakai — sesuaikan dengan kebutuhan kamu.',
      },
    ],
    contactTitle: 'Jadwalkan Cleaning',
    contactSubtitle:
      'Hubungi kami untuk estimasi harga — transparan, tidak ada biaya tersembunyi.',
  },

  LAUNDRY: {
    primaryColor: '#42A5F5',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Baju Bersih, Hidup Lebih Ringan',
    heroSubtitle:
      'Cuci, kering, lipat, setrika — kami tangani semuanya biar kamu fokus hal penting.',
    heroCtaText: 'Antar Sekarang',
    aboutFeatures: [
      {
        icon: icon('washing-machine'),
        title: 'Cuci Bersih',
        description:
          'Mesin modern dan detergen premium — noda membandel pun angkat.',
      },
      {
        icon: icon('iron'),
        title: 'Setrika Rapi',
        description:
          'Hasil setrika halus dan rapi — kemeja, baju batik, sampai jas bisa ditangani.',
      },
      {
        icon: icon('delivery-car'),
        title: 'Antar Jemput',
        description:
          'Gratis pickup dan antar untuk area tertentu — pakaian bersih tanpa keluar rumah.',
      },
    ],
    contactTitle: 'Antar Jemput Available',
    contactSubtitle:
      'Tidak sempat antar? Kami jemput — hubungi untuk jadwal pickup hari ini.',
  },

  PLUMBING: {
    primaryColor: '#1565C0',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Masalah Air? Kami Selesaikan',
    heroSubtitle:
      'Kebocoran pipa, mampet, instalasi baru — tim berpengalaman siap respons cepat.',
    heroCtaText: 'Panggil Sekarang',
    aboutFeatures: [
      {
        icon: icon('wrench'),
        title: 'Respons Cepat',
        description:
          'Target on-site dalam 1–2 jam untuk darurat — tidak biarkan masalah membesar.',
      },
      {
        icon: icon('shield-guarantee'),
        title: 'Garansi Pengerjaan',
        description:
          'Jika bermasalah dalam 30 hari, kami perbaiki gratis — tanggung jawab penuh.',
      },
      {
        icon: icon('invoice'),
        title: 'Estimasi Transparan',
        description:
          'Harga dikasih sebelum kerja dimulai — tidak ada angka kejutan di akhir.',
      },
    ],
    contactTitle: 'Hubungi Kami',
    contactSubtitle:
      'Darurat 24 jam tersedia — kebocoran tidak menunggu jam kerja.',
  },

  ELECTRICAL: {
    primaryColor: '#F9A825',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Instalasi Listrik yang Aman dan Benar',
    heroSubtitle:
      'Dari pasang lampu sampai rewiring total — dikerjakan teknisi bersertifikat PLN.',
    heroCtaText: 'Hubungi Kami',
    aboutFeatures: [
      {
        icon: icon('certificate'),
        title: 'Teknisi Bersertifikat',
        description:
          'Semua teknisi memiliki SLO dan sertifikat kompetensi — pekerjaan sesuai standar.',
      },
      {
        icon: icon('shield-safe'),
        title: 'Keselamatan Utama',
        description:
          'Instalasi yang benar mencegah korsleting dan kebakaran — tidak main-main dengan listrik.',
      },
      {
        icon: icon('clipboard-check'),
        title: 'Garansi Pengerjaan',
        description:
          'Masalah muncul setelah kami kerja? Kami datang lagi, gratis.',
      },
    ],
    contactTitle: 'Konsultasi Gratis',
    contactSubtitle:
      'Ceritakan kebutuhanmu — kami survei, hitung, dan kasih penawaran yang jelas.',
  },

  AC_APPLIANCE_REPAIR: {
    primaryColor: '#00ACC1',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — AC Dingin Lagi, Alat Berfungsi Lagi',
    heroSubtitle:
      'Service AC, cuci AC, dan perbaikan elektronik rumah — fast response, hasil terjamin.',
    heroCtaText: 'Panggil Teknisi',
    aboutFeatures: [
      {
        icon: icon('snowflake'),
        title: 'Service AC Lengkap',
        description:
          'Cuci, isi freon, perbaikan komponen — semua dikerjakan di tempat.',
      },
      {
        icon: icon('tools-repair'),
        title: 'Alat Rumah Tangga',
        description:
          'Mesin cuci, kulkas, dispenser, water heater — kami tangani semua merk.',
      },
      {
        icon: icon('clock-fast'),
        title: 'Respons Hari Ini',
        description:
          'Booking pagi, teknisi datang hari ini — tidak harus tunggu berhari-hari.',
      },
    ],
    contactTitle: 'Booking Servis',
    contactSubtitle:
      'Tersedia setiap hari — teknisi datang ke lokasi kamu, tidak perlu bawa alat berat.',
  },

  INTERIOR_DESIGN: {
    primaryColor: '#546E7A',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Ruang yang Bicara Tentang Kamu',
    heroSubtitle:
      'Desain interior residential dan komersial — dari konsep sampai eksekusi, kami dampingi.',
    heroCtaText: 'Konsultasi',
    aboutFeatures: [
      {
        icon: icon('blueprint'),
        title: 'Desain Custom',
        description:
          'Tidak ada template — setiap proyek dirancang khusus sesuai kepribadian dan kebutuhan klien.',
      },
      {
        icon: icon('palette-color'),
        title: 'Full Supervision',
        description:
          'Dari pemilihan material sampai finishing — kami awasi agar hasilnya sesuai desain.',
      },
      {
        icon: icon('calendar-project'),
        title: 'On Budget & Time',
        description:
          'Timeline dan anggaran disepakati di awal — tidak ada cost overrun yang mengejutkan.',
      },
    ],
    contactTitle: 'Mulai Proyek Kamu',
    contactSubtitle:
      'Konsultasi awal gratis — ceritakan visi kamu, kami bantu wujudkan.',
  },

  LANDSCAPING: {
    primaryColor: '#2E7D32',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Taman Impian di Rumah Kamu',
    heroSubtitle:
      'Desain taman, penanaman, dan perawatan — tanaman sehat, tampilan selalu segar.',
    heroCtaText: 'Konsultasi Taman',
    aboutFeatures: [
      {
        icon: icon('plant-tree'),
        title: 'Desain Taman',
        description:
          'Minimalis modern, tropis, atau zen — taman yang sesuai karakter rumah kamu.',
      },
      {
        icon: icon('water-drop'),
        title: 'Sistem Irigasi',
        description:
          'Instalasi drip dan sprinkler otomatis — tanaman tumbuh sehat tanpa perlu siram manual.',
      },
      {
        icon: icon('calendar-maintenance'),
        title: 'Perawatan Rutin',
        description:
          'Paket monthly maintenance — taman selalu rapi tanpa kamu harus turun tangan.',
      },
    ],
    contactTitle: 'Cek Lokasi Kamu',
    contactSubtitle:
      'Survei gratis — kami lihat lahan, diskusi konsep, dan kasih estimasi biaya.',
  },

  // ── AUTOMOTIVE (4) ──────────────────────────────────────────────────────────

  CAR_REPAIR: {
    primaryColor: '#37474F',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Mobil Kamu di Tangan yang Tepat',
    heroSubtitle:
      'Servis berkala, perbaikan mesin, dan diagnosis — transparan dari awal sampai selesai.',
    heroCtaText: 'Booking Servis',
    aboutFeatures: [
      {
        icon: icon('engine'),
        title: 'Mekanik Berpengalaman',
        description:
          'Tim dengan pengalaman berbagai merk dan tahun — tahu cara baca masalah sebelum parah.',
      },
      {
        icon: icon('invoice-transparent'),
        title: 'Estimasi Dulu',
        description:
          'Harga spare part dan jasa dikasih sebelum pengerjaan — kamu yang putuskan.',
      },
      {
        icon: icon('shield-warranty'),
        title: 'Garansi Servis',
        description:
          'Garansi pengerjaan dan spare part — masalah yang sama tidak akan kamu bayar dua kali.',
      },
    ],
    contactTitle: 'Bawa Mobilmu',
    contactSubtitle:
      'Booking dulu agar langsung ditangani tanpa antre — atau drop in, kami usahakan.',
  },

  MOTORCYCLE_REPAIR: {
    primaryColor: '#FF6F00',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Motor Kamu, Kami yang Urus',
    heroSubtitle:
      'Ganti oli, tune up, sampai overhaul mesin — cepat, terjangkau, dan jujur.',
    heroCtaText: 'Servis Sekarang',
    aboutFeatures: [
      {
        icon: icon('motorcycle-icon'),
        title: 'Semua Merk',
        description:
          'Honda, Yamaha, Suzuki, Kawasaki — pengalaman dengan semua jenis motor.',
      },
      {
        icon: icon('clock-fast'),
        title: 'Pengerjaan Cepat',
        description:
          'Servis ringan selesai dalam 1–2 jam — kamu bisa tunggu atau jalan-jalan dulu.',
      },
      {
        icon: icon('price-affordable'),
        title: 'Harga Bersahabat',
        description:
          'Spare part dengan harga wajar, jasa transparan — tidak ada mark-up tersembunyi.',
      },
    ],
    contactTitle: 'Workshop Kami',
    contactSubtitle:
      'Bisa langsung datang atau WhatsApp dulu untuk estimasi biaya.',
  },

  CAR_WASH: {
    primaryColor: '#039BE5',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Mobil Bersih, Kamu Puas',
    heroSubtitle:
      'Cuci manual, salon mobil, dan detailing — hasilnya beda dari sekadar cuci biasa.',
    heroCtaText: 'Cuci Sekarang',
    aboutFeatures: [
      {
        icon: icon('water-spray'),
        title: 'Cuci Manual',
        description:
          'Setiap sudut dijangkau tangan — bukan conveyor belt yang melewatkan banyak bagian.',
      },
      {
        icon: icon('sparkle-shine'),
        title: 'Poles & Coating',
        description:
          'Nano coating dan carnauba wax — cat terlindungi, mobil tetap kinclong lebih lama.',
      },
      {
        icon: icon('interior-clean'),
        title: 'Interior Detail',
        description:
          'Vacuum, lap dashboard, jok bersih — dalam mobil senyaman luar.',
      },
    ],
    contactTitle: 'Temukan Cabang Kami',
    contactSubtitle:
      'Buka dari pagi — antrian dikelola dengan sistem, tidak perlu menunggu terlalu lama.',
  },

  AUTO_PARTS: {
    primaryColor: '#546E7A',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Sparepart Lengkap, Kualitas Terjamin',
    heroSubtitle:
      'Part OEM dan aftermarket untuk semua merk — tersedia, harga kompetitif, garansi jelas.',
    heroCtaText: 'Cek Stok',
    aboutFeatures: [
      {
        icon: icon('gear-cog'),
        title: 'Stok Luas',
        description:
          'Ribuan SKU tersedia — part langka pun bisa kami carikan dari jaringan supplier kami.',
      },
      {
        icon: icon('certificate-original'),
        title: 'OEM & Aftermarket',
        description:
          'Pilihan sesuai anggaran — OEM untuk ketenangan pikiran, aftermarket berkualitas untuk hemat.',
      },
      {
        icon: icon('shield-warranty'),
        title: 'Garansi Part',
        description:
          'Setiap spare part ada garansi — cacat produksi langsung diganti tanpa perdebatan.',
      },
    ],
    contactTitle: 'Hubungi Toko Kami',
    contactSubtitle:
      'Tidak yakin part yang cocok? WhatsApp nopol dan keluhan — kami bantu carikan.',
  },

  // ── LIFESTYLE & ENTERTAINMENT (5) ───────────────────────────────────────────

  PHOTOGRAPHY: {
    primaryColor: '#212121',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Momen Berharga, Diabadikan Indah',
    heroSubtitle:
      'Portrait, wedding, produk, dan event — kami tangkap cerita yang tidak ingin kamu lupakan.',
    heroCtaText: 'Lihat Portofolio',
    aboutFeatures: [
      {
        icon: icon('camera'),
        title: 'Berbagai Sesi',
        description:
          'Portrait, pre-wedding, maternity, produk, dan event — pengalaman lintas genre.',
      },
      {
        icon: icon('edit-photo'),
        title: 'Editing Profesional',
        description:
          'Setiap foto melalui proses editing cermat — hasilnya konsisten dan siap cetak.',
      },
      {
        icon: icon('calendar-fast'),
        title: 'Pengiriman Cepat',
        description:
          'Foto siap dalam 7–14 hari kerja — file resolusi tinggi langsung ke Google Drive kamu.',
      },
    ],
    contactTitle: 'Diskusikan Projekmu',
    contactSubtitle:
      'Ceritakan momen apa yang ingin diabadikan — kami bantu rencanakan dari awal.',
  },

  TRAVEL_AGENCY: {
    primaryColor: '#0288D1',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Perjalanan Impian, Kami yang Urus',
    heroSubtitle:
      'Paket wisata, tiket, akomodasi — dari Sabang sampai Merauke, atau mancanegara.',
    heroCtaText: 'Rencanakan Trip',
    aboutFeatures: [
      {
        icon: icon('airplane'),
        title: 'Paket Lengkap',
        description:
          'Tiket, hotel, transport, dan tour guide — semua sudah termasuk, tinggal berangkat.',
      },
      {
        icon: icon('shield-travel'),
        title: 'Asuransi Perjalanan',
        description:
          'Setiap paket include asuransi — perjalanan terlindungi dari hal tak terduga.',
      },
      {
        icon: icon('support-24h'),
        title: 'Support 24 Jam',
        description:
          'Tim kami standby selama perjalanan kamu — ada masalah? Kami siap bantu kapan saja.',
      },
    ],
    contactTitle: 'Konsultasi Perjalanan',
    contactSubtitle:
      'Ceritakan destinasi impian dan budgetmu — kami susunkan itinerary terbaik.',
  },

  HOTEL_LODGING: {
    primaryColor: '#8D6E63',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Istirahat Nyaman, Pengalaman Tak Terlupakan',
    heroSubtitle:
      'Kamar bersih, pelayanan ramah, lokasi strategis — semua yang kamu butuhkan ada di sini.',
    heroCtaText: 'Cek Kamar',
    aboutFeatures: [
      {
        icon: icon('bed-comfort'),
        title: 'Kamar Nyaman',
        description:
          'Sprei bersih, AC dingin, kamar mandi higienis — standar yang tidak pernah kami kompromikan.',
      },
      {
        icon: icon('breakfast'),
        title: 'Sarapan Tersedia',
        description:
          'Menu sarapan lokal dan continental — energi penuh sebelum mulai hari.',
      },
      {
        icon: icon('location-strategic'),
        title: 'Lokasi Strategis',
        description:
          'Dekat pusat kota, wisata, atau kawasan bisnis — akses mudah ke mana-mana.',
      },
    ],
    contactTitle: 'Reservasi Sekarang',
    contactSubtitle:
      'Hubungi kami langsung untuk harga terbaik — tanpa komisi platform pihak ketiga.',
  },

  EVENT_VENUE: {
    primaryColor: '#6A1B9A',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Venue Impian untuk Momen Terbaik',
    heroSubtitle:
      'Pernikahan, ulang tahun, seminar, dan gathering — kami siapkan panggung terbaik untukmu.',
    heroCtaText: 'Cek Ketersediaan',
    aboutFeatures: [
      {
        icon: icon('ballroom'),
        title: 'Kapasitas Variatif',
        description:
          'Dari gathering kecil 50 pax sampai pesta besar 1000 orang — kami ada solusinya.',
      },
      {
        icon: icon('catering-venue'),
        title: 'Catering & Setup',
        description:
          'Paket lengkap tersedia — venue, dekorasi, dan katering dalam satu kontrak.',
      },
      {
        icon: icon('sound-system'),
        title: 'Sound & Lighting',
        description:
          'Sistem audio visual profesional tersedia — tidak perlu sewa alat dari luar.',
      },
    ],
    contactTitle: 'Diskusi Acara Kamu',
    contactSubtitle:
      'Survei venue gratis — lihat langsung, tanya sepuasnya, baru putuskan.',
  },

  TUTORING_EDUCATION: {
    primaryColor: '#1565C0',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Belajar Lebih Efektif, Hasil Lebih Nyata',
    heroSubtitle:
      'Bimbel privat dan kelompok untuk SD sampai SMA — pengajar berpengalaman, metode terbukti.',
    heroCtaText: 'Daftar Sekarang',
    aboutFeatures: [
      {
        icon: icon('book-open'),
        title: 'Pengajar Berkualitas',
        description:
          'Semua tutor lulusan PTN atau memiliki pengalaman mengajar minimal 3 tahun.',
      },
      {
        icon: icon('target-focus'),
        title: 'Program Terstruktur',
        description:
          'Silabus sesuai kurikulum, progress dipantau per sesi — ada laporan untuk orang tua.',
      },
      {
        icon: icon('flexible-schedule'),
        title: 'Jadwal Fleksibel',
        description:
          'Belajar online atau offline — pilih waktu yang tidak ganggu kegiatan sekolah.',
      },
    ],
    contactTitle: 'Hubungi Kami',
    contactSubtitle:
      'Konsultasi gratis untuk tentukan program yang paling sesuai kebutuhan siswa.',
  },

  // ── PROFESSIONAL SERVICES (6) ───────────────────────────────────────────────

  TAILOR: {
    primaryColor: '#4A148C',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Pakaian yang Pas, Rasa yang Beda',
    heroSubtitle:
      'Jahit custom, permak, dan bordir — buat pakaian yang benar-benar fit di badanmu.',
    heroCtaText: 'Konsultasi',
    aboutFeatures: [
      {
        icon: icon('measuring-tape'),
        title: 'Ukuran Presisi',
        description:
          'Setiap pakaian dibuat dari nol berdasarkan ukuran tubuh kamu — tidak ada kompromi fit.',
      },
      {
        icon: icon('fabric-choice'),
        title: 'Pilihan Kain Luas',
        description:
          'Koleksi kain dari berbagai jenis dan daerah — bantu pilih yang paling cocok untuk desainmu.',
      },
      {
        icon: icon('scissors-craft'),
        title: 'Pengerjaan Teliti',
        description:
          'Setiap jahitan dikerjakan dengan detail — hasilnya tahan lama dan rapi dari dalam.',
      },
    ],
    contactTitle: 'Kunjungi Workshop Kami',
    contactSubtitle:
      'Konsultasi desain dan pengukuran di tempat — bawa referensi atau gambar sendiri.',
  },

  PET_SHOP: {
    primaryColor: '#FF8F00',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Semua yang Terbaik untuk Hewan Kesayanganmu',
    heroSubtitle:
      'Makanan, aksesoris, dan suplemen premium — karena anabul kamu layak yang terbaik.',
    heroCtaText: 'Lihat Produk',
    aboutFeatures: [
      {
        icon: icon('paw-print'),
        title: 'Produk Premium',
        description:
          'Brand pet food terpercaya, halal, dan teruji nutrisinya — dari anak kucing sampai senior.',
      },
      {
        icon: icon('staff-knowledgeable'),
        title: 'Staff Pencinta Hewan',
        description:
          'Tim kami semua pet owner — saran yang kami kasih berasal dari pengalaman nyata.',
      },
      {
        icon: icon('delivery-safe'),
        title: 'Pengiriman Aman',
        description:
          'Produk dikemas aman agar tidak bocor atau rusak — sampai dalam kondisi sempurna.',
      },
    ],
    contactTitle: 'Toko Kami',
    contactSubtitle:
      'Datang langsung atau order via WhatsApp — pengiriman tersedia untuk area sekitar.',
  },

  PET_GROOMING: {
    primaryColor: '#EC407A',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Anabul Bersih, Kamu Tenang',
    heroSubtitle:
      'Mandi, potong kuku, cukur bulu, dan ear cleaning — dikerjakan dengan sabar dan penuh kasih.',
    heroCtaText: 'Book Grooming',
    aboutFeatures: [
      {
        icon: icon('bath-pet'),
        title: 'Mandi Lengkap',
        description:
          'Shampo sesuai jenis bulu, kondisioner, dan blow dry — bulu halus dan wangi tahan lama.',
      },
      {
        icon: icon('scissors-pet'),
        title: 'Potong Bulu Custom',
        description:
          'Gaya sesuai permintaan atau standar breed — hasilnya rapi dan proporsional.',
      },
      {
        icon: icon('heart-care'),
        title: 'Penanganan Lembut',
        description:
          'Kami sabar dengan hewan yang takut atau tidak kooperatif — tidak ada paksa, tidak ada stres.',
      },
    ],
    contactTitle: 'Jadwalkan Sesi',
    contactSubtitle:
      'Booking 1–2 hari sebelum — terutama di weekend yang selalu ramai.',
  },

  PRINT_SHOP: {
    primaryColor: '#0097A7',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1563906267088-b029e7101114?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Cetak Apapun, Hasil Profesional',
    heroSubtitle:
      'Banner, brosur, undangan, stiker, dan merchandise — desain sendiri atau dibantu tim kami.',
    heroCtaText: 'Order Cetak',
    aboutFeatures: [
      {
        icon: icon('printer-quality'),
        title: 'Mesin Modern',
        description:
          'Cetak digital dan offset berkualitas tinggi — warna akurat, garis tajam, tidak blobor.',
      },
      {
        icon: icon('design-help'),
        title: 'Desain Dibantu',
        description:
          'Tidak punya file desain? Tim kami bantu buat dari brief kamu — tanpa biaya desain mahal.',
      },
      {
        icon: icon('delivery-fast'),
        title: 'Cetak Ekspres',
        description:
          'Butuh cepat? Layanan same-day dan next-day tersedia — untuk deadline yang tidak bisa ditunda.',
      },
    ],
    contactTitle: 'Konsultasi Cetak',
    contactSubtitle:
      'Kirim file atau konsultasi desain — estimasi harga langsung dari WhatsApp kami.',
  },

  RENTAL_PROPERTY: {
    primaryColor: '#37474F',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Hunian Nyaman, Lokasi Strategis',
    heroSubtitle:
      'Kost, kontrakan, dan apartemen — pilihan hunian yang bersih, aman, dan terjangkau.',
    heroCtaText: 'Cek Ketersediaan',
    aboutFeatures: [
      {
        icon: icon('house-clean'),
        title: 'Unit Terawat',
        description:
          'Rutin dibersihkan dan dicek kondisinya — kamu masuk ke unit yang benar-benar siap huni.',
      },
      {
        icon: icon('shield-security'),
        title: 'Keamanan 24 Jam',
        description:
          'CCTV, satpam, dan sistem akses yang terkontrol — ketenangan pikiran untuk kamu dan keluarga.',
      },
      {
        icon: icon('document-contract'),
        title: 'Kontrak Jelas',
        description:
          'Semua tertuang dalam kontrak tertulis — tidak ada kenaikan harga mendadak atau kejutan.',
      },
    ],
    contactTitle: 'Jadwalkan Survey',
    contactSubtitle:
      'Lihat langsung kondisi unit — kami temani dan jawab semua pertanyaan kamu.',
  },

  MOVING_SERVICE: {
    primaryColor: '#FF8F00',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop',
    heroTitle: '{{storeName}} — Pindahan Lancar, Barang Aman',
    heroSubtitle:
      'Jasa pindah rumah, kantor, dan kos — tim berpengalaman, armada lengkap, tidak main-main.',
    heroCtaText: 'Minta Estimasi',
    aboutFeatures: [
      {
        icon: icon('truck-moving'),
        title: 'Armada Lengkap',
        description:
          'Dari pickup kecil sampai truk besar — disesuaikan dengan volume barang bawaan kamu.',
      },
      {
        icon: icon('box-packing'),
        title: 'Packing Aman',
        description:
          'Barang pecah belah dibungkus khusus, furnitur dilindungi — sampai tanpa lecet.',
      },
      {
        icon: icon('team-professional'),
        title: 'Tim Profesional',
        description:
          'Berpengalaman handling barang besar dan berat — cepat, cermat, tidak ngasal.',
      },
    ],
    contactTitle: 'Hubungi Kami',
    contactSubtitle:
      'Ceritakan lokasi asal, tujuan, dan perkiraan barang — estimasi harga gratis.',
  },

  // ── FALLBACK — untuk custom kategori / tidak dikenal ────────────────────────

  __default__: {
    primaryColor: '#6366F1',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop',
    heroTitle: 'Welcome to {{storeName}}',
    heroSubtitle:
      'Quality products and services — we are here to help you get what you need.',
    heroCtaText: 'Explore Now',
    aboutFeatures: [
      {
        icon: icon('star-quality'),
        title: 'Quality First',
        description:
          'Everything we offer is selected and verified for quality you can trust.',
      },
      {
        icon: icon('handshake'),
        title: 'Trusted Service',
        description:
          'Hundreds of satisfied customers — their trust is our biggest achievement.',
      },
      {
        icon: icon('support'),
        title: 'Always Available',
        description:
          'Questions? We are responsive and ready to help before and after purchase.',
      },
    ],
    contactTitle: 'Get in Touch',
    contactSubtitle: 'We are open and ready to serve — reach out anytime.',
  },
};

// ─── Compile-time exhaustiveness ──────────────────────────────────────────────
// CATEGORY_AUTOFILL is annotated as CategoryAutofillMap above.
// If any CategoryKey is missing from the object literal, TypeScript will error:
//   "Property 'NEW_KEY' is missing in type '...' but required in type 'CategoryAutofillMap'"
//
// This is caught by `pnpm typecheck` in CI — no manual audits needed.
// The runtime assertAutofillCoverage() above catches the reverse direction.
