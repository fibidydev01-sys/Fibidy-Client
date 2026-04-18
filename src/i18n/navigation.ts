// ==========================================
// NEXT-INTL NAVIGATION WRAPPERS
// File: src/i18n/navigation.ts
//
// These wrappers auto-prepend the current locale to internal URLs.
// Use these INSTEAD of the corresponding exports from 'next/navigation'
// for anything that routes between app pages.
//
// KEEP using 'next/navigation' for:
//   - useSearchParams (no locale concept)
//   - notFound
//   - useParams
// ==========================================

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);