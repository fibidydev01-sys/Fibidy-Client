'use client';

// ============================================================================
// MARKDOWN EDITOR
// File: src/components/dashboard/product/form/markdown-editor.tsx
//
// Editor rich text untuk deskripsi produk. Yang KELUAR dari sini adalah
// markdown, bukan HTML — kontraknya di `lib/shared/markdown.ts`.
//
// ── KENAPA TIPTAP, DAN KENAPA `@tiptap/markdown` YANG RESMI ────────────────
// `@tiptap/markdown` v3.30.3 dirawat tim ueberdosis (6 maintainer, MIT, repo
// github.com/ueberdosis/tiptap), dan versinya bergerak seiring dengan inti
// Tiptap — peer-nya dipatok persis `@tiptap/core 3.30.3`.
//
// BUKAN `tiptap-markdown` komunitas: rilis terakhirnya 11 bulan lalu, satu
// maintainer, dan penulisnya sendiri menyatakan tidak akan merilis v1 maupun
// menangani issue yang ada.
//
// ── KENAPA TOOLBAR-NYA DIBANGUN SENDIRI ────────────────────────────────────
// Paket "pre-styled drop-in" yang beredar menyuntik gayanya sendiri, di luar
// token tema dashboard ini, dan menduplikasi Radix + lucide-react yang sudah
// jadi dependensi repo. Toolbar di bawah memakai `ToggleGroup`, `Popover`,
// `Input`, dan `Button` yang SUDAH ada — jadi ia otomatis ikut tema terang/
// gelap dan lebar halaman yang sama dengan formulir di sekitarnya.
//
// ── SUBSET YANG DIIZINKAN ──────────────────────────────────────────────────
// Tebal, miring, daftar berpoin, daftar bernomor, tautan. Titik.
//
// Yang DIMATIKAN dari StarterKit dan alasannya:
//   blockquote  — `>` adalah SATU-SATUNYA sintaks markdown yang tidak selamat
//                 dari SanitizePipe di server; ia di-encode jadi `&gt;`.
//                 Membiarkan tombolnya berarti menjanjikan sesuatu yang rusak
//                 saat disimpan.
//   heading     — deskripsi hidup di dalam halaman yang sudah punya hierarki
//                 judulnya sendiri.
//   codeBlock,
//   code, strike,
//   horizontalRule,
//   underline   — tidak ada gunanya untuk deskripsi produk UMKM, dan tiap
//                 tombol tambahan adalah satu hal lagi yang harus dirender
//                 etalase publik dengan benar.
//
// Gambar juga tidak ada: form produk sudah punya langkah media sendiri.
// ============================================================================

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { useTranslations } from 'next-intl';
import { Bold, Italic, List, ListOrdered, Link2, Link2Off } from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/shared/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength,
}: MarkdownEditorProps) {
  const t = useTranslations('dashboard.products.form.description');
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    // `immediatelyRender: false` wajib di Next App Router — tanpa itu Tiptap
    // merender saat SSR dan memicu ketidakcocokan hidrasi.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        heading: false,
        codeBlock: false,
        code: false,
        strike: false,
        horizontalRule: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow' },
        },
      }),
      Markdown,
    ],
    content: value,
    contentType: 'markdown',
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[10rem] w-full px-3 py-2 text-sm outline-none',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
          '[&_p]:leading-relaxed [&_a]:underline [&_a]:underline-offset-2',
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      const md = ed.getMarkdown();
      // Batasnya ditegakkan di sini juga, bukan cuma lewat penghitung.
      // Yang dibandingkan panjang MARKDOWN — sama persis dengan yang
      // divalidasi @MaxLength(1000) di server.
      if (maxLength && md.length > maxLength) return;
      onChange(md);
    },
  });

  if (!editor) return null;

  const adaTautan = editor.isActive('link');

  const pasangTautan = () => {
    const url = linkUrl.trim();
    if (!url) return;
    // Protokol dilengkapi supaya tidak jadi tautan relatif yang menyesatkan.
    const final = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: final }).run();
    setLinkUrl('');
    setLinkOpen(false);
  };

  return (
    <div className="rounded-md border focus-within:ring-1 focus-within:ring-ring">
      <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
        <ToggleGroup type="multiple" size="sm" variant="outline">
          <ToggleGroupItem
            value="bold"
            aria-label={t('bold')}
            data-state={editor.isActive('bold') ? 'on' : 'off'}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="italic"
            aria-label={t('italic')}
            data-state={editor.isActive('italic') ? 'on' : 'off'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToggleGroup type="multiple" size="sm" variant="outline">
          <ToggleGroupItem
            value="bulletList"
            aria-label={t('bulletList')}
            data-state={editor.isActive('bulletList') ? 'on' : 'off'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3.5 w-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="orderedList"
            aria-label={t('orderedList')}
            data-state={editor.isActive('orderedList') ? 'on' : 'off'}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        {adaTautan ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2"
            aria-label={t('unlink')}
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Link2Off className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-2"
                aria-label={t('link')}
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 space-y-2 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {t('linkPrompt')}
              </p>
              <div className="flex gap-2">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="wa.me/628…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      pasangTautan();
                    }
                  }}
                />
                <Button type="button" size="sm" className="h-8" onClick={pasangTautan}>
                  {t('linkApply')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {editor.isEmpty && placeholder && (
        <p className="pointer-events-none absolute px-3 py-2 text-sm text-muted-foreground/50">
          {placeholder}
        </p>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
