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
import type { BankAccount, BankName } from '@/types/tenant';

const BANK_LIST: { value: BankName; label: string }[] = [
  { value: 'BCA', label: 'BCA' },
  { value: 'Mandiri', label: 'Mandiri' },
  { value: 'BRI', label: 'BRI' },
  { value: 'BNI', label: 'BNI' },
  { value: 'BSI', label: 'BSI' },
  { value: 'BTN', label: 'BTN' },
  { value: 'CIMB Niaga', label: 'CIMB Niaga' },
  { value: 'Permata', label: 'Permata' },
  { value: 'Danamon', label: 'Danamon' },
  { value: 'Maybank ID', label: 'Maybank ID' },
  { value: 'Panin', label: 'Panin' },
  { value: 'Jenius', label: 'Jenius (BTPN)' },
  { value: 'SeaBank', label: 'SeaBank' },
  { value: 'Blu by BCA', label: 'Blu by BCA' },
  { value: 'Bank Jago', label: 'Bank Jago' },
  { value: 'Allo Bank', label: 'Allo Bank' },
  { value: 'OCBC Indonesia', label: 'OCBC Indonesia' },
];

function BankCombobox({
  value,
  onValueChange,
  usedBanks,
}: {
  value: BankName;
  onValueChange: (v: BankName) => void;
  usedBanks: BankName[];
}) {
  const [open, setOpen] = useState(false);
  const available = BANK_LIST.filter((b) => !usedBanks.includes(b.value));
  const selected = BANK_LIST.find((b) => b.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10 px-3"
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : 'Select bank...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search bank..." />
          <CommandList className="max-h-64">
            <CommandEmpty>No bank available.</CommandEmpty>
            <CommandGroup heading="Indonesia">
              {available.map((b) => (
                <CommandItem
                  key={b.value}
                  value={`${b.value} ${b.label}`}
                  onSelect={() => { onValueChange(b.value); setOpen(false); }}
                  className="gap-2"
                >
                  <Check className={cn('h-4 w-4 shrink-0', value === b.value ? 'opacity-100' : 'opacity-0')} />
                  <span>{b.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usedBanks: BankName[];
  onSave: (bank: BankAccount) => void;
}

function BankForm({
  onSave,
  onCancel,
  usedBanks,
}: {
  onSave: (bank: BankAccount) => void;
  onCancel: () => void;
  usedBanks: BankName[];
}) {
  const available = BANK_LIST.filter((b) => !usedBanks.includes(b.value));
  const [selectedBank, setSelectedBank] = useState<BankName>(available[0]?.value ?? 'BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: '',
      bank: selectedBank,
      accountNumber,
      accountName,
      enabled: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Bank</Label>
        <BankCombobox value={selectedBank} onValueChange={setSelectedBank} usedBanks={usedBanks} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountNumber">Nomor Rekening</Label>
        <Input
          id="accountNumber"
          placeholder="Contoh: 1234567890"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
        <Input
          id="accountName"
          placeholder="Contoh: John Doe"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
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

export function BankAccountDialog({ open, onOpenChange, usedBanks, onSave }: BankAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
          <DialogDescription>Select a bank to receive transfer payments.</DialogDescription>
        </DialogHeader>
        {open && (
          <BankForm
            key={usedBanks.join(',')}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            usedBanks={usedBanks}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}