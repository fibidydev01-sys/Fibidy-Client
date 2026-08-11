'use client';

// ============================================================================
// KASIR SEARCH FIELD
// File: src/components/dashboard/kasir/kasir-search-field.tsx
//
// Tiga halaman (Jual, Riwayat, Stok) sebelumnya menyusun kolom pencarian
// dengan tangan: <Input> + ikon `absolute left-3 top-1/2 -translate-y-1/2` +
// tombol X `absolute right-2`. Selain diulang tiga kali, padding kirinya
// (`pl-9`) adalah angka yang harus dijaga manual setiap kali ukuran ikon
// berubah.
//
// InputGroup mengurus keduanya lewat layout, bukan posisi absolut, jadi tinggi
// dan perataannya sama persis dengan input lain di aplikasi.
// ============================================================================

import { Search, X } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/shared/utils';

export function KasirSearchField({
  value,
  onChange,
  placeholder,
  clearLabel,
  /** true saat permintaan pencarian sedang berjalan. */
  busy,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearLabel: string;
  busy?: boolean;
  className?: string;
}) {
  return (
    <InputGroup className={cn('h-10', className)}>
      <InputGroupAddon>
        {busy ? (
          <Spinner className="size-4" />
        ) : (
          <Search className="size-4" aria-hidden />
        )}
      </InputGroupAddon>

      <InputGroupInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />

      {value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            onClick={() => onChange('')}
            aria-label={clearLabel}
          >
            <X className="size-3.5" aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
