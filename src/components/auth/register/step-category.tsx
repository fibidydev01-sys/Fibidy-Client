'use client';

// ============================================================================
// STEP CATEGORY (REGISTER WIZARD)
// File: src/components/auth/register/step-category.tsx
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// - fieldErrors prop: highlight container saat category tidak dipilih
// - Border merah di bawah search + teks error
// - Merah hilang saat user pilih kategori
//
// [STICKY LAYOUT FIX — May 2026]
// Scroll dihandle oleh SCROLLABLE BODY di register.tsx
// ============================================================================

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getCategoryGroupList,
  getCategoriesByGroup,
  getCategoryLabelKey,
  getCategoryDescriptionKey,
  getCategoryGroupLabelKey,
} from '@/lib/constants/shared/categories';
import { cn } from '@/lib/shared/utils';
import { Plus, Search, Check, AlertCircle } from 'lucide-react';

interface StepCategoryProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  // [SPRINT 5]
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

interface ResolvedCategory {
  key: string;
  group: string;
  label: string;
  description: string;
}

export function StepCategory({
  selectedCategory,
  onSelectCategory,
  fieldErrors = new Set(),
  onClearFieldError,
}: StepCategoryProps) {
  const t = useTranslations('auth.register.category');
  const tRoot = useTranslations();

  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const hasCategoryError = fieldErrors.has('category');

  const groups = useMemo(() => {
    return getCategoryGroupList().map((group) => {
      const items: ResolvedCategory[] = getCategoriesByGroup(group.key).map(
        (cat) => ({
          key: cat.key,
          group: cat.group,
          label: tRoot(getCategoryLabelKey(cat.key)),
          description: tRoot(getCategoryDescriptionKey(cat.key)),
        }),
      );
      return {
        key: group.key,
        label: tRoot(getCategoryGroupLabelKey(group.key)),
        items,
      };
    });
  }, [tRoot]);

  const flatFiltered = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return groups
      .flatMap((g) => g.items)
      .filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
  }, [groups, search]);

  const handleSelectCategory = (category: string) => {
    onSelectCategory(category);
    if (hasCategoryError) onClearFieldError?.('category');
  };

  const handleSelectCustom = () => {
    if (customCategory.trim()) {
      handleSelectCategory(customCategory.trim());
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-3">

      {/* Error banner */}
      {hasCategoryError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive font-medium">
            {t('searchPlaceholder')}
          </p>
        </div>
      )}

      {/* Search */}
      {!showCustom && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'pl-9',
              hasCategoryError && 'border-destructive focus-visible:ring-destructive',
            )}
          />
        </div>
      )}

      {/* Category List */}
      {!showCustom && (
        <div className={cn(
          'space-y-5 rounded-xl transition-all',
          hasCategoryError && 'outline outline-2 outline-destructive/50 outline-offset-2',
        )}>
          {search ? (
            flatFiltered.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-sm text-muted-foreground">{t('noResults')}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustom(true);
                    setCustomCategory(search);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {t('addOwn')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {flatFiltered.map((cat) => (
                  <CategoryRow
                    key={cat.key}
                    label={cat.label}
                    description={cat.description}
                    value={cat.key}
                    isSelected={selectedCategory === cat.key}
                    onSelect={handleSelectCategory}
                  />
                ))}
              </div>
            )
          ) : (
            groups.map((group) => (
              <div key={group.key} className="space-y-2">
                <p className="px-1">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.items.map((cat) => (
                    <CategoryRow
                      key={cat.key}
                      label={cat.label}
                      description={cat.description}
                      value={cat.key}
                      isSelected={selectedCategory === cat.key}
                      onSelect={handleSelectCategory}
                    />
                  ))}
                </div>
              </div>
            ))
          )}

          {!search && (
            <div className="pt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCustom(true)}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                {t('noMatch')} {t('addOwnCta')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Custom Category Input */}
      {showCustom && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
              {t('customLabel')}
            </span>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="custom-category"
              className="text-xs font-medium text-muted-foreground"
            >
              {t('customInputLabel')}
            </label>
            <Input
              id="custom-category"
              autoFocus
              placeholder={t('customInputPlaceholder')}
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSelectCustom();
                }
              }}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustom(false);
                setCustomCategory('');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSelectCustom}
              disabled={!customCategory.trim()}
            >
              {t('useThis')}
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
}

// ── Category Row ──────────────────────────────────────────────────────────────

interface CategoryRowProps {
  label: string;
  description?: string;
  value: string;
  isSelected: boolean;
  onSelect: (v: string) => void;
}

function CategoryRow({ label, description, value, isSelected, onSelect }: CategoryRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'w-full text-left rounded-xl border-2 p-4 transition-all duration-150',
        'flex items-center gap-4',
        isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
          : 'border-border hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
            {description}
          </p>
        )}
      </div>
      <div
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'border-2 border-muted-foreground/30',
        )}
      >
        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
      </div>
    </button>
  );
}
