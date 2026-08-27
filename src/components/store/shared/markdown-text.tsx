'use client';

// ============================================================================
// MARKDOWN TEXT
// File: src/components/store/shared/markdown-text.tsx
//
// Satu-satunya tempat deskripsi produk dirender jadi teks berformat.
// Kontrak formatnya ada di `lib/shared/markdown.ts` — baca itu dulu.
//
// ── KENAPA TANPA `remark-gfm` ──────────────────────────────────────────────
// Diukur: react-markdown 35,2 KB gzip, +remark-breaks 35,6 KB, +remark-gfm
// 45,9 KB. Tambahan 10,3 KB itu membeli tabel dan coretan — dua hal yang tidak
// dipakai deskripsi produk. Ini bundel ETALASE PUBLIK, dibayar tiap pembeli
// yang membuka halaman produk di kuota seluler.
//
// ── KENAPA `remark-breaks` WAJIB, BUKAN PEMANIS ────────────────────────────
// Deskripsi yang sudah tersimpan ditulis dengan tombol Enter biasa. Markdown
// TIDAK menganggap satu baris baru sebagai ganti baris. Diuji:
//
//   sumber : 'Kopi susu gula aren\nPanas atau dingin\nBisa tanpa gula'
//   tanpa  : <p>Kopi susu gula arenPanas atau dinginBisa tanpa gula</p>
//   dengan : <p>Kopi susu gula aren<br/>Panas atau dingin<br/>…</p>
//
// Tanpa plugin ini, SETIAP deskripsi produk yang sudah ada di seluruh etalase
// berubah jadi kata-kata dempet. Harganya 0,5 KB gzip.
//
// ── KENAPA BUKAN PERENDER 0,9 KB ───────────────────────────────────────────
// `snarkdown` sepuluh kali lebih kecil, tapi mengeluarkan string HTML yang
// harus dipasang lewat `dangerouslySetInnerHTML`. Diuji berdampingan, ia
// meneruskan `<img src=x onerror=…>` hidup-hidup dan membuat href
// `javascript:` — termasuk bentuk entitas `javascript&#58;` yang LOLOS dari
// `SanitizePipe` di server (regexnya cuma mencocokkan `javascript:` harfiah).
//
// `react-markdown` menetralkannya secara STRUKTUR: ia membangun pohon elemen
// React, tidak pernah menyentuh HTML mentah, dan menyaring protokol URL. Ini
// konten buatan pengguna PERTAMA yang dirender sebagai markup di etalase
// publik — keamanannya tidak boleh bergantung pada tebakan regex.
//
// HTML mentah TIDAK diaktifkan (tidak ada `rehype-raw`), dan itu disengaja.
// ============================================================================

import Markdown, { type Components } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/shared/utils';

interface MarkdownTextProps {
  children: string | null | undefined;
  /** Kelas untuk pembungkus terluar. */
  className?: string;
}

// Pemetaan elemen. Ditulis eksplisit, bukan mengandalkan `prose` dari
// typography plugin: repo ini tidak memasangnya, dan deskripsi produk cuma
// perlu lima bentuk. Tiap elemen memakai token tema yang sama dengan teks di
// sekitarnya supaya tidak terlihat seperti tempelan.
// Props TIDAK di-spread; tiap komponen cuma mengambil apa yang benar-benar
// dipakai. react-markdown mengoper simpul AST-nya sebagai prop `node`, dan
// meneruskannya ke elemen DOM menghasilkan atribut HTML tidak sah
// `node="[object Object]"` di SETIAP elemen deskripsi — terlihat langsung di
// HTML etalase saat diperiksa. Mengambil yang dipakai saja menutup itu tanpa
// variabel buangan, sekaligus membuat jelas apa yang benar-benar dirender.
const komponen: Components = {
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium underline underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      {children}
    </a>
  ),
  // Judul apa pun diturunkan jadi satu ukuran. Deskripsi produk hidup di dalam
  // halaman yang sudah punya hierarki judulnya sendiri; membiarkan h1–h6 asli
  // merusak struktur dokumen dan aksesibilitasnya.
  h1: ({ children }) => <p className="font-semibold text-foreground">{children}</p>,
  h2: ({ children }) => <p className="font-semibold text-foreground">{children}</p>,
  h3: ({ children }) => <p className="font-semibold text-foreground">{children}</p>,
  h4: ({ children }) => <p className="font-semibold text-foreground">{children}</p>,
  h5: ({ children }) => <p className="font-semibold text-foreground">{children}</p>,
  h6: ({ children }) => <p className="font-semibold text-foreground">{children}</p>,
};

export function MarkdownText({ children, className }: MarkdownTextProps) {
  if (!children) return null;

  return (
    <div className={cn('space-y-2 [&>*:first-child]:mt-0', className)}>
      <Markdown remarkPlugins={[remarkBreaks]} components={komponen}>
        {children}
      </Markdown>
    </div>
  );
}
