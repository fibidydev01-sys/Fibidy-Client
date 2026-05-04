'use client';

// ==========================================
// THEME TOGGLE
// File: src/components/marketing/shared/theme-toggle.tsx
//
// Footer-only theme toggle. Uses next-themes which is already wired
// at the locale layout. Three states: light / dark / system.
//
// The button cycles light → dark → system → light. Visually the
// icon reflects the *resolved* theme so users always see what's
// currently active, not what they last picked.
//
// Why client component: useTheme is a hook. Wrapped in a guard
// (mounted check) to avoid hydration mismatch — server renders the
// neutral "system" state, client hydrates with the persisted choice.
//
// next-themes uses localStorage internally — this is the only
// blessed localStorage usage in marketing per anti-pattern §5.
// ==========================================

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const t = useTranslations('marketing.footer.themeToggle');
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — render neutral icon until client mounts.
  useEffect(() => setMounted(true), []);

  const active = theme ?? 'system';
  const Icon =
    !mounted || resolvedTheme === 'light'
      ? Sun
      : resolvedTheme === 'dark'
        ? Moon
        : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('label')}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          disabled={active === 'light'}
          className="text-sm"
        >
          <Sun className="mr-2 h-3.5 w-3.5" aria-hidden />
          {t('light')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          disabled={active === 'dark'}
          className="text-sm"
        >
          <Moon className="mr-2 h-3.5 w-3.5" aria-hidden />
          {t('dark')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          disabled={active === 'system'}
          className="text-sm"
        >
          <Monitor className="mr-2 h-3.5 w-3.5" aria-hidden />
          {t('system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
