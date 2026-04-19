'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { useEffect, useState } from 'react';

const FILE_TYPES = ['pdf', 'epub', 'zip', 'mp4', 'mp3', 'png', 'jpg'];

interface DiscoverFiltersProps {
  search: string;
  fileType: string;
  onSearchChange: (value: string) => void;
  onFileTypeChange: (value: string) => void;
}

export function DiscoverFilters({
  search,
  fileType,
  onSearchChange,
  onFileTypeChange,
}: DiscoverFiltersProps) {
  const t = useTranslations('discover.list');
  const [localSearch, setLocalSearch] = useState(search);
  const debounced = useDebounce(localSearch, 400);

  useEffect(() => {
    onSearchChange(debounced);
  }, [debounced, onSearchChange]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          className="pl-10 pr-8"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => { setLocalSearch(''); onSearchChange(''); }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={!fileType ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => onFileTypeChange('')}
        >
          {t('filterAll')}
        </Button>
        {FILE_TYPES.map((type) => (
          <Button
            key={type}
            size="sm"
            variant={fileType === type ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => onFileTypeChange(fileType === type ? '' : type)}
          >
            {type.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  );
}