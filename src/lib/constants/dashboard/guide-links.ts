// ============================================================================
// TAUTAN PANDUAN — satu tempat untuk semua alamat guide.fibidy.com
//
// Sebelum ini alamatnya ditulis langsung di komponennya masing-masing dan
// sudah tersebar di lima berkas. Alamat yang tersebar berarti cepat atau
// lambat ada satu yang menunjuk halaman yang sudah pindah, dan tidak ada
// cara menemukannya selain membuka satu per satu.
// ============================================================================

const BASIS = 'https://guide.fibidy.com';

export const GUIDE = {
  produk: `${BASIS}/products`,
  kasir: `${BASIS}/kasir`,
  stok: `${BASIS}/kasir/stok`,
  laporan: `${BASIS}/kasir/laporan`,
  diskon: `${BASIS}/kasir/diskon`,
  promo: `${BASIS}/kasir/promo`,
} as const;
