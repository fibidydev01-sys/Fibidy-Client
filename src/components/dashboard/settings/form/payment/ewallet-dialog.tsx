'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { PROVIDER_COLORS } from '@/lib/constants/shared/constants';
import type { EWallet, EWalletProvider } from '@/types/tenant';

// ==========================================
// EWALLET DIALOG
// FIX: Hapus PROVIDER_COLORS lokal + export, import dari constants.ts
// ==========================================

const EWALLET_LIST: { value: EWalletProvider; label: string; flag: string }[] = [
  { value: 'GoPay', label: 'GoPay', flag: '💚' },
  { value: 'OVO', label: 'OVO', flag: '💜' },
  { value: 'DANA', label: 'DANA', flag: '💙' },
  { value: 'ShopeePay', label: 'ShopeePay', flag: '🧡' },
  { value: 'LinkAja', label: 'LinkAja', flag: '❤️' },
  { value: 'QRIS', label: 'QRIS', flag: '🔲' },
];

function EWalletCombobox({
  value,
  onValueChange,
  usedProviders,
}: {
  value: EWalletProvider;
  onValueChange: (v: EWalletProvider) => void;
  usedProviders: EWalletProvider[];
}) {
  const [open, setOpen] = useState(false);
  const available = EWALLET_LIST.filter((e) => !usedProviders.includes(e.value));
  const selected = EWALLET_LIST.find((e) => e.value === value);
  const accentColor = selected ? (PROVIDER_COLORS[selected.value] ?? '') : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10 px-3"
        >
          {selected ? (
            <span className="flex items-center gap-2 min-w-0">
              <span>{selected.flag}</span>
              <span className={cn('font-semibold truncate', accentColor)}>{selected.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select e-wallet...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search e-wallet..." />
          <CommandList className="max-h-64">
            <CommandEmpty>No e-wallet available.</CommandEmpty>
            <CommandGroup heading="Indonesia">
              {available.map((e) => (
                <CommandItem
                  key={e.value}
                  value={`${e.value} ${e.label}`}
                  onSelect={() => { onValueChange(e.value); setOpen(false); }}
                  className="gap-2"
                >
                  <Check className={cn('h-4 w-4 shrink-0', value === e.value ? 'opacity-100' : 'opacity-0')} />
                  <span>{e.flag}</span>
                  <span className={cn('font-medium', PROVIDER_COLORS[e.value] ?? '')}>{e.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface EwalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usedProviders: EWalletProvider[];
  onSave: (ewallet: EWallet) => void;
}

function EwalletForm({
  onSave,
  onCancel,
  usedProviders,
}: {
  onSave: (ewallet: EWallet) => void;
  onCancel: () => void;
  usedProviders: EWalletProvider[];
}) {
  const available = EWALLET_LIST.filter((e) => !usedProviders.includes(e.value));
  const [selectedProvider, setSelectedProvider] = useState<EWalletProvider>(
    available[0]?.value ?? 'GoPay'
  );
  const [number, setNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: '',
      provider: selectedProvider,
      number,
      enabled: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Provider</Label>
        <EWalletCombobox
          value={selectedProvider}
          onValueChange={setSelectedProvider}
          usedProviders={usedProviders}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ewalletNumber">Nomor / ID</Label>
        <Input
          id="ewalletNumber"
          placeholder="Contoh: 08123456789"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}

export function EwalletDialog({ open, onOpenChange, usedProviders, onSave }: EwalletDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add E-Wallet</DialogTitle>
          <DialogDescription>Select an e-wallet to receive digital payments.</DialogDescription>
        </DialogHeader>
        {open && (
          <EwalletForm
            key={usedProviders.join(',')}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            usedProviders={usedProviders}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}