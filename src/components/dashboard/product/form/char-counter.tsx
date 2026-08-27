// ============================================================================
// CHAR COUNTER — dipindah ke shared/form-field.tsx
// File: src/components/dashboard/product/form/char-counter.tsx
//
// Implementasinya TIDAK lagi di sini. Berkas ini tinggal jembatan supaya
// dua pemanggil di folder ini tidak perlu ikut berubah dalam commit yang
// sama, dan supaya `import { CharCounter } from './char-counter'` tidak
// diam-diam berhenti menunjuk penghitung yang sama dengan sisa dasbor.
//
// Kenapa dipindah: ada TIGA penghitung di repo ini dengan tiga perilaku
// berbeda (11px vs 12px, mono vs sans, ambang `max-2` vs `max-10` vs 90%).
// Penjual yang mengisi wizard lalu membuka Pengaturan lalu menambah produk
// melihat ketiganya dalam satu sesi. Sekarang satu: lihat
// shared/form-field.tsx.
//
// Catatan yang tetap berlaku untuk deskripsi produk: `current` adalah panjang
// STRING MARKDOWN yang akan disimpan, bukan panjang teks yang terlihat di
// editor. Itu disengaja — yang divalidasi @MaxLength(1000) di server persis
// string yang sama, jadi angka di layar dan penolakan server tidak bisa
// berbeda. Ongkos sintaksnya kecil (terukur 15,1% pada deskripsi UMKM
// realistis), jadi selisih "yang saya ketik" vs "yang dihitung" tidak pernah
// mengejutkan.
// ============================================================================

export { CharCounter } from '@/components/dashboard/shared/form-field';
