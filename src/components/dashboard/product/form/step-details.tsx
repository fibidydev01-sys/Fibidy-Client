'use client';

// ─── Step 1: Details ───────────────────────────────────────────────────────

import { useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/shared/utils';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormData } from '@/lib/shared/validations';

interface StepDetailsProps {
  form: UseFormReturn<ProductFormData>;
  showPrice: boolean;
  onShowPriceChange: (val: boolean) => void;
  currency: string;
  categories: string[];
}

// ─── Currency Input ───────────────────────────────────────────────────────
function CurrencyInput({
  currency,
  placeholder,
  field,
  onChange,
  value,
}: {
  currency: string;
  placeholder: string;
  field: Record<string, unknown>;
  onChange: (val: number | undefined) => void;
  value: number | undefined;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
        {currency}
      </span>
      <Input
        type="number"
        min="0"
        placeholder={placeholder}
        className={cn('h-11 font-medium tabular-nums', currency.length <= 3 ? 'pl-14' : 'pl-16')}
        {...field}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      />
    </div>
  );
}

export function StepDetails({
  form,
  showPrice,
  onShowPriceChange,
  currency,
  categories,
}: StepDetailsProps) {
  const watchCategory = form.watch('category');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const isNewCategory =
    categorySearch.trim() !== '' &&
    !categories.some((cat) => cat.toLowerCase() === categorySearch.toLowerCase());

  const handleSelectCategory = (value: string) => {
    form.setValue('category', value);
    setCategorySearch('');
    setCategoryOpen(false);
  };

  const handleCreateCategory = () => {
    const newCategory = categorySearch.trim();
    if (newCategory) {
      form.setValue('category', newCategory);
      setCategorySearch('');
      setCategoryOpen(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── LAYER 1: Aktif/Nonaktif + Category ──────────────────── */}
      <div className="flex items-start gap-4">

        {/* Aktif/Nonaktif — kiri */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="shrink-0">
              <div className="flex items-center gap-2 rounded-xl border px-4 py-3 h-11">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="isActive"
                />
                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Aktifkan
                </Label>
              </div>
            </FormItem>
          )}
        />

        {/* Category — kanan */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="flex flex-col flex-1">
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className={cn(
                        'h-11 w-full justify-between font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value || 'Kategori'}
                      <span className="ml-2 text-muted-foreground/50 text-xs">▼</span>
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0" align="end">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Cari atau buat kategori..."
                      value={categorySearch}
                      onValueChange={setCategorySearch}
                    />
                    <CommandList>
                      <CommandEmpty className="py-3 px-4 text-sm text-muted-foreground">
                        {categorySearch
                          ? <span>Tidak ada kategori &quot;{categorySearch}&quot;</span>
                          : <span>Ketik untuk mencari atau membuat kategori</span>
                        }
                      </CommandEmpty>
                      {filteredCategories.length > 0 && (
                        <CommandGroup heading="Kategori">
                          {filteredCategories.map((cat) => (
                            <CommandItem
                              key={cat}
                              value={cat}
                              onSelect={() => handleSelectCategory(cat)}
                            >
                              <span className={cn(
                                'mr-2 text-xs',
                                watchCategory === cat ? 'opacity-100' : 'opacity-0'
                              )}>
                                ✓
                              </span>
                              {cat}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      {isNewCategory && (
                        <CommandGroup heading="Buat baru">
                          <CommandItem
                            value={`__create__${categorySearch}`}
                            onSelect={handleCreateCategory}
                            className="text-primary font-medium"
                          >
                            <span className="mr-2">+</span>
                            Buat &quot;{categorySearch}&quot;
                          </CommandItem>
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

      </div>

      {/* ── LAYER 2: Product Name + Description ─────────────────── */}
      <div className="space-y-4">

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">
                Nama produk <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="cth. Nasi Goreng Spesial, Headphone Wireless"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsikan produk — bahan, ukuran, fitur utama..."
                  rows={4}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Deskripsi yang jelas membantu pelanggan membeli dengan lebih yakin.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

      </div>

      {/* ── LAYER 3: Pricing ────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Toggle harga */}
        <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
          <div>
            <Label className="text-sm font-medium">
              {showPrice ? 'Tampilkan harga' : 'Harga atas permintaan'}
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {showPrice
                ? 'Pelanggan melihat harga di listing'
                : 'Pelanggan akan melihat tombol "Hubungi kami"'}
            </p>
          </div>
          <Switch checked={showPrice} onCheckedChange={onShowPriceChange} />
        </div>

        {/* Notice harga atas permintaan */}
        {!showPrice && (
          <div className="rounded-xl border border-dashed border-orange-400/40 bg-orange-500/5 px-4 py-3.5">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
              Harga atas permintaan aktif
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Tidak ada kolom harga yang diperlukan. Pelanggan akan menghubungi Anda langsung.
            </p>
          </div>
        )}

        {/* Kolom harga */}
        {showPrice && (
          <div className="grid sm:grid-cols-2 gap-4">

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Harga jual <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <CurrencyInput
                      currency={currency}
                      placeholder="0"
                      field={field}
                      value={field.value as number | undefined}
                      onChange={(v) => field.onChange(v ?? 0)}
                    />
                  </FormControl>
                  <FormDescription>Harga yang ditampilkan ke pelanggan</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comparePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Harga coret</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      currency={currency}
                      placeholder="0"
                      field={field}
                      value={field.value as number | undefined}
                      onChange={(v) => field.onChange(v)}
                    />
                  </FormControl>
                  <FormDescription>
                    Harga sebelum diskon — ditampilkan dengan coretan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        )}

      </div>

    </div>
  );
}