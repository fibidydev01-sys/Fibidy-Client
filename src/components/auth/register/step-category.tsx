'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import {
  getCategoryList,
  getCategoriesByGroup,
  getCategoryGroupList,
} from '@/lib/constants/shared/categories';

// ==========================================
// TYPES
// ==========================================

interface StepCategoryProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

// ==========================================
// COMPONENT — tanpa header & nav (dihandle parent)
// ==========================================

export function StepCategory({ selectedCategory, onSelectCategory }: StepCategoryProps) {
  const allCategories = getCategoryList();
  const groups = getCategoryGroupList();

  const [search, setSearch] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const isPredefined = allCategories.some((c) => c.key === selectedCategory);
  const isCustomSelected = selectedCategory && !isPredefined;

  const filteredCategories = search.trim()
    ? allCategories.filter(
      (c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    )
    : null;

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onSelectCategory(customValue.trim());
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 text-sm"
        autoComplete="off"
      />

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto -mx-1 px-1 space-y-4 pr-2">

        {filteredCategories ? (
          filteredCategories.length > 0 ? (
            <div className="space-y-1">
              {filteredCategories.map((cat) => (
                <CategoryItem
                  key={cat.key}
                  label={cat.label}
                  description={cat.description}
                  value={cat.key}
                  isSelected={selectedCategory === cat.key}
                  onSelect={onSelectCategory}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No categories found{' '}
              <button
                type="button"
                className="text-primary underline underline-offset-4"
                onClick={() => {
                  setShowCustomInput(true);
                  setCustomValue(search);
                  setSearch('');
                }}
              >
                Add your own
              </button>
            </div>
          )
        ) : (
          <>
            {groups.map((group) => {
              const items = getCategoriesByGroup(group.key);
              if (items.length === 0) return null;
              return (
                <div key={group.key}>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5 px-1">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {items.map((cat) => (
                      <CategoryItem
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
              );
            })}

            {isCustomSelected && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5 px-1">
                  Custom
                </p>
                <CategoryItem
                  label={selectedCategory}
                  value={selectedCategory}
                  isSelected
                  onSelect={onSelectCategory}
                />
              </div>
            )}

            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-dashed border-border"
              >
                Don&apos;t see a match?{' '}
                <span className="text-primary font-medium">Add your own</span>
              </button>
            ) : (
              <div className="border border-border rounded-md p-3 space-y-3">
                <Label htmlFor="custom-category" className="text-sm font-medium">
                  Your business type
                </Label>
                <Input
                  id="custom-category"
                  placeholder="e.g. Flower Shop, Tattoo Studio, Food Truck..."
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomSubmit();
                    if (e.key === 'Escape') { setShowCustomInput(false); setCustomValue(''); }
                  }}
                  autoFocus
                  className="h-9 text-sm"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1 h-8 text-xs"
                    onClick={() => { setShowCustomInput(false); setCustomValue(''); }}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" className="flex-1 h-8 text-xs"
                    disabled={!customValue.trim()} onClick={handleCustomSubmit}>
                    Use this type
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// CATEGORY ITEM
// ==========================================

function CategoryItem({
  label, description, value, isSelected, onSelect,
}: {
  label: string; description?: string; value: string;
  isSelected: boolean; onSelect: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left',
        isSelected
          ? 'bg-primary/8 border border-primary/30 text-foreground'
          : 'border border-transparent hover:bg-muted/60 text-foreground'
      )}
    >
      <span className={cn(
        'shrink-0 flex items-center justify-center w-4 h-4 rounded-full border transition-colors',
        isSelected ? 'border-primary bg-primary' : 'border-border bg-background'
      )}>
        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn('block', isSelected && 'font-medium')}>{label}</span>
        {description && (
          <span className="block text-xs text-muted-foreground truncate">{description}</span>
        )}
      </span>
    </button>
  );
}