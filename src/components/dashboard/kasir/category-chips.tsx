'use client';

// ============================================================================
// CATEGORY CHIPS
// File: src/components/dashboard/kasir/category-chips.tsx
//
// Filter kategori berupa chip horizontal, bukan dropdown: pilihan langsung
// terlihat dan cukup satu tap. Dropdown butuh dua tap dan menutup daftar
// produk saat terbuka — dua-duanya mahal saat pelanggan menunggu.
//
// Chip "Semua" selalu ada di depan sebagai jalan pulang dari filter apa pun.
//
// [UI/UX — Agu 2026] Dua perubahan:
//
// 1. Chip-nya sekarang KasirFilterGroup (ToggleGroup + ScrollArea) yang sama
//    dengan filter status di Riwayat dan filter kondisi di Stok. Sebelumnya
//    tiga tempat itu punya tombol chip buatan sendiri dengan radius dan state
//    terpilih yang sudah mulai berbeda satu sama lain.
//
// 2. Di atas 12 kategori, chip berubah jadi Combobox. Alasannya bukan estetika:
//    dua puluh chip berarti scroll horizontal berkali-kali untuk menemukan satu
//    kategori, dan itu lebih lambat daripada mengetik tiga huruf.
//
// [FIX — chip kepotong] Lebar TIDAK lagi diterima dari pemanggil.
//
// Dulu halaman Jual mengirim `sm:max-w-md`, disalin dari KasirSearchField tepat
// di atasnya. Untuk kolom pencarian batas 448px memang benar — input selebar
// layar konyol. Untuk barisan chip, batas yang sama menyembunyikan pilihan:
// empat chip pertama menghabiskan jatah, sisanya masuk area scroll yang tidak
// kelihatan ada, dan seribu piksel di sebelahnya menganggur.
//
// Dua varian di bawah punya kebutuhan lebar yang BERBEDA, jadi masing-masing
// menentukan sendiri — bukan menerima satu nilai yang cocok untuk salah satu:
//   · chip     → selebar induk; barisan filter memang harus memakai ruang ada
//   · combobox → dibatasi, karena yang itu memang sebuah input
// ============================================================================

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { KasirFilterGroup } from './kasir-filter-group';

const SEMUA = '__semua__';
const BATAS_CHIP = 12;

export function CategoryChips({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  /** null = semua kategori */
  value: string | null;
  onChange: (kategori: string | null) => void;
}) {
  const t = useTranslations('dashboard.kasir.filter');

  const [query, setQuery] = useState(value ?? '');

  // Kategori direset dari luar saat katalog ditukar (barang ↔ layanan).
  // Tanpa sinkronisasi ini, teks kategori lama tertinggal di kolom Combobox
  // padahal filternya sudah kosong.
  //
  // Disesuaikan saat render, bukan lewat useEffect: efek akan menampilkan satu
  // frame dengan teks lama sebelum sempat memperbaikinya. Ini pola resmi React
  // untuk state turunan prop.
  const [valueSebelumnya, setValueSebelumnya] = useState(value);
  if (value !== valueSebelumnya) {
    setValueSebelumnya(value);
    setQuery(value ?? '');
  }

  const terfilter = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.toLowerCase().includes(q));
  }, [categories, query]);

  // Tanpa kategori sama sekali, chip "Semua" sendirian tidak memfilter apa pun.
  if (categories.length === 0) return null;

  if (categories.length > BATAS_CHIP) {
    return (
      <Combobox
        items={terfilter}
        value={value ?? ''}
        onValueChange={(next) => {
          const dipilih = typeof next === 'string' ? next : '';
          setQuery(dipilih);
          onChange(dipilih || null);
        }}
      >
        <ComboboxInput
          placeholder={t('categoryLabel')}
          aria-label={t('categoryLabel')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-md"
        />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>{t('categoryLabel')}</ComboboxEmpty>
            <ComboboxItem value="">{t('all')}</ComboboxItem>
            {terfilter.map((kategori) => (
              <ComboboxItem key={kategori} value={kategori}>
                {kategori}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  }

  return (
    <KasirFilterGroup
      ariaLabel={t('categoryLabel')}
      value={value ?? SEMUA}
      onChange={(next) => onChange(next === SEMUA ? null : next)}
      options={[
        { value: SEMUA, label: t('all') },
        ...categories.map((kategori) => ({ value: kategori, label: kategori })),
      ]}
    />
  );
}
