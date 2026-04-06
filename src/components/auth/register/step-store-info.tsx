'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCheckSlug } from '@/hooks/auth/use-auth';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { Loader2, Check, X, Info } from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

interface StepStoreInfoProps {
  name: string;
  slug: string;
  description: string;
  onUpdate: (data: { name?: string; slug?: string; description?: string }) => void;
}

// ==========================================
// COMPONENT — no header, no nav (handled by parent)
// ==========================================

export function StepStoreInfo({ name, slug, description, onUpdate }: StepStoreInfoProps) {
  const [localName, setLocalName] = useState(name);
  const [localSlug, setLocalSlug] = useState(slug);
  const [localDescription, setLocalDescription] = useState(description);
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);

  const { checkSlug, isChecking, isAvailable, reset: resetSlug } = useCheckSlug();
  const debouncedSlug = useDebounce(localSlug, 500);

  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      checkSlug(debouncedSlug);
    } else {
      resetSlug();
    }
  }, [debouncedSlug, checkSlug, resetSlug]);

  // Sync up to parent on every change
  const handleNameChange = (value: string) => {
    setLocalName(value);
    if (!hasManuallyEditedSlug) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 30);
      setLocalSlug(generated);
      onUpdate({ name: value, slug: generated });
    } else {
      onUpdate({ name: value });
    }
  };

  const handleSlugChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setLocalSlug(cleaned);
    setHasManuallyEditedSlug(true);
    onUpdate({ slug: cleaned });
  };

  const handleDescriptionChange = (value: string) => {
    setLocalDescription(value);
    onUpdate({ description: value });
  };

  return (
    <div className="space-y-5 max-w-md">

      {/* Store Name */}
      <div className="space-y-1.5">
        <Label htmlFor="store-name" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Store name
        </Label>
        <Input
          id="store-name"
          placeholder="e.g. Burger House"
          value={localName}
          onChange={(e) => handleNameChange(e.target.value)}
          className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">
          Shown on your store homepage and listings
        </p>
      </div>

      <div className="border-t max-w-md" />

      {/* Store URL */}
      <div className="space-y-1.5">
        <Label htmlFor="store-slug" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Store URL
        </Label>
        <div className="relative">
          <Input
            id="store-slug"
            placeholder="burger-house"
            value={localSlug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="h-11 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          {localSlug.length >= 3 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : isAvailable === true ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : isAvailable === false ? (
                <X className="h-4 w-4 text-red-500" />
              ) : null}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          {localSlug || 'your-store'}.fibidy.com
        </p>
        {isAvailable === false && (
          <p className="text-xs text-destructive">This URL is already taken</p>
        )}
      </div>

      <div className="border-t max-w-md" />

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="store-desc" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Description{' '}
          <span className="normal-case font-normal text-muted-foreground/70">(optional)</span>
        </Label>
        <Textarea
          id="store-desc"
          placeholder="Tell customers what your store is about..."
          rows={3}
          value={localDescription}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          maxLength={500}
          className="resize-none text-sm placeholder:text-muted-foreground/50"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Shown in your store profile &amp; search results</span>
          <span className="font-mono tabular-nums">{localDescription.length}/500</span>
        </div>
      </div>
    </div>
  );
}