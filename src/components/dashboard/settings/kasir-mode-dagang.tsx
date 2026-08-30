'use client';

// ============================================================================
// PENGATURAN → KASIR (mode dagang + struk)
// File: src/components/dashboard/settings/kasir-mode-dagang.tsx
//
// [MIGRASI HEADER — Aug 2026]
// WizardNav (save-only mode) diganti WizardHeader, HANYA di dalam
// FormKasir — satu-satunya tempat yang di kode aslinya memang punya nav.
// Cabang isLoading/!config di KasirModeDagangSection TIDAK disentuh:
// keduanya tidak pernah punya WizardNav sama sekali (skeleton loading
// dan pesan gagal-muat tidak butuh aksi Back/Save), jadi tidak ada yang
// perlu dimigrasi di sana.
//
// Layar ini menutup dua lubang sekaligus.
//
// 1. MODE DAGANG. Kategori toko cuma MENEBAK sekali saat config kasir pertama
//    kali dibuat — laundry ditebak JASA, bengkel HYBRID, apotek PRODUK.
//    Sesudah itu kolomnya milik seller (G8), dan tanpa layar ini janji itu
//    kosong: mode dagang cuma bisa diganti lewat permintaan langsung ke API.
//    Akibatnya toko roti yang mulai menerima pesanan kue custom terkunci di
//    tebakan awal, dan tab Papan Kerja yang ia butuhkan tidak pernah muncul.
//
// 2. IDENTITAS STRUK. namaUsaha/alamat/noTelp/footerStruk sudah dicetak di
//    setiap struk sejak modul kasir ada, tapi belum pernah punya UI — jadi
//    struk semua tenant selama ini keluar tanpa nama usaha.
//
// Keduanya tinggal di satu layar karena keduanya adalah "cara kasir toko ini
// bekerja", disetel sesekali, bukan pekerjaan harian.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Boxes, ClipboardList, Package, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { WizardHeader } from '@/components/dashboard/shared/wizard-header';
import { useKasirLock } from '@/hooks/dashboard/use-kasir-lock';
import { toast } from 'sonner';
import { cn } from '@/lib/shared/utils';
import { PAGE_COLUMN } from '@/components/dashboard/shared/page-column';
import { getErrorMessage } from '@/lib/api/client';
import { useKasirConfig, useUpdateKasirConfig } from '@/hooks/dashboard/use-kasir';
import type { KasirConfig, KasirDagangType } from '@/types/kasir';
import { Button } from '@/components/ui/button';

/// Yang dijanjikan tiap mode, ditulis sebagai akibat yang bisa dilihat seller
/// di layarnya — bukan istilah internal. "HYBRID" tidak berarti apa-apa buat
/// pemilik bengkel; "jual barang dan layanan" berarti sesuatu.
const MODE: Array<{
  id: KasirDagangType;
  icon: typeof Package;
  labelKey: string;
  descKey: string;
  efekKeys: string[];
}> = [
  {
    id: 'PRODUK',
    icon: Package,
    labelKey: 'modeProduk',
    descKey: 'modeProdukDesc',
    efekKeys: ['efekKatalogBarang', 'efekAdaStok', 'efekTanpaPapan'],
  },
  {
    id: 'JASA',
    icon: Wrench,
    labelKey: 'modeJasa',
    descKey: 'modeJasaDesc',
    efekKeys: ['efekKatalogLayanan', 'efekAdaPapan', 'efekTanpaStok'],
  },
  {
    id: 'HYBRID',
    icon: Boxes,
    labelKey: 'modeHybrid',
    descKey: 'modeHybridDesc',
    efekKeys: ['efekKatalogKeduanya', 'efekAdaStok', 'efekAdaPapan'],
  },
];

const PAPER_WIDTHS = [58, 80] as const;

export function KasirModeDagangSection({ onBack }: { onBack: () => void }) {
  const t = useTranslations('dashboard.kasir.settingsKasir');
  const { data: config, isLoading, refetch } = useKasirConfig();

  // [FINALISASI] Dulu satu baris: `if (isLoading || !config)`. Bentuk itu
  // punya jalan buntu — begitu permintaan GAGAL, `isLoading` jadi false tapi
  // `config` tetap undefined, sehingga syaratnya benar SELAMANYA dan
  // skeletonnya tidak pernah selesai. Tenant FREE kena persis itu: setiap
  // endpoint kasir menolak mereka dengan 403, dan halaman ini menggantung
  // tanpa satu pun petunjuk.
  //
  // Sekarang ketiga keadaan dipisah. Kasus 403 sendiri sudah ditangani
  // KasirPlanGate di settings/client.tsx sebelum komponen ini dipasang;
  // cabang di bawah menangani kegagalan LAIN (jaringan, 500) yang dulu ikut
  // tersedot ke jalan buntu yang sama.
  //
  // [MIGRASI HEADER] Cabang isLoading dan !config TIDAK punya nav di kode
  // aslinya — tidak ditambahkan WizardHeader di sini, konsisten dengan itu.
  if (isLoading) {
    return (
      <div className={cn(PAGE_COLUMN, 'space-y-4 mt-6')}>
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className={cn(PAGE_COLUMN, 'space-y-3 mt-6')}>
        <p className="text-sm text-muted-foreground">{t('gagalMuat')}</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          {t('cobaLagi')}
        </Button>
      </div>
    );
  }

  // Form baru dipasang SETELAH config ada, dan `key` membuatnya terpasang
  // ulang kalau config berganti. Itu menggantikan useEffect yang menyalin
  // data ke state — pola yang di repo ini dilarang lint (set-state-in-effect)
  // dan memang rawan: menyalin ulang di tengah pengetikan akan menghapus apa
  // yang sedang diketik seller.
  return <FormKasir key={config.id} config={config} onBack={onBack} t={t} />;
}

