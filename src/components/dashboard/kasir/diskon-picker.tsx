'use client';

// ============================================================================
// DISKON PICKER
// File: src/components/dashboard/kasir/diskon-picker.tsx
//
// Ditampilkan dengan TUKAR ISI di halaman keranjang, bukan modal di atas
// modal. Alur checkout sudah punya satu tumpukan navigasi (Kasir → Keranjang
// → Struk); menambah lapisan lagi membuat tombol kembali jadi ambigu.
//
// Kasir hanya MEMILIH dari preset yang sudah dibuat pemilik toko di
// Pengaturan — tidak ada pembuatan diskon dadakan di sini. Itu alasan
// halaman kelola preset tinggal di Pengaturan, bukan di alur transaksi.
//
// [UI/UX — Agu 2026] Daftarnya kini <RadioGroup>, bukan tumpukan <button>
// dengan ikon centang buatan sendiri. Ini memang persis satu-dari-sekian:
// RadioGroup memberi navigasi panah, pengumuman "terpilih" oleh pembaca layar,
// dan satu tab stop untuk seluruh daftar — tiga hal yang harus ditulis manual
// pada versi tombol.
// ============================================================================

import { useTranslations } from 'next-intl';
import { ArrowLeft, Percent, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from '@/components/ui/empty';
import { FieldLabel } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPriceIDR } from '@/lib/shared/format';
import { useDiskonPresets } from '@/hooks/dashboard/use-kasir';
import type { DiskonPreset } from '@/types/kasir';
import { Link } from '@/i18n/navigation';

const TANPA_DISKON = '__tanpa__';

export function DiskonPicker({
  subtotal,
  terpilihId,
  onPilih,
  onBack,
}: {
  subtotal: number;
  terpilihId: string | null;
  onPilih: (preset: DiskonPreset | null) => void;
  onBack: () => void;
}) {
  const t = useTranslations('dashboard.kasir.diskon');
  const { data: presets, isLoading } = useDiskonPresets();

  const pilih = (nilai: string) => {
    if (nilai === TANPA_DISKON) {
      onPilih(null);
      return;
    }
    const preset = (presets ?? []).find((p) => p.id === nilai);
    if (preset) onPilih(preset);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label={t('back')}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Button>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[var(--shape-panel)]" />
          ))}
        </div>
      ) : (
        <RadioGroup
          value={terpilihId ?? TANPA_DISKON}
          onValueChange={pilih}
          aria-label={t('groupLabel')}
          className="gap-2"
        >
          {/* Jalan keluar dari diskon apa pun — selalu di posisi pertama. */}
          <FieldLabel htmlFor="diskon-tanpa">
            <Card className="w-full flex-row items-center gap-3 py-3 transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
              <CardContent className="flex flex-1 items-center gap-3 px-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Percent className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex-1 font-medium">{t('none')}</span>
                <RadioGroupItem value={TANPA_DISKON} id="diskon-tanpa" />
              </CardContent>
            </Card>
          </FieldLabel>

          {(presets ?? []).map((preset) => {
            // Pratinjau dampak nominal sebelum dipilih — kasir bisa menyebut
            // angka hematnya ke pelanggan tanpa menghitung di kepala.
            const hemat = Math.round((subtotal * preset.persen) / 100);

            return (
              <FieldLabel key={preset.id} htmlFor={`diskon-${preset.id}`}>
                <Card className="w-full flex-row items-center gap-3 py-3 transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                  <CardContent className="flex flex-1 items-center gap-3 px-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold tabular-nums text-primary">
                      {preset.persen}%
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {preset.nama}
                      </span>
                      <span className="block text-sm font-normal text-muted-foreground">
                        {t('savePreview', { nominal: formatPriceIDR(hemat) })}
                      </span>
                    </span>
                    <RadioGroupItem
                      value={preset.id}
                      id={`diskon-${preset.id}`}
                    />
                  </CardContent>
                </Card>
              </FieldLabel>
            );
          })}

          {/* Card border-dashed buatan sendiri diganti Empty. `min-h-0`
              karena ini duduk di dalam sheet yang sempit — tinggi minimum
              bawaan akan mendorong tombolnya keluar layar di ponsel. */}
          {(presets ?? []).length === 0 && (
            <Empty className="min-h-0 gap-4 py-6 sm:p-6 md:p-6">
              <EmptyHeader>
                <EmptyDescription>{t('emptyPresets')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href="/dashboard/settings?section=diskon-preset">
                    <Settings2 className="h-3.5 w-3.5" aria-hidden />
                    {t('managePresets')}
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </RadioGroup>
      )}
    </div>
  );
}
