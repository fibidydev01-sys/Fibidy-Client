'use client';

// ==========================================
// STEP CATEGORY (REGISTER WIZARD)
// File: src/components/auth/register/step-category.tsx
//
// [POLISH v15.4 — May 2026]
//
// CHANGED in v15.4:
//   - `cat.label` / `cat.description` access patterns REMOVED.
//     The category registry (lib/constants/shared/categories.ts) marked
//     these fields `@deprecated` and made them optional in v15.4 — they
//     now live in i18n at `common.categories.items.{KEY}.{label,description}`.
//   - Resolves labels/descriptions via the same helpers `step-review.tsx`
//     uses: `getCategoryLabelKey()` / `getCategoryDescriptionKey()`.
//   - Builds a single normalized `categoryItems` array up-front (id +
//     resolved label + resolved description) so search filtering and
//     row rendering both consume the same shape — no more optional
//     unwrap dance at the call site.
//
// PRESERVED:
//   - Custom-category escape hatch (the "Add your own" path)
//   - Search input + filter behavior
//   - Group rendering order via `getCategoryGroupList()`
//   - Selected/unselected UI states
// ==========================================

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
import { Plus, Search, Check } from 'lucide-react';

interface StepCategoryProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
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
}: StepCategoryProps) {
  const t = useTranslations('auth.register.category');
  // Root-level translator — categories i18n lives under common.*, not auth.*
  const tRoot = useTranslations();

  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // ──────────────────────────────────────────────────────────────
  // Build per-group resolved categories ONCE per render. Each item
  // carries its already-translated label + description so neither
  // the search filter nor the row component has to deal with the
  // optional/undefined registry fields directly.
  // ──────────────────────────────────────────────────────────────
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

  // Flat list — used only when the user has typed a search query
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

  const handleSelectCustom = () => {
    if (customCategory.trim()) {
      onSelectCategory(customCategory.trim());
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── SEARCH ─────────────────────────────────────────────── */}
      {!showCustom && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      )}

      {/* ── CATEGORY LIST ──────────────────────────────────────── */}
      {!showCustom && (
        <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
          {search ? (
            // Flat search results
            flatFiltered.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('noResults')}
                </p>
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
                    onSelect={onSelectCategory}
                  />
                ))}
              </div>
            )
          ) : (
            // Grouped view
            groups.map((group) => (
              <div key={group.key} className="space-y-2">
                <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground px-1">
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
                      onSelect={onSelectCategory}
                    />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* "Add your own" tail CTA */}
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

      {/* ── CUSTOM CATEGORY INPUT ──────────────────────────────── */}
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
              className="h-10"
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

// ==========================================
// CATEGORY ROW
// ==========================================

interface CategoryRowProps {
  label: string;
  description?: string;
  value: string;
  isSelected: boolean;
  onSelect: (v: string) => void;
}

function CategoryRow({
  label,
  description,
  value,
  isSelected,
  onSelect,
}: CategoryRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full text-left rounded-lg border p-3 transition-colors ${
        isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border hover:border-primary/40 hover:bg-muted/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
        {isSelected && (
          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        )}
      </div>
    </button>
  );
}