function FormKasir({
  config,
  onBack,
  t,
}: {
  config: KasirConfig;
  onBack: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const { mutate: simpanConfig, isPending } = useUpdateKasirConfig();

  // Mahkota di tombol simpan. Seluruh pengaturannya tetap terlihat dan tetap
  // bisa diutak-atik tenant FREE — yang ditahan cuma menyimpannya.
  const { terkunci, jaga } = useKasirLock();

  const [dagangType, setDagangType] = useState<KasirDagangType>(
    config.dagangType,
  );
  const [namaUsaha, setNamaUsaha] = useState(config.namaUsaha ?? '');
  const [alamat, setAlamat] = useState(config.alamat ?? '');
  const [noTelp, setNoTelp] = useState(config.noTelp ?? '');
  const [footerStruk, setFooterStruk] = useState(config.footerStruk ?? '');
  const [paperWidth, setPaperWidth] = useState<number>(config.paperWidth ?? 58);

  const simpan = () => {
    simpanConfig(
      {
        dagangType,
        namaUsaha: namaUsaha.trim(),
        alamat: alamat.trim(),
        noTelp: noTelp.trim(),
        footerStruk: footerStruk.trim(),
        paperWidth,
      },
      { onError: (err) => toast.error(getErrorMessage(err)) },
    );
  };

  return (
    <div className={cn('flex h-full flex-col', PAGE_COLUMN)}>
      {/* [MIGRASI HEADER] WizardHeader elemen PERTAMA, save-only mode. */}
      <WizardHeader
        onBack={onBack}
        onSave={jaga(simpan)}
        saveTerkunci={terkunci}
        isSaving={isPending}
        saveLabel={t('save')}
        savingLabel={t('saving')}
      />

      <div className="flex-1 space-y-8 mt-6">
        {/* ── Mode dagang ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold">{t('modeTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('modeDescription')}
          </p>

          <div
            className="mt-4 space-y-2"
            role="radiogroup"
            aria-label={t('modeTitle')}
          >
            {MODE.map((m) => {
              const aktif = dagangType === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={aktif}
                  onClick={() => setDagangType(m.id)}
                  className={cn(
                    'w-full rounded-[var(--shape-panel)] border p-4 text-left transition-colors',
                    aktif
                      ? 'border-primary bg-primary/[0.06]'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        aktif
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <m.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{t(m.labelKey)}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {t(m.descKey)}
                      </p>
                      {/* Akibat konkret di layar, supaya pilihan ini tidak
                          terasa seperti tombol misterius. */}
                      <ul className="mt-2 space-y-0.5">
                        {m.efekKeys.map((key) => (
                          <li
                            key={key}
                            className="text-xs text-muted-foreground"
                          >
                            · {t(key)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {dagangType !== config.dagangType && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              <ClipboardList className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('modeBerubahHint')}
            </p>
          )}
        </section>

        {/* ── Identitas struk ────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{t('strukTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('strukDescription')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama-usaha">{t('namaUsaha')}</Label>
            <Input
              id="nama-usaha"
              value={namaUsaha}
              maxLength={60}
              onChange={(e) => setNamaUsaha(e.target.value)}
              placeholder={t('namaUsahaPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">{t('alamat')}</Label>
            <Input
              id="alamat"
              value={alamat}
              maxLength={120}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder={t('alamatPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="no-telp">{t('noTelp')}</Label>
            <Input
              id="no-telp"
              value={noTelp}
              maxLength={20}
              inputMode="tel"
              onChange={(e) => setNoTelp(e.target.value)}
              placeholder={t('noTelpPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer-struk">{t('footerStruk')}</Label>
            <Input
              id="footer-struk"
              value={footerStruk}
              maxLength={80}
              onChange={(e) => setFooterStruk(e.target.value)}
              placeholder={t('footerStrukPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('paperWidth')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {PAPER_WIDTHS.map((lebar) => {
                const aktif = paperWidth === lebar;
                return (
                  <button
                    key={lebar}
                    type="button"
                    aria-pressed={aktif}
                    onClick={() => setPaperWidth(lebar)}
                    className={cn(
                      'rounded-[var(--shape-panel)] border px-3 py-3 text-left transition-colors',
                      aktif
                        ? 'border-primary bg-primary/[0.06]'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <span className="block text-sm font-medium">
                      {t('paperWidthValue', { mm: lebar })}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {t(lebar === 58 ? 'paperWidth58Hint' : 'paperWidth80Hint')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
