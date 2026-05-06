'use client';

// ==========================================
// CALENDAR (shadcn — react-day-picker v9)
// File: src/components/ui/calendar.tsx
//
// REWRITE for react-day-picker v9 (package.json pins ^9.14.0).
// Previous version used the v8 classNames API (head_row, head_cell,
// row, cell, day, IconLeft/IconRight) which v9 doesn't recognize —
// resulting in unstyled defaults: the weekday header wrapping
// (Su / MoTuWeThFrSa), days bleeding out of the grid, navigation
// chevrons missing.
//
// v9 uses:
//   - weekdays / weekday / week / day / day_button (replacing head_row /
//     head_cell / row / cell / day)
//   - month_caption (replacing caption)
//   - nav with button_previous / button_next (replacing nav with
//     nav_button / nav_button_previous / nav_button_next)
//   - Single `Chevron` component slot (replacing IconLeft/IconRight)
//   - `getDefaultClassNames()` so we extend the v9 defaults instead
//     of fully replacing them, which protects us against any future
//     v9 minor releases adding new class slots we forgot to map.
//
// Visual behavior matches the official Magic UI bento "Calendar" card.
// ==========================================

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/lib/shared/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'relative flex flex-col gap-4 md:flex-row',
          defaultClassNames.months,
        ),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-7 select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-7 select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-7 w-full items-center justify-center px-7',
          defaultClassNames.month_caption,
        ),
        caption_label: cn(
          'select-none text-sm font-medium',
          defaultClassNames.caption_label,
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center',
          defaultClassNames.day,
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 select-none p-0 font-normal aria-selected:opacity-100',
          defaultClassNames.day_button,
        ),
        range_start: cn(
          'day-range-start rounded-l-md bg-accent',
          defaultClassNames.range_start,
        ),
        range_middle: cn(
          'day-range-middle rounded-none',
          defaultClassNames.range_middle,
        ),
        range_end: cn(
          'day-range-end rounded-r-md bg-accent',
          defaultClassNames.range_end,
        ),
        today: cn(
          'rounded-md bg-accent text-accent-foreground',
          defaultClassNames.today,
        ),
        outside: cn(
          'day-outside text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        selected: cn(
          'rounded-md bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          defaultClassNames.selected,
        ),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: iconClassName, orientation, ...rest }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon
                className={cn('h-4 w-4', iconClassName)}
                {...rest}
              />
            );
          }
          return (
            <ChevronRightIcon
              className={cn('h-4 w-4', iconClassName)}
              {...rest}
            />
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };